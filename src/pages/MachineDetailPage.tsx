import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { MotorSchematic } from '../components/machines/MotorSchematic';

export const MachineDetailPage: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const { machines, alerts, setSelectedMachineId, acknowledgeAlert, resolveAlert, updateMachineCalibration } = useFleet();

  const machine = machines.find((m) => m.id.toLowerCase() === (machineId || '').toLowerCase());

  useEffect(() => {
    if (machine) {
      setSelectedMachineId(machine.id);
    }
  }, [machine, setSelectedMachineId]);

  const [isCalibrating, setIsCalibrating] = useState(false);

  if (!machine) {
    return (
      <div className="max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
          <Icon name="search_off" size={36} />
        </div>
        <h2 className="font-headline-lg text-on-surface">Machine Not Found</h2>
        <p className="font-body-lg text-outline max-w-md">
          The requested machine identifier <code className="text-primary font-mono">{machineId}</code> could not be found in the active Workshop Floor A asset registry.
        </p>
        <button
          onClick={() => navigate('/machines')}
          className="mt-4 px-6 py-3 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:bg-inverse-primary transition-colors flex items-center gap-2"
        >
          <Icon name="arrow_back" size={18} />
          <span>Return to Machines Fleet</span>
        </button>
      </div>
    );
  }

  const machineAlerts = alerts.filter((a) => a.machineId === machine.id);

  const handleRecalibrate = () => {
    setIsCalibrating(true);
    updateMachineCalibration(machine.id, 'calibrating');
    setTimeout(() => {
      updateMachineCalibration(machine.id, 'calibrated');
      setIsCalibrating(false);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-outline font-label-md text-label-md uppercase">
          <button
            onClick={() => navigate('/machines')}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Icon name="arrow_back" size={16} />
            <span>Machines Fleet</span>
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">{machine.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/telemetry?machine=${machine.id}`)}
            className="px-4 py-2 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-md font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Icon name="monitoring" size={18} />
            <span>Open Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* Hero Machine Information Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-primary text-label-md font-semibold tracking-wider">
              {machine.id} // {machine.nodeId}
            </span>
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span className="font-body-sm text-outline">{machine.type}</span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight">
            {machine.name}
          </h1>
          <p className="font-body-md text-on-surface-variant">
            {machine.location} • {machine.bay}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <Badge status={machine.healthStatus} size="lg" />
          <div className="px-3 py-1.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-label-sm text-label-sm flex items-center gap-1.5">
            <Icon
              name={machine.connectionStatus === 'disconnected' ? 'wifi_off' : 'wifi'}
              size={16}
              className={machine.connectionStatus === 'disconnected' ? 'text-outline' : 'text-tertiary'}
            />
            <span className="uppercase">{machine.connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Grid: Schematic & Telemetry Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Schematic View */}
        <div className="lg:col-span-7">
          <MotorSchematic
            machine={machine}
            onSensorNodeClick={() => navigate(`/telemetry?machine=${machine.id}`)}
          />
        </div>

        {/* Specifications & Live Metrics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/30 flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
                Overall Vibration
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
                  {machine.connectionStatus === 'disconnected' ? '--' : machine.vibration.overall.toFixed(1)}
                </span>
                <span className="font-body-sm text-outline">{machine.vibration.unit}</span>
              </div>
              <span className="font-label-sm text-[11px] text-tertiary mt-1">
                {machine.vibration.statusText}
              </span>
            </div>

            <div className="bg-surface-container p-5 rounded-xl border border-outline-variant/30 flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
                Housing Temp
              </span>
              <div className="flex items-baseline gap-1 my-1">
                <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
                  {machine.connectionStatus === 'disconnected' ? '--' : machine.temperature.core.toFixed(1)}
                </span>
                <span className="font-body-sm text-outline">{machine.temperature.unit}</span>
              </div>
              <span className="font-label-sm text-[11px] text-primary mt-1">
                +{machine.temperature.rise} °C rise
              </span>
            </div>
          </div>

          {/* Machine Baseline & Limit Configuration */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Baseline & Safety Thresholds
              </span>
              <button
                onClick={handleRecalibrate}
                disabled={isCalibrating || machine.connectionStatus === 'disconnected'}
                className="text-primary hover:text-primary-fixed font-label-sm text-[11px] uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
              >
                <Icon name="sync" size={14} className={isCalibrating ? 'animate-spin' : ''} />
                <span>{isCalibrating ? 'Calibrating...' : 'Recalibrate Baseline'}</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-outline">Vibration Baseline</span>
                <span className="font-telemetry-sm text-on-surface">
                  {machine.vibration.baseline.toFixed(1)} mm/s RMS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Vibration Trip Cutoff</span>
                <span className="font-telemetry-sm text-secondary">
                  &lt; {machine.vibration.threshold.toFixed(1)} mm/s RMS (ISO Zone D)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Thermal Steady Cutoff</span>
                <span className="font-telemetry-sm text-secondary">
                  &lt; {machine.temperature.threshold.toFixed(1)} °C
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Calibration Matrix</span>
                <span className="font-telemetry-sm text-tertiary">
                  {machine.calibrationStatus === 'calibrated' ? 'Continuous FFT (Nominal)' : 'Recalibration Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware & Sensor Node Identity */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 flex flex-col gap-3 font-body-sm">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider border-b border-outline-variant/20 pb-2">
              Hardware & Edge Specs
            </span>
            <div className="flex items-center justify-between">
              <span className="text-outline">Rating / Voltage</span>
              <span className="text-on-surface font-telemetry-sm">
                {machine.specs.powerKw} kW / {machine.specs.voltage}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Shaft Speed</span>
              <span className="text-on-surface font-telemetry-sm">{machine.specs.rpm} RPM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Edge Gateway IP</span>
              <span className="text-primary font-mono text-[12px]">{machine.edge.ipAddress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Firmware Version</span>
              <span className="text-on-surface font-mono text-[12px]">{machine.edge.firmwareVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Steps & Guidance */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="p-3 rounded-lg bg-surface-container text-primary shrink-0">
            <Icon name="psychology" size={26} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Diagnostic Intelligence Guidance
              </span>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                Confidence {machine.recommendedAction.confidence}%
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {machine.recommendedAction.title}
            </h3>
            <p className="font-body-md text-on-surface-variant">
              {machine.recommendedAction.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/telemetry?machine=${machine.id}`)}
          className="px-5 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md font-medium border border-outline-variant/30 transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Examine Waveforms</span>
          <Icon name="arrow_forward" size={16} />
        </button>
      </div>

      {/* Machine Alerts & Events Log */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Associated Alerts & Historical Events
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-outline font-telemetry-sm text-[12px]">
              {machineAlerts.length}
            </span>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-primary hover:text-primary-fixed font-label-md text-label-md uppercase tracking-wider"
          >
            View All Plant Alerts
          </button>
        </div>

        {machineAlerts.length === 0 ? (
          <div className="py-8 text-center text-outline font-body-md">
            No active or historical alerts recorded for {machine.name} ({machine.id}). Operating within learned baseline models.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {machineAlerts.map((alert) => (
              <div key={alert.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <Badge status={alert.severity} size="sm" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-telemetry-sm text-[12px] text-outline">
                      <span>{alert.id}</span>
                      <span>•</span>
                      <span>{alert.createdAt}</span>
                      <span>•</span>
                      <span className="text-primary font-mono">{alert.observedValue}</span>
                    </div>
                    <span className="font-headline-sm text-[15px] text-on-surface font-semibold">
                      {alert.title}
                    </span>
                    <p className="font-body-sm text-on-surface-variant max-w-2xl">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary font-label-sm text-label-sm uppercase font-semibold transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="font-label-sm text-label-sm text-tertiary uppercase flex items-center gap-1">
                      <Icon name="check" size={16} />
                      Resolved ({alert.resolvedBy})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
