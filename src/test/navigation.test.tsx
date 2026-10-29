import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FleetProvider } from '../context/FleetContext';
import { OverviewPage } from '../pages/OverviewPage';
import { MachinesPage } from '../pages/MachinesPage';

describe('Component & Page Integration', () => {
  it('renders OverviewPage with 12 active drives and ISO Zone A vibration', () => {
    render(
      <FleetProvider>
        <MemoryRouter>
          <OverviewPage />
        </MemoryRouter>
      </FleetProvider>
    );

    expect(screen.getByText('Motor Health Overview')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // total fleet
    expect(screen.getByText('09')).toBeInTheDocument(); // healthy normal
    expect(screen.getByText('02')).toBeInTheDocument(); // warning
    expect(screen.getByText('01')).toBeInTheDocument(); // critical
    expect(screen.getByText('Main Workshop Motor')).toBeInTheDocument();
    expect(screen.getByText('2.4')).toBeInTheDocument(); // 2.4 mm/s RMS
    expect(screen.getByText('Download Shift Log')).toBeInTheDocument();
  });

  it('renders MachinesPage with asset inventory table and search', () => {
    render(
      <FleetProvider>
        <MemoryRouter>
          <MachinesPage />
        </MemoryRouter>
      </FleetProvider>
    );

    expect(screen.getByText('Machines Fleet Inventory')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by asset tag/i)).toBeInTheDocument();
    expect(screen.getByText('Sensor Calibrations')).toBeInTheDocument();
    expect(screen.getByText('Provision Retrofit Node')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('ISO Audit Report')).toBeInTheDocument();
  });
});

