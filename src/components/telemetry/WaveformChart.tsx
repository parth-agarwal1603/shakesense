import React, { useState, useEffect } from 'react';
import { Machine } from '../../types';

interface WaveformChartProps {
  machine: Machine;
  filterBand?: string;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({ machine, filterBand = 'All Bands (0-800Hz)' }) => {
  const [phase, setPhase] = useState(0);

  // Smooth wave phase animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const overall = machine.vibration.overall;
  const isWarning = machine.healthStatus === 'warning';
  const isCritical = machine.healthStatus === 'critical';

  // Waveform styling based on health status
  const traceColor = isCritical ? '#ffb4ab' : isWarning ? '#ffb0ca' : '#42e18d';
  const deltaText = isCritical
    ? `+${(overall - machine.vibration.baseline).toFixed(1)} mm/s delta (CRITICAL)`
    : isWarning
    ? `+${(overall - machine.vibration.baseline).toFixed(1)} mm/s delta (Warning)`
    : `+${(overall - machine.vibration.baseline).toFixed(1)} mm/s delta (Safe)`;

  // Generate responsive wave path based on real axis readings
  const amplitudeMultiplier = isCritical ? 1.8 : isWarning ? 1.3 : 1.0;
  const yAmp = (machine.vibration.y / 4.5) * 45 * amplitudeMultiplier;
  const xAmp = (machine.vibration.x / 4.5) * 20 * amplitudeMultiplier;

  const points: [number, number][] = [];
  const secondaryPoints: [number, number][] = [];
  const segments = 40;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 600;
    const norm = (i / segments) * Math.PI * 4;
    // Primary Harmonic (Y dominant)
    const yVal = 80 + Math.sin(norm + phase) * yAmp + Math.sin(norm * 2 + phase * 1.5) * (yAmp * 0.35);
    points.push([x, yVal]);

    // Secondary Harmonic (X/Z trace)
    const secVal = 80 + Math.cos(norm * 1.5 + phase) * xAmp + Math.sin(norm * 0.5 + phase) * 10;
    secondaryPoints.push([x, secVal]);
  }

  const primaryPathStr = points.reduce((acc, [px, py], idx) => {
    return idx === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : `${acc} L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }, '');

  const areaPathStr = `${primaryPathStr} L 600 160 L 0 160 Z`;

  const secondaryPathStr = secondaryPoints.reduce((acc, [px, py], idx) => {
    return idx === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : `${acc} L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }, '');

  return (
    <div className="bg-surface-container-low rounded-xl p-6 sm:p-space-xl flex flex-col justify-between shadow-md relative overflow-hidden group">
      {/* Subtle Ambient Glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: traceColor }}
      />

      <div>
        {/* Card Top Bar */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
                Triaxial Accelerometer
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-outline">
                ISO 10816-3 Class II ({filterBand})
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Vibration Velocity (RMS)
            </h2>
          </div>

          <div
            className="px-space-md py-1.5 rounded-full flex items-center gap-1.5 font-label-sm text-label-sm tracking-wider uppercase font-semibold"
            style={{
              backgroundColor: isCritical
                ? 'rgba(147, 0, 10, 0.4)'
                : isWarning
                ? 'rgba(225, 0, 127, 0.2)'
                : 'rgba(66, 225, 141, 0.15)',
              color: traceColor,
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'animate-ping' : ''}`}
              style={{ backgroundColor: traceColor }}
            />
            <span>{deltaText}</span>
          </div>
        </div>

        {/* Massive Hero Metric Display */}
        <div className="flex flex-wrap items-baseline gap-space-md mb-space-lg">
          <span className="font-telemetry-lg text-[52px] sm:text-[64px] leading-none text-on-surface font-semibold tracking-tight">
            {machine.connectionStatus === 'disconnected' ? '--' : overall.toFixed(1)}
          </span>
          <span className="font-telemetry-md text-telemetry-md text-primary font-medium">
            {machine.vibration.unit}
          </span>
          <span className="font-body-sm text-body-sm text-outline ml-auto">
            Nominal baseline: {machine.vibration.baseline.toFixed(1)} mm/s // Cutoff: {machine.vibration.threshold.toFixed(1)} mm/s
          </span>
        </div>

        {/* High Fidelity SVG Real-Time Waveform */}
        <div className="bg-surface-container-lowest rounded-lg p-space-md sm:p-space-lg mb-space-lg relative border border-outline-variant/30">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-space-md">
            <div className="flex items-center gap-space-md">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Live Time-Domain Waveform
              </span>
              <span className="text-outline text-label-sm">|</span>
              <span className="font-label-sm text-label-sm text-primary font-telemetry-sm">
                1600 Hz Window ({machine.specs.rpm} RPM)
              </span>
            </div>
            <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-outline">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-primary" />X
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5" style={{ backgroundColor: traceColor }} />
                Y (Dominant)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-secondary" />Z
              </span>
            </div>
          </div>

          <div className="w-full h-44 relative flex items-center overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
            </div>

            {/* Waveform Path */}
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 600 160"
            >
              <defs>
                <linearGradient id={`vibe-grad-${machine.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={traceColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={traceColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Area under primary wave */}
              <path d={areaPathStr} fill={`url(#vibe-grad-${machine.id})`} />

              {/* Secondary Trace (Harmonic overlay) */}
              <path
                d={secondaryPathStr}
                fill="none"
                opacity="0.65"
                stroke="#7cd0ff"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />

              {/* Primary Harmonic Wave (Y dominant) */}
              <path
                d={primaryPathStr}
                fill="none"
                stroke={traceColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>

            {/* Real-time Cursor Line Pin */}
            <div className="absolute right-24 top-0 bottom-0 w-px bg-primary/40 flex flex-col justify-between items-center pointer-events-none">
              <span className="font-telemetry-sm text-label-sm bg-primary text-on-primary px-1.5 py-0.5 rounded-sm -mt-2">
                {overall.toFixed(2)} pk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary -mb-1" />
            </div>
          </div>

          <div className="flex items-center justify-between text-outline font-telemetry-sm text-label-sm mt-space-sm">
            <span>-500ms</span>
            <span>-250ms</span>
            <span>Real-time Window (0ms)</span>
          </div>
        </div>

        {/* Axis Triaxial Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mb-space-lg">
          <div className="bg-surface-container p-space-md rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              X-Axis (Radial Horiz)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-md text-telemetry-md text-on-surface font-semibold">
                {machine.connectionStatus === 'disconnected' ? '--' : machine.vibration.x.toFixed(1)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">mm/s</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (machine.vibration.x / 4.5) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-space-md rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              Y-Axis (Radial Vert)
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="font-telemetry-md text-telemetry-md font-semibold"
                style={{ color: traceColor }}
              >
                {machine.connectionStatus === 'disconnected' ? '--' : machine.vibration.y.toFixed(1)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">mm/s</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  backgroundColor: traceColor,
                  width: `${Math.min(100, (machine.vibration.y / 4.5) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-space-md rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              Z-Axis (Axial Thrust)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-md text-telemetry-md text-on-surface font-semibold">
                {machine.connectionStatus === 'disconnected' ? '--' : machine.vibration.z.toFixed(1)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">mm/s</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (machine.vibration.z / 4.5) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Plain Language Interpretation */}
      <div className="pt-space-md bg-surface-container/60 rounded-lg p-space-md flex flex-wrap items-center justify-between gap-2 border border-outline-variant/20">
        <div className="flex items-center gap-space-sm">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ color: traceColor }}
          >
            {isCritical ? 'crisis_alert' : isWarning ? 'warning' : 'check_circle'}
          </span>
          <span className="font-body-md text-body-md text-on-surface">
            {isCritical
              ? 'Severe harmonics breach standard threshold. Recommend prompt inspection of mounting and coupling.'
              : isWarning
              ? 'Moderate harmonic drift above baseline model. Recommended for next scheduled shift maintenance.'
              : 'Normal harmonic motion without unbalance. Smooth mechanical operation.'}
          </span>
        </div>
        <span className="font-telemetry-sm text-telemetry-sm text-outline font-medium">
          1600 Hz DSP
        </span>
      </div>
    </div>
  );
};
