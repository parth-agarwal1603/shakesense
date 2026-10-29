import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Machine } from '../../types';

interface EdgeDebugConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
}

export const EdgeDebugConsoleModal: React.FC<EdgeDebugConsoleModalProps> = ({
  isOpen,
  onClose,
  machine,
}) => {
  const [logEntries, setLogEntries] = useState<string[]>([
    `[INFO] [ESP32-S3-${machine.id}] I2C bus initialized at 400kHz. Sensor WHO_AM_I responded: 0x68`,
    `[INFO] TinyML INT8 model loaded in flash: 1600Hz sampling window, 512-point FFT enabled`,
    `[INFO] WiFi Station connected to SSID 'PFL_FACTORY_WFA_IOT' (IP: ${machine.edge.ipAddress}, RSSI: ${machine.edge.rssi})`,
    `[DATA] Frame #${machine.edge.framesSent - 4}: ax=+0.112g ay=+0.194g az=+0.082g | RMS=2.41 mm/s | INT8_LAT=12ms`,
    `[DATA] Frame #${machine.edge.framesSent - 3}: ax=+0.109g ay=+0.191g az=+0.080g | RMS=2.39 mm/s | INT8_LAT=12ms`,
    `[DATA] Frame #${machine.edge.framesSent - 2}: ax=+0.115g ay=+0.198g az=+0.085g | RMS=2.42 mm/s | INT8_LAT=12ms`,
    `[DATA] Frame #${machine.edge.framesSent - 1}: ax=+0.111g ay=+0.193g az=+0.081g | RMS=2.40 mm/s | INT8_LAT=12ms`,
  ]);

  const [commandInput, setCommandInput] = useState('');

  const sendCommand = (cmd: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    let response = `[ACK] Command '${cmd}' processed by coprocessor.`;

    if (cmd.toLowerCase().includes('ping')) {
      response = `[PONG] Heartbeat ACK from ${machine.nodeId} in 8.4ms (Link RSSI: ${machine.edge.rssi})`;
    } else if (cmd.toLowerCase().includes('fft')) {
      response = `[FFT] Peak spectral component: 24.75 Hz (1X motor speed) @ 1.9 mm/s. Harmonics: 49.5 Hz (2X) @ 0.4 mm/s`;
    } else if (cmd.toLowerCase().includes('selftest')) {
      response = `[SELFTEST] MPU-6050 Gyro/Accel registers OK. Sensor self-test deviation < 2.1%. Thermal sensor within calibration envelope.`;
    }

    setLogEntries((prev) => [...prev, `[USER@${timestamp}] $ ${cmd}`, response]);
    setCommandInput('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edge Debug Console — ${machine.name} (${machine.id})`}
      subtitle={`Node Hardware: ESP32-S3 IoT Gateway // Sensor: MPU-6050 (${machine.nodeId})`}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4">
        {/* Hardware Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container p-3 rounded-lg text-body-sm font-telemetry-sm">
          <div>
            <span className="text-outline text-[11px] uppercase block font-label-sm">IP Endpoint</span>
            <span className="text-primary">{machine.edge.ipAddress}:8883</span>
          </div>
          <div>
            <span className="text-outline text-[11px] uppercase block font-label-sm">Firmware</span>
            <span className="text-on-surface">{machine.edge.firmwareVersion}</span>
          </div>
          <div>
            <span className="text-outline text-[11px] uppercase block font-label-sm">WiFi RSSI</span>
            <span className="text-tertiary">{machine.edge.rssi}</span>
          </div>
          <div>
            <span className="text-outline text-[11px] uppercase block font-label-sm">Packet Status</span>
            <span className="text-tertiary">0.00% Drop ({machine.edge.framesSent} Frm)</span>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div className="bg-black/95 border border-outline-variant/40 rounded-lg p-4 font-mono text-[12px] text-green-400 h-64 overflow-y-auto space-y-1 select-text">
          {logEntries.map((entry, idx) => (
            <div
              key={idx}
              className={
                entry.startsWith('[USER')
                  ? 'text-primary font-semibold'
                  : entry.startsWith('[ACK') || entry.startsWith('[PONG')
                  ? 'text-cyan-300'
                  : entry.includes('WARNING') || entry.includes('CRITICAL')
                  ? 'text-rose-400'
                  : 'text-zinc-300'
              }
            >
              {entry}
            </div>
          ))}
        </div>

        {/* Quick Command Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-sm text-[11px] text-outline uppercase tracking-wider">
            Quick Invocations:
          </span>
          <button
            onClick={() => sendCommand('ping -c 1')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-telemetry-sm text-[11px] transition-colors"
          >
            ping heartbeat
          </button>
          <button
            onClick={() => sendCommand('dump_fft_spectrum --bins=64')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-telemetry-sm text-[11px] transition-colors"
          >
            dump FFT spectrum
          </button>
          <button
            onClick={() => sendCommand('run_selftest')}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-telemetry-sm text-[11px] transition-colors"
          >
            run hardware self-test
          </button>
        </div>

        {/* Command Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (commandInput.trim()) sendCommand(commandInput.trim());
          }}
          className="flex items-center gap-2 pt-1"
        >
          <span className="font-mono text-primary text-[14px]">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type edge CLI command (e.g. read_fifo, get_voltage, reboot_node)..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-on-surface font-mono text-[13px] focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider font-semibold hover:bg-inverse-primary transition-colors"
          >
            Execute
          </button>
        </form>
      </div>
    </Modal>
  );
};

