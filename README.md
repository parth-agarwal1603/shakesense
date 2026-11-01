# ShakeSense — Industrial Motor Health Telemetry & Diagnostic Platform

ShakeSense is a production-grade, dark-mode predictive maintenance and telemetric monitoring application engineered for factory floors, workshops, and industrial IoT environments.

Developed for **RideHack** by unifying Stitch-generated designs into a responsive, integrated web platform.

---

## System Architecture & Tech Stack

- **Framework**: React 18 with TypeScript and Vite 6
- **Routing**: React Router v6 with client-side history, deep linking, and URL parameter state preservation
- **Styling**: Tailwind CSS v3 with custom industrial tokens based on `kinetic_industrial_precision/DESIGN.md`
- **State Management**: Centralized single-source-of-truth `FleetContext` providing unified data consistency across all views
- **Iconography**: Crisp Lucide React SVG components (offline-resilient, zero CDN latency, zero layout shifts)
- **Typography**: 
  - **Inter** (`@fontsource/inter` 400, 500, 600, 700) for clean interface hierarchy
  - **JetBrains Mono** (`@fontsource/jetbrains-mono` 400, 500, 600, 700) with tabular numerals (`tnum`) for rock-solid mechanical measurements
- **DSP Telemetry Engine**: Simulated 1600 Hz time-domain triaxial vibration waveforms (X, dominant Y, Z axes), harmonic FFT bandpass filters, thermal load envelopes, and ISO 10816-3 Class II baseline deviation modeling
- **Testing**: Vitest + React Testing Library unit and integration test suite

---

## Implemented Pages & Capabilities

1. **`/overview` — Motor Health Overview**:
   - Fleet-wide KPI summary (12 Active Drives: 9 Healthy Normal, 2 Needs Attention, 1 Critical Alert).
   - High-contrast interactive vector motor schematic with triaxial sensor node placement callout.
   - Dual-axis baseline tolerance indicators and diagnostic recommendations.
   - Quick shift diagnostic log generation and download (`.md`).
   - One-click instant telemetry scan trigger.

2. **`/machines` — Machines Fleet Inventory**:
   - Searchable, filterable registry of all 12 monitored retrofit motor units.
   - Filters: All, Healthy Normal, Warning Drift, Critical Trigger, and Disconnected Edge Nodes.
   - Multi-column sort by ID, Name, Vibration Velocity, and Bearing Temperature.
   - CSV inventory export and ISO 10816 machinery fleet audit report download.
   - Provision Retrofit Node modal dialog with MAC and bus configuration.
   - Sensor Calibration matrix modal with baseline tolerance and sampling rate adjustments.

3. **`/machines/:machineId` — Individual Machine Profile**:
   - Comprehensive asset deep-dive (e.g. `MTR-001`, `PMP-002`, `CMP-004`).
   - Motor hardware specifications, learned baseline thresholds, and sensor topology.
   - Historical maintenance event log and interactive sensor recalibration workflow.
   - Contextual direct drill-down into live sensor telemetry.

4. **`/telemetry` & `/telemetry?machine=:id` — Live Telemetry & DSP Analysis**:
   - Real-time animated triaxial accelerometer stream (MPU-6050 emulation).
   - Dynamic peak cursor pin showing instantaneous peak velocity and dominant frequency.
   - Bandpass DSP filters: All Bands (0–800 Hz), 1X Harmonic (10–30 Hz), 2X Harmonic (30–60 Hz), Blade Pass / Rotor (60–200 Hz), and High-Freq Bearing Cage (200–800 Hz).
   - Thermal equilibrium envelope chart with ambient reference and 70°C trip limit.
   - Edge Coprocessor diagnostic status bar and debug console drawer.

5. **`/alerts` — Diagnostic Alarms & Events**:
   - Real-time threshold violation registry with severity tags (Critical, Warning, Advisory).
   - Dedicated **Acknowledge** and **Resolve** state transitions that update fleet-wide badge counts.
   - Multi-parameter filtering by severity, acknowledgment status, and specific machinery unit.

6. **`/analytics` — Predictive Analytics & Trends**:
   - Fleet-wide vibration RMS trends and thermal equilibrium tracking across 1h, 24h, 7d, and 30d windows.
   - ISO 10816-3 zone drift distribution breakdown (Zones A, B, C, D).
   - Harmonic deviation histograms comparing baseline vs. current operating profiles.

---

## Simulated vs. Real Hardware Telemetry Disclosure

In compliance with industrial engineering standards and honest system reporting:
- **Simulation**: Telemetry data, time-domain waveform sweeps, and edge synchronization streams are currently driven by a mathematical mock engine emulating ESP32-S3 + MPU-6050 I2C sensor nodes.
- **Physical Integration Readiness**: The domain model and context architecture are structured to plug directly into live MQTT brokers, WebSockets, or REST industrial edge gateways without refactoring UI layers.

### ML model integration

The dashboard supports both browser and backend model files. Copy `.env.example` to `.env.local`. With `VITE_MODEL_RUNTIME=auto`, ONNX and TensorFlow.js run in the browser; Python/native files use `VITE_ML_API_URL`.

To run the checked-in Python models locally:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

Then start the Vite app in a second terminal with `npm run dev`. The default frontend endpoint is `http://localhost:8000/predict`.

The backend request includes the three trained global artifacts in `global_models/`: the Random Forest classifier, Isolation Forest anomaly detector, and Median+MAD detector. It also includes an optional personalised profile from `VITE_PERSONALIZED_MODEL_PATH`. Each artifact declares its required feature columns so the backend can apply the correct feature engineering rather than treating all models as one seven-input model.

The model receives seven numeric features per machine, in this order:

`vibration.overall`, `vibration.x`, `vibration.y`, `vibration.z`, `temperature.core`, `temperature.ambient`, `edge.sampleRateHz`.

The output must be a 2D tensor with one row per machine. The first output value is exposed as `score`; the second value is mapped to `healthy` (`0`), `warning` (`1`), or `critical` (`2`).

Python-native files such as `.pkl`, `.joblib`, `.pt`, and `.pth` are loaded by the configured backend. The backend receives `models` (each with `id`, `path`, `format`, and `featureColumns`), the seven dashboard features, and must return `{ "predictions": [{ "machineId": "MTR-001", "models": { "...": { "score": 0, "label": "..." } } }] }`. The global artifacts were trained on `mean`, `rms`, `peak_to_peak`, `kurtosis`, and `crest_factor`; the personalised profile additionally requires `temperature_c` and must be run against window-level telemetry.

The dashboard derives the global feature vector from the current triaxial readings. Because the current UI stream exposes aggregate readings rather than raw FFT windows, `kurtosis` uses the neutral Gaussian value of `3`; deploy the edge/window telemetry path when production-grade personalized inference is required.

### ESP32 edge model

The firmware in [`global_models/esp32-model`](./global_models/esp32-model) is integrated as the `esp32Embedded` model contract. It computes `mean`, `rms`, `peak_to_peak`, `kurtosis`, `crest_factor`, and `temperature_c` over a 1000-sample MPU-6050 window, then applies the device Median+MAD profile from `ShakeSense_Profile.h`. The backend returns this edge result alongside the three global model results.

`ShakeSense_Profile.h` is intentionally a placeholder until a real profile is exported. Generate one from the personalized notebook output, then upload `ShakeSense_ESP32.ino` with the Arduino `Wire`, `OneWire`, and `DallasTemperature` libraries:

```bash
python global_models/esp32-model/export_profile.py \
  path/to/SHAKESENSE_MOTOR_001_calculated_features.csv \
  --device-id SHAKESENSE_MOTOR_001 \
  --output global_models/esp32-model/ShakeSense_Profile.h
```

The firmware emits comma-separated feature values and `status=NORMAL|ABNORMAL` over Serial at 115200 baud. The current web dashboard remains simulation-backed until a gateway forwards those records to the backend `/predict` request.

For TensorFlow.js, set:

```env
VITE_MODEL_PATH=/model
VITE_MODEL_FORMAT=tensorflowjs
VITE_MODEL_RUNTIME=browser
```

---

## Brand Colors & Design System Tokens

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Jet Black** | `#0A0A0A` / `#0C0D0F` | Main canvas background |
| **Cerulean Blue** | `#007BA7` | Active navigation, interactive controls, telemetry traces |
| **Neon Rose** | `#FF2D95` | Critical anomalies and threshold breaches |
| **Healthy Green** | `#32D583` | Nominal baseline operation |
| **Warning Amber** | `#F5B942` | Advisory harmonic drift |
| **Card Surface** | `#15171B` / `#1A1D23` | Instrument cards |
| **Elevated Surface**| `#1D2026` / `#242830` | Hover states, modals, and toolbars |
| **Border Outline** | `#30343B` / `#3F484E` | High-contrast component borders |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/parth-agarwal1603/shakesense.git
cd shakesense
npm install
```

### Running Locally (Development Mode)

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Test Suite

Execute the unit and integration tests via Vitest:

```bash
npm test
```

### Building for Production

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## License

Developed for RideHack / ShakeSense. All rights reserved.
