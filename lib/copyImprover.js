import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate improved, compliant marketing copy based on violations
 * @param {Object} params
 * @param {string} params.originalCopy - Original marketing copy
 * @param {Array} params.violations - List of violations detected
 * @param {string} params.platform - Target platform (Meta, Google, TikTok)
 * @param {string} params.productCategory - Product category
 * @returns {Promise<Object>} - { improvedCopy, changes: [], confidence }
 */
export async function generateImprovedCopy({
  originalCopy,
  violations,
  platform,
  productCategory,
}) {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  // Fallback if no API key
  if (!hasGeminiKey) {
    return {
      improvedCopy: originalCopy,
      changes: ["Gemini API key not configured"],
      confidence: 0,
      method: "fallback",
    };
  }

  // If no violations, return original
  if (!violations || violations.length === 0) {
    return {
      improvedCopy: originalCopy,
      changes: ["No violations detected - copy is compliant"],
      confidence: 1.0,
      method: "no-changes-needed",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build violation summary
    const violationSummary = violations
      .map((v, idx) => {
        const parts = [
          `${idx + 1}. ${v.category} (${v.severity})`,
          `   - Issue: ${v.explanation}`,
        ];
        if (v.offendingText) {
          parts.push(`   - Flagged phrase: "${v.offendingText}"`);
        }
        if (v.suggestedFix) {
          parts.push(`   - Suggestion: ${v.suggestedFix}`);
        }
        return parts.join("\n");
      })
      .join("\n\n");

    const prompt = [
      "You are an expert advertising compliance copywriter specializing in healthcare and regulated products.",
      "",
      `PLATFORM: ${platform}`,
      `PRODUCT CATEGORY: ${productCategory}`,
      "",
      "ORIGINAL MARKETING COPY:",
      originalCopy,
      "",
      "VIOLATIONS DETECTED:",
      violationSummary,
      "",
      "TASK:",
      "Rewrite the marketing copy to fix ALL violations while:",
      "1. Maintaining the core message and value proposition",
      "2. Keeping the tone and brand voice similar",
      "3. Making it compelling and persuasive",
      "4. Ensuring full compliance with ad platform policies",
      "5. Keeping similar length (within 20% of original)",
      "",
      "Return ONLY valid JSON with this structure:",
      "{",
      '  "improvedCopy": "The rewritten compliant marketing copy",',
      '  "changes": ["Change 1 explanation", "Change 2 explanation"],',
      '  "confidence": 0.95',
      "}",
      "",
      "The confidence should be 0-1 based on how well the rewrite addresses violations.",
      "Do not include markdown formatting, just pure JSON.",
    ].join("\n");

    const result = await model.generateContent(prompt);
    const response = result.response;
    const raw = response.text().trim();
    const parsed = safeJsonParse(raw);

    if (parsed && typeof parsed === "object" && parsed.improvedCopy) {
      return {
        improvedCopy: parsed.improvedCopy,
        changes: Array.isArray(parsed.changes)
          ? parsed.changes
          : ["Copy improved for compliance"],
        confidence:
          typeof parsed.confidence === "number"
            ? Math.min(1, Math.max(0, parsed.confidence))
            : 0.8,
        method: "gemini-ai",
      };
    }

    // Fallback if parsing fails
    return {
      improvedCopy: originalCopy,
      changes: ["Failed to generate improved copy"],
      confidence: 0,
      method: "parse-error",
    };
  } catch (err) {
    console.error("Failed to generate improved copy:", err);
    return {
      improvedCopy: originalCopy,
      changes: [`Error: ${err.message}`],
      confidence: 0,
      method: "error",
    };
  }
}

function safeJsonParse(raw) {
  try {
    // Try to extract JSON from markdown code blocks
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
