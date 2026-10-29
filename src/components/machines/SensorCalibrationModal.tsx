import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';
import { Badge } from '../common/Badge';

interface SensorCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorCalibrationModal: React.FC<SensorCalibrationModalProps> = ({ isOpen, onClose }) => {
  const { machines, updateMachineCalibration } = useFleet();
  const [calibratingId, setCalibratingId] = useState<string | null>(null);

  const handleRecalibrate = (id: string) => {
    setCalibratingId(id);
    updateMachineCalibration(id, 'calibrating');

    setTimeout(() => {
      updateMachineCalibration(id, 'calibrated');
      setCalibratingId(null);
    }, 2200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sensor FFT Baseline Calibrations"
      subtitle="Autonomous 1600 Hz DSP Baseline Convergence Matrix"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        <p className="text-on-surface-variant text-body-sm">
          Sensor baseline models capture nominal triaxial spectral vibrations, harmonics, and thermal steady-state profiles. Recalibrating establishes a new baseline reference envelope based on 500 contiguous FFT windows.
        </p>

        <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container font-label-sm text-[11px] text-outline uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Node & Machine</th>
                <th className="py-3 px-4">Baseline RMS</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 bg-surface-container-low">
              {machines.map((m) => {
                const isThisCalibrating = calibratingId === m.id || m.calibrationStatus === 'calibrating';
                return (
                  <tr key={m.id} className="hover:bg-surface-container transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{m.name}</span>
                        <span className="font-telemetry-sm text-[11px] text-outline">
                          {m.id} // {m.nodeId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-telemetry-sm text-on-surface">
                      {m.vibration.baseline.toFixed(1)} mm/s RMS
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        status={isThisCalibrating ? 'calibrating' : m.calibrationStatus === 'calibrated' ? 'healthy' : 'warning'}
                        text={isThisCalibrating ? 'SAMPLING (50%)' : m.calibrationStatus.toUpperCase()}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRecalibrate(m.id)}
                        disabled={isThisCalibrating || m.connectionStatus === 'disconnected'}
                        className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label-sm text-[11px] tracking-wider uppercase transition-colors disabled:opacity-40"
                      >
                        {isThisCalibrating ? 'Recalibrating...' : 'Recalibrate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

