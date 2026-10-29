import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useFleet } from '../../context/FleetContext';
import { Modal } from '../common/Modal';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { activeFacility, totalMachines, criticalAlertsCount, warningAlertsCount } = useFleet();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/overview', icon: 'dashboard' },
    { name: 'Machines Fleet', path: '/machines', icon: 'precision_manufacturing', badge: totalMachines },
    { name: 'Live Telemetry', path: '/telemetry', icon: 'monitoring' },
    { name: 'Analytics & Trends', path: '/analytics', icon: 'query_stats' },
    {
      name: 'Alerts & Diagnostics',
      path: '/alerts',
      icon: 'crisis_alert',
      alertBadge: criticalAlertsCount + warningAlertsCount,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between select-none transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col">
          {/* Header & Logo */}
          <div className="h-14 px-4 sm:px-5 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate('/overview')}
            >
              {/* Custom Crisp SVG Industrial Logo */}
              <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-primary/40">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3-7 4 14 3-7h5" />
                </svg>
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <span className="font-headline-md font-bold tracking-tight text-on-surface text-[17px]">
                    Shake<span className="text-primary-light">Sense</span>
                  </span>
                  <span className="font-label-sm text-[10px] text-primary-light uppercase tracking-wider px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/40 font-mono">
                    IoT Edge
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={isCollapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'} size={17} />
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="flex lg:hidden p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {!isCollapsed && (
            <div className="px-5 py-2 border-b border-outline-variant/15 bg-surface-container-low/40">
              <p className="font-label-sm text-[10.5px] text-on-surface-variant font-mono tracking-tight uppercase">
                Know Your Motor Before It Fails.
              </p>
            </div>
          )}

          {/* Diagnostics Navigation */}
          <div className="px-3 py-3">
            {!isCollapsed && (
              <div className="px-space-sm py-1 mb-space-sm flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Diagnostics Navigation
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-space-md py-3 rounded-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm border-l-2 border-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon name={item.icon} size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="font-body-lg text-body-lg truncate">{item.name}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.alertBadge && item.alertBadge > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-semibold animate-pulse">
                          {item.alertBadge}
                        </span>
                      ) : item.badge !== undefined ? (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-outline font-telemetry-sm text-[11px]">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Facility & Profile Information */}
        <div className="flex flex-col border-t border-outline-variant/30 bg-surface-container-low">
          {!isCollapsed && (
            <div className="px-space-md py-space-sm flex flex-col gap-1.5 border-b border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase">Facility</span>
                <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                  {activeFacility.syncStatus}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface truncate">
                {activeFacility.name}
              </p>
              <div className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface-variant">
                <span>Retrofit Sensors:</span>
                <span className="text-primary font-telemetry-sm">{totalMachines} Active (MPU6050)</span>
              </div>
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span>Connectivity:</span>
                <span className="text-tertiary-fixed-dim font-telemetry-sm">Edge Sync (Demo)</span>
              </div>
            </div>
          )}

          {/* User Profile Strip */}
          <div
            onClick={() => setShowProfileModal(true)}
            className={`px-space-md py-space-sm flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Operator Identity & Session"
          >
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Icon name="person" size={18} className="text-on-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    Markus Vance
                  </span>
                  <span className="font-label-sm text-label-sm text-outline truncate">
                    Lead Maintenance
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && <Icon name="unfold_more" size={18} className="text-outline" />}
          </div>
        </div>
      </aside>

      {/* Profile & Shift Operator Dialog */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Plant Operator Profile & Credentials"
        subtitle="Role: Lead Maintenance Engineer (Level 3)"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-container">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <Icon name="badge" size={32} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Markus Vance</span>
              <span className="font-body-sm text-body-sm text-outline">Industrial IoT Maintenance Staff #PFL-4892</span>
              <span className="font-label-sm text-label-sm text-tertiary mt-1">Shift A // ISO 18436-2 Vibration Analyst</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-body-sm">
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 flex flex-col">
              <span className="text-outline uppercase text-[11px] font-label-sm">Active Session</span>
              <span className="font-telemetry-sm text-on-surface mt-1">Edge Token Valid (7h 18m)</span>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 flex flex-col">
              <span className="text-outline uppercase text-[11px] font-label-sm">Authorized Actions</span>
              <span className="font-telemetry-sm text-tertiary mt-1">Acknowledge, Resolve, Calibrate</span>
            </div>
          </div>

          <p className="text-outline text-body-sm">
            Assigned to Workshop Floor A machinery fleet. Sensor calibrations and baseline override authorizations are logged to the factory audit trail.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

