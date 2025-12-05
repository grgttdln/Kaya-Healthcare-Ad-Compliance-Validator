"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="#">
        AdSafeCare
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: 1,
        borderColor: "divider",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(255,255,255,0.9)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.2} alignItems="center">
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            AdSafeCare
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            component="p"
          >
            Compliance made simple.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Link href="#" color="primary" underline="hover">
              Privacy
            </Link>
            <Link href="#" color="primary" underline="hover">
              Terms
            </Link>
            <Link href="#" color="primary" underline="hover">
              Support
            </Link>
          </Stack>
          <Copyright />
        </Stack>
      </Container>
    </Box>
  );
}
