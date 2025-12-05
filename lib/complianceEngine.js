import { runTextChecks } from "./textChecker";
import { runImageChecks } from "./imageChecker";
import { computeScore } from "./scoreUtils";

export async function complianceEngine(input) {
  const { copy, platform, productCategory, imageFile, imageUrl } = input;

  const imageResult = await runImageChecks({ imageFile, imageUrl });

  const textViolations = await runTextChecks({
    copy,
    ocrText: imageResult.ocrText,
    platform,
    productCategory,
  });

  const violations = [
    ...(textViolations || []),
    ...(imageResult.violations || []),
  ].map((v, idx) => ({
    id: v.id || `V-${idx}`,
    severity: v.severity || "info",
    category: v.category || "General",
    offendingText: v.offendingText ?? null,
    offendingImageRegion: v.offendingImageRegion ?? null,
    policyReference: v.policyReference || "POLICY",
    explanation: v.explanation || "No explanation provided.",
    suggestedFix: v.suggestedFix || "Provide a safer alternative.",
    confidence: typeof v.confidence === "number" ? v.confidence : 0.5,
  }));

  const { score, status } = computeScore(violations);

  return {
    complianceScore: score,
    status,
    violations,
    meta: {
      platform,
      productCategory,
      timestamp: new Date().toISOString(),
    },
  };
}
