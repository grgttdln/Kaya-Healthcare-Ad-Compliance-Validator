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
    <Container maxWidth="lg" component="main" sx={{ py: { xs: 8, md: 10 } }}>
      <Stack spacing={2} sx={{ textAlign: "center", mb: 6 }}>
        <Chip
          label="What you get"
          color="primary"
          variant="outlined"
          sx={{ alignSelf: "center", fontWeight: 700 }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Built for regulated teams
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 720, alignSelf: "center" }}
        >
          Automate the tedious parts of ad review while keeping humans in
          control. Kaya keeps your team fast, consistent, and audit-ready.
        </Typography>
      </Stack>

      <Grid container spacing={3} alignItems="stretch" justifyContent="center">
        {tiers.map((tier) => (
          <Grid item key={tier.title} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                borderColor: "grey.200",
                background:
                  "linear-gradient(180deg, rgba(11,99,246,0.06) 0%, rgba(255,255,255,0.95) 100%)",
              }}
            >
              <CardHeader
                title={tier.title}
                titleTypographyProps={{
                  align: "center",
                  variant: "h6",
                  fontWeight: 700,
                }}
                avatar={tier.icon}
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
                  spacing={1.2}
                  sx={{ p: 0, m: 0, listStyle: "none", alignItems: "center" }}
                >
                  {tier.description.map((line) => (
                    <Typography
                      component="li"
                      variant="body1"
                      color="text.secondary"
                      key={line}
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
  );
}
