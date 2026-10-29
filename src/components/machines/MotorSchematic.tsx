import React, { useState } from 'react';
import { Machine } from '../../types';

interface MotorSchematicProps {
  machine: Machine;
  onSensorNodeClick?: () => void;
}

export const MotorSchematic: React.FC<MotorSchematicProps> = ({ machine, onSensorNodeClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Status colors for the sensor node
  const statusColors = {
    healthy: { glow: '#42e18d', fill: '#00391e', stroke: '#42e18d', label: 'Nominal' },
    warning: { glow: '#ffb0ca', fill: '#640035', stroke: '#ffb0ca', label: 'Advisory Drift' },
    critical: { glow: '#ffb4ab', fill: '#690005', stroke: '#ffb4ab', label: 'Immediate Action' },
    disconnected: { glow: '#899299', fill: '#2a2a2a', stroke: '#899299', label: 'Link Offline' },
    calibrating: { glow: '#7cd0ff', fill: '#00344a', stroke: '#7cd0ff', label: 'FFT Sampling' },
  }[machine.healthStatus];

  return (
    <div className="bg-surface-container rounded-xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[340px]">
      {/* Top Bar */}
      <div className="flex items-center justify-between relative z-10 mb-4">
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
          Physical Topology & Sensor Node
        </span>
        <span
          className="font-label-sm text-label-sm bg-surface-container-low px-2.5 py-1 rounded border border-outline-variant/30 flex items-center gap-1.5"
          style={{ color: statusColors.stroke }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColors.stroke }}
          />
          {machine.nodeId} Retrofit Node
        </span>
      </div>

      {/* Motor Vector Schematic */}
      <div className="my-auto py-4 sm:py-6 flex items-center justify-center relative z-10 w-full">
        <div className="relative w-full max-w-md">
          <svg
            className="w-full h-auto text-outline-variant select-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 540 240"
          >
            {/* Stator Frame / Cooling Fins */}
            <rect
              className="text-outline-variant"
              fill="#131313"
              height="150"
              rx="8"
              strokeWidth="2"
              width="220"
              x="140"
              y="45"
            />
            <path
              className="text-surface-container-highest"
              d="M165 45V195M190 45V195M215 45V195M240 45V195M265 45V195M290 45V195M315 45V195M340 45V195"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />

            {/* Terminal Box */}
            <rect
              className="text-outline"
              fill="#201f1f"
              height="30"
              rx="4"
              strokeWidth="2"
              width="90"
              x="200"
              y="15"
            />
            <line className="text-outline" strokeWidth="1.5" x1="245" x2="245" y1="15" y2="45" />

            {/* Drive End (DE) Housing */}
            <rect
              className="text-outline"
              fill="#1c1b1b"
              height="120"
              rx="4"
              strokeWidth="2"
              width="45"
              x="360"
              y="60"
            />

            {/* Output Shaft */}
            <rect
              className="text-outline"
              fill="#2a2a2a"
              height="50"
              rx="3"
              strokeWidth="2"
              width="85"
              x="405"
              y="95"
            />
            <line className="text-outline-variant" strokeWidth="1.5" x1="440" x2="440" y1="95" y2="145" />
            <circle cx="480" cy="120" fill="#7cd0ff" r="4" />

            {/* Non-Drive End (NDE) Housing */}
            <rect
              className="text-outline"
              fill="#1c1b1b"
              height="120"
              rx="4"
              strokeWidth="2"
              width="45"
              x="95"
              y="60"
            />

            {/* Fan Cowl */}
            <path
              className="text-outline-variant"
              d="M95 70C65 75 55 95 55 120C55 145 65 165 95 170Z"
              fill="#131313"
              strokeWidth="2"
            />
            <circle className="text-outline-variant" cx="75" cy="120" r="10" strokeWidth="1.5" />

            {/* Base Mounting Feet */}
            <rect
              className="text-outline-variant"
              fill="#201f1f"
              height="24"
              rx="2"
              strokeWidth="2"
              width="60"
              x="135"
              y="195"
            />
            <rect
              className="text-outline-variant"
              fill="#201f1f"
              height="24"
              rx="2"
              strokeWidth="2"
              width="60"
              x="305"
              y="195"
            />
            <circle className="text-outline" cx="165" cy="207" r="4" />
            <circle className="text-outline" cx="335" cy="207" r="4" />

            {/* Interactive Sensor Marker on Drive End (DE Bearing) */}
            <g
              className="cursor-pointer transition-transform"
              onClick={onSensorNodeClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <circle
                cx="382"
                cy="78"
                fill={statusColors.glow}
                fillOpacity={isHovered ? 0.35 : 0.18}
                r={isHovered ? 22 : 18}
                className="transition-all duration-200"
              />
              <circle
                cx="382"
                cy="78"
                fill={statusColors.fill}
                r="9"
                stroke={statusColors.stroke}
                strokeWidth="2"
              />
              <circle cx="382" cy="78" fill={statusColors.glow} r="3.5" />
              {/* Connecting Pointer */}
              <path
                d="M382 60V34H430"
                stroke={statusColors.stroke}
                strokeDasharray="2 2"
                strokeWidth="1.5"
              />
            </g>
          </svg>

          {/* Floating Sensor Callout Tooltip */}
          <div
            onClick={onSensorNodeClick}
            className={`absolute -top-3 right-0 sm:right-6 bg-surface-container-high px-space-md py-space-xs rounded-lg shadow-xl border border-outline-variant/40 flex items-center gap-space-sm cursor-pointer transition-transform hover:scale-105 ${
              isHovered ? 'ring-1 ring-primary' : ''
            }`}
          >
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColors.stroke }}
            />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                {machine.specs.sensorLocation}
              </span>
              <span
                className="font-telemetry-sm text-telemetry-sm"
                style={{ color: statusColors.stroke }}
              >
                Triaxial Accelerometer: {statusColors.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Micro Specifications */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-outline font-label-sm text-label-sm pt-4 border-t border-outline-variant/20 relative z-10">
        <span>Rating: {machine.specs.powerKw} kW Induction / {machine.specs.voltage}</span>
        <span>RPM: {machine.specs.rpm.toLocaleString()} (Continuous)</span>
        <span>Bearing: {machine.specs.bearingType}</span>
      </div>
    </div>
  );
};

