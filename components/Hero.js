"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

export default function Hero() {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0b63f6 0%, #5dd0f5 55%, #f2f7ff 100%)",
        color: "common.white",
        pt: { xs: 8, md: 12 },
        pb: { xs: 12, md: 16 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(800px at 20% 20%, rgba(255,255,255,0.2), transparent 60%), radial-gradient(700px at 80% 10%, rgba(255,255,255,0.18), transparent 55%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            maxWidth: 780,
            textAlign: "center",
            mx: "auto",
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
            <Chip
              label="Healthcare compliance"
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label="Ad review automation"
              variant="outlined"
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.6)",
                fontWeight: 700,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />
          </Stack>
          <Typography
            component="h1"
            variant="h2"
            sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
            gutterBottom
          >
            Confidently ship compliant healthcare ads.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.9)",
            }}
            gutterBottom
          >
            Run automated checks, review findings, and export approvals in
            minutes—not days.
          </Typography>
          <Stack
            sx={{ pt: 4 }}
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          ></Stack>
        </Box>
      </Container>
    </Box>
  );
}
