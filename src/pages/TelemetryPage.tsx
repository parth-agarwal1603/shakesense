import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';
import { WaveformChart } from '../components/telemetry/WaveformChart';
import { ThermalEnvelopeChart } from '../components/telemetry/ThermalEnvelopeChart';
import { EdgeCoprocessorBar } from '../components/telemetry/EdgeCoprocessorBar';

export const TelemetryPage: React.FC = () => {
  const { machines, selectedMachine, setSelectedMachineId } = useFleet();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const machineParam = searchParams.get('machine');
  useEffect(() => {
    if (machineParam && machineParam !== selectedMachine.id) {
      const match = machines.find((m) => m.id === machineParam);
      if (match) setSelectedMachineId(match.id);
    }
  }, [machineParam, machines, selectedMachine.id, setSelectedMachineId]);

  const [showMachineDropdown, setShowMachineDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterBand, setFilterBand] = useState('All Bands (0-800Hz)');

  const filterBands = [
    'All Bands (0-800Hz)',
    '1X Harmonic (10-30Hz)',
    '2X Harmonic (30-60Hz)',
    'Blade Pass / Rotor (60-200Hz)',
    'High-Freq Bearing Cage (200-800Hz)',
  ];

  const handleSelectMachine = (id: string) => {
    setSelectedMachineId(id);
    setSearchParams({ machine: id });
    setShowMachineDropdown(false);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-8">
      {/* Top Command / Stream Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Machine Selector Pill */}
          <div className="relative">
            <div
              onClick={() => {
                setShowMachineDropdown(!showMachineDropdown);
                setShowFilterDropdown(false);
              }}
              className="group cursor-pointer bg-surface-container hover:bg-surface-container-high transition-colors px-4 py-2 rounded-full flex items-center gap-2.5 shadow-sm border border-outline-variant/30 select-none"
            >
              <div className="relative flex items-center justify-center w-3 h-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full absolute ${
                    selectedMachine.healthStatus === 'critical' ? 'bg-error animate-ping' : 'bg-tertiary'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedMachine.healthStatus === 'critical'
                      ? 'bg-error'
                      : selectedMachine.healthStatus === 'warning'
                      ? 'bg-secondary'
                      : 'bg-tertiary'
                  }`}
                />
              </div>

              <span className="font-telemetry-md text-sm text-on-surface tracking-tight pl-0.5">
                {selectedMachine.id}
              </span>
              <span className="text-outline text-body-sm">•</span>
              <span className="font-body-md text-sm text-on-surface-variant font-medium max-w-[200px] sm:max-w-none truncate">
                {selectedMachine.name}
              </span>
              <Icon
                name="arrow_drop_down"
                size={18}
                className="text-outline ml-0.5 group-hover:text-primary transition-colors"
              />
            </div>

            {/* Dropdown Menu */}
            {showMachineDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMachineDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-2xl z-40 py-2 divide-y divide-outline-variant/20">
                  <div className="px-4 py-2 font-label-sm text-[11px] text-outline uppercase tracking-wider">
                    Select Monitored Machine ({machines.length} Total)
                  </div>
                  {machines.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMachine(m.id)}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        m.id === selectedMachine.id
                          ? 'bg-primary-container text-on-primary-container'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-medium truncate">{m.name}</span>
                        <span className="font-telemetry-sm text-[12px] opacity-75">
                          {m.id} // {m.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-telemetry-sm font-semibold">
                          {m.connectionStatus === 'disconnected' ? '--' : `${m.vibration.overall.toFixed(1)} mm/s`}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.healthStatus === 'healthy'
                              ? 'bg-tertiary'
                              : m.healthStatus === 'warning'
                              ? 'bg-secondary'
                              : m.healthStatus === 'critical'
                              ? 'bg-error animate-pulse'
                              : 'bg-outline'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Edge Sensor Protocol Pill */}
          <div className="bg-surface-container-low border border-outline-variant/30 px-space-md py-space-sm rounded-full flex items-center gap-space-sm">
            <Icon name="memory" size={18} className="text-primary" />
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Live Edge Stream
            </span>
            <span className="text-outline text-body-sm">•</span>
            <span className="font-telemetry-sm text-telemetry-sm text-primary">
              {selectedMachine.edge.protocol}
            </span>
          </div>
        </div>

        {/* Right Stream State Indicators & Filter Band */}
        <div className="flex flex-wrap items-center gap-space-md sm:gap-space-lg">
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <Icon
              name="sensors"
              size={18}
              className={selectedMachine.connectionStatus === 'disconnected' ? 'text-outline' : 'text-tertiary'}
            />
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Buffer Status:
            </span>
            <span
              className={`font-telemetry-sm text-telemetry-sm ${
                selectedMachine.connectionStatus === 'disconnected' ? 'text-outline' : 'text-tertiary'
              }`}
            >
              {selectedMachine.connectionStatus === 'disconnected'
                ? 'Offline (No Buffer)'
                : 'Realtime Sync (0 Drop)'}
            </span>
          </div>

          {/* Filter Band Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowMachineDropdown(false);
              }}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs shadow-sm border border-outline-variant/30 cursor-pointer"
            >
              <Icon name="tune" size={16} />
              <span>{filterBand}</span>
              <Icon name="arrow_drop_down" size={14} />
            </button>

            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1">
                  <div className="px-3 py-1.5 font-label-sm text-[10px] text-outline uppercase tracking-wider">
                    Bandpass DSP Filter
                  </div>
                  {filterBands.map((band) => (
                    <button
                      key={band}
                      onClick={() => {
                        setFilterBand(band);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-body-sm transition-colors ${
                        filterBand === band
                          ? 'bg-primary-container text-on-primary-container font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Machine Details Quick Action */}
          <button
            onClick={() => navigate(`/machines/${selectedMachine.id}`)}
            className="hidden sm:flex items-center gap-1 text-primary hover:text-primary-fixed font-label-md text-label-md uppercase tracking-wider transition-colors"
          >
            <span>Machine Profile</span>
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>

      {/* Main Hero Telemetry Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 mb-5">
        <WaveformChart machine={selectedMachine} filterBand={filterBand} />
        <ThermalEnvelopeChart machine={selectedMachine} />
      </div>

      {/* Bottom Section: Edge Diagnostic Coprocessor Bar */}
      <EdgeCoprocessorBar machine={selectedMachine} />
    </div>
  );
};
