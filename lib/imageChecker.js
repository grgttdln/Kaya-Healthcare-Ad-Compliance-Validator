import OpenAI from "openai";

// Image checker with optional OpenAI Vision (uses OPENAI_API_KEY) and
// lightweight heuristics as fallback.
export async function runImageChecks({ imageFile, imageUrl, platform }) {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const platformName = platform?.toLowerCase() || "";

  // --- Heuristic baseline (filename/URL cues) ---
  const filename =
    typeof imageFile?.name === "string" ? imageFile.name.toLowerCase() : "";
  const urlString = (imageUrl || "").toLowerCase();
  const combined = `${filename} ${urlString}`.trim();

  const beforeAfterDetected =
    combined.includes("before_after") ||
    combined.includes("before-after") ||
    combined.includes("beforeafter") ||
    (combined.includes("before") && combined.includes("after"));

  const nudityHints = ["bikini", "lingerie", "nude", "topless"];
  const nudityHit = nudityHints.some((w) => combined.includes(w));

  const negativeBodyHints = [
    "overweight",
    "obese",
    "fat",
    "ashamed",
    "before pic sad",
  ];
  const negativeBodyHit = negativeBodyHints.some((w) => combined.includes(w));

  const heurAnnotatedRegions = beforeAfterDetected
    ? [
        { x: "10%", y: "10%", width: "35%", height: "80%", label: "before" },
        { x: "55%", y: "10%", width: "35%", height: "80%", label: "after" },
      ]
    : [];

  const heuristic = {
    beforeAfterDetected,
    nudityLabel: nudityHit ? "possible" : "none",
    nudityScore: nudityHit ? 0.6 : 0,
    negativeBodyHit,
    ocrText: combined
      .replace(/[-_]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 12)
      .join(" "),
    annotatedRegions: heurAnnotatedRegions,
  };

  // --- OpenAI Vision (if key present and image provided) ---
  let vision = null;
  if (hasOpenAIKey && (imageFile || imageUrl)) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const imageDataUrl = await toDataUrl(imageFile, imageUrl);
      if (imageDataUrl) {
        const userMessage = [
          {
            type: "text",
            text: [
              "You are an ad compliance vision checker. Analyze the provided image and return a JSON object with:",
              "- beforeAfterDetected: boolean",
              '- nudityLabel: "none" | "possible" | "likely"',
              "- nudityScore: number between 0 and 1",
              "- negativeBodyHit: boolean (overly negative body imagery, shaming, unhealthy extremes)",
              "- ocrText: short text (<= 160 chars) you can read",
              "- annotatedRegions: array of { x: percent string, y: percent string, width: percent string, height: percent string, label: string } for notable regions (e.g., before/after panels).",
              "Return ONLY minified JSON with these keys.",
            ].join("\n"),
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ];

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a vision model that strictly returns JSON for ad compliance signals.",
            },
            { role: "user", content: userMessage },
          ],
          max_tokens: 300,
        });

        const raw = completion?.choices?.[0]?.message?.content?.trim() || "{}";
        const parsed = safeJsonParse(raw);
        if (parsed && typeof parsed === "object") {
          vision = {
            beforeAfterDetected: !!parsed.beforeAfterDetected,
            nudityLabel:
              typeof parsed.nudityLabel === "string"
                ? parsed.nudityLabel
                : "none",
            nudityScore:
              typeof parsed.nudityScore === "number"
                ? clamp01(parsed.nudityScore)
                : 0,
            negativeBodyHit: !!parsed.negativeBodyHit,
            ocrText: typeof parsed.ocrText === "string" ? parsed.ocrText : "",
            annotatedRegions: Array.isArray(parsed.annotatedRegions)
              ? parsed.annotatedRegions
              : [],
          };
        }
      }
    } catch (err) {
      console.error(
        "OpenAI vision check failed, falling back to heuristics",
        err
      );
    }
  }

  // Merge vision result over heuristic (vision wins when present)
  const merged = {
    beforeAfterDetected:
      vision?.beforeAfterDetected ?? heuristic.beforeAfterDetected,
    nudityLabel: vision?.nudityLabel ?? heuristic.nudityLabel,
    nudityScore:
      typeof vision?.nudityScore === "number"
        ? vision.nudityScore
        : heuristic.nudityScore,
    negativeBodyHit: vision?.negativeBodyHit ?? heuristic.negativeBodyHit,
    ocrText: (vision?.ocrText || heuristic.ocrText || "").trim(),
    annotatedRegions: vision?.annotatedRegions?.length
      ? vision.annotatedRegions
      : heuristic.annotatedRegions,
  };

  // Build violations list
  const violations = [];
  if (merged.beforeAfterDetected) {
    violations.push({
      id: "IMG-BA-1",
      severity:
        platformName === "meta" || platformName === "tiktok"
          ? "critical"
          : "warning",
      category: "Before/After Imagery",
      offendingText: null,
      offendingImageRegion: merged.annotatedRegions?.[0] || null,
      policyReference: "POL-4",
      explanation: "Detected potential before/after imagery.",
      suggestedFix: "Avoid before/after layouts or remove labels.",
      confidence: merged.nudityScore ? merged.nudityScore : 0.65,
    });
  }

  if (merged.nudityLabel !== "none") {
    violations.push({
      id: "IMG-NUD-1",
      severity: "critical",
      category: "Nudity / Exposure",
      offendingText: null,
      offendingImageRegion: null,
      policyReference: "POL-5",
      explanation: "Image analysis suggests nudity or sensitive exposure.",
      suggestedFix: "Use imagery without nudity or sensitive exposure.",
      confidence: merged.nudityScore || 0.6,
    });
  }

  if (merged.negativeBodyHit) {
    violations.push({
      id: "IMG-NB-1",
      severity: "warning",
      category: "Negative Body Imagery",
      offendingText: null,
      offendingImageRegion: null,
      policyReference: "POL-5",
      explanation: "Image suggests overly negative body imagery or shaming.",
      suggestedFix: "Use neutral or positive imagery that avoids body shaming.",
      confidence: 0.55,
    });
  }

  return {
    ocrText: merged.ocrText,
    nudityScore: merged.nudityScore,
    nudityLabel: merged.nudityLabel,
    beforeAfterDetected: merged.beforeAfterDetected,
    annotatedRegions: merged.annotatedRegions,
    violations,
  };
}

async function toDataUrl(imageFile, imageUrl) {
  if (imageFile && typeof imageFile.arrayBuffer === "function") {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mime = imageFile.type || "image/png";
    return `data:${mime};base64,${base64}`;
  }
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    return imageUrl.trim();
  }
  return null;
}

function safeJsonParse(raw) {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}

function clamp01(n) {
  if (Number.isFinite(n)) return Math.min(1, Math.max(0, n));
  return 0;
}
