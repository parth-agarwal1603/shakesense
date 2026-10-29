import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { ProvisionNodeModal } from '../components/machines/ProvisionNodeModal';
import { SensorCalibrationModal } from '../components/machines/SensorCalibrationModal';
import { Machine } from '../types';

export const MachinesPage: React.FC = () => {
  const {
    machines,
    setSelectedMachineId,
    totalMachines,
    healthyCount,
    warningCount,
    criticalCount,
    fleetVibrationAverage,
    fleetMeanTemperature,
    gatewayUpRate,
  } = useFleet();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('status') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'vibe' | 'temp'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredMachines = useMemo(() => {
    return machines
      .filter((m) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          m.name.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query) ||
          m.nodeId.toLowerCase().includes(query) ||
          m.location.toLowerCase().includes(query) ||
          m.bay.toLowerCase().includes(query);

        const matchesFilter =
          currentFilter === 'all' ||
          m.healthStatus === currentFilter ||
          (currentFilter === 'disconnected' && m.connectionStatus === 'disconnected');

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') diff = a.id.localeCompare(b.id);
        else if (sortBy === 'name') diff = a.name.localeCompare(b.name);
        else if (sortBy === 'vibe') diff = a.vibration.overall - b.vibration.overall;
        else if (sortBy === 'temp') diff = a.temperature.core - b.temperature.core;
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [machines, searchQuery, currentFilter, sortBy, sortOrder]);

  const handleRowClick = (machine: Machine) => {
    setSelectedMachineId(machine.id);
    navigate(`/machines/${machine.id}`);
  };

  const handleExportCSV = () => {
    const headers = ['Machine ID', 'Name', 'Node ID', 'Location', 'Bay', 'Vibration (mm/s)', 'Zone', 'Temp (°C)', 'Health Status', 'Connection'];
    const rows = machines.map((m) => [
      m.id,
      `"${m.name}"`,
      m.nodeId,
      `"${m.location}"`,
      `"${m.bay}"`,
      m.vibration.overall,
      m.vibration.zone,
      m.temperature.core,
      m.healthStatus,
      m.connectionStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShakeSense_Fleet_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('CSV Exported Successfully');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleExportAuditReport = () => {
    const report = `# SHAKESENSE — ISO 10816 MACHINERY FLEET AUDIT REPORT
Facility: Precision Fabrications Ltd. — Workshop Floor A
Generated: ${new Date().toLocaleString()}
Vibration Standards: ISO 10816-3 (Class II Medium Induction Machines)
Total Enrolled Machines: ${totalMachines}
Baseline Fleet Average Vibration: ${fleetVibrationAverage} mm/s RMS
Mean Operating Temperature: ${fleetMeanTemperature} °C
Gateway Uptime: ${gatewayUpRate}%

--- ASSET AUDIT BREAKDOWN ---
${machines
  .map(
    (m) =>
      `[${m.id}] ${m.name} // Node: ${m.nodeId}
  Location: ${m.location} (${m.bay})
  Vibration: ${m.vibration.overall} mm/s RMS (${m.vibration.zone})
  Temperature: ${m.temperature.core} °C (Rise: +${m.temperature.rise} °C)
  Health: ${m.healthStatus.toUpperCase()}
  Guidance: ${m.recommendedAction.title}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShakeSense_ISO_Audit_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('ISO Audit Report Downloaded');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const toggleSort = (col: 'id' | 'name' | 'vibe' | 'temp') => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-md text-label-md uppercase tracking-wider">
              Asset Registry
            </span>
            <span className="font-label-md text-label-md text-outline">ZONE A // BAY 1-4</span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight">
            Machines Fleet Inventory
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Overview of all {totalMachines} monitored retrofit IoT motor sensors across Workshop Floor A with synchronized tri-axial vibration metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCalibrationModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md transition-colors border border-outline-variant/30 cursor-pointer text-sm"
          >
            <Icon name="tune" size={18} className="text-primary" />
            <span>Sensor Calibrations</span>
          </button>

          <button
            onClick={() => setIsProvisionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container hover:bg-inverse-primary text-on-primary-container font-body-md font-semibold transition-colors cursor-pointer shadow-sm text-sm"
          >
            <Icon name="add_circle" size={18} />
            <span>Provision Retrofit Node</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Coverage */}
        <div className="flex flex-col bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm gap-1 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-outline uppercase tracking-wider">
              Fleet Coverage
            </span>
            <Icon name="precision_manufacturing" size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
              {totalMachines}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              / {totalMachines} Active Nodes
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Nominal Baseline */}
        <div className="flex flex-col bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm gap-1 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
              Nominal Baseline
            </span>
            <Icon name="verified" size={18} className="text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-telemetry-lg text-telemetry-lg text-tertiary font-semibold">
              {healthyCount}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              Optimal ({((healthyCount / totalMachines) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-tertiary h-full rounded-full"
              style={{ width: `${(healthyCount / totalMachines) * 100}%` }}
            />
          </div>
        </div>

        {/* Advisory Warning */}
        <div className="flex flex-col bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm gap-1 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
              Advisory Warning
            </span>
            <Icon name="warning" size={18} className="text-secondary" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-telemetry-lg text-telemetry-lg text-secondary font-semibold">
              {warningCount}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              ISO Zone B/C
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-secondary h-full rounded-full"
              style={{ width: `${(warningCount / totalMachines) * 100}%` }}
            />
          </div>
        </div>

        {/* Critical Trigger */}
        <div className="flex flex-col bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm gap-1 border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-error uppercase tracking-wider">
              Critical Trigger
            </span>
            <Icon name="crisis_alert" size={18} className="text-error" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-telemetry-lg text-telemetry-lg text-error font-semibold">
              {criticalCount}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">
              Immediate Attention
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-error h-full rounded-full"
              style={{ width: `${(criticalCount / totalMachines) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-4 sm:p-5 rounded-xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Icon
            name="search"
            size={20}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset tag, motor nomenclature, or bay position..."
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 font-body-md text-sm pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCurrentFilter('all');
              setSearchParams({});
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-xs transition-all cursor-pointer shadow-sm ${
              currentFilter === 'all'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span>ALL UNITS</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest/40 font-telemetry-sm text-[11px]">
              {totalMachines}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentFilter('healthy');
              setSearchParams({ status: 'healthy' });
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-xs transition-all cursor-pointer shadow-sm ${
              currentFilter === 'healthy'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            <span>HEALTHY</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest font-telemetry-sm text-[11px]">
              {healthyCount}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentFilter('warning');
              setSearchParams({ status: 'warning' });
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-xs transition-all cursor-pointer shadow-sm ${
              currentFilter === 'warning'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <span>WARNING</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest font-telemetry-sm text-[11px]">
              {warningCount}
            </span>
          </button>

          <button
            onClick={() => {
              setCurrentFilter('critical');
              setSearchParams({ status: 'critical' });
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-xs transition-all cursor-pointer shadow-sm ${
              currentFilter === 'critical'
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-error animate-pulse" />
            <span>CRITICAL</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest font-telemetry-sm text-[11px]">
              {criticalCount}
            </span>
          </button>
        </div>
      </div>

      {/* Machines Inventory Table */}
      <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest/60 text-outline font-label-md text-xs uppercase tracking-wider border-b border-outline-variant/20">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 sm:px-5 font-medium cursor-pointer hover:text-on-surface transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Machine & Node ID</span>
                    <Icon name={sortBy === 'name' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'} size={14} />
                  </div>
                </th>
                <th className="py-3 px-4 sm:px-5 font-medium">Location</th>
                <th
                  onClick={() => toggleSort('vibe')}
                  className="py-3 px-4 sm:px-5 font-medium cursor-pointer hover:text-on-surface transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Vibration Velocity</span>
                    <Icon name={sortBy === 'vibe' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'} size={14} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('temp')}
                  className="py-3 px-4 sm:px-5 font-medium cursor-pointer hover:text-on-surface transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Bearing Temp</span>
                    <Icon name={sortBy === 'temp' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'} size={14} />
                  </div>
                </th>
                <th className="py-3 px-4 sm:px-5 font-medium">Health Status</th>
                <th className="py-3 px-4 sm:px-5 font-medium">Edge Telemetry</th>
                <th className="py-3 px-4 sm:px-5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/20 font-body-md text-sm">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon name="search_off" size={32} className="text-outline/60" />
                      <p className="font-headline-sm">No machines match current search and filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentFilter('all');
                          setSearchParams({});
                        }}
                        className="mt-2 px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-body-md transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMachines.map((m) => {
                  const isWarning = m.healthStatus === 'warning';
                  const isCritical = m.healthStatus === 'critical';
                  const isDisconnected = m.connectionStatus === 'disconnected';

                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleRowClick(m)}
                      className={`hover:bg-surface-container transition-colors group cursor-pointer ${
                        isCritical
                          ? 'bg-error-container/10'
                          : isWarning
                          ? 'bg-secondary-container/10'
                          : isDisconnected
                          ? 'opacity-75'
                          : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isCritical
                                ? 'bg-error-container/20 text-error'
                                : isWarning
                                ? 'bg-secondary-container/20 text-secondary'
                                : 'bg-surface-container-high text-primary'
                            }`}
                          >
                            <Icon
                              name={
                                m.type.includes('Pump')
                                  ? 'water_pump'
                                  : m.type.includes('Fan')
                                  ? 'mode_fan'
                                  : m.type.includes('Compressor')
                                  ? 'cyclone'
                                  : m.type.includes('Mixer')
                                  ? 'blender'
                                  : 'electric_bolt'
                              }
                              size={20}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`font-headline-sm text-sm text-on-surface font-semibold transition-colors ${
                                isCritical
                                  ? 'group-hover:text-error'
                                  : isWarning
                                  ? 'group-hover:text-secondary'
                                  : 'group-hover:text-primary'
                              }`}
                            >
                              {m.name}
                            </span>
                            <span className="font-telemetry-sm text-[11px] text-outline mt-0.5">
                              {m.id} // {m.nodeId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex flex-col">
                          <span className="text-on-surface">{m.location}</span>
                          <span className="font-label-sm text-[10.5px] text-outline uppercase mt-0.5">
                            {m.bay}
                          </span>
                        </div>
                      </td>

                      {/* Vibration */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-telemetry-md text-sm font-semibold ${
                              isCritical
                                ? 'text-error'
                                : isWarning
                                ? 'text-secondary'
                                : isDisconnected
                                ? 'text-outline'
                                : 'text-on-surface'
                            }`}
                          >
                            {isDisconnected ? '--' : m.vibration.overall.toFixed(1)}
                          </span>
                          <span className="font-label-sm text-[10.5px] text-outline">mm/s</span>
                          {!isDisconnected && (
                            <Badge isoZone={m.vibration.zone} size="sm" showDot={false} />
                          )}
                        </div>
                      </td>

                      {/* Temperature */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div
                          className={`flex items-center gap-1 font-telemetry-md text-sm ${
                            isCritical
                              ? 'text-error'
                              : isWarning
                              ? 'text-secondary'
                              : isDisconnected
                              ? 'text-outline'
                              : 'text-on-surface'
                          }`}
                        >
                          <span>{isDisconnected ? '--' : m.temperature.core.toFixed(1)}</span>
                          <span className="font-label-sm text-[10.5px] text-outline">°C</span>
                        </div>
                      </td>

                      {/* Health Status */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <Badge status={m.healthStatus} size="sm" />
                      </td>

                      {/* Edge Telemetry Status */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-1.5">
                          <Icon
                            name={
                              isDisconnected
                                ? 'wifi_off'
                                : isCritical
                                ? 'wifi_tethering_error'
                                : 'wifi'
                            }
                            size={16}
                            className={
                              isDisconnected
                                ? 'text-outline'
                                : isCritical
                                ? 'text-error'
                                : isWarning
                                ? 'text-secondary'
                                : 'text-tertiary'
                            }
                          />
                          <span
                            className={`font-telemetry-sm text-[11px] ${
                              isCritical
                                ? 'text-error'
                                : isDisconnected
                                ? 'text-outline'
                                : 'text-on-surface-variant'
                            }`}
                          >
                            {isDisconnected
                              ? 'Link Lost (4h ago)'
                              : isCritical
                              ? 'High Spike Alert'
                              : `Live Sync (${m.edge.latencyMs}ms)`}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(m);
                          }}
                          className={`px-3 py-1.5 rounded-md text-on-surface font-body-sm text-xs transition-colors shadow-sm inline-flex items-center gap-1 cursor-pointer ${
                            isCritical
                              ? 'bg-error text-on-error font-semibold hover:bg-error/80'
                              : isWarning
                              ? 'bg-surface-container-high hover:bg-secondary hover:text-on-secondary'
                              : 'bg-surface-container-high hover:bg-primary hover:text-on-primary'
                          }`}
                        >
                          <span>Inspect</span>
                          <Icon name="chevron_right" size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Telemetry Summary Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-lg bg-surface-container-low border border-outline-variant/30 p-space-lg rounded-xl shadow-md">
        <div className="flex flex-wrap items-center gap-space-xl">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Icon name="analytics" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Fleet Vibration Average
              </span>
              <span className="font-telemetry-md text-telemetry-md text-on-surface font-semibold">
                {fleetVibrationAverage} mm/s{' '}
                <span className="font-body-sm text-body-sm text-tertiary font-normal">
                  (Within ISO Class II)
                </span>
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Icon name="thermostat" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Mean Operating Temp
              </span>
              <span className="font-telemetry-md text-telemetry-md text-on-surface font-semibold">
                {fleetMeanTemperature} °C{' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                  (Target: 50-65 °C)
                </span>
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
              <Icon name="sensors" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                ESP32 Gateway Up-rate
              </span>
              <span className="font-telemetry-md text-telemetry-md text-tertiary font-semibold">
                {gatewayUpRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-md justify-end">
          {exportNotice && (
            <span className="text-tertiary font-label-sm text-label-sm animate-fadeIn">
              {exportNotice}
            </span>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-sm px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md transition-colors cursor-pointer border border-outline-variant/30 shadow-sm"
          >
            <Icon name="file_download" size={20} className="text-outline" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportAuditReport}
            className="flex items-center gap-space-sm px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md transition-colors cursor-pointer border border-outline-variant/30 shadow-sm"
          >
            <Icon name="description" size={20} className="text-outline" />
            <span>ISO Audit Report</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProvisionNodeModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
      />
      <SensorCalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
      />
    </div>
  );
};
