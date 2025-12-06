"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import ChecklistRtlIcon from "@mui/icons-material/ChecklistRtl";

const tiers = [
  {
    title: "Fast Analysis",
    description: ["Real-time checking", "Instant feedback", "Detailed reports"],
    icon: <SpeedIcon color="primary" fontSize="large" />,
  },
  {
    title: "Secure",
    description: ["Data encryption", "Private audits", "Compliance logs"],
    icon: <SecurityIcon color="primary" fontSize="large" />,
  },
  {
    title: "Comprehensive",
    description: [
      "Multi-platform support",
      "Regulatory updates",
      "Expert support",
    ],
    icon: <ChecklistRtlIcon color="primary" fontSize="large" />,
  },
];

export default function Features() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 9, md: 11 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" component="main" sx={{ position: "relative" }}>
        <Stack spacing={2} sx={{ textAlign: "center", mb: 4 }}>
          <Chip
            label="What you get"
            color="primary"
            variant="outlined"
            sx={{
              alignSelf: "center",
              fontWeight: 700,
              backgroundColor: "rgba(11,99,246,0.07)",
              borderColor: "rgba(11,99,246,0.22)",
              letterSpacing: "0.02em",
            }}
          />
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Built for regulated teams
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ maxWidth: 720, alignSelf: "center", lineHeight: 1.6 }}
          >
            Automate the tedious parts of ad review while keeping humans in
            control. Kaya keeps your team fast, consistent, and audit-ready.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={3}
          alignItems="stretch"
          justifyContent="center"
        >
          {tiers.map((tier) => (
            <Grid
              item
              key={tier.title}
              xs={12}
              sm={6}
              md={4}
              sx={{ display: "flex" }}
            >
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderColor: "rgba(15, 23, 42, 0.12)",
                  background:
                    "linear-gradient(180deg, rgba(250,252,255,0.96) 0%, rgba(243,247,254,0.94) 100%)",
                  transition: "border-color 120ms ease, transform 120ms ease",
                  "&:hover": {
                    borderColor: "rgba(11, 99, 246, 0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  sx={{
                    height: 5,
                    background:
                      "linear-gradient(90deg, #0b63f6 0%, #5de0c6 100%)",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                />
                <CardHeader
                  title={tier.title}
                  titleTypographyProps={{
                    align: "center",
                    variant: "h6",
                    fontWeight: 750,
                    letterSpacing: "-0.01em",
                  }}
                  avatar={
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: "transparent",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {tier.icon}
                    </Box>
                  }
                  sx={{
                    pb: 1,
                    textAlign: "center",
                    "& .MuiCardHeader-avatar": {
                      m: 0,
                      mx: "auto",
                    },
                  }}
                />
                <CardContent
                  sx={{
                    pt: 0,
                    textAlign: "center",
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack
                    component="ul"
                    spacing={1.1}
                    sx={{ p: 0, m: 0, listStyle: "none", alignItems: "center" }}
                  >
                    {tier.description.map((line) => (
                      <Typography
                        component="li"
                        variant="body1"
                        color="text.secondary"
                        key={line}
                        sx={{ fontWeight: 500 }}
                      >
                        {line}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
