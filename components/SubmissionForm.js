"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import ImagePreview from "./ImagePreview";

const platforms = ["Meta", "Facebook", "Instagram", "Google Ads", "TikTok"];

export default function SubmissionForm({
  value,
  onChange,
  onSubmit,
  loading,
  categories = ["OTC drugs", "Food/Dietary Supplements", "Alcohol"],
}) {
  const [errors, setErrors] = React.useState({});

  const handleField = (field, val) => {
    onChange((prev) => ({ ...prev, [field]: val }));
  };

  const validate = () => {
    const next = {};
    if (!value.marketingCopy.trim())
      next.marketingCopy = "Marketing copy is required.";
    if (value.imageMode === "upload" && !value.imageFile && !value.imageUrl) {
      // Optional image; no error when both missing.
    }
    if (!value.platform) next.platform = "Select a platform.";
    if (!value.category) next.category = "Select a category.";
    if (value.category === "custom" && !value.categoryCustom.trim()) {
      next.categoryCustom = "Enter a category.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...value };
    onSubmit(payload);
  };

  const imagePreviewUrl =
    value.imageMode === "upload" && value.imageFile
      ? URL.createObjectURL(value.imageFile)
      : value.imageMode === "url"
      ? value.imageUrl
      : "";

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardHeader
        title="Submit content"
        subheader="Run AI compliance checks before launch."
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Marketing copy"
              value={value.marketingCopy}
              onChange={(e) => handleField("marketingCopy", e.target.value)}
              multiline
              minRows={4}
              required
              error={Boolean(errors.marketingCopy)}
              helperText={errors.marketingCopy}
              placeholder="Enter the ad headline and body..."
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Image input (optional — used for OCR, before/after, nudity
                flags)
              </Typography>
              <RadioGroup
                row
                value={value.imageMode}
                onChange={(e) => handleField("imageMode", e.target.value)}
                name="image-mode"
              >
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload file"
                />
                <FormControlLabel
                  value="url"
                  control={<Radio />}
                  label="Image URL"
                />
              </RadioGroup>
              {value.imageMode === "upload" ? (
                <Stack spacing={1}>
                  <Button variant="outlined" component="label">
                    {value.imageFile ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleField("imageFile", file || null);
                      }}
                    />
                  </Button>
                  {errors.imageFile && (
                    <FormHelperText error>{errors.imageFile}</FormHelperText>
                  )}
                </Stack>
              ) : (
                <TextField
                  label="Image URL"
                  value={value.imageUrl}
                  onChange={(e) => handleField("imageUrl", e.target.value)}
                  fullWidth
                  error={Boolean(errors.imageUrl)}
                  helperText={errors.imageUrl}
                />
              )}
              <Box sx={{ mt: 2 }}>
                <ImagePreview imageUrl={imagePreviewUrl} />
              </Box>
            </Box>

            <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
              <FormControl fullWidth error={Boolean(errors.platform)}>
                <InputLabel id="platform-label">Platform</InputLabel>
                <Select
                  labelId="platform-label"
                  label="Platform"
                  value={value.platform}
                  onChange={(e) => handleField("platform", e.target.value)}
                  required
                >
                  {platforms.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
                {errors.platform && (
                  <FormHelperText error>{errors.platform}</FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                error={
                  Boolean(errors.category) || Boolean(errors.categoryCustom)
                }
              >
                <InputLabel id="category-label">Product category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Product category"
                  value={value.category}
                  onChange={(e) => handleField("category", e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom (free form)</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText error>{errors.category}</FormHelperText>
                )}
                {value.category === "custom" && (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      label="Enter category"
                      fullWidth
                      value={value.categoryCustom}
                      onChange={(e) =>
                        handleField("categoryCustom", e.target.value)
                      }
                      error={Boolean(errors.categoryCustom)}
                      helperText={errors.categoryCustom}
                    />
                  </Box>
                )}
              </FormControl>
            </Stack>

            <Divider />

            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} /> : null}
                sx={{ mr: 1, minWidth: 140 }}
              >
                {loading ? "Running..." : "Run check"}
              </Button>
              <Button
                variant="text"
                color="secondary"
                disabled={loading}
                onClick={() =>
                  onChange({
                    marketingCopy: "",
                    imageMode: "upload",
                    imageFile: null,
                    imageUrl: "",
                    platform: "Meta",
                    category: "Weight loss",
                    categoryCustom: "",
                  })
                }
              >
                Reset
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
