export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'disconnected' | 'calibrating';
export type ConnectionStatus = 'online' | 'degraded' | 'disconnected';
export type CalibrationStatus = 'calibrated' | 'calibrating' | 'pending';
export type IsoZone = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface VibrationReading {
  overall: number; // in mm/s RMS
  x: number;
  y: number;
  z: number;
  unit: string;
  zone: IsoZone;
  baseline: number;
  threshold: number;
  statusText: string;
}

export interface TemperatureReading {
  core: number; // in °C
  ambient: number;
  rise: number;
  unit: string;
  threshold: number;
  statusText: string;
}

export interface MachineSpecs {
  powerKw: number;
  voltage: string;
  rpm: number;
  installedDate: string;
  bearingType: string;
  sensorLocation: string;
}

export interface EdgeDiagnostic {
  macAddress?: string;
  busAddress?: string;
  rssi: string;
  latencyMs: number;
  sampleRateHz: number;
  lossRatePercent: number;
  framesSent: number;
  protocol: string;
  ipAddress: string;
  firmwareVersion: string;
}

export interface DiagnosticGuidance {
  title: string;
  description: string;
  confidence: number;
  actionRequired: boolean;
  severity: 'nominal' | 'advisory' | 'urgent';
}

export interface Machine {
  id: string; // e.g. "MTR-001"
  name: string; // e.g. "Main Workshop Motor"
  nodeId: string; // e.g. "MPU6050-A01"
  type: string; // e.g. "Induction Motor"
  location: string; // e.g. "Floor A — Section 1"
  bay: string; // e.g. "Primary Drive Bay"
  healthStatus: HealthStatus;
  connectionStatus: ConnectionStatus;
  calibrationStatus: CalibrationStatus;
  lastReadingAt: string;
  vibration: VibrationReading;
  temperature: TemperatureReading;
  specs: MachineSpecs;
  edge: EdgeDiagnostic;
  recommendedAction: DiagnosticGuidance;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  sensorType: string;
  observedValue: string;
  thresholdOrBaselineReference: string;
  createdAt: string;
  status: AlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  recommendedAction: string;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  machineCount: number;
  activeSensors: number;
  syncStatus: string;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface TelemetryPoint {
  timeOffset: number; // ms offset
  timestamp: string;
  x: number;
  y: number;
  z: number;
  composite: number;
  temp: number;
}
