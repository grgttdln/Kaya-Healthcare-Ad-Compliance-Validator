"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import ImagePreview from "./ImagePreview";

const severityColor = {
  critical: "error",
  warning: "warning",
  info: "info",
};

export default function ReportView({
  report,
  onApplySuggestedFix,
  onExport,
  marketingCopy,
}) {
  const statusColor = report?.status === "pass" ? "success" : "error";

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardHeader
        title="Report"
        subheader="Compliance score and flagged issues."
        sx={{ pb: 0 }}
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={onExport}
            disabled={!report}
          >
            Export JSON
          </Button>
        }
      />
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {!report ? (
          <Alert severity="info">
            Run a check to see the compliance report.
          </Alert>
        ) : (
          <>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={`Score: ${report.complianceScore}/100`}
                color={statusColor}
                variant="filled"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={report.status === "pass" ? "Pass" : "Fail"}
                color={statusColor}
                variant="outlined"
              />
              <Typography color="text.secondary">
                Platform: {report.meta.platform} • Category:{" "}
                {report.meta.productCategory}
              </Typography>
            </Stack>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Violations
            </Typography>
            <Stack spacing={2}>
              {report.violations.map((v) => (
                <Card key={v.id} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={v.severity}
                        color={severityColor[v.severity] || "default"}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {v.policyReference} • {v.category}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Offending text: “{v.offendingText}”
                    </Typography>
                    <Typography color="text.secondary">
                      {v.explanation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confidence: {(v.confidence * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suggested fix: {v.suggestedFix}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() =>
                          onApplySuggestedFix(
                            v.suggestedFix.replace("Replace with: ", "")
                          )
                        }
                      >
                        Apply suggested fix
                      </Button>
                      <Button variant="text" size="small" onClick={onExport}>
                        Export JSON
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Image preview (mocked annotations)
            </Typography>
            <ImagePreview imageUrl={null} boxes={[]} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
