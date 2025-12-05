"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

export default function Header() {
  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(255,255,255,0.85)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ flexGrow: 1 }}
          >
            <Chip
              label="AdSafeCare"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
            />
            <Typography variant="body2" color="text.secondary">
              Compliance Validator for Healthcare Ads
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ display: { xs: "none", sm: "inline-flex" } }}></Box>
            <Button
              href="/compliance"
              color="primary"
              variant="contained"
              sx={{ fontWeight: 700 }}
            >
              Get started
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
