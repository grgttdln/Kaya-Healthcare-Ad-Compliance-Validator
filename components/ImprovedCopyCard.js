"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import Collapse from "@mui/material/Collapse";

export default function ImprovedCopyCard({ improvedCopy, originalCopy, onApply }) {
  const [showComparison, setShowComparison] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (!improvedCopy || improvedCopy.method === "fallback") {
    return null;
  }

  const hasImprovement =
    improvedCopy.method !== "no-changes-needed" &&
    improvedCopy.improvedCopy !== originalCopy;

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedCopy.improvedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceColor =
    improvedCopy.confidence >= 0.8
      ? "success"
      : improvedCopy.confidence >= 0.6
      ? "warning"
      : "error";

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: hasImprovement ? "#10b981" : "#3b82f6",
        backgroundColor: hasImprovement
          ? "rgba(16, 185, 129, 0.02)"
          : "rgba(59, 130, 246, 0.02)",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: hasImprovement
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(59, 130, 246, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasImprovement ? (
                  <AutoFixHighRoundedIcon
                    sx={{ fontSize: 20, color: "#059669" }}
                  />
                ) : (
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 20, color: "#2563eb" }}
                  />
                )}
              </Box>
              <Stack spacing={0.25}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {hasImprovement
                    ? "✨ AI-Improved Marketing Copy"
                    : "✓ Copy is Compliant"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasImprovement
                    ? "Automatically fixed all violations"
                    : "No changes needed"}
                </Typography>
              </Stack>
            </Stack>
            {improvedCopy.confidence > 0 && (
              <Chip
                label={`${Math.round(improvedCopy.confidence * 100)}% confidence`}
                color={confidenceColor}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>

          {/* Improved Copy Display */}
          {hasImprovement && (
            <>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#ffffff",
                  borderRadius: 1.5,
                  border: "2px solid #10b981",
                  position: "relative",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.7,
                    color: "#111827",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {improvedCopy.improvedCopy}
                </Typography>
                <IconButton
                  onClick={handleCopy}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: copied ? "#10b981" : "rgba(0,0,0,0.05)",
                    color: copied ? "#fff" : "#64748b",
                    "&:hover": {
                      backgroundColor: copied ? "#059669" : "rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {copied ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Box>

              {/* Changes Made */}
              {improvedCopy.changes && improvedCopy.changes.length > 0 && (
                <Stack spacing={0.75}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                    }}
                  >
                    Changes Made
                  </Typography>
                  <Stack spacing={0.5}>
                    {improvedCopy.changes.map((change, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            mt: 0.75,
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {change}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Comparison Toggle */}
              <Box>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<CompareArrowsRoundedIcon />}
                  onClick={() => setShowComparison(!showComparison)}
                  sx={{ textTransform: "none" }}
                >
                  {showComparison ? "Hide" : "Show"} original copy
                </Button>
                <Collapse in={showComparison}>
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      backgroundColor: "#f9fafb",
                      borderRadius: 1,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                    >
                      ORIGINAL:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        whiteSpace: "pre-wrap",
                        textDecoration: "line-through",
                        opacity: 0.7,
                      }}
                    >
                      {originalCopy}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onApply(improvedCopy.improvedCopy)}
                  startIcon={<CheckCircleRoundedIcon />}
                >
                  Apply Improved Copy
                </Button>
                <Button variant="outlined" onClick={handleCopy}>
                  Copy to Clipboard
                </Button>
              </Stack>
            </>
          )}

          {/* No changes needed message */}
          {!hasImprovement && (
            <Box
              sx={{
                p: 2,
                backgroundColor: "rgba(59, 130, 246, 0.05)",
                borderRadius: 1.5,
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Your marketing copy is already compliant with all platform
                policies. No changes needed!
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

