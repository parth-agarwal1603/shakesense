import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFleet } from '../../context/FleetContext';

interface ProvisionNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvisionNodeModal: React.FC<ProvisionNodeModalProps> = ({ isOpen, onClose }) => {
  const { provisionNode } = useFleet();
  const [name, setName] = useState('');
  const [type, setType] = useState('Induction Motor');
  const [bay, setBay] = useState('Secondary Drive Bay 3');
  const [location, setLocation] = useState('Floor A — Section 2');
  const [baseline, setBaseline] = useState('1.8');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      provisionNode({
        name: name.trim(),
        type,
        bay,
        location,
        baseline: parseFloat(baseline) || 1.8,
      });
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setName('');
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Provision Retrofit IoT Sensor Node"
      subtitle="Register New MPU-6050 + ESP32 Edge Device into Workshop Floor A"
    >
      {successMessage ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">check_circle</span>
          </div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Node Successfully Enrolled</h4>
          <p className="font-body-md text-outline">
            Edge sync handshake established. Initializing 1600 Hz DSP baseline window.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Asset / Motor Nomenclature
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Auxiliary Slurry Pump 03"
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3.5 py-2.5 text-on-surface placeholder:text-outline/50 font-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Machinery Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary"
              >
                <option value="Induction Motor">Induction Motor</option>
                <option value="Centrifugal Pump">Centrifugal Pump</option>
                <option value="Screw Compressor">Screw Compressor</option>
                <option value="Exhaust Fan">Exhaust Fan</option>
                <option value="Planetary Mixer Drive">Planetary Mixer Drive</option>
                <option value="Heavy Hydraulic Drive">Heavy Hydraulic Drive</option>
                <option value="Synchronous Spindle">Synchronous Spindle</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Initial Baseline RMS (mm/s)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="4.0"
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3.5 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Location Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3.5 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Bay Reference
              </label>
              <input
                type="text"
                value={bay}
                onChange={(e) => setBay(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3.5 py-2.5 text-on-surface font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="p-3.5 rounded bg-surface-container border border-outline-variant/30 text-body-sm text-outline flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">sensors</span>
            <span>
              Device will be automatically assigned an MPU6050 I²C bus address and provisioned on the local 192.168.4.x edge network subnet.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-body-md font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Provision Node</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

