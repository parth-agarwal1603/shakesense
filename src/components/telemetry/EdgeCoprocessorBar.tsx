import React, { useState } from 'react';
import { Machine } from '../../types';
import { Icon } from '../common/Icon';
import { EdgeDebugConsoleModal } from './EdgeDebugConsoleModal';

interface EdgeCoprocessorBarProps {
  machine: Machine;
}

export const EdgeCoprocessorBar: React.FC<EdgeCoprocessorBarProps> = ({ machine }) => {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const isConnected = machine.connectionStatus !== 'disconnected';

  return (
    <>
      <div className="w-full bg-surface-container-low rounded-xl p-space-lg shadow-sm border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-lg">
          {/* Diagnostic Sub-System Title */}
          <div className="flex items-center gap-space-md w-full lg:w-auto">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <Icon name="developer_board" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  On-Device Edge Coprocessor
                </h3>
                <span
                  className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded uppercase font-semibold ${
                    isConnected
                      ? 'bg-tertiary/15 text-tertiary'
                      : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-outline">
                Real-time local anomaly inference & frequency FFT decomposition ({machine.edge.protocol})
              </p>
            </div>
          </div>

          {/* Key Diagnostic Edge Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-lg w-full lg:w-auto">
            {/* Metric 1: Signal Quality */}
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Wi-Fi RSSI / Link
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon
                  name={isConnected ? 'wifi' : 'wifi_off'}
                  size={18}
                  className={isConnected ? 'text-tertiary' : 'text-outline'}
                />
                <span className="font-telemetry-md text-telemetry-md text-on-surface font-medium">
                  {isConnected ? machine.edge.rssi : 'No Signal'}
                </span>
              </div>
              <span
                className={`font-body-sm text-body-sm ${
                  isConnected ? 'text-tertiary' : 'text-outline'
                }`}
              >
                {isConnected ? '99.8% Signal Reliability' : 'Gateway Link Down'}
              </span>
            </div>

            {/* Metric 2: TinyML Latency */}
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                TinyML Inference
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon name="speed" size={18} className="text-primary" />
                <span className="font-telemetry-md text-telemetry-md text-primary font-medium">
                  {isConnected ? `${machine.edge.latencyMs} ms` : '--'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-outline">
                Quantized INT8 Model
              </span>
            </div>

            {/* Metric 3: Sample Rate */}
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Sampling Frequency
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon name="equalizer" size={18} className="text-outline" />
                <span className="font-telemetry-md text-telemetry-md text-on-surface font-medium">
                  {isConnected ? `${machine.edge.sampleRateHz.toLocaleString()} Hz` : '0 Hz'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-outline">
                Nyquist limit: {machine.edge.sampleRateHz / 2} Hz
              </span>
            </div>

            {/* Metric 4: Loss Rate */}
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Loss Rate
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon
                  name={machine.edge.lossRatePercent > 0.05 ? 'warning' : 'check'}
                  size={18}
                  className={machine.edge.lossRatePercent > 0.05 ? 'text-secondary' : 'text-tertiary'}
                />
                <span className="font-telemetry-md text-telemetry-md text-on-surface font-medium">
                  {machine.edge.lossRatePercent.toFixed(2)}%
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-outline">
                {machine.edge.framesSent.toLocaleString()} Frames Sent
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 w-full lg:w-auto flex justify-end">
            <button
              onClick={() => setIsConsoleOpen(true)}
              className="w-full lg:w-auto bg-surface-container hover:bg-surface-container-high text-on-surface px-space-lg py-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors border border-outline-variant/30"
            >
              <Icon name="terminal" size={16} />
              <span>Open Edge Debug Console</span>
            </button>
          </div>
        </div>
      </div>

      <EdgeDebugConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        machine={machine}
      />
    </>
  );
};

