"use client";

import * as React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SubmissionForm from "../../components/SubmissionForm";
import ReportView from "../../components/ReportView";
import policies from "../../data/policies.json";

export default function CompliancePage() {
  const [report, setReport] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState("");
  const [formState, setFormState] = React.useState({
    marketingCopy: "",
    imageMode: "upload",
    imageFile: null,
    imageUrl: "",
    platform: "Meta",
    category: "Weight Loss Products",
    categoryCustom: "",
  });
  const [toast, setToast] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    let objectUrl;
    if (formState.imageMode === "upload" && formState.imageFile) {
      objectUrl = URL.createObjectURL(formState.imageFile);
      setImagePreviewUrl(objectUrl);
    } else if (formState.imageMode === "url" && formState.imageUrl) {
      setImagePreviewUrl(formState.imageUrl);
    } else {
      setImagePreviewUrl("");
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formState.imageMode, formState.imageFile, formState.imageUrl]);

  const handleSubmit = async (payload) => {
    // Normalize field names to match API expectations
    const normalized = {
      copy: payload.marketingCopy,
      platform: payload.platform,
      productCategory:
        payload.category === "custom" && payload.categoryCustom
          ? payload.categoryCustom
          : payload.category,
      imageFile: payload.imageFile,
      imageUrl: payload.imageUrl,
    };

    setLoading(true);
    try {
      const hasFile = !!normalized.imageFile;
      let res;
      if (hasFile) {
        const formData = new FormData();
        Object.entries(normalized).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (key === "imageFile") {
              if (value) formData.append(key, value);
            } else {
              formData.append(key, value);
            }
          }
        });
        res = await fetch("/api/check", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });
      }
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setReport(data);
      setToast({
        open: true,
        message: "Report generated",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message: "Unable to run check. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestedFix = (text) => {
    setFormState((prev) => ({ ...prev, marketingCopy: text }));
  };

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance-report.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.08em" }}
        >
          AdSafeCare
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: "-0.02em",
            fontSize: { xs: "2.2rem", md: "2.7rem" },
            lineHeight: 1.15,
          }}
        >
          Submit content and get an instant compliance report
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: { xs: "1.02rem", md: "1.08rem" },
            fontWeight: 500,
            maxWidth: 760,
          }}
        >
          Validate claims, assets, and disclosures before you launch campaigns.
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="stretch" direction="column">
        <Grid item xs={12}>
          <SubmissionForm
            value={formState}
            onChange={setFormState}
            onSubmit={handleSubmit}
            onReset={() => setReport(null)}
            loading={loading}
            categories={policies.productCategories?.map((c) => c.name) || []}
          />
        </Grid>
        <Grid item xs={12}>
          <ReportView
            report={report}
            onApplySuggestedFix={handleApplySuggestedFix}
            onExport={handleExport}
            marketingCopy={formState.marketingCopy}
            imagePreviewUrl={imagePreviewUrl}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
