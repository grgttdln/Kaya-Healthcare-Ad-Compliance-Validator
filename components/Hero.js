"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

export default function Hero() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0B63F6 0%, #52E0C7 100%)",
        color: "common.white",
        pt: { xs: 8, md: 12 },
        pb: { xs: 10, md: 14 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            maxWidth: 780,
            textAlign: "center",
            mx: "auto",
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
            <Chip label="Healthcare compliance" color="secondary" />
            <Chip
              label="Ad review automation"
              variant="outlined"
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)" }}
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
            sx={{ opacity: 0.9, lineHeight: 1.6 }}
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
          >
            <Button variant="contained" size="large" color="secondary">
              Get started
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              sx={{ borderColor: "rgba(255,255,255,0.7)" }}
            >
              Watch demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
