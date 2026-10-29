import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FleetProvider, useFleet } from '../context/FleetContext';

describe('FleetContext State & Domain Calculations', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FleetProvider>{children}</FleetProvider>
  );

  it('initializes with 12 fleet machines and exact health breakdown', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    expect(result.current.totalMachines).toBe(12);
    expect(result.current.healthyCount).toBe(9);
    expect(result.current.warningCount).toBe(2);
    expect(result.current.criticalCount).toBe(1);
    expect(result.current.selectedMachine.id).toBe('MTR-001');
  });

  it('initializes with correct unresolved critical and warning alarms', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    expect(result.current.criticalAlertsCount).toBe(1);
    expect(result.current.warningAlertsCount).toBe(2);
  });

  it('acknowledging an alert updates status without resolving the underlying alarm', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    act(() => {
      result.current.acknowledgeAlert('ALT-1094', 'Test Operator');
    });

    const targetAlert = result.current.alerts.find((a) => a.id === 'ALT-1094');
    expect(targetAlert?.status).toBe('acknowledged');
    expect(targetAlert?.acknowledgedBy).toBe('Test Operator');
    // Unresolved critical count remains 1 because it has not been fixed/resolved yet!
    expect(result.current.criticalAlertsCount).toBe(1);
  });

  it('resolving an alert decrements unresolved counter', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    act(() => {
      result.current.resolveAlert('ALT-1094', 'Lead Tech');
    });

    const targetAlert = result.current.alerts.find((a) => a.id === 'ALT-1094');
    expect(targetAlert?.status).toBe('resolved');
    expect(targetAlert?.resolvedBy).toBe('Lead Tech');
    // Now unresolved critical count becomes 0!
    expect(result.current.criticalAlertsCount).toBe(0);
  });

  it('provisioning a new node increments fleet count and recalculates totals', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    act(() => {
      result.current.provisionNode({
        name: 'Hydro-Slurry Mixer 04',
        type: 'Planetary Mixer Drive',
        bay: 'Bay 5',
        location: 'Floor A — Section 4',
        baseline: 1.6,
      });
    });

    expect(result.current.totalMachines).toBe(13);
    expect(result.current.healthyCount).toBe(10);
    const newMachine = result.current.machines.find((m) => m.name === 'Hydro-Slurry Mixer 04');
    expect(newMachine).toBeDefined();
    expect(newMachine?.healthStatus).toBe('healthy');
    expect(newMachine?.vibration.overall).toBe(1.6);
  });

  it('updating calibration updates machine calibration status', () => {
    const { result } = renderHook(() => useFleet(), { wrapper });

    act(() => {
      result.current.updateMachineCalibration('MTR-001', 'calibrating');
    });

    const machine = result.current.machines.find((m) => m.id === 'MTR-001');
    expect(machine?.calibrationStatus).toBe('calibrating');
  });
});

