export function computeScore(violations) {
  let score = 100;
  let hasCritical = false;

  violations.forEach((v) => {
    const confidence = typeof v.confidence === "number" ? v.confidence : 1;
    if (v.severity === "critical") {
      score -= 50 * confidence;
      hasCritical = true;
    } else if (v.severity === "warning") {
      score -= 20 * confidence;
    } else if (v.severity === "info") {
      score -= 5 * confidence;
    }
  });

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  const status = hasCritical || score < 80 ? "fail" : "pass";
  return { score: Math.round(score), status };
}
