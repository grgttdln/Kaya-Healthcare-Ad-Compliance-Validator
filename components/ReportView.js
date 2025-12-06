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
import Collapse from "@mui/material/Collapse";
import ButtonBase from "@mui/material/ButtonBase";
import Grid from "@mui/material/Grid";
import ImagePreview from "./ImagePreview";
import ImprovedCopyCard from "./ImprovedCopyCard";
import HighlightedCopy from "./HighlightedCopy";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";

const severityTone = {
  critical: { dot: "#d32f2f", label: "Critical" },
  warning: { dot: "#edb200", label: "Moderate" },
  info: { dot: "#9e9e9e", label: "Minor" },
};

const severityStyles = {
  critical: {
    border: "#fecdd3",
    chipBg: "rgba(239, 68, 68, 0.12)",
    chipText: "#b91c1c",
  },
  warning: {
    border: "#fef9c3",
    chipBg: "rgba(234, 179, 8, 0.12)",
    chipText: "#92400e",
  },
  info: {
    border: "#e5e7eb",
    chipBg: "rgba(107, 114, 128, 0.14)",
    chipText: "#374151",
  },
};

const groupMeta = {
  text: {
    label: "Text Violations",
    helper: "Copy and claim issues.",
    Icon: DescriptionRoundedIcon,
  },
  image: {
    label: "Image Violations",
    helper: "Visual-only issues.",
    Icon: ImageRoundedIcon,
  },
};

const violationGroups = ["text", "image"];

export default function ReportView({
  report,
  onApplySuggestedFix,
  onExport,
  onExportPdf = () => {},
  marketingCopy,
  imagePreviewUrl,
}) {
  const statusColor = report?.status === "pass" ? "success" : "error";
  const boxes = report?.imageAnnotations || [];
  const imageInsights = report?.imageInsights || {};
  const imageAnalyzed = report?.meta?.imageAnalyzed;
  const imageSource = report?.meta?.imageSource;
  const reportImageUrl = report?.meta?.imageUrl || "";
  const previewUrl = imagePreviewUrl || reportImageUrl || null;

  const groupedViolations = React.useMemo(() => {
    const base = Object.fromEntries(violationGroups.map((k) => [k, []]));
    (report?.violations || []).forEach((v) => {
      const category = (v.category || "").toLowerCase();
      const isImageCategory =
        category.includes("image") || category.includes("imagery");
      const isTextCategory =
        category.includes("text") || category.includes("copy");
      const isCrossModal = !!v.offendingText && !!v.offendingImageRegion;
      const isImageSignal = !!v.offendingImageRegion || isImageCategory;

      if (isCrossModal) {
        base.image.push(v);
        return;
      }
      if (isImageSignal) {
        base.image.push(v);
        return;
      }
      if (isTextCategory || v.offendingText) {
        base.text.push(v);
        return;
      }
      base.text.push(v);
    });
    return base;
  }, [report?.violations]);

  const [openGroups, setOpenGroups] = React.useState(new Set(violationGroups));

  const allViolations = report?.violations || [];
  const severityCounts = React.useMemo(() => {
    return allViolations.reduce(
      (acc, v) => {
        const key = (v.severity || "info").toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { critical: 0, warning: 0, info: 0 }
    );
  }, [allViolations]);
  const totalViolations = allViolations.length;

  React.useEffect(() => {
    const defaults = new Set(
      violationGroups.filter((key) => (groupedViolations[key] || []).length > 0)
    );
    setOpenGroups(defaults.size ? defaults : new Set(violationGroups));
  }, [report?.violations, groupedViolations]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getSeverityTone = (severity) =>
    severityTone[severity] || { dot: "#9e9e9e", label: severity || "Info" };
  const getSeverityStyle = (severity) =>
    severityStyles[severity] || severityStyles.info;

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
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={onExport}
              disabled={!report}
              sx={{
                fontWeight: 700,
                boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
              }}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onExportPdf}
              disabled={!report}
              sx={{
                fontWeight: 700,
                borderWidth: 2,
                textTransform: "none",
              }}
            >
              Export PDF
            </Button>
          </Stack>
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
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
              {report?.meta?.platform && (
                <Chip
                  label={`${report.meta.platform}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
              {report?.meta?.platformStrictness && (
                <Chip
                  label={`${report.meta.platformStrictness}x strictness`}
                  size="small"
                  color={
                    report.meta.platformStrictness >= 1.4
                      ? "error"
                      : report.meta.platformStrictness >= 1.2
                      ? "warning"
                      : "default"
                  }
                  sx={{ fontWeight: 600 }}
                />
              )}
              {report?.meta?.categoryRisk && report.meta.categoryRisk > 1.0 && (
                <Chip
                  label={`${report.meta.categoryRisk}x category risk`}
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>

            <Divider />

            <Stack spacing={1.75}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Violations
                </Typography>
              </Stack>

              <Box
                sx={{
                  borderRadius: 1.25,
                  border: "1px dashed",
                  borderColor: "divider",
                  backgroundColor: "#f8fafc",
                  p: { xs: 1.25, sm: 1.5 },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {totalViolations
                        ? `${totalViolations} open issue${
                            totalViolations > 1 ? "s" : ""
                          }`
                        : "No violations detected"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Severity breakdown for this run.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    <Chip
                      label={`Critical: ${severityCounts.critical || 0}`}
                      size="small"
                      color={severityCounts.critical ? "error" : "default"}
                    />
                    <Chip
                      label={`Moderate: ${severityCounts.warning || 0}`}
                      size="small"
                      color={severityCounts.warning ? "warning" : "default"}
                    />
                    <Chip
                      label={`Minor: ${severityCounts.info || 0}`}
                      size="small"
                      color="default"
                    />
                  </Stack>
                </Stack>
              </Box>

              <Grid>
                {violationGroups.map((key) => {
                  const meta = groupMeta[key];
                  const list = groupedViolations[key] || [];
                  const isOpen = openGroups.has(key);
                  return (
                    <Grid item xs={12} key={key}>
                      <Box
                        sx={{
                          mb: 1,
                          borderRadius: 1.25,
                          border: "1px dashed",
                          borderColor: "divider",
                          backgroundColor: "#f9fafb",
                          p: { xs: 1.5, sm: 1.75 },
                          width: "100%",
                        }}
                      >
                        <ButtonBase
                          onClick={() => toggleGroup(key)}
                          sx={{
                            width: "100%",
                            textAlign: "left",
                            borderRadius: 1.5,
                            px: 1.25,
                            py: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                          }}
                          disableRipple
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.25,
                                backgroundColor: "#e5edff",
                                color: "#2f4fdb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <meta.Icon
                                sx={{ fontSize: 18, color: "#1f3bb3" }}
                              />
                            </Box>
                            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {meta.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {meta.helper}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Box
                            sx={{
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 999,
                              backgroundColor: list.length
                                ? "rgba(239, 68, 68, 0.12)"
                                : "rgba(15, 23, 42, 0.06)",
                              color: list.length ? "#b91c1c" : "#475569",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {list.length
                              ? `${list.length} issue${
                                  list.length > 1 ? "s" : ""
                                }`
                              : "None"}
                          </Box>
                        </ButtonBase>

                        <Collapse in={isOpen}>
                          {list.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ px: 1, pt: 1.25 }}
                            >
                              No {meta.label.toLowerCase()}.
                            </Typography>
                          ) : (
                            <Box
                              sx={{
                                pt: 1.25,
                                display: "grid",
                                gap: { xs: 1.25, md: 1.5 },
                                gridTemplateColumns: "1fr",
                                width: "100%",
                              }}
                            >
                              {list.map((v) => {
                                const tone = getSeverityTone(v.severity);
                                const severityStyle = getSeverityStyle(
                                  v.severity
                                );

                                return (
                                  <Box
                                    key={v.id}
                                    sx={{
                                      p: { xs: 1.5, sm: 1.75 },
                                      borderRadius: 1.25,
                                      border: "1px solid",
                                      borderColor: severityStyle.border,
                                      backgroundColor: "#fff",
                                      cursor: "default",
                                      transition: "all 0.15s ease",
                                      boxShadow:
                                        "0 1px 3px rgba(15, 23, 42, 0.06)",
                                      height: "100%",
                                      width: "100%",
                                    }}
                                  >
                                    <Stack spacing={1}>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{ minWidth: 0 }}
                                      >
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                          sx={{ minWidth: 0 }}
                                        >
                                          <Box
                                            sx={{
                                              width: 10,
                                              height: 10,
                                              borderRadius: "50%",
                                              backgroundColor: tone.dot,
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              fontWeight: 700,
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                          >
                                            {v.category || "Violation"}
                                          </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.75}>
                                          <Chip
                                            size="small"
                                            label={tone.label}
                                            sx={{
                                              backgroundColor:
                                                severityStyle.chipBg,
                                              color: severityStyle.chipText,
                                              fontWeight: 700,
                                              textTransform: "capitalize",
                                            }}
                                          />
                                          <Chip
                                            size="small"
                                            label={`Rule ${v.policyReference}`}
                                            variant="outlined"
                                          />
                                        </Stack>
                                      </Stack>

                                      <Stack spacing={0.4}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{
                                            fontWeight: 700,
                                            letterSpacing: 0.2,
                                            textTransform: "uppercase",
                                          }}
                                        >
                                          Why this was flagged
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {v.explanation}
                                          {v.offendingText
                                            ? ` The phrase "${v.offendingText}" triggered this rule.`
                                            : ""}
                                        </Typography>
                                      </Stack>

                                      {v.offendingText ? (
                                        <Stack spacing={0.35}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                              fontWeight: 700,
                                              letterSpacing: 0.2,
                                              textTransform: "uppercase",
                                            }}
                                          >
                                            Flagged text
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: "#111827",
                                              backgroundColor: "#f8fafc",
                                              borderRadius: 1,
                                              px: 1.25,
                                              py: 0.6,
                                              border: "1px solid #e2e8f0",
                                              whiteSpace: "pre-wrap",
                                              wordBreak: "break-word",
                                              mt: 0.25,
                                            }}
                                          >
                                            {`"${v.offendingText}"`}
                                          </Typography>
                                        </Stack>
                                      ) : null}

                                      {v.suggestedFix ? (
                                        <Stack spacing={0.35}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                              fontWeight: 700,
                                              letterSpacing: 0.2,
                                              textTransform: "uppercase",
                                            }}
                                          >
                                            How to fix it
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                              backgroundColor: "#f9fafb",
                                              borderRadius: 1,
                                              px: 1,
                                              py: 0.6,
                                              border: "1px dashed #e5e7eb",
                                            }}
                                          >
                                            {v.suggestedFix}
                                          </Typography>
                                        </Stack>
                                      ) : null}
                                    </Stack>
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </Collapse>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>

            {/* Highlighted Original Copy Section */}
            {marketingCopy && allViolations.length > 0 && (
              <>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Highlighted violations in copy
                  </Typography>
                  <HighlightedCopy
                    copy={marketingCopy}
                    violations={allViolations}
                  />
                </Stack>
              </>
            )}

            {/* Improved Copy Section */}
            {report?.improvedCopy && (
              <>
                <Divider />
                <ImprovedCopyCard
                  improvedCopy={report.improvedCopy}
                  originalCopy={marketingCopy}
                  onApply={onApplySuggestedFix}
                />
              </>
            )}

            {previewUrl && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Image preview
                    </Typography>
                    {boxes.length > 0 && (
                      <Chip
                        label={`${boxes.length} region${
                          boxes.length > 1 ? "s" : ""
                        } flagged`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          color: "#b91c1c",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Stack>
                  <ImagePreview imageUrl={previewUrl} boxes={boxes} />
                </Stack>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
