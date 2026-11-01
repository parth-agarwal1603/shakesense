import React, { useMemo, useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { Icon } from '../components/common/Icon';

export const AnalyticsPage: React.FC = () => {
  const { machines, timeRange, setTimeRange, fleetVibrationAverage, fleetMeanTemperature } = useFleet();
  const [metricTab, setMetricTab] = useState<'vibration' | 'temperature'>('vibration');

  const trendPoints = useMemo(() => {
    const pointCount = timeRange === '1h' ? 6 : timeRange === '24h' ? 8 : timeRange === '7d' ? 7 : 10;
    const span = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
    const suffix = timeRange === '1h' ? 'm' : timeRange === '24h' ? 'h' : 'd';
    return Array.from({ length: pointCount }, (_, index) => ({
      label: `${Math.round((index / Math.max(1, pointCount - 1)) * span)}${suffix}`,
      vibration: Number((fleetVibrationAverage + Math.sin(index * 1.4) * 0.18).toFixed(2)),
      temperature: Number((fleetMeanTemperature + Math.cos(index * 0.9) * 1.2).toFixed(1)),
    }));
  }, [fleetMeanTemperature, fleetVibrationAverage, timeRange]);

  const zoneCounts = useMemo(
    () => (['Zone A', 'Zone B', 'Zone C', 'Zone D'] as const).map((zone) => ({
      zone,
      count: machines.filter((machine) => machine.vibration.zone === zone).length,
    })),
    [machines],
  );

  const harmonicBands = useMemo(() => [
    { name: '1X', value: machines.reduce((sum, machine) => sum + machine.vibration.y, 0) / Math.max(1, machines.length) },
    { name: '2X', value: machines.reduce((sum, machine) => sum + machine.vibration.x, 0) / Math.max(1, machines.length) },
    { name: 'Blade / Rotor', value: machines.reduce((sum, machine) => sum + machine.vibration.z, 0) / Math.max(1, machines.length) },
    { name: 'Bearing Cage', value: machines.reduce((sum, machine) => sum + machine.vibration.overall * 0.35, 0) / Math.max(1, machines.length) },
  ], [machines]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-7xl mx-auto pb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 bg-surface-container-low border border-outline-variant/30 p-5 sm:p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-label-md uppercase tracking-wider">Predictive Diagnostics</span>
            <span className="font-label-md text-outline">HARMONIC DRIFT & BASELINE HISTOGRAMS</span>
          </div>
          <h1 className="font-headline-lg sm:font-headline-xl text-2xl text-on-surface tracking-tight">Analytics & Trends</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">Long-term telemetry tracking, ISO zone drift distribution, thermal equilibrium, and harmonic comparison.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 rounded-md font-label-md uppercase transition-colors ${timeRange === range ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-outline hover:text-on-surface'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30">
          <span className="font-label-sm text-outline uppercase tracking-wider">Fleet Mean RMS Velocity</span>
          <div className="flex items-baseline gap-2 my-2"><span className="font-telemetry-lg text-on-surface font-semibold">{fleetVibrationAverage}</span><span className="text-primary font-telemetry-md">mm/s RMS</span></div>
          <span className="text-tertiary font-body-sm flex items-center gap-1"><Icon name="trending_flat" size={16} />+0.04 mm/s baseline deviation</span>
        </div>
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30">
          <span className="font-label-sm text-outline uppercase tracking-wider">Mean Housing Temperature</span>
          <div className="flex items-baseline gap-2 my-2"><span className="font-telemetry-lg text-on-surface font-semibold">{fleetMeanTemperature}</span><span className="text-primary font-telemetry-md">°C</span></div>
          <span className="text-on-surface-variant font-body-sm flex items-center gap-1"><Icon name="thermostat" size={16} className="text-primary" />Steady thermal equilibrium</span>
        </div>
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/30">
          <span className="font-label-sm text-outline uppercase tracking-wider">Baseline Model Alignment</span>
          <div className="flex items-baseline gap-2 my-2"><span className="font-telemetry-lg text-tertiary font-semibold">{machines.length ? Math.round((machines.filter((machine) => machine.healthStatus === 'healthy').length / machines.length) * 100) : 0}%</span><span className="text-outline font-telemetry-md">Converg.</span></div>
          <span className="text-secondary font-body-sm flex items-center gap-1"><Icon name="warning" size={16} />{machines.filter((machine) => machine.vibration.zone === 'Zone C' || machine.vibration.zone === 'Zone D').length} machines outside nominal zone</span>
        </div>
      </div>

      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div><h3 className="font-headline-sm text-on-surface">Historical Telemetry Trend</h3><p className="font-body-sm text-outline">Window: {timeRange} · synchronized fleet readings</p></div>
          <div className="flex gap-1 bg-surface-container p-1 rounded-lg">
            {(['vibration', 'temperature'] as const).map((metric) => <button key={metric} onClick={() => setMetricTab(metric)} className={`px-3 py-1 rounded font-label-sm uppercase ${metricTab === metric ? 'bg-primary-container text-on-primary-container' : 'text-outline'}`}>{metric}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-10 gap-3 items-end h-40">
          {trendPoints.map((point) => {
            const value = metricTab === 'vibration' ? point.vibration : point.temperature;
            const max = metricTab === 'vibration' ? Math.max(1, fleetVibrationAverage * 1.5) : Math.max(1, fleetMeanTemperature * 1.2);
            return <div key={point.label} className="flex flex-col items-center gap-1 h-full justify-end"><span className="font-telemetry-sm text-on-surface">{value}</span><div className="w-full bg-surface-container-highest rounded-t h-28 flex items-end"><div className={`w-full rounded-t ${metricTab === 'vibration' ? 'bg-primary' : 'bg-secondary'}`} style={{ height: `${Math.min(100, (value / max) * 100)}%` }} /></div><span className="font-label-sm text-outline">{point.label}</span></div>;
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6">
          <h3 className="font-headline-sm text-on-surface">ISO 10816 Zone Distribution</h3>
          <p className="font-body-sm text-outline mb-5">Current fleet vibration classification.</p>
          <div className="space-y-4">
            {zoneCounts.map(({ zone, count }) => <div key={zone}><div className="flex justify-between font-body-sm mb-1"><span className="text-on-surface">{zone}</span><span className="font-telemetry-sm text-outline">{count} machines</span></div><div className="h-3 rounded bg-surface-container-highest overflow-hidden"><div className={`h-full rounded ${zone === 'Zone A' ? 'bg-tertiary' : zone === 'Zone B' ? 'bg-primary' : zone === 'Zone C' ? 'bg-secondary' : 'bg-error'}`} style={{ width: `${machines.length ? (count / machines.length) * 100 : 0}%` }} /></div></div>)}
          </div>
        </section>
        <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6">
          <h3 className="font-headline-sm text-on-surface">Harmonic Deviation Histogram</h3>
          <p className="font-body-sm text-outline mb-5">Average axis energy by diagnostic band.</p>
          <div className="grid grid-cols-4 gap-4 items-end h-40">
            {harmonicBands.map((band) => <div key={band.name} className="flex flex-col items-center gap-2 h-full justify-end"><span className="font-telemetry-sm text-on-surface">{band.value.toFixed(1)}</span><div className="w-full bg-surface-container-highest rounded-t h-28 flex items-end"><div className="w-full bg-primary rounded-t" style={{ height: `${Math.min(100, (band.value / 4.5) * 100)}%` }} /></div><span className="font-label-sm text-outline text-center">{band.name}</span></div>)}
          </div>
        </section>
      </div>

      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 shadow-md">
        <h3 className="font-headline-sm text-on-surface mb-1">Machinery Comparative Spectrum</h3>
        <p className="font-body-sm text-outline mb-5">Machine-by-machine comparison against learned safety limits.</p>
        <div className="space-y-4">
          {machines.map((machine) => {
            const value = metricTab === 'vibration' ? machine.vibration.overall : machine.temperature.core;
            const threshold = metricTab === 'vibration' ? machine.vibration.threshold : machine.temperature.threshold;
            return <div key={machine.id}><div className="flex justify-between font-body-sm mb-1"><span><span className="font-mono text-primary mr-2">{machine.id}</span>{machine.name}</span><span className="font-telemetry-sm text-on-surface">{value.toFixed(1)} / {threshold.toFixed(1)}</span></div><div className="h-2 bg-surface-container-highest rounded overflow-hidden"><div className={`h-full rounded ${value >= threshold ? 'bg-error' : value >= threshold * 0.75 ? 'bg-secondary' : 'bg-tertiary'}`} style={{ width: `${Math.min(100, (value / threshold) * 100)}%` }} /></div></div>;
          })}
        </div>
      </section>
    </div>
  );
};
