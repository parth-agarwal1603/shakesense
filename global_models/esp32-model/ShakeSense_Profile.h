#pragma once
// Replace this placeholder profile with the output of export_profile.py.
// Values below are NOT trained values and are deliberately invalid placeholders.
#define SHAKESENSE_DEVICE_ID "REPLACE_WITH_DEVICE_ID"
#define SHAKESENSE_FEATURE_COUNT 6
static const float shakesense_median[SHAKESENSE_FEATURE_COUNT] = {
  0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f
};
static const float shakesense_mad[SHAKESENSE_FEATURE_COUNT] = {
  0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f
};
static const float SHAKESENSE_ROBUST_Z_THRESHOLD = 3.0f;
