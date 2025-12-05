import fs from "fs";
import path from "path";

export function loadPolicyDb() {
  const filePath = path.join(process.cwd(), "data", "policies.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// Apply platform overrides by cloning and mutating rule severities where needed.
export function applyPlatformOverrides(rules, platform, overrides) {
  const key = (platform || "").toLowerCase();
  const platformOverrides = overrides?.[key] || {};
  return rules.map((rule) => {
    const override = platformOverrides[rule.id];
    if (override?.severity) {
      return { ...rule, severity: override.severity };
    }
    return rule;
  });
}

export function getCategoryInfo(db, productCategory) {
  const entry =
    db.productCategories.find(
      (c) => c.name.toLowerCase() === (productCategory || "").toLowerCase()
    ) || null;
  return entry;
}

export function getPreScreenClaims(db) {
  return db.claimsRequiringPreScreen || [];
}

export function getPlatformBanned(db, platform) {
  const key = (platform || "").toLowerCase();
  const overrides = db.platform_overrides || {};
  const entry = overrides[key] || {};
  return entry.additional_banned || [];
}
