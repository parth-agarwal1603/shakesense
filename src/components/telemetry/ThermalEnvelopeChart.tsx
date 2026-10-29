import React from 'react';
import { Machine } from '../../types';

interface ThermalEnvelopeChartProps {
  machine: Machine;
}

export const ThermalEnvelopeChart: React.FC<ThermalEnvelopeChartProps> = ({ machine }) => {
  const temp = machine.temperature.core;
  const ambient = machine.temperature.ambient;
  const rise = machine.temperature.rise;
  const threshold = machine.temperature.threshold; // e.g. 70.0 °C
  const isCritical = temp >= threshold || machine.healthStatus === 'critical';
  const isWarning = (temp > 60.0 && temp < threshold) || machine.healthStatus === 'warning';

  const themeColor = isCritical ? '#ffb4ab' : isWarning ? '#ffb0ca' : '#42e18d';
  const marginToTrip = Math.max(0, Number((threshold - temp).toFixed(1)));
  const percentageOfGauge = Math.min(100, Math.max(0, (temp / 100) * 100));

  return (
    <div className="bg-surface-container-low rounded-xl p-6 sm:p-space-xl flex flex-col justify-between shadow-md relative overflow-hidden group">
      {/* Subtle Thermal Ambient Glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: themeColor }}
      />

      <div>
        {/* Card Top Bar */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs mb-1">
              <span
                className="font-label-sm text-label-sm tracking-widest uppercase"
                style={{ color: themeColor }}
              >
                Internal Thermistor
              </span>
              <span className="text-outline">•</span>
              <span className="font-label-sm text-label-sm text-outline">
                Class F Insulation Margin (155°C Stator)
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Motor Core Temperature
            </h2>
          </div>

          <div
            className="px-space-md py-1.5 rounded-full flex items-center gap-1.5 font-label-sm text-label-sm tracking-wider uppercase font-semibold"
            style={{
              backgroundColor: isCritical
                ? 'rgba(147, 0, 10, 0.4)'
                : isWarning
                ? 'rgba(225, 0, 127, 0.2)'
                : 'rgba(53, 53, 52, 0.8)',
              color: themeColor,
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'animate-ping' : ''}`}
              style={{ backgroundColor: themeColor }}
            />
            <span>
              {isCritical ? 'Thermal Trip Limit Exceeded' : isWarning ? 'Elevated Thermal Gradient' : 'Normal Operating Temp'}
            </span>
          </div>
        </div>

        {/* Massive Hero Metric Display */}
        <div className="flex flex-wrap items-baseline gap-space-md mb-space-lg">
          <span className="font-telemetry-lg text-[52px] sm:text-[64px] leading-none text-on-surface font-semibold tracking-tight">
            {machine.connectionStatus === 'disconnected' ? '--' : temp.toFixed(1)}
          </span>
          <span
            className="font-telemetry-md text-telemetry-md font-medium"
            style={{ color: themeColor }}
          >
            {machine.temperature.unit}
          </span>
          <span className="font-body-sm text-body-sm text-outline ml-auto">
            Trip Threshold: {threshold.toFixed(1)} °C
          </span>
        </div>

        {/* High Fidelity Thermal Progress & Trend Section */}
        <div className="bg-surface-container-lowest rounded-lg p-space-md sm:p-space-lg mb-space-lg flex flex-col justify-between border border-outline-variant/30">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-space-md">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Thermal Load Envelope & Safety Margin
            </span>
            <span className="font-telemetry-sm text-telemetry-sm text-on-surface-variant font-medium">
              {marginToTrip > 0 ? `${marginToTrip} °C to Warning Limit` : 'TRIP LIMIT BREACHED'}
            </span>
          </div>

          {/* Gauge Bar Container with Trip Pin */}
          <div className="relative w-full py-space-sm mb-space-md">
            {/* Background Track with zone bands */}
            <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden relative flex">
              <div className="h-full bg-tertiary/20" style={{ width: '60%' }} title="Zone Nominal: 0-60°C" />
              <div className="h-full bg-primary/20" style={{ width: '15%' }} title="Zone Advisory: 60-70°C" />
              <div className="h-full bg-secondary-container/30" style={{ width: '25%' }} title="Zone Danger: >70°C" />
            </div>

            {/* Active Value Fill Indicator */}
            <div
              className="absolute top-2 left-0 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${percentageOfGauge}%`,
                background: isCritical
                  ? 'linear-gradient(to right, #e1007f, #ff2d95)'
                  : isWarning
                  ? 'linear-gradient(to right, #007ba7, #ffb0ca)'
                  : 'linear-gradient(to right, #00844c, #42e18d, #007ba7)',
              }}
            />

            {/* Trip Threshold Marker Pin (at 70%) */}
            <div className="absolute top-0 bottom-0 left-[70%] flex flex-col items-center pointer-events-none -ml-px">
              <div className="w-0.5 h-8 bg-error" />
              <span className="font-label-sm text-label-sm text-error uppercase font-medium mt-1">
                70.0° Trip
              </span>
            </div>
          </div>

          {/* Thermal Dynamic Mini Trend Curve SVG */}
          <div className="w-full h-24 pt-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              <div className="w-full h-px bg-outline" />
              <div className="w-full h-px bg-outline" />
            </div>
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 500 80"
            >
              <defs>
                <linearGradient id={`temp-grad-${machine.id}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={themeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              {/* Temperature gradual curve over last 30 minutes */}
              <path
                d="M 0,65 Q 100,60 200,52 T 350,42 T 450,38 L 500,36 L 500,80 L 0,80 Z"
                fill={`url(#temp-grad-${machine.id})`}
              />
              <path
                d="M 0,65 Q 100,60 200,52 T 350,42 T 450,38 L 500,36"
                fill="none"
                stroke={themeColor}
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              {/* Target stabilization line */}
              <line
                opacity="0.3"
                stroke="#899299"
                strokeDasharray="4 4"
                x1="0"
                x2="500"
                y1="36"
                y2="36"
              />
            </svg>
            <div className="flex items-center justify-between text-outline font-telemetry-sm text-label-sm mt-1">
              <span>-30 Min (Cold Start 32.1°C)</span>
              <span>Steady Plateau Profile</span>
              <span>Now ({temp.toFixed(1)}°C)</span>
            </div>
          </div>
        </div>

        {/* Ambient & Rise Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-lg">
          <div className="bg-surface-container p-space-md rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              Ambient Workshop Temp
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-md text-telemetry-md text-on-surface font-semibold">
                {ambient.toFixed(1)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">°C</span>
            </div>
            <span className="font-body-sm text-body-sm text-outline mt-1">
              Workshop Floor A Sensor #2
            </span>
          </div>

          <div className="bg-surface-container p-space-md rounded-lg flex flex-col">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">
              Calculated Thermal Rise
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-md text-telemetry-md text-primary font-semibold">
                +{rise.toFixed(1)}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">°C ΔT</span>
            </div>
            <span
              className="font-body-sm text-body-sm mt-1"
              style={{ color: rise > 45.0 ? '#ffb4ab' : '#42e18d' }}
            >
              {rise > 45.0 ? 'Exceeds standard 45.0°C rise limit' : 'Well below 45.0°C rise limit'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Plain Language Interpretation */}
      <div className="pt-space-md bg-surface-container/60 rounded-lg p-space-md flex flex-wrap items-center justify-between gap-2 border border-outline-variant/20">
        <div className="flex items-center gap-space-sm">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ color: themeColor }}
          >
            thermostat
          </span>
          <span className="font-body-md text-body-md text-on-surface">
            {isCritical
              ? 'Critical temperature warning. Verify cooling circulation and stator winding resistance.'
              : isWarning
              ? 'Winding temperature trending upward. Check lubrication and ventilation fan cowl.'
              : 'Thermal equilibrium reached within safe envelope. Stator winding cooling intact.'}
          </span>
        </div>
        <span className="font-telemetry-sm text-telemetry-sm text-outline font-medium">
          Safe Margin: {marginToTrip > 0 ? `${((marginToTrip / threshold) * 100).toFixed(1)}%` : '0%'}
        </span>
      </div>
    </div>
  );
};

