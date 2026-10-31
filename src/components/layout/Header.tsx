import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useFleet } from '../../context/FleetContext';
import { TimeRange } from '../../types';

interface HeaderProps {
  onToggleMobileNav: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, isSidebarCollapsed }) => {
  const {
    machines,
    selectedMachineId,
    selectedMachine,
    setSelectedMachineId,
    activeFacility,
    timeRange,
    setTimeRange,
    isLiveStreamEnabled,
    toggleLiveStream,
    lastSyncTime,
    triggerManualSweep,
    isSweeping,
    modelStatus,
    modelError,
    criticalAlertsCount,
    warningAlertsCount,
  } = useFleet();

  const [showMachineDropdown, setShowMachineDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const navigate = useNavigate();

  const timeRangeLabels: Record<TimeRange, string> = {
    '1h': 'Last 1 Hour',
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
  };

  return (
    <header
      className={`fixed top-0 right-0 h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 z-40 flex items-center justify-between px-space-md sm:px-space-lg transition-all duration-200 ${
        isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'
      }`}
    >
      {/* Left Context & Switchers */}
      <div className="flex items-center gap-space-sm sm:gap-space-md min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface"
          aria-label="Open Navigation"
        >
          <Icon name="menu" size={20} />
        </button>

        <div className="hidden xl:flex items-center gap-space-xs">
          <span className="font-label-sm text-[10.5px] text-outline uppercase tracking-wider">Context:</span>
          <span className="font-headline-sm text-sm text-on-surface whitespace-nowrap">
            Motor Health Telemetry
          </span>
        </div>

        <div className="hidden xl:block h-4 w-px bg-outline-variant/40" />

        <div className="flex items-center gap-space-sm">
          {/* Facility Selector */}
          <div
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-sm border border-outline-variant/30 text-on-surface select-none whitespace-nowrap"
            title={activeFacility.name}
          >
            <Icon name="factory" size={15} className="text-outline" />
            <span className="font-body-sm text-[12px] truncate max-w-[190px]">
              Workshop Floor A ({machines.length} Machines)
            </span>
          </div>

          {/* Quick Machine Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMachineDropdown(!showMachineDropdown);
                setShowTimeDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-sm border border-outline-variant/30 transition-colors cursor-pointer select-none whitespace-nowrap"
              title="Select machine to inspect"
            >
              <Icon
                name={selectedMachine.healthStatus === 'critical' ? 'error' : 'electric_bolt'}
                size={15}
                className={selectedMachine.healthStatus === 'critical' ? 'text-secondary' : 'text-primary'}
              />
              <span className="font-telemetry-sm text-[12px] text-on-surface max-w-[130px] sm:max-w-[180px] truncate">
                {selectedMachine.id} — {selectedMachine.name}
              </span>
              <Icon name="expand_more" size={14} className="text-outline" />
            </button>

            {showMachineDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMachineDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 max-h-80 overflow-y-auto bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1 divide-y divide-surface-container-highest/30">
                  <div className="px-3 py-1.5 font-label-sm text-[10px] text-outline uppercase tracking-wider">
                    Select Target Motor ({machines.length} Units)
                  </div>
                  {machines.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMachineId(m.id);
                        setShowMachineDropdown(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 text-body-sm cursor-pointer transition-colors ${
                        m.id === selectedMachineId
                          ? 'bg-primary-container text-on-primary-container'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-medium truncate">{m.name}</span>
                        <span className="font-telemetry-sm text-[11px] opacity-75">{m.id} // {m.bay}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
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
                        <span className="font-label-sm text-[10px] uppercase opacity-90">{m.healthStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls & Indicators */}
      <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
        {/* Time Range Selector */}
        <div className="relative hidden md:block shrink-0">
          <button
            onClick={() => {
              setShowTimeDropdown(!showTimeDropdown);
              setShowMachineDropdown(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container rounded-sm text-outline transition-colors cursor-pointer whitespace-nowrap"
          >
            <Icon name="schedule" size={14} />
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase whitespace-nowrap">
              {timeRangeLabels[timeRange]}
            </span>
            <Icon name="arrow_drop_down" size={14} />
          </button>

          {showTimeDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowTimeDropdown(false)} />
              <div className="absolute right-0 mt-1.5 w-40 bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1">
                {(['1h', '24h', '7d', '30d'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range);
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-body-sm font-label-sm uppercase transition-colors ${
                      timeRange === range
                        ? 'bg-primary-container text-on-primary-container font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {timeRangeLabels[range]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live Demo Stream Toggle Pill */}
        <button
          onClick={toggleLiveStream}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-colors select-none whitespace-nowrap shrink-0 ${
            isLiveStreamEnabled
              ? 'bg-surface-container border-primary/40 text-primary'
              : 'bg-surface-container-high border-outline-variant/40 text-outline'
          }`}
          title={isLiveStreamEnabled ? 'Live Stream Active (Click to Pause)' : 'Live Stream Paused (Click to Resume)'}
        >
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              isLiveStreamEnabled ? 'bg-primary animate-pulse' : 'bg-outline'
            }`}
          />
          <span className="font-label-sm text-[11px] uppercase whitespace-nowrap">
            {isLiveStreamEnabled ? 'Edge Stream' : 'Paused'}
          </span>
        </button>

        {/* Critical & Warning Quick Badges (Links to Alerts) */}
        <div
          onClick={() => navigate('/alerts')}
          className="hidden md:flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high px-2 py-1 rounded-sm border border-outline-variant/40 cursor-pointer transition-colors"
          title="Open Alerts & Diagnostics"
        >
          <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container font-label-sm text-[10.5px] font-semibold rounded-sm">
            {criticalAlertsCount} Critical
          </span>
          <span className="px-1.5 py-0.5 bg-surface-container-highest text-on-surface-variant font-label-sm text-[10.5px] rounded-sm">
            {warningAlertsCount} Warnings
          </span>
        </div>

        {/* Sync Sweep Indicator & Trigger */}
        <span
          className={`hidden lg:inline-block font-label-sm text-[10px] uppercase tracking-wider ${
            modelStatus === 'error'
              ? 'text-error'
              : modelStatus === 'loading'
              ? 'text-secondary'
              : modelStatus === 'disabled'
              ? 'text-outline'
              : 'text-tertiary'
          }`}
          title={modelError || (modelStatus === 'disabled' ? 'ML model is not configured' : 'ML model ready')}
        >
          ML {modelStatus}
        </span>
        <div className="font-telemetry-sm text-[12px] text-outline border-l border-outline-variant/30 pl-space-sm sm:pl-space-md flex items-center gap-1.5">
          <button
            onClick={triggerManualSweep}
            disabled={isSweeping}
            className="flex items-center text-tertiary hover:text-primary transition-colors disabled:opacity-50"
            title="Trigger Instant Telemetry Scan"
          >
            <Icon
              name="sync"
              size={15}
              className={isSweeping ? 'animate-spin' : ''}
            />
          </button>
          <span className="hidden xs:inline-block font-mono text-[12px]">{lastSyncTime}</span>
        </div>
      </div>
    </header>
  );
};
