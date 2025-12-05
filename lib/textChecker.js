"use server";

import OpenAI from "openai";
import {
  loadPolicyDb,
  applyPlatformOverrides,
  getCategoryInfo,
  getPreScreenClaims,
  getPlatformBanned,
} from "./policyUtils";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FALLBACK_VIOLATION = {
  id: "POL-LLM-ERROR",
  severity: "warning",
  category: "LLM Parsing",
  offendingText: null,
  offendingImageRegion: null,
  policyReference: "LLM",
  explanation: "The LLM response could not be parsed as JSON.",
  suggestedFix: "Retry the compliance check.",
  confidence: 0.5,
};

function buildSystemPrompt({
  rules,
  platformOverrides,
  categoryInfo,
  preScreenClaims,
  banned,
  prohibitedPhrases,
  requiredDisclaimers,
}) {
  const ruleSummary = rules
    .map(
      (r) =>
        `${r.id} (${r.severity}): ${r.title} | patterns: ${
          Array.isArray(r.pattern) ? r.pattern.join(", ") : ""
        }`
    )
    .join("\n");

  const overrideSummary = Object.entries(platformOverrides || {})
    .map(([plat, ov]) => `${plat}: ${JSON.stringify(ov)}`)
    .join("\n");

  const preScreenSummary = preScreenClaims
    .map(
      (c) =>
        `${c.id} (${c.slug}): ${c.description} examples: ${c.examples.join(
          ", "
        )}`
    )
    .join("\n");

  const prohibitedSummary = (prohibitedPhrases || []).join(", ");
  const requiredDisclaimersSummary = (requiredDisclaimers || []).join(", ");

  return `
You are an advertising compliance engine. Use only the policy rules provided below. Output only JSON matching the provided schema. Keep explanations plain-language and concise for non-lawyers.

You analyze:
- marketing copy
- OCR text from images

Your job:
- Detect prohibited claims
- Detect medical guarantees
- Detect unverified FDA approval statements
- Detect missing required disclaimers
- Apply platform-based overrides (Meta is strictest; before/after imagery = critical on Meta/TikTok; nudity/sensitive visuals are strictly limited on Meta/TikTok)
- Map all findings to policy DB entries
- If the product category is regulated (requires_prescreen), flag missing pre-screen or risky claims.
- Enforce prohibited phrases: cure; miracle; guaranteed results; 100% guaranteed; FDA-approved (without proof).
- Enforce required disclaimers: Consult your doctor; Results may vary; Rx required (for regulated/Rx).

Writing rules:
- Keep explanation <= 2 sentences, plain-language, no legal jargon.
- Suggested fix must be an actionable rewrite the user can paste, not just advice.
- If a phrase triggered the rule, mention it explicitly in explanation.

Policy DB rules:
${ruleSummary}

Platform overrides:
${overrideSummary || "none"}

Regulated category: ${categoryInfo?.regulated ? "yes" : "no"} (${
    categoryInfo?.name || "unknown"
  })
Requires pre-screen: ${categoryInfo?.requires_prescreen ? "yes" : "no"}
Claims requiring pre-screen:
${preScreenSummary}

Additional platform banned terms (normalized platform): ${
    banned.join(", ") || "none"
  }

Required disclaimers: ${requiredDisclaimersSummary || "none"}
Prohibited phrases: ${prohibitedSummary || "none"}

RULES:
- Output ONLY STRICT JSON. No commentary. No markdown. No backticks.
- JSON shape: { "violations": [...], "score": number, "pass": boolean, "meta": { "platform": string, "productCategory": string } }
- Each violation must include: id, severity (critical|warning|info), category, offendingText (or null), offendingImageRegion (or null), policyReference, explanation, suggestedFix, confidence (0-1)
- If no violations, output: { "violations": [], "score": 100, "pass": true, "meta": { ... } }
Example violation:
{ "id":"POL-1-001", "severity":"critical", "category":"Prohibited Claims", "offendingText":"guaranteed results", "offendingImageRegion": null, "policyReference":"POL-1", "explanation":"The phrase 'guaranteed results' promises an outcome that cannot be guaranteed.", "suggestedFix":"Use a qualified statement, e.g., 'Results may vary. Consult your doctor.'", "confidence":0.95 }
`;
}

export async function runTextChecks({
  copy,
  ocrText,
  platform,
  productCategory,
}) {
  const policyDb = loadPolicyDb();
  const rules = applyPlatformOverrides(
    policyDb.base_rules,
    platform,
    policyDb.platform_overrides
  );
  const categoryInfo = getCategoryInfo(policyDb, productCategory);
  const preScreenClaims = getPreScreenClaims(policyDb);
  const banned = getPlatformBanned(policyDb, platform);

  const systemPrompt = buildSystemPrompt({
    rules,
    platformOverrides: policyDb.platform_overrides,
    categoryInfo,
    preScreenClaims,
    banned,
    prohibitedPhrases: policyDb.prohibited_phrases,
    requiredDisclaimers: policyDb.required_disclaimers,
  });

  // If no key, return empty violations as graceful fallback.
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  const userPayload = {
    copy,
    ocrText,
    platform,
    productCategory,
    category: categoryInfo,
    banned,
    preScreenClaims,
    rules,
  };

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    return [FALLBACK_VIOLATION];
  }

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed?.violations) {
      return parsed.violations;
    }
    return [parsed];
  } catch (err) {
    console.error("LLM parse error", err, content);
    return [FALLBACK_VIOLATION];
  }
}
