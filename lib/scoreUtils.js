/**
 * Platform-specific severity weights and compliance strictness
 */
const PLATFORM_WEIGHTS = {
  meta: {
    name: "Meta (Facebook/Instagram)",
    strictness: 1.5, // Meta is 50% stricter
    severityMultipliers: {
      critical: 1.8, // Critical violations weighted heavily on Meta
      warning: 1.3,
      info: 1.0,
    },
    prohibitedCategories: [
      "before/after imagery",
      "nudity",
      "body shaming",
      "unrealistic outcomes",
    ],
  },
  tiktok: {
    name: "TikTok",
    strictness: 1.4,
    severityMultipliers: {
      critical: 1.6,
      warning: 1.3,
      info: 1.0,
    },
    prohibitedCategories: [
      "before/after imagery",
      "nudity",
      "sensitive content",
    ],
  },
  google: {
    name: "Google Ads",
    strictness: 1.2,
    severityMultipliers: {
      critical: 1.4,
      warning: 1.2,
      info: 1.0,
    },
    prohibitedCategories: ["misleading claims", "unverified medical claims"],
  },
  youtube: {
    name: "YouTube",
    strictness: 1.1,
    severityMultipliers: {
      critical: 1.3,
      warning: 1.1,
      info: 1.0,
    },
    prohibitedCategories: ["misleading health claims"],
  },
  default: {
    name: "General Platform",
    strictness: 1.0,
    severityMultipliers: {
      critical: 1.0,
      warning: 1.0,
      info: 1.0,
    },
    prohibitedCategories: [],
  },
};

/**
 * Product category risk levels
 */
const CATEGORY_RISK_WEIGHTS = {
  "weight loss": 1.5, // High risk, heavily regulated
  "otc drugs": 1.4,
  "food/dietary supplements": 1.3,
  alcohol: 1.3,
  "milk code products": 1.4,
  cosmetics: 1.1,
  "consumer electronics": 1.0,
  "airline promo fares": 1.0,
};

/**
 * Get platform configuration with weights
 */
export function getPlatformWeight(platform) {
  const normalized = (platform || "default").toLowerCase().trim();
  return PLATFORM_WEIGHTS[normalized] || PLATFORM_WEIGHTS.default;
}

/**
 * Get category risk weight
 */
export function getCategoryWeight(category) {
  const normalized = (category || "").toLowerCase().trim();
  return CATEGORY_RISK_WEIGHTS[normalized] || 1.0;
}

/**
 * Compute weighted compliance score based on platform and category
 */
export function computeScore(violations, platform, productCategory) {
  const platformConfig = getPlatformWeight(platform);
  const categoryWeight = getCategoryWeight(productCategory);

  let score = 100;
  let hasCritical = false;
  let weightedPenalties = 0;

  violations.forEach((v) => {
    const confidence = typeof v.confidence === "number" ? v.confidence : 1;
    const severity = (v.severity || "info").toLowerCase();

    // Base penalties
    let basePenalty = 0;
    if (severity === "critical") {
      basePenalty = 50;
      hasCritical = true;
    } else if (severity === "warning") {
      basePenalty = 20;
    } else if (severity === "info") {
      basePenalty = 5;
    }

    // Apply platform severity multiplier
    const platformMultiplier =
      platformConfig.severityMultipliers[severity] || 1.0;

    // Apply category risk weight
    const categoryMultiplier = categoryWeight;

    // Check if violation category is in platform's prohibited list
    const violationCategory = (v.category || "").toLowerCase();
    const isPlatformProhibited = platformConfig.prohibitedCategories.some(
      (cat) => violationCategory.includes(cat)
    );

    // Extra penalty for platform-prohibited categories
    const prohibitedMultiplier = isPlatformProhibited ? 1.5 : 1.0;

    // Calculate weighted penalty
    const weightedPenalty =
      basePenalty *
      confidence *
      platformMultiplier *
      categoryMultiplier *
      prohibitedMultiplier *
      platformConfig.strictness;

    weightedPenalties += weightedPenalty;
  });

  score -= weightedPenalties;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // Stricter pass threshold for high-risk platforms and categories
  const passThreshold = 80 - (platformConfig.strictness - 1.0) * 10;
  const status = hasCritical || score < passThreshold ? "fail" : "pass";

  return {
    score: Math.round(score),
    status,
    meta: {
      platform: platformConfig.name,
      platformStrictness: platformConfig.strictness,
      categoryRisk: categoryWeight,
      passThreshold: Math.round(passThreshold),
      weightedPenalties: Math.round(weightedPenalties),
    },
  };
}
