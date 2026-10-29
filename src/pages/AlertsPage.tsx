import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Alert, AlertSeverity } from '../types';

export const AlertsPage: React.FC = () => {
  const { alerts, machines, acknowledgeAlert, resolveAlert, criticalAlertsCount, warningAlertsCount } = useFleet();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const severityParam = searchParams.get('severity') as AlertSeverity | null;
  const [selectedSeverity, setSelectedSeverity] = useState<string>(severityParam || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeAlertDetail, setActiveAlertDetail] = useState<Alert | null>(null);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
      const matchesMachine = selectedMachineId === 'all' || a.machineId === selectedMachineId;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.machineName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.machineId.toLowerCase().includes(q);

      return matchesSeverity && matchesStatus && matchesMachine && matchesSearch;
    });
  }, [alerts, selectedSeverity, selectedStatus, selectedMachineId, searchQuery]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded bg-secondary-container/20 text-secondary font-label-md text-label-md uppercase tracking-wider">
              Diagnostic Alarms
            </span>
            <span className="font-label-md text-label-md text-outline">
              ISO 10816 SPECTRUM THRESHOLDS
            </span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight">
            Alerts & Diagnostics
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Real-time mechanical anomaly notifications, threshold violations, and edge diagnostic events across Workshop Floor A.
          </p>
        </div>

        {/* Alarm Summary Counters */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-error-container/30 text-error flex items-center justify-center">
              <Icon name="crisis_alert" size={18} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10.5px] text-outline uppercase tracking-wider">
                Critical
              </span>
              <span className="font-telemetry-md text-sm text-error font-semibold">
                {criticalAlertsCount} Unresolved
              </span>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
              <Icon name="warning" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10.5px] text-outline uppercase tracking-wider">
                Warnings
              </span>
              <span className="font-telemetry-md text-sm text-secondary font-semibold">
                {warningAlertsCount} Advisory
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-surface-container-low border border-outline-variant/30 p-4 sm:p-5 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title, root cause, or asset tag..."
            className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/70 font-body-md pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Machine Filter Dropdown */}
        <select
          value={selectedMachineId}
          onChange={(e) => setSelectedMachineId(e.target.value)}
          className="bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
        >
          <option value="all">All Machinery Units</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} — {m.name}
            </option>
          ))}
        </select>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => {
                setSelectedSeverity(sev);
                if (sev === 'all') setSearchParams({});
                else setSearchParams({ severity: sev });
              }}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md uppercase transition-colors ${
                selectedSeverity === sev
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap border-l border-outline-variant/30 pl-2">
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md uppercase transition-colors ${
                selectedStatus === st
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-12 text-center text-outline flex flex-col items-center justify-center gap-3">
            <Icon name="verified" size={40} className="text-tertiary" />
            <h3 className="font-headline-sm text-on-surface">No Alarms Match Current Criteria</h3>
            <p className="font-body-md max-w-md">
              All monitored induction drives and pump units are operating nominal or no events match your current filters.
            </p>
            <button
              onClick={() => {
                setSelectedSeverity('all');
                setSelectedStatus('all');
                setSelectedMachineId('all');
                setSearchQuery('');
                setSearchParams({});
              }}
              className="mt-2 px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-body-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isResolved = alert.status === 'resolved';

            return (
              <div
                key={alert.id}
                className={`bg-surface-container-low border rounded-xl p-6 transition-all shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                  isResolved
                    ? 'border-outline-variant/20 opacity-70 bg-surface-container-lowest'
                    : isCritical
                    ? 'border-error/40 bg-error-container/5 hover:border-error'
                    : isWarning
                    ? 'border-secondary/40 bg-secondary-container/5 hover:border-secondary'
                    : 'border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      isCritical
                        ? 'bg-error-container/30 text-error'
                        : isWarning
                        ? 'bg-secondary-container/30 text-secondary'
                        : 'bg-primary-container/20 text-primary'
                    }`}
                  >
                    <Icon
                      name={isCritical ? 'crisis_alert' : isWarning ? 'warning' : 'info'}
                      size={24}
                      className={isCritical && !isResolved ? 'animate-pulse' : ''}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-primary text-label-md font-semibold">
                        {alert.id}
                      </span>
                      <span className="text-outline text-body-sm">•</span>
                      <button
                        onClick={() => navigate(`/machines/${alert.machineId}`)}
                        className="text-on-surface hover:text-primary transition-colors font-medium text-body-md underline decoration-outline-variant"
                      >
                        {alert.machineName} ({alert.machineId})
                      </button>
                      <span className="text-outline text-body-sm">•</span>
                      <span className="font-telemetry-sm text-outline text-[12px]">
                        {alert.createdAt}
                      </span>
                      <Badge status={alert.severity} size="sm" />
                      <Badge status={alert.status} size="sm" />
                    </div>

                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {alert.title}
                    </h3>

                    <p className="font-body-md text-on-surface-variant max-w-3xl">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-body-sm font-label-sm text-outline pt-1">
                      <span>Observed: <strong className="text-on-surface font-mono">{alert.observedValue}</strong></span>
                      <span>Reference: <span className="text-on-surface-variant">{alert.thresholdOrBaselineReference}</span></span>
                      <span>Sensor: <span className="text-primary">{alert.sensorType}</span></span>
                    </div>

                    {/* Resolution Metadata */}
                    {alert.status === 'acknowledged' && (
                      <div className="font-label-sm text-[11px] text-secondary flex items-center gap-1.5 pt-1">
                        <Icon name="done" size={14} />
                        <span>Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}</span>
                      </div>
                    )}
                    {alert.status === 'resolved' && (
                      <div className="font-label-sm text-[11px] text-tertiary flex items-center gap-1.5 pt-1">
                        <Icon name="check_circle" size={14} />
                        <span>Resolved by {alert.resolvedBy} at {alert.resolvedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    onClick={() => setActiveAlertDetail(alert)}
                    className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md transition-colors border border-outline-variant/30 text-body-sm"
                  >
                    View Diagnosis
                  </button>

                  <button
                    onClick={() => navigate(`/telemetry?machine=${alert.machineId}`)}
                    className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-body-md transition-colors border border-outline-variant/30 text-body-sm flex items-center gap-1"
                  >
                    <Icon name="monitoring" size={16} />
                    <span>Telemetry</span>
                  </button>

                  {alert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors border border-outline-variant/40"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-2 rounded-lg bg-tertiary-container/30 hover:bg-tertiary-container/60 text-tertiary font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors border border-tertiary/40"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Diagnostic Action Dialog */}
      {activeAlertDetail && (
        <Modal
          isOpen={true}
          onClose={() => setActiveAlertDetail(null)}
          title={`Alarm Details — ${activeAlertDetail.id}`}
          subtitle={`Asset Ref: ${activeAlertDetail.machineId} // ${activeAlertDetail.machineName}`}
          maxWidth="max-w-2xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge status={activeAlertDetail.severity} size="lg" />
              <Badge status={activeAlertDetail.status} size="lg" />
              <span className="text-outline font-telemetry-sm ml-auto">{activeAlertDetail.createdAt}</span>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-headline-sm text-on-surface">{activeAlertDetail.title}</h4>
              <p className="font-body-md text-on-surface-variant">{activeAlertDetail.description}</p>
            </div>

            <div className="bg-surface-container p-4 rounded-lg flex flex-col gap-2 font-body-sm">
              <span className="font-label-sm text-outline uppercase tracking-wider">
                Telemetry Signature Breakdown
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-outline block text-[11px]">Observed Reading</span>
                  <span className="text-on-surface font-mono font-semibold">
                    {activeAlertDetail.observedValue}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">Baseline Model Reference</span>
                  <span className="text-on-surface font-mono">
                    {activeAlertDetail.thresholdOrBaselineReference}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">Triggering Sensor Node</span>
                  <span className="text-primary font-mono">{activeAlertDetail.sensorType}</span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">Current Status</span>
                  <span className="text-tertiary uppercase font-mono">{activeAlertDetail.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container p-4 rounded-lg border-l-2 border-primary flex flex-col gap-1">
              <span className="font-label-sm text-primary uppercase tracking-wider font-semibold">
                Recommended Maintenance Procedure
              </span>
              <p className="text-on-surface font-body-md">
                {activeAlertDetail.recommendedAction}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const mId = activeAlertDetail.machineId;
                  setActiveAlertDetail(null);
                  navigate(`/telemetry?machine=${mId}`);
                }}
                className="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-body-md flex items-center gap-1.5"
              >
                <Icon name="monitoring" size={18} />
                <span>Examine Live Telemetry</span>
              </button>

              <div className="flex items-center gap-2">
                {activeAlertDetail.status === 'active' && (
                  <button
                    onClick={() => {
                      acknowledgeAlert(activeAlertDetail.id);
                      setActiveAlertDetail(null);
                    }}
                    className="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md"
                  >
                    Acknowledge
                  </button>
                )}
                {activeAlertDetail.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      resolveAlert(activeAlertDetail.id);
                      setActiveAlertDetail(null);
                    }}
                    className="px-4 py-2 rounded bg-tertiary-container text-on-tertiary-container font-semibold hover:bg-tertiary-container/80"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => setActiveAlertDetail(null)}
                  className="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
