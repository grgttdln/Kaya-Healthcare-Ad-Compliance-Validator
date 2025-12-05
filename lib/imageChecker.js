// Mockable image checker. Replace with real vision provider when VISION_API_KEY is set.
export async function runImageChecks({ imageFile, imageUrl }) {
  const hasVisionKey = !!process.env.VISION_API_KEY;

  // Basic heuristics for mock mode
  const filename =
    typeof imageFile?.name === "string" ? imageFile.name.toLowerCase() : "";
  const urlString = (imageUrl || "").toLowerCase();
  const combined = `${filename} ${urlString}`;

  const beforeAfterDetected =
    combined.includes("before_after") ||
    combined.includes("before-after") ||
    combined.includes("beforeafter") ||
    (combined.includes("before") && combined.includes("after"));

  const nudityHints = ["bikini", "lingerie", "nude", "topless"];
  const nudityHit = nudityHints.some((w) => combined.includes(w));

  const ocrText = beforeAfterDetected ? "before after" : "";

  const annotatedRegions = beforeAfterDetected
    ? [
        { x: "10%", y: "10%", width: "35%", height: "80%", label: "before" },
        { x: "55%", y: "10%", width: "35%", height: "80%", label: "after" },
      ]
    : [];

  const violations = [];
  if (beforeAfterDetected) {
    violations.push({
      id: "IMG-BA-1",
      severity: "warning",
      category: "Before/After Imagery",
      offendingText: null,
      offendingImageRegion: annotatedRegions[0] || null,
      policyReference: "POL-4",
      explanation: "Detected potential before/after imagery.",
      suggestedFix: "Avoid before/after layouts or remove labels.",
      confidence: 0.65,
    });
  }
  if (nudityHit) {
    violations.push({
      id: "IMG-NUD-1",
      severity: "critical",
      category: "Nudity / Exposure",
      offendingText: null,
      offendingImageRegion: null,
      policyReference: "POL-5",
      explanation:
        "Image filename or URL suggests nudity or sensitive exposure.",
      suggestedFix: "Use imagery without nudity or sensitive exposure.",
      confidence: 0.6,
    });
  }

  if (hasVisionKey) {
    // TODO: Integrate actual vision API (OCR, nudity, before/after detection).
    // For now, still return mock but keep shape.
  }

  return {
    ocrText,
    nudityScore: nudityHit ? 0.6 : 0,
    nudityLabel: nudityHit ? "possible" : "none",
    beforeAfterDetected,
    annotatedRegions,
    violations,
  };
}
