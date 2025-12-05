"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

// Simple mocked preview with optional bounding boxes.
export default function ImagePreview({ imageUrl, boxes = [] }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: 220,
        borderRadius: 2,
        borderColor: "grey.200",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "grey.50",
      }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt="Creative preview"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Typography color="text.secondary">
          Image preview will appear here.
        </Typography>
      )}

      {boxes.map((box, idx) => (
        <Box
          key={idx}
          sx={{
            position: "absolute",
            border: "2px solid rgba(255,0,0,0.6)",
            borderRadius: 1,
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            pointerEvents: "none",
          }}
          aria-label={box.label || "Violation region"}
        />
      ))}
    </Paper>
  );
}
