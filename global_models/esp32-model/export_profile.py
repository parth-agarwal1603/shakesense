"""Export a per-device Median+MAD profile from notebook-calculated real features.

Input CSV must be produced by the revised real-data notebook and include:
  mean,rms,peak_to_peak,kurtosis,crest_factor,temperature_c,verified_healthy
The notebook writes <DEVICE_ID>_calculated_features.csv.

This exporter deliberately creates a compact embedded Median+MAD profile.
It does NOT export the notebook's scikit-learn Isolation Forest.
"""
import argparse
import re
import pandas as pd

FEATURES = ["mean", "rms", "peak_to_peak", "kurtosis", "crest_factor", "temperature_c"]

p = argparse.ArgumentParser()
p.add_argument("csv", help="Calculated feature CSV from the real-data notebook")
p.add_argument("--device-id", required=True, help="Device ID to embed in firmware")
p.add_argument("--output", default="ShakeSense_Profile.h")
p.add_argument("--threshold", type=float, default=3.0, help="Robust z-score threshold")
args = p.parse_args()

df = pd.read_csv(args.csv)
missing = [c for c in FEATURES + ["verified_healthy"] if c not in df.columns]
if missing:
    raise SystemExit(f"CSV missing required columns: {missing}")

flag = df["verified_healthy"].astype(str).str.strip().str.lower().isin(["1", "true", "yes", "healthy"])
healthy = df.loc[flag, FEATURES].apply(pd.to_numeric, errors="coerce").dropna()
if len(healthy) < 30:
    raise SystemExit(f"Need at least 30 verified healthy windows; found {len(healthy)}")

medians = healthy.median()
mads = (healthy - medians).abs().median()
if (mads <= 1e-12).any():
    zero = list(mads[mads <= 1e-12].index)
    raise SystemExit(f"Zero/near-zero MAD for {zero}. Collect more varied healthy data or inspect units.")

safe_id = args.device_id.replace('\\', '\\\\').replace('"', '\\"')
lines = [
    "#pragma once",
    "// Auto-generated from verified real healthy windows. Do not edit manually.",
    f'#define SHAKESENSE_DEVICE_ID "{safe_id}"',
    f"#define SHAKESENSE_FEATURE_COUNT {len(FEATURES)}",
    "static const float shakesense_median[SHAKESENSE_FEATURE_COUNT] = {",
    "  " + ", ".join(f"{v:.9g}f" for v in medians.values) + ",",
    "};",
    "static const float shakesense_mad[SHAKESENSE_FEATURE_COUNT] = {",
    "  " + ", ".join(f"{v:.9g}f" for v in mads.values) + ",",
    "};",
    f"static const float SHAKESENSE_ROBUST_Z_THRESHOLD = {args.threshold:.9g}f;",
    "",
    "// Feature order: " + ", ".join(FEATURES),
    f"// Healthy windows used: {len(healthy)}",
]
with open(args.output, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print(f"Wrote {args.output} using {len(healthy)} verified healthy windows for {args.device_id}")
print("Medians:\n", medians)
print("MADs:\n", mads)
