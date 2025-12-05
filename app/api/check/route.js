import { NextResponse } from "next/server";
import { complianceEngine } from "../../../lib/complianceEngine";
import { generateImprovedCopy } from "../../../lib/copyImprover";

const REQUIRED_FIELDS = ["copy", "platform", "productCategory"];

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("imageFile");
      const advertiserProof = formData.get("advertiserProof");
      payload = {
        copy: formData.get("copy") || "",
        platform: formData.get("platform") || "",
        productCategory: formData.get("productCategory") || "",
        creativeType: formData.get("creativeType") || "",
        imageFile: file && typeof file === "object" ? file : null,
        imageUrl: formData.get("imageUrl") || "",
        advertiserProof:
          advertiserProof && typeof advertiserProof === "object"
            ? advertiserProof
            : null,
      };
    } else {
      const body = await req.json();
      payload = {
        copy: body.copy || "",
        platform: body.platform || "",
        productCategory: body.productCategory || "",
        creativeType: body.creativeType || "",
        imageFile: null,
        imageUrl: body.imageUrl || "",
        advertiserProof: null,
      };
    }

    const missing = REQUIRED_FIELDS.filter(
      (f) => !payload[f] || !String(payload[f]).trim()
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const report = await complianceEngine(payload);

    // Generate improved copy ONLY if there are TEXT violations
    // (skip if only image violations exist)
    let improvedCopy = null;
    if (report.violations && report.violations.length > 0) {
      const hasTextViolations = report.violations.some(
        (v) => v.offendingText || !v.offendingImageRegion
      );

      if (hasTextViolations) {
        improvedCopy = await generateImprovedCopy({
          originalCopy: payload.copy,
          violations: report.violations,
          platform: payload.platform,
          productCategory: payload.productCategory,
        });
      }
    }

    return NextResponse.json({ ...report, improvedCopy }, { status: 200 });
  } catch (err) {
    console.error("POST /api/check error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
