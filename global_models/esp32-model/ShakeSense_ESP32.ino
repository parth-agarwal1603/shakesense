/*
  ShakeSense ESP32 - compact personalised vibration anomaly detector

  Embedded algorithm: per-device Median + MAD robust baseline.
  This is NOT a compiled sklearn Isolation Forest. It is a lightweight,
  interpretable personalised detector suitable for ESP32 deployment.

  Hardware assumptions (edit to match your wiring):
    MPU6050 I2C: SDA=21, SCL=22, address=0x68
    DS18B20 data: GPIO 4, with 4.7k pull-up to 3.3V

  Arduino libraries:
    - OneWire
    - DallasTemperature

  MPU6050 is read directly over I2C (no MPU library required).
*/
#include <Arduino.h>
#include <math.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "ShakeSense_Profile.h"

static const int I2C_SDA_PIN = 21;
static const int I2C_SCL_PIN = 22;
static const uint8_t MPU_ADDR = 0x68;
static const int DS18B20_PIN = 4;
static const uint32_t SAMPLE_RATE_HZ = 100;
static const uint16_t WINDOW_SIZE = 1000;
static const float ACCEL_LSB_PER_G = 16384.0f; // MPU6050 +/-2g range
static const uint32_t SAMPLE_PERIOD_US = 1000000UL / SAMPLE_RATE_HZ;

OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);

float samples[WINDOW_SIZE];
float temperatureC = NAN;
uint16_t sampleCount = 0;
uint32_t nextSampleUs = 0;

bool writeMPU(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

bool readAccelX_g(float &x_g) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom(MPU_ADDR, (uint8_t)6, (uint8_t)true) != 6) return false;
  int16_t ax = (int16_t)((Wire.read() << 8) | Wire.read());
  Wire.read(); Wire.read(); // discard Y
  Wire.read(); Wire.read(); // discard Z
  x_g = ((float)ax) / ACCEL_LSB_PER_G;
  return true;
}

struct Features {
  float mean;
  float rms;
  float peakToPeak;
  float kurtosis;
  float crestFactor;
  float temperature;
};

Features calculateFeatures(const float *x, uint16_t n, float tempC) {
  Features f{};
  if (n == 0) return f;

  double sum = 0.0, sumSq = 0.0;
  float minV = x[0], maxV = x[0], peakAbs = fabsf(x[0]);
  for (uint16_t i = 0; i < n; ++i) {
    const float v = x[i];
    sum += v;
    sumSq += (double)v * (double)v;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
    if (fabsf(v) > peakAbs) peakAbs = fabsf(v);
  }
  const double mean = sum / n;
  const double m2 = sumSq / n - mean * mean;
  f.mean = (float)mean;
  f.rms = sqrtf((float)(sumSq / n));
  f.peakToPeak = maxV - minV;
  f.temperature = tempC;

  // Pearson kurtosis, matching scipy.stats.kurtosis(..., fisher=False)
  // apart from the small-sample bias correction used by scipy's default bias=True.
  double m4 = 0.0;
  for (uint16_t i = 0; i < n; ++i) {
    const double d = (double)x[i] - mean;
    m4 += d * d * d * d;
  }
  m4 /= n;
  f.kurtosis = (m2 > 1e-18) ? (float)(m4 / (m2 * m2)) : 0.0f;
  f.crestFactor = (f.rms > 1e-12f) ? peakAbs / f.rms : 0.0f;
  return f;
}

struct Detection {
  bool abnormal;
  float maxAbsRobustZ;
};

Detection detectAnomaly(const Features &f) {
  const float values[SHAKESENSE_FEATURE_COUNT] = {
    f.mean, f.rms, f.peakToPeak, f.kurtosis, f.crestFactor, f.temperature
  };
  float maxZ = 0.0f;
  for (uint8_t i = 0; i < SHAKESENSE_FEATURE_COUNT; ++i) {
    const float mad = shakesense_mad[i];
    if (!(mad > 1e-12f)) continue; // zero-MAD feature is ignored; fix profile if this occurs
    const float z = 0.6745f * (values[i] - shakesense_median[i]) / mad;
    const float absZ = fabsf(z);
    if (absZ > maxZ) maxZ = absZ;
  }
  Detection d;
  d.maxAbsRobustZ = maxZ;
  d.abnormal = maxZ > SHAKESENSE_ROBUST_Z_THRESHOLD;
  return d;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  Wire.setClock(400000);
  tempSensor.begin();

  // Wake MPU6050 and configure +/-2g accelerometer range.
  if (!writeMPU(0x6B, 0x00)) {
    Serial.println("ERROR: MPU6050 not responding. Check I2C wiring/address.");
    while (true) delay(1000);
  }
  writeMPU(0x1C, 0x00); // +/-2g

  Serial.println("ShakeSense ESP32 started");
  Serial.print("Device profile: "); Serial.println(SHAKESENSE_DEVICE_ID);
  Serial.println("Features: mean,rms,peak_to_peak,kurtosis,crest_factor,temperature_c");
  nextSampleUs = micros();
}

void loop() {
  const uint32_t now = micros();
  if ((int32_t)(now - nextSampleUs) < 0) return;
  nextSampleUs += SAMPLE_PERIOD_US;

  float ax_g;
  if (!readAccelX_g(ax_g)) {
    Serial.println("WARN: MPU6050 read failed; skipping sample");
    return;
  }
  samples[sampleCount++] = ax_g;

  if (sampleCount >= WINDOW_SIZE) {
    // DS18B20 temperature sampled once per vibration window.
    tempSensor.requestTemperatures();
    temperatureC = tempSensor.getTempCByIndex(0);

    if (temperatureC == DEVICE_DISCONNECTED_C || !isfinite(temperatureC)) {
      Serial.println("WARN: DS18B20 unavailable; cannot score this window");
    } else {
      Features f = calculateFeatures(samples, WINDOW_SIZE, temperatureC);
      Detection d = detectAnomaly(f);

      Serial.print("DEVICE="); Serial.print(SHAKESENSE_DEVICE_ID);
      Serial.print(",mean="); Serial.print(f.mean, 6);
      Serial.print(",rms="); Serial.print(f.rms, 6);
      Serial.print(",peak_to_peak="); Serial.print(f.peakToPeak, 6);
      Serial.print(",kurtosis="); Serial.print(f.kurtosis, 6);
      Serial.print(",crest_factor="); Serial.print(f.crestFactor, 6);
      Serial.print(",temperature_c="); Serial.print(f.temperature, 2);
      Serial.print(",max_abs_robust_z="); Serial.print(d.maxAbsRobustZ, 3);
      Serial.print(",status="); Serial.println(d.abnormal ? "ABNORMAL" : "NORMAL");
    }
    sampleCount = 0;
    // Restart the sample schedule after the DS18B20 conversion delay.
    nextSampleUs = micros();
  }
}
