import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Machine, Alert, Facility, TimeRange, CalibrationStatus } from '../types';
import { INITIAL_FLEET } from '../data/mockFleet';
import { INITIAL_ALERTS } from '../data/mockAlerts';
import {
  isModelConfigured,
  ModelInferenceStatus,
  ModelPrediction,
  runModelInference,
} from '../services/mlModel';

interface FleetContextType {
  machines: Machine[];
  alerts: Alert[];
  selectedMachineId: string;
  selectedMachine: Machine;
  setSelectedMachineId: (id: string) => void;
  activeFacility: Facility;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  isLiveStreamEnabled: boolean;
  toggleLiveStream: () => void;
  lastSyncTime: string;
  triggerManualSweep: () => Promise<void>;
  isSweeping: boolean;
  modelStatus: ModelInferenceStatus;
  modelError: string | null;
  lastPredictions: ModelPrediction[];
  acknowledgeAlert: (alertId: string, author?: string) => void;
  resolveAlert: (alertId: string, author?: string) => void;
  provisionNode: (nodeData: { name: string; type: string; bay: string; location: string; baseline: number }) => void;
  updateMachineCalibration: (machineId: string, status: CalibrationStatus) => void;

  // Derived Fleet Metrics
  totalMachines: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  disconnectedCount: number;
  calibratingCount: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;
  fleetVibrationAverage: number;
  fleetMeanTemperature: number;
  gatewayUpRate: number;
}

const defaultFacility: Facility = {
  id: 'FAC-01',
  name: 'Precision Fabrications Ltd. — Workshop Floor A',
  code: 'PFL-WFA',
  machineCount: 12,
  activeSensors: 12,
  syncStatus: 'SYNC OK',
};

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_FLEET);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('MTR-001');
  const [activeFacility] = useState<Facility>(defaultFacility);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isLiveStreamEnabled, setIsLiveStreamEnabled] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('10:42:18 AM');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<ModelInferenceStatus>(
    isModelConfigured ? 'ready' : 'disabled',
  );
  const [modelError, setModelError] = useState<string | null>(null);
  const [lastPredictions, setLastPredictions] = useState<ModelPrediction[]>([]);

  // Controlled deterministic live micro-drift
  useEffect(() => {
    if (!isLiveStreamEnabled) return;

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setMachines((prevMachines) =>
        prevMachines.map((m) => {
          // Never simulate readings for disconnected nodes
          if (m.connectionStatus === 'disconnected') return m;

          // Deterministic subtle micro-variation using sine wave
          const vibeOffset = Math.sin(tick * 0.5 + m.id.charCodeAt(m.id.length - 1)) * 0.05;
          const tempOffset = Math.cos(tick * 0.3 + m.id.charCodeAt(m.id.length - 1)) * 0.04;

          let newVibe = Number((m.vibration.overall + vibeOffset).toFixed(1));
          let newTemp = Number((m.temperature.core + tempOffset).toFixed(1));

          // Clamp to reasonable bounds per status
          if (m.healthStatus === 'healthy') {
            newVibe = Math.max(1.0, Math.min(3.2, newVibe));
            newTemp = Math.max(35.0, Math.min(52.0, newTemp));
          }

          return {
            ...m,
            vibration: {
              ...m.vibration,
              overall: newVibe,
              x: Number(Math.max(0.4, (m.vibration.x + vibeOffset * 0.4)).toFixed(1)),
              y: Number(Math.max(0.6, (m.vibration.y + vibeOffset * 0.6)).toFixed(1)),
              z: Number(Math.max(0.2, (m.vibration.z + vibeOffset * 0.2)).toFixed(1)),
            },
            temperature: {
              ...m.temperature,
              core: newTemp,
              rise: Number((newTemp - m.temperature.ambient).toFixed(1)),
            },
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreamEnabled]);

  const selectedMachine = useMemo(() => {
    return machines.find((m) => m.id === selectedMachineId) || machines[0];
  }, [machines, selectedMachineId]);

  const toggleLiveStream = useCallback(() => {
    setIsLiveStreamEnabled((prev) => !prev);
  }, []);

  const triggerManualSweep = useCallback(async () => {
    setIsSweeping(true);
    setModelError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (isModelConfigured) {
        setModelStatus('loading');
        const predictions = await runModelInference(machines);
        setLastPredictions(predictions);
        setModelStatus('ready');
      }

      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncTime(formatted);
    } catch (error) {
      setModelStatus('error');
      setModelError(error instanceof Error ? error.message : 'ML inference failed.');
    } finally {
      setIsSweeping(false);
    }
  }, [machines]);

  const acknowledgeAlert = useCallback((alertId: string, author: string = 'Markus Vance') => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => {
        if (alert.id === alertId) {
          const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          return {
            ...alert,
            status: 'acknowledged',
            acknowledgedAt: `Today, ${nowStr}`,
            acknowledgedBy: author,
          };
        }
        return alert;
      })
    );
  }, []);

  const resolveAlert = useCallback((alertId: string, author: string = 'Markus Vance') => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => {
        if (alert.id === alertId) {
          const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          return {
            ...alert,
            status: 'resolved',
            resolvedAt: `Today, ${nowStr}`,
            resolvedBy: author,
          };
        }
        return alert;
      })
    );
  }, []);

  const provisionNode = useCallback((nodeData: { name: string; type: string; bay: string; location: string; baseline: number }) => {
    const nextNum = machines.length + 1;
    const formattedNum = String(nextNum).padStart(3, '0');
    const newId = `MTR-${formattedNum}`;
    const newNodeId = `MPU6050-A${String(nextNum).padStart(2, '0')}`;

    const newMachine: Machine = {
      id: newId,
      name: nodeData.name,
      nodeId: newNodeId,
      type: nodeData.type,
      location: nodeData.location,
      bay: nodeData.bay,
      healthStatus: 'healthy',
      connectionStatus: 'online',
      calibrationStatus: 'calibrated',
      lastReadingAt: 'Just now',
      vibration: {
        overall: Number(nodeData.baseline.toFixed(1)),
        x: Number((nodeData.baseline * 0.45).toFixed(1)),
        y: Number((nodeData.baseline * 0.75).toFixed(1)),
        z: Number((nodeData.baseline * 0.3).toFixed(1)),
        unit: 'mm/s RMS',
        zone: 'Zone A',
        baseline: nodeData.baseline,
        threshold: 4.5,
        statusText: 'ISO 10816 Zone A',
      },
      temperature: {
        core: 44.0,
        ambient: 24.0,
        rise: 20.0,
        unit: '°C',
        threshold: 70.0,
        statusText: 'Baseline Calibrated',
      },
      specs: {
        powerKw: 15,
        voltage: '400V / 3-Phase',
        rpm: 1480,
        installedDate: 'Today (Provisioned)',
        bearingType: 'Standard Industrial Deep Groove Ball',
        sensorLocation: 'Drive End Housing',
      },
      edge: {
        rssi: '-46 dBm',
        latencyMs: 12,
        sampleRateHz: 1600,
        lossRatePercent: 0.0,
        framesSent: 120,
        protocol: 'ESP32 + MPU-6050 (I²C / WiFi)',
        ipAddress: `192.168.4.${100 + nextNum}`,
        firmwareVersion: 'v2.4.1-edge-tinyml',
      },
      recommendedAction: {
        title: 'Provisioning complete',
        description: 'Sensor node successfully enrolled and telemetry channel synchronized.',
        confidence: 99,
        actionRequired: false,
        severity: 'nominal',
      },
    };

    setMachines((prev) => [...prev, newMachine]);
  }, [machines.length]);

  const updateMachineCalibration = useCallback((machineId: string, status: CalibrationStatus) => {
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          return {
            ...m,
            calibrationStatus: status,
            healthStatus: status === 'calibrating' ? 'calibrating' : m.healthStatus === 'calibrating' ? 'healthy' : m.healthStatus,
          };
        }
        return m;
      })
    );
  }, []);

  // Shared derived calculations
  const totalMachines = machines.length;
  const healthyCount = useMemo(() => machines.filter((m) => m.healthStatus === 'healthy').length, [machines]);
  const warningCount = useMemo(() => machines.filter((m) => m.healthStatus === 'warning').length, [machines]);
  const criticalCount = useMemo(() => machines.filter((m) => m.healthStatus === 'critical').length, [machines]);
  const disconnectedCount = useMemo(() => machines.filter((m) => m.healthStatus === 'disconnected').length, [machines]);
  const calibratingCount = useMemo(() => machines.filter((m) => m.healthStatus === 'calibrating').length, [machines]);

  // Alert counts
  const activeAlerts = useMemo(() => alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged'), [alerts]);
  const activeAlertsCount = activeAlerts.length;
  const criticalAlertsCount = useMemo(() => alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length, [alerts]);
  const warningAlertsCount = useMemo(() => alerts.filter((a) => a.severity === 'warning' && a.status !== 'resolved').length, [alerts]);

  // Fleet averages for online connected machines
  const { fleetVibrationAverage, fleetMeanTemperature } = useMemo(() => {
    const activeMachines = machines.filter((m) => m.connectionStatus === 'online');
    if (!activeMachines.length) return { fleetVibrationAverage: 0, fleetMeanTemperature: 0 };

    const totalVibe = activeMachines.reduce((sum, m) => sum + m.vibration.overall, 0);
    const totalTemp = activeMachines.reduce((sum, m) => sum + m.temperature.core, 0);

    return {
      fleetVibrationAverage: Number((totalVibe / activeMachines.length).toFixed(2)),
      fleetMeanTemperature: Number((totalTemp / activeMachines.length).toFixed(1)),
    };
  }, [machines]);

  const gatewayUpRate = 99.94;

  const value = {
    machines,
    alerts,
    selectedMachineId,
    selectedMachine,
    setSelectedMachineId,
    activeFacility,
    timeRange,
    setTimeRange,
    isLiveStreamEnabled,
    toggleLiveStream,
    lastSyncTime,
    triggerManualSweep,
    isSweeping,
    modelStatus,
    modelError,
    lastPredictions,
    acknowledgeAlert,
    resolveAlert,
    provisionNode,
    updateMachineCalibration,
    totalMachines,
    healthyCount,
    warningCount,
    criticalCount,
    disconnectedCount,
    calibratingCount,
    activeAlertsCount,
    criticalAlertsCount,
    warningAlertsCount,
    fleetVibrationAverage,
    fleetMeanTemperature,
    gatewayUpRate,
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
};

export const useFleet = (): FleetContextType => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
