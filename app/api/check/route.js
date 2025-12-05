export async function POST() {
  const now = new Date().toISOString();

  const mock = {
    complianceScore: 10,
    status: "fail",
    violations: [
      {
        id: "POL-1-001",
        severity: "critical",
        category: "Prohibited claims",
        offendingText: "guaranteed results",
        offendingImageRegion: null,
        policyReference: "POL-1",
        explanation: "Promises of guaranteed results are prohibited.",
        suggestedFix: "Replace with: 'Results vary; consult your doctor.'",
        confidence: 0.98,
      },
    ],
    meta: {
      platform: "Meta",
      productCategory: "Weight loss",
      timestamp: now,
    },
  };

  return Response.json(mock, { status: 200 });
}
