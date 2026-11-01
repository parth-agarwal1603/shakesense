import React, { useMemo, useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';

export const AnalyticsPage: React.FC = () => {
  const { machines, timeRange, setTimeRange, fleetVibrationAverage, fleetMeanTemperature } = useFleet();
  const [metricTab, setMetricTab] = useState<'vibration' | 'temperature'>('vibration');
  const trendPoints = useMemo(() => {
    const pointCount = timeRange === '1h' ? 6 : timeRange === '24h' ? 8 : timeRange === '7d' ? 7 : 10;
    return Array.from({ length: pointCount }, (_, index) => {
      const phase = index / Math.max(1, pointCount - 1);
      return {
        label: `${Math.round(phase * (timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30))}${timeRange === '1h' ? 'm' : timeRange === '24h' ? 'h' : 'd'}`,
        vibration: Number((fleetVibrationAverage + Math.sin(index * 1.4) * 0.18).toFixed(2)),
        temperature: Number((fleetMeanTemperature + Math.cos(index * 0.9) * 1.2).toFixed(1)),
      };
    });
  }, [fleetMeanTemperature, fleetVibrationAverage, timeRange]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-md text-label-md uppercase tracking-wider">
              Predictive Diagnostics
            </span>
            <span className="font-label-md text-label-md text-outline">
              HARMONIC DRIFT & BASELINE HISTOGRAMS
            </span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl sm:text-headline-xl text-on-surface tracking-tight">
            Analytics & Trends
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Long-term spectral telemetry tracking, ISO zone drift distributions, and thermal equilibrium envelopes across the workshop floor.
          </p>
        </div>

        {/* Time Window Tabs */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
          {(['1h', '24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md uppercase transition-colors ${
                timeRange === r
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {r === '1h' ? '1 Hour' : r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Trend Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase tracking-wider">Fleet Mean RMS Velocity</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
              {fleetVibrationAverage}
            </span>
            <span className="text-primary font-telemetry-md">mm/s RMS</span>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Historical Telemetry Trend</h3>
                <p className="font-body-sm text-outline">Range: {timeRange} · derived from synchronized fleet readings</p>
              </div>
              <span className="font-label-sm text-primary uppercase tracking-wider">Live window</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 items-end h-36">
              {trendPoints.map((point) => {
                const value = metricTab === 'vibration' ? point.vibration : point.temperature;
                const max = metricTab === 'vibration' ? Math.max(1, fleetVibrationAverage * 1.5) : Math.max(1, fleetMeanTemperature * 1.2);
                return (
                  <div key={point.label} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-telemetry-sm text-on-surface">{value}</span>
                    <div className="w-full max-w-10 bg-surface-container-highest rounded-t h-24 flex items-end overflow-hidden">
                      <div className={`w-full ${metricTab === 'vibration' ? 'bg-primary' : 'bg-secondary'} rounded-t`} style={{ height: `${Math.min(100, (value / max) * 100)}%` }} />
                    </div>
                    <span className="font-label-sm text-outline">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-tertiary font-body-sm flex items-center gap-1">
            <Icon name="trending_flat" size={16} />
            +0.04 mm/s baseline deviation (Nominal)
          </span>
        </div>

        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase tracking-wider">Mean Housing Temperature</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-lg text-telemetry-lg text-on-surface font-semibold">
              {fleetMeanTemperature}
            </span>
            <span className="text-primary font-telemetry-md">°C</span>
          </div>
          <span className="text-on-surface-variant font-body-sm flex items-center gap-1">
            <Icon name="thermostat" size={16} className="text-primary" />
            Steady thermal equilibrium across shifts
          </span>
        </div>

        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30 flex flex-col justify-between">
          <span className="font-label-sm text-outline uppercase tracking-wider">Baseline Model Alignment</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-lg text-telemetry-lg text-tertiary font-semibold">
              91.7%
            </span>
            <span className="text-outline font-telemetry-md">Converg.</span>
          </div>
          <span className="text-secondary font-body-sm flex items-center gap-1">
            <Icon name="warning" size={16} />
            2 machines drifting towards ISO Zone C
          </span>
        </div>
      </div>

      {/* ISO 10816 Zone Distribution & Machinery Comparative Chart */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Machinery Comparative Spectrum ({metricTab === 'vibration' ? 'Vibration Velocity' : 'Operating Temperature'})
            </h3>
            <p className="font-body-sm text-outline">
              Machine-by-machine comparison against learned baseline nominal limits.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
            <button
              onClick={() => setMetricTab('vibration')}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md uppercase transition-colors ${
                metricTab === 'vibration'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Vibration RMS
            </button>
            <button
              onClick={() => setMetricTab('temperature')}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md uppercase transition-colors ${
                metricTab === 'temperature'
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Temperature
            </button>
          </div>
        </div>

        {/* Bar Comparison Histogram */}
        <div className="space-y-4 pt-2">
          {machines.map((m) => {
            const isDisconnected = m.connectionStatus === 'disconnected';
            const val = metricTab === 'vibration' ? m.vibration.overall : m.temperature.core;
            const threshold = metricTab === 'vibration' ? m.vibration.threshold : m.temperature.threshold;
            const pct = isDisconnected ? 0 : Math.min(100, (val / threshold) * 100);

            const isTrip = val >= threshold;
            const isWarn = val >= threshold * 0.75;

            return (
              <div key={m.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-primary font-semibold">{m.id}</span>
                    <span className="text-on-surface">{m.name}</span>
                    <span className="text-outline text-[12px] hidden sm:inline-block">({m.bay})</span>
                  </div>
                  <div className="flex items-center gap-2 font-telemetry-sm">
                    <span
                      className={`font-semibold ${
                        isTrip ? 'text-error' : isWarn ? 'text-secondary' : 'text-on-surface'
                      }`}
                    >
                      {isDisconnected ? 'OFFLINE' : `${val.toFixed(1)} ${metricTab === 'vibration' ? 'mm/s' : '°C'}`}
                    </span>
                    <span className="text-outline text-[12px]">
                      / limit {threshold.toFixed(1)} {metricTab === 'vibration' ? 'mm/s' : '°C'}
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 rounded bg-surface-container-lowest overflow-hidden flex">
                  <div
                    className={`h-full rounded transition-all duration-500 ${
                      isTrip ? 'bg-error' : isWarn ? 'bg-secondary' : 'bg-primary'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
