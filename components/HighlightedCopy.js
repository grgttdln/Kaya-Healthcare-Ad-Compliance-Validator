"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

const severityColors = {
  critical: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "#ef4444",
    text: "#991b1b",
    label: "Critical",
  },
  warning: {
    background: "rgba(234, 179, 8, 0.2)",
    border: "#eab308",
    text: "#854d0e",
    label: "Warning",
  },
  info: {
    background: "rgba(59, 130, 246, 0.15)",
    border: "#3b82f6",
    text: "#1e40af",
    label: "Info",
  },
};

/**
 * HighlightedCopy - Renders marketing copy with problematic phrases highlighted inline
 * @param {string} copy - The original marketing copy
 * @param {Array} violations - Array of violations with offendingText, severity, category, etc.
 */
export default function HighlightedCopy({ copy, violations = [] }) {
  const highlights = React.useMemo(() => {
    if (!copy || !violations.length) return [];

    // Build highlight ranges from violations
    const ranges = [];
    const copyLower = copy.toLowerCase();

    violations.forEach((v) => {
      if (!v.offendingText) return;

      const textLower = v.offendingText.toLowerCase();
      let searchStart = 0;

      // Find all occurrences of the offending text
      while (searchStart < copyLower.length) {
        const idx = copyLower.indexOf(textLower, searchStart);
        if (idx === -1) break;

        ranges.push({
          start: idx,
          end: idx + v.offendingText.length,
          severity: (v.severity || "info").toLowerCase(),
          category: v.category || "Violation",
          explanation: v.explanation || "",
          policyReference: v.policyReference || "",
          originalText: copy.slice(idx, idx + v.offendingText.length),
        });

        searchStart = idx + 1;
      }
    });

    // Sort by start position
    ranges.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges (keep highest severity)
    const merged = [];
    for (const range of ranges) {
      if (merged.length === 0) {
        merged.push(range);
        continue;
      }

      const last = merged[merged.length - 1];
      if (range.start <= last.end) {
        // Overlapping - extend and keep higher severity
        last.end = Math.max(last.end, range.end);
        const severityRank = { critical: 3, warning: 2, info: 1 };
        if (severityRank[range.severity] > severityRank[last.severity]) {
          last.severity = range.severity;
          last.category = range.category;
          last.explanation = range.explanation;
        }
      } else {
        merged.push(range);
      }
    }

    return merged;
  }, [copy, violations]);

  // If no copy or no highlights, show plain text
  if (!copy) {
    return (
      <Typography variant="body2" color="text.secondary">
        No marketing copy provided.
      </Typography>
    );
  }

  if (highlights.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          backgroundColor: "#f8fafc",
          borderRadius: 1.5,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.8,
            color: "#1e293b",
          }}
        >
          {copy}
        </Typography>
      </Box>
    );
  }

  // Build segments: alternating plain text and highlighted text
  const segments = [];
  let lastEnd = 0;

  highlights.forEach((h, idx) => {
    // Add plain text before this highlight
    if (h.start > lastEnd) {
      segments.push({
        type: "plain",
        text: copy.slice(lastEnd, h.start),
        key: `plain-${idx}`,
      });
    }

    // Add highlighted segment
    segments.push({
      type: "highlight",
      text: copy.slice(h.start, h.end),
      severity: h.severity,
      category: h.category,
      explanation: h.explanation,
      policyReference: h.policyReference,
      key: `highlight-${idx}`,
    });

    lastEnd = h.end;
  });

  // Add remaining plain text
  if (lastEnd < copy.length) {
    segments.push({
      type: "plain",
      text: copy.slice(lastEnd),
      key: "plain-end",
    });
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          Original copy with violations highlighted
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {Object.entries(severityColors).map(([key, val]) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.5,
                  backgroundColor: val.background,
                  border: `1px solid ${val.border}`,
                }}
              />
              <span>{val.label}</span>
            </Box>
          ))}
        </Box>
      </Stack>

      <Box
        sx={{
          p: 2,
          backgroundColor: "#ffffff",
          borderRadius: 1.5,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          component="div"
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 2,
            color: "#1e293b",
            fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
          }}
        >
          {segments.map((seg) => {
            if (seg.type === "plain") {
              return <span key={seg.key}>{seg.text}</span>;
            }

            const colors = severityColors[seg.severity] || severityColors.info;

            return (
              <Tooltip
                key={seg.key}
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {seg.category}
                    </Typography>
                    {seg.policyReference && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", opacity: 0.8 }}
                      >
                        Rule: {seg.policyReference}
                      </Typography>
                    )}
                    {seg.explanation && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {seg.explanation}
                      </Typography>
                    )}
                  </Box>
                }
                arrow
                placement="top"
              >
                <Box
                  component="mark"
                  sx={{
                    backgroundColor: colors.background,
                    borderBottom: `2px solid ${colors.border}`,
                    color: colors.text,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    cursor: "help",
                    transition: "all 0.15s ease",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: colors.border,
                      color: "#fff",
                    },
                  }}
                >
                  {seg.text}
                </Box>
              </Tooltip>
            );
          })}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        Hover over highlighted text to see violation details
      </Typography>
    </Stack>
  );
}
