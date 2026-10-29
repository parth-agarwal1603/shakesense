import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';
import { MotorSchematic } from '../components/machines/MotorSchematic';

export const OverviewPage: React.FC = () => {
  const {
    totalMachines,
    healthyCount,
    warningCount,
    criticalCount,
    selectedMachine,
    lastSyncTime,
    triggerManualSweep,
    isSweeping,
  } = useFleet();

  const navigate = useNavigate();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadShiftLog = () => {
    const timestamp = new Date().toISOString();
    const logContent = `# SHAKESENSE — SHIFT DIAGNOSTIC LOG
Facility: Precision Fabrications Ltd. — Workshop Floor A
Generated: ${timestamp}
Operator: Markus Vance (Lead Maintenance)

--- FLEET SUMMARY ---
Total Active Monitored Drives: ${totalMachines}
Healthy Normal (Baseline Alignment): ${healthyCount}
Needs Attention (Advisory Drift): ${warningCount}
Critical Anomaly Flags: ${criticalCount}

--- FEATURED ASSET SNAPSHOT: ${selectedMachine.name} (${selectedMachine.id}) ---
Classification: ${selectedMachine.type}
Bay Location: ${selectedMachine.bay} // ${selectedMachine.location}
Health Status: ${selectedMachine.healthStatus.toUpperCase()}
Node ID: ${selectedMachine.nodeId} (ESP32-S3 + MPU-6050)
Overall Vibration: ${selectedMachine.vibration.overall} mm/s RMS (${selectedMachine.vibration.zone})
Baseline Tolerance: < ${selectedMachine.vibration.threshold} mm/s RMS
Housing Temperature: ${selectedMachine.temperature.core} °C (Ambient: ${selectedMachine.temperature.ambient} °C)
Thermal Limit: < ${selectedMachine.temperature.threshold} °C Cutoff
Diagnostic Recommendation: ${selectedMachine.recommendedAction.title}
Confidence: ${selectedMachine.recommendedAction.confidence}%

Audit Verification Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
`;

    const blob = new Blob([logContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShakeSense_Shift_Log_${selectedMachine.id}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2400);
  };

  // Flagged machine lists for KPI cards
  const warningLabel = 'PMP-002, MTR-004';
  const criticalLabel = 'CMP-004';

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* Top Section: Header & Sweep Status */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-surface-container-high text-primary font-label-md text-label-md uppercase tracking-wider">
              Facility: Workshop Floor A
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-high text-tertiary font-label-md text-label-md">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              Sensors Synchronized
            </span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight mt-1">
            Motor Health Overview
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            High-level operational condition across workshop induction drives. Calibrated to continuous baseline vibration models.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30">
          <div className="flex flex-col text-left md:text-right">
            <span className="font-label-sm text-[10.5px] text-outline uppercase tracking-wider">
              Telemetry Sweep
            </span>
            <span className="font-telemetry-md text-telemetry-md text-on-surface">
              {lastSyncTime} EST
            </span>
          </div>
          <div className="h-7 w-px bg-surface-container-highest" />
          <button
            onClick={triggerManualSweep}
            disabled={isSweeping}
            className="flex items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high text-primary transition-colors disabled:opacity-50"
            title="Trigger Instant Telemetry Scan"
          >
            <Icon name="sync" size={18} className={isSweeping ? 'animate-spin' : ''} />
          </button>
        </div>
      </section>

      {/* Fleet Health Status: 4 Big-Picture Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Fleet */}
        <div
          onClick={() => navigate('/machines')}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:bg-surface-container transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Fleet
            </span>
            <span className="p-2 rounded bg-surface-container text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="precision_manufacturing" size={20} />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-telemetry-lg text-telemetry-lg text-on-surface tracking-tight">
              {String(totalMachines).padStart(2, '0')}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Active Monitored Drives</p>
          </div>
          <div className="mt-4 pt-3 bg-surface-container/40 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline">Sensory Coverage</span>
            <span className="font-telemetry-sm text-telemetry-sm text-on-surface">100% Online</span>
          </div>
        </div>

        {/* Healthy Normal */}
        <div
          onClick={() => navigate('/machines?status=healthy')}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:bg-surface-container transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider font-semibold">
              Healthy Normal
            </span>
            <span className="p-2 rounded bg-tertiary-container/30 text-tertiary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="verified" size={20} />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-telemetry-lg text-telemetry-lg text-tertiary tracking-tight">
              {String(healthyCount).padStart(2, '0')}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Operating at Baseline</p>
          </div>
          <div className="mt-4 pt-3 bg-surface-container/40 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline">Fleet Share</span>
            <span className="font-telemetry-sm text-telemetry-sm text-tertiary">
              {((healthyCount / totalMachines) * 100).toFixed(1)}% Nominal
            </span>
          </div>
        </div>

        {/* Needs Attention */}
        <div
          onClick={() => navigate('/machines?status=warning')}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:bg-surface-container transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-semibold">
              Needs Attention
            </span>
            <span className="p-2 rounded bg-primary-container/30 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="warning_amber" size={20} />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-telemetry-lg text-telemetry-lg text-primary tracking-tight">
              {String(warningCount).padStart(2, '0')}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Bearing Drift Detected</p>
          </div>
          <div className="mt-4 pt-3 bg-surface-container/40 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-outline">Units Flagged</span>
            <span className="font-telemetry-sm text-telemetry-sm text-primary">{warningLabel}</span>
          </div>
        </div>

        {/* Critical Alert */}
        <div
          onClick={() => navigate('/alerts?severity=critical')}
          className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:bg-surface-container transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between pb-3">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
              Critical Alert
            </span>
            <span className="p-2 rounded bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="error_outline" size={20} />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-telemetry-lg text-telemetry-lg text-secondary tracking-tight">
              {String(criticalCount).padStart(2, '0')}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">Severe Axial Imbalance</p>
          </div>
          <div className="mt-4 pt-3 bg-secondary-container/20 rounded px-3 py-1.5 flex items-center justify-between">
            <span className="font-label-sm text-[11px] text-secondary">Unit Affected</span>
            <span className="font-telemetry-sm text-telemetry-sm text-secondary font-semibold">
              {criticalLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Selected Machine */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col gap-6 shadow-sm">
        {/* Card Header Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-md text-label-md text-primary font-semibold tracking-wider">
                ASSET REF: {selectedMachine.id}
              </span>
              <span className="h-1 w-1 rounded-full bg-outline" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {selectedMachine.bay} // {selectedMachine.location}
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {selectedMachine.name}
            </h2>
          </div>

          {/* Large Clear Status Badge */}
          <div className="flex items-center gap-space-sm px-space-lg py-space-sm rounded-lg bg-surface-container self-start lg:self-auto border border-outline-variant/30">
            <span
              className={`h-3 w-3 rounded-full ${
                selectedMachine.healthStatus === 'healthy'
                  ? 'bg-tertiary'
                  : selectedMachine.healthStatus === 'warning'
                  ? 'bg-secondary'
                  : selectedMachine.healthStatus === 'critical'
                  ? 'bg-error animate-pulse'
                  : 'bg-outline'
              }`}
            />
            <span
              className={`font-label-md text-label-md font-semibold tracking-wide uppercase ${
                selectedMachine.healthStatus === 'healthy'
                  ? 'text-tertiary'
                  : selectedMachine.healthStatus === 'warning'
                  ? 'text-secondary'
                  : selectedMachine.healthStatus === 'critical'
                  ? 'text-error'
                  : 'text-outline'
              }`}
            >
              {selectedMachine.healthStatus === 'healthy'
                ? 'HEALTHY — Operating within Learned Baseline'
                : selectedMachine.healthStatus === 'warning'
                ? 'WARNING — Baseline Harmonic Drift Detected'
                : selectedMachine.healthStatus === 'critical'
                ? 'CRITICAL — Severe Vibration Imbalance Breach'
                : 'DISCONNECTED — Telemetry Stream Inactive'}
            </span>
          </div>
        </div>

        {/* Main Content Split: Telemetry Snapshot & Spatial Sensor Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Motor Wireframe & Retrofit Sensor Node Overlay */}
          <div className="lg:col-span-7">
            <MotorSchematic
              machine={selectedMachine}
              onSensorNodeClick={() => navigate(`/telemetry?machine=${selectedMachine.id}`)}
            />
          </div>

          {/* Current Snapshot Numerical Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
            {/* Metric 1: Vibration */}
            <div className="bg-surface-container rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Overall Vibration
                </span>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded ${
                    selectedMachine.healthStatus === 'healthy'
                      ? 'text-tertiary bg-surface-container-low'
                      : selectedMachine.healthStatus === 'warning'
                      ? 'text-secondary bg-surface-container-low'
                      : 'text-error bg-error-container/30'
                  }`}
                >
                  {selectedMachine.vibration.statusText}
                </span>
              </div>
              <div className="my-4 flex items-baseline gap-space-sm">
                <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold tracking-tight">
                  {selectedMachine.connectionStatus === 'disconnected' ? '--' : selectedMachine.vibration.overall.toFixed(1)}
                </span>
                <span className="font-telemetry-md text-telemetry-md text-outline">
                  {selectedMachine.vibration.unit}
                </span>
              </div>
              {/* Baseline Reference Bar */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                  <span>Baseline: {selectedMachine.vibration.baseline.toFixed(1)} mm/s</span>
                  <span className="text-on-surface font-telemetry-sm">
                    &lt; {selectedMachine.vibration.threshold.toFixed(1)} mm/s Threshold
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-lowest overflow-hidden flex">
                  <div
                    className={`h-full rounded transition-all duration-300 ${
                      selectedMachine.healthStatus === 'critical'
                        ? 'bg-error'
                        : selectedMachine.healthStatus === 'warning'
                        ? 'bg-secondary'
                        : 'bg-tertiary'
                    }`}
                    style={{
                      width: `${Math.min(100, (selectedMachine.vibration.overall / selectedMachine.vibration.threshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metric 2: Temperature */}
            <div className="bg-surface-container rounded-xl p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Housing Temperature
                </span>
                <span
                  className={`font-label-sm text-label-sm px-2 py-0.5 rounded ${
                    selectedMachine.temperature.core > 70.0
                      ? 'text-error bg-error-container/30'
                      : selectedMachine.temperature.core > 60.0
                      ? 'text-secondary bg-surface-container-low'
                      : 'text-tertiary bg-surface-container-low'
                  }`}
                >
                  {selectedMachine.temperature.statusText}
                </span>
              </div>
              <div className="my-4 flex items-baseline gap-space-sm">
                <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold tracking-tight">
                  {selectedMachine.connectionStatus === 'disconnected' ? '--' : selectedMachine.temperature.core.toFixed(1)}
                </span>
                <span className="font-telemetry-md text-telemetry-md text-outline">
                  {selectedMachine.temperature.unit}
                </span>
              </div>
              {/* Baseline Reference Bar */}
              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                  <span>Thermal Steady-State</span>
                  <span className="text-on-surface font-telemetry-sm">
                    &lt; {selectedMachine.temperature.threshold.toFixed(1)} °C Cutoff
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-surface-container-lowest overflow-hidden flex">
                  <div
                    className="h-full bg-primary rounded transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (selectedMachine.temperature.core / selectedMachine.temperature.threshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Action Recommendation Card */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4 max-w-3xl">
          <div
            className={`p-3 rounded-lg shrink-0 ${
              selectedMachine.recommendedAction.severity === 'urgent'
                ? 'bg-error-container/30 text-error'
                : selectedMachine.recommendedAction.severity === 'advisory'
                ? 'bg-secondary-container/30 text-secondary'
                : 'bg-surface-container text-tertiary'
            }`}
          >
            <Icon
              name={
                selectedMachine.recommendedAction.severity === 'urgent'
                  ? 'crisis_alert'
                  : selectedMachine.recommendedAction.severity === 'advisory'
                  ? 'warning'
                  : 'thumb_up'
              }
              size={24}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-[10.5px] text-outline uppercase tracking-wider">
                Automated Diagnostic Guidance
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              <span className="font-label-sm text-[11px] text-tertiary font-semibold">
                Confidence {selectedMachine.recommendedAction.confidence}%
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Recommended Action: {selectedMachine.recommendedAction.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {selectedMachine.recommendedAction.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadShiftLog}
            className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-body-md flex items-center justify-center gap-2 transition-colors border border-outline-variant/30 cursor-pointer"
          >
            <Icon
              name={downloadSuccess ? 'check' : 'download'}
              size={16}
              className={downloadSuccess ? 'text-tertiary' : 'text-outline'}
            />
            <span>{downloadSuccess ? 'Shift Log Downloaded' : 'Download Shift Log'}</span>
          </button>

          <button
            onClick={() => navigate(`/telemetry?machine=${selectedMachine.id}`)}
            className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-md text-body-md font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <span>View Full Telemetry</span>
            <Icon name="arrow_forward" size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
