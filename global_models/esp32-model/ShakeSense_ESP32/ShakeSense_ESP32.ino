/*
  ShakeSense ESP32 - compact personalised vibration anomaly detector

  Embedded algorithm: per-device Median + MAD robust baseline.
  This is NOT a compiled sklearn Isolation Forest. It is a lightweight,
  interpretable personalised detector suitable for ESP32 deployment.

  Hardware assumptions (edit to match your wiring):
    MPU6050 I2C: SDA=21, SCL=22, address=0x68
    DS18B20 data: GPIO 4, with 4.7k pull-up to 3.3V
    L298N channel A: ENA=13, IN1=12, IN2=14

  Arduino libraries:
    - Adafruit MPU6050
    - Adafruit Unified Sensor
    - OneWire
    - DallasTemperature
*/
#include <Arduino.h>
#include <math.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "ShakeSense_Types.h"
#include "ShakeSense_Profile.h"

static const int I2C_SDA_PIN = 21;
static const int I2C_SCL_PIN = 22;
static const int DS18B20_PIN = 4;
static const int MOTOR_ENA_PIN = 13;
static const int MOTOR_IN1_PIN = 12;
static const int MOTOR_IN2_PIN = 14;
static const uint32_t SAMPLE_RATE_HZ = 100;
static const uint16_t WINDOW_SIZE = 1000;
static const uint32_t SAMPLE_PERIOD_US = 1000000UL / SAMPLE_RATE_HZ;
static const unsigned long MPU_RETRY_INTERVAL_MS = 2000;

Adafruit_MPU6050 mpu;
OneWire oneWire(DS18B20_PIN);
DallasTemperature tempSensor(&oneWire);

float samples[WINDOW_SIZE];
float temperatureC = NAN;
uint16_t sampleCount = 0;
uint32_t nextSampleUs = 0;
bool mpuReady = false;
bool motorEnabled = false;
unsigned long lastMpuRetryMs = 0;
unsigned long lastTemperatureReadMs = 0;
unsigned long lastLiveReportMs = 0;
float latestAccelX = NAN;
float latestAccelY = NAN;
float latestAccelZ = NAN;

bool tryStartMpu() {
  if (!mpu.begin()) return false;
  mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
  mpu.setFilterBandwidth(MPU6050_BAND_44_HZ);
  return true;
}

void setMotorEnabled(bool enabled) {
  motorEnabled = enabled;
  if (enabled) {
    digitalWrite(MOTOR_IN1_PIN, HIGH);
    digitalWrite(MOTOR_IN2_PIN, LOW);
    digitalWrite(MOTOR_ENA_PIN, HIGH);
    Serial.println("Motor enabled: forward at full speed");
  } else {
    digitalWrite(MOTOR_ENA_PIN, LOW);
    digitalWrite(MOTOR_IN1_PIN, LOW);
    digitalWrite(MOTOR_IN2_PIN, LOW);
    Serial.println("Motor disabled");
  }
}

void processSerialCommands() {
  if (!Serial.available()) return;
  String command = Serial.readStringUntil('\n');
  command.trim();
  command.toLowerCase();
  if (command == "motor on") {
    setMotorEnabled(true);
  } else if (command == "motor off" || command == "stop") {
    setMotorEnabled(false);
  } else if (command == "status") {
    Serial.print("MOTOR="); Serial.print(motorEnabled ? "ON" : "OFF");
    Serial.print(",MPU6050="); Serial.println(mpuReady ? "READY" : "UNAVAILABLE");
  } else if (command.length() > 0) {
    Serial.println("Commands: motor on | motor off | status");
  }
}

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

  pinMode(MOTOR_ENA_PIN, OUTPUT);
  pinMode(MOTOR_IN1_PIN, OUTPUT);
  pinMode(MOTOR_IN2_PIN, OUTPUT);
  setMotorEnabled(false);

  tempSensor.begin();

  mpuReady = tryStartMpu();
  lastMpuRetryMs = millis();
  if (mpuReady) {
    Serial.println("ShakeSense sensor readings started");
  } else {
    Serial.println("MPU6050 not detected; temperature readings continue while retrying.");
  }

  Serial.println("ShakeSense ESP32 started");
  Serial.print("Device profile: "); Serial.println(SHAKESENSE_DEVICE_ID);
  Serial.println("Features: mean,rms,peak_to_peak,kurtosis,crest_factor,temperature_c");
  Serial.println("Motor is OFF by default. Send 'motor on' only after checking the hardware.");
  nextSampleUs = micros();
}

void loop() {
  processSerialCommands();

  const unsigned long nowMs = millis();
  if (!mpuReady && nowMs - lastMpuRetryMs >= MPU_RETRY_INTERVAL_MS) {
    lastMpuRetryMs = nowMs;
    mpuReady = tryStartMpu();
    if (mpuReady) Serial.println("MPU6050 detected; accelerometer readings enabled.");
  }

  if (nowMs - lastTemperatureReadMs >= 1000) {
    lastTemperatureReadMs = nowMs;
    tempSensor.requestTemperatures();
    temperatureC = tempSensor.getTempCByIndex(0);
  }

  const uint32_t now = micros();
  if (mpuReady && (int32_t)(now - nextSampleUs) >= 0) {
    nextSampleUs += SAMPLE_PERIOD_US;

    sensors_event_t accel, gyro, mpuTemp;
    mpu.getEvent(&accel, &gyro, &mpuTemp);
    latestAccelX = accel.acceleration.x;
    latestAccelY = accel.acceleration.y;
    latestAccelZ = accel.acceleration.z;
    const float magnitudeMs2 = sqrtf(
      accel.acceleration.x * accel.acceleration.x +
      accel.acceleration.y * accel.acceleration.y +
      accel.acceleration.z * accel.acceleration.z
    );
    samples[sampleCount++] = magnitudeMs2 / 9.80665f;
  }

  if (nowMs - lastLiveReportMs >= 500) {
    lastLiveReportMs = nowMs;
    if (mpuReady) {
      const float magnitude = sqrtf(
        latestAccelX * latestAccelX +
        latestAccelY * latestAccelY +
        latestAccelZ * latestAccelZ
      );
      Serial.print("Accel X: "); Serial.print(latestAccelX, 3);
      Serial.print(" | Y: "); Serial.print(latestAccelY, 3);
      Serial.print(" | Z: "); Serial.print(latestAccelZ, 3);
      Serial.print(" | Vibration magnitude: "); Serial.print(magnitude, 3);
      Serial.print(" m/s^2 | ");
    } else {
      Serial.print("MPU6050 unavailable | ");
    }
    Serial.print("Motor temperature: ");
    if (temperatureC == DEVICE_DISCONNECTED_C || !isfinite(temperatureC)) {
      Serial.println("Sensor disconnected!");
    } else {
      Serial.print(temperatureC, 2);
      Serial.println(" C");
    }
  }

  if (sampleCount >= WINDOW_SIZE) {
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
    nextSampleUs = micros();
  }
}
