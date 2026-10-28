'use client';

import React from 'react';
import {
  CloudRain,
  Droplets,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  LocationData,
  WeatherObservation,
  RiskAssessment,
  AlertItem,
  ImpactAssessment,
} from '@/types';

interface DashboardTabProps {
  location: LocationData;
  weather: WeatherObservation;
  assessment: RiskAssessment;
  alerts: AlertItem[];
  waterLevelMeters: number;
  dangerLevelMeters: number;
  onNavigateTab: (tabId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export default function DashboardTab({
  location,
  weather,
  assessment,
  alerts,
  waterLevelMeters,
  dangerLevelMeters,
  onNavigateTab,
  onAcknowledgeAlert,
}: DashboardTabProps) {
  // Gauge color based on severity
  const getGaugeColor = (score: number) => {
    if (score < 25) return '#10b981'; // Green
    if (score < 50) return '#f59e0b'; // Amber
    if (score < 72) return '#f97316'; // Orange
    if (score < 88) return '#ef4444'; // Red
    return '#a855f7'; // Violet
  };

  const waterRatio = Math.min(100, Math.round((waterLevelMeters / dangerLevelMeters) * 100));

  return (
    <div className="space-y-6">
      {/* Catchment & Administrative Headline Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-flood-border relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold tracking-wide uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {location.city} • {location.state} • {location.catchmentBasin}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {location.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Primary drainage into <strong className="text-white">{location.primaryRiver}</strong>. Catchment slope{' '}
              <strong className="text-white">{location.slopeDegree}°</strong> with{' '}
              <strong className="text-white">{location.imperviousAreaPercent}%</strong> urban impervious coverage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('simulation')}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate What-If Scenario</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="flex items-center space-x-1.5 bg-flood-panel hover:bg-flood-card border border-flood-borderLight text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
            >
              <span>Explore GIS Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Risk Meter + 4 Essential Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scientific Risk Severity Gauge Meter */}
        <div className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Composite Flood Risk Meter
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                assessment.confidenceScore > 80
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/60 text-amber-300 border-amber-700'
              }`}
            >
              {assessment.confidenceScore}% Confidence
            </span>
          </div>

          {/* SVG Circular Gauge */}
          <div className="relative flex flex-col items-center justify-center my-6">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Arc */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#1e293b"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset="100"
                strokeLinecap="round"
              />
              {/* Value Arc */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke={getGaugeColor(assessment.overallScore)}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * 0.75 * assessment.overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {assessment.overallScore}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100 Score</span>
              <div
                className="mt-2 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: `${getGaugeColor(assessment.overallScore)}20`,
                  color: getGaugeColor(assessment.overallScore),
                  border: `1px solid ${getGaugeColor(assessment.overallScore)}60`,
                }}
              >
                {assessment.severityLevel} Risk
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-300 line-clamp-3 bg-flood-card/60 p-3 rounded-xl border border-flood-border/60">
              {assessment.summaryExplanation}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Scientific Heuristic Model</span>
              <button
                onClick={() => onNavigateTab('analysis')}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-0.5"
              >
                <span>Explain Factors</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Center & Right: 4 Telemetry Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: 24h Precipitation */}
          <div className="glass-card rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                24h Accumulated Rainfall
              </span>
              <CloudRain className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {weather.past24hRainfallMm.toFixed(1)}
                </span>
                <span className="text-xs font-medium text-slate-400">mm / 24h</span>
              </div>
              <div className="text-xs text-cyan-300 font-semibold mt-1">
                {assessment.imdClassification}
              </div>
            </div>
            <div className="pt-2 border-t border-flood-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Source: {weather.source}</span>
              <span className={weather.isLive ? 'text-emerald-400' : 'text-amber-400'}>
                {weather.isLive ? '● Live Feed' : '○ Station Benchmark'}
              </span>
            </div>
          </div>

          {/* Card 2: Peak Rainfall Intensity Rate */}
          <div className="glass-card rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Precipitation Rate
              </span>
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {weather.currentPrecipitationMmHr.toFixed(1)}
                </span>
                <span className="text-xs font-medium text-slate-400">mm / hr</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {weather.currentPrecipitationMmHr > 25 ? (
                  <span className="text-red-400 font-bold">⚠️ Cloudburst Danger Threshold</span>
                ) : weather.currentPrecipitationMmHr > 5 ? (
                  <span className="text-amber-300 font-semibold">Active Downpour</span>
                ) : (
                  <span className="text-emerald-400">Nominal Intensity</span>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-flood-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Next 24h Forecast:</span>
              <strong className="text-slate-200">{weather.forecast24hRainfallMm.toFixed(1)} mm</strong>
            </div>
          </div>

          {/* Card 3: Water Level & River Stage */}
          <div className="glass-card rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                River Stage / Water Level
              </span>
              <Gauge className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  {waterLevelMeters.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-slate-400">m (Danger: {dangerLevelMeters.toFixed(2)}m)</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    waterRatio > 90 ? 'bg-red-500' : waterRatio > 75 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${waterRatio}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>{waterRatio}% of Danger Mark</span>
                <span className={waterRatio > 85 ? 'text-red-400 font-semibold' : 'text-slate-400'}>
                  {waterRatio > 85 ? 'Warning Stage' : 'Safe Headroom'}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-flood-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Telemetry: CWC AWLR-04</span>
              <span>Trend: Rising (+0.08 m/h)</span>
            </div>
          </div>

          {/* Card 4: Soil Saturation & Topography */}
          <div className="glass-card rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hydrological Infiltration
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-white">
                  CN {location.soilCurveNumber}
                </span>
                <span className="text-xs font-medium text-slate-400">(SCS Runoff Index)</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Estimated Soil Saturation:{' '}
                <strong className="text-white">
                  {Math.min(100, Math.round(weather.past24hRainfallMm * 0.8 + 20))}%
                </strong>
              </div>
            </div>
            <div className="pt-2 border-t border-flood-border/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Base Elevation: {location.baseElevationM}m</span>
              <span>Slope: {location.slopeDegree}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Rainfall & Runoff Trend Visualizer Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>24-Hour Observed Rainfall & Runoff Profile</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bar: Hourly Precipitation (mm) • Line: Estimated Overland Runoff Yield (SCS-CN)
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-3 bg-cyan-500 rounded-sm inline-block"></span>
              <span>Precipitation (mm)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-1 bg-amber-400 rounded-sm inline-block"></span>
              <span>Runoff (mm)</span>
            </span>
          </div>
        </div>

        {/* Custom SVG Bar & Trend Chart */}
        <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
          {weather.hourlyRainfallSeries.map((pt, i) => {
            const maxVal = Math.max(
              25,
              ...weather.hourlyRainfallSeries.map((p) => Math.max(p.rainfallMm, p.runoffMm))
            );
            const rainHeightPercent = Math.min(100, (pt.rainfallMm / maxVal) * 100);
            const runoffHeightPercent = Math.min(100, (pt.runoffMm / maxVal) * 100);

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap">
                  <div>{pt.time}</div>
                  <div className="text-cyan-400 font-semibold">{pt.rainfallMm} mm rain</div>
                  <div className="text-amber-400">{pt.runoffMm} mm runoff</div>
                </div>

                {/* Bars Container */}
                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  <div
                    className="w-1/2 bg-cyan-500/80 hover:bg-cyan-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, rainHeightPercent)}%` }}
                  ></div>
                  <div
                    className="w-1/2 bg-amber-500/80 hover:bg-amber-400 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, runoffHeightPercent)}%` }}
                  ></div>
                </div>

                {/* X-axis label */}
                <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center">
                  {i % 3 === 0 ? pt.time : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Active Warnings Preview + Quick Impact Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Emergency Alerts */}
        <div className="glass-panel rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Active Warnings & Advisories ({alerts.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-0.5"
              >
                <span>Alerts Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                    a.severity === 'emergency'
                      ? 'bg-red-950/40 border-red-800/60'
                      : a.severity === 'warning'
                      ? 'bg-orange-950/40 border-orange-800/60'
                      : 'bg-amber-950/30 border-amber-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white block">{a.title}</span>
                      <span className="text-[11px] text-slate-300 mt-0.5 block">{a.recommendedAction}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{a.freshness}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">Trigger: {a.triggerMetric}</span>
                    {!a.acknowledged ? (
                      <button
                        onClick={() => onAcknowledgeAlert(a.id)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Impact Snapshot */}
        <div className="glass-panel rounded-2xl p-5 border border-flood-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Impact Assessment & At-Risk Assets</span>
              </h3>
              <button
                onClick={() => onNavigateTab('impact')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-0.5"
              >
                <span>Full Assessment</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2">
              <div className="bg-flood-card/70 p-3 rounded-xl border border-flood-border/60 text-center">
                <div className="text-xl font-bold text-white">
                  {(
                    (location.populationDensityPerSqKm * 4.2 * (assessment.overallScore / 100) * 0.45) /
                    1000
                  ).toFixed(1)}
                  k
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Est. Exposed Pop.</div>
              </div>

              <div className="bg-flood-card/70 p-3 rounded-xl border border-flood-border/60 text-center">
                <div className="text-xl font-bold text-amber-400">
                  {assessment.overallScore > 60 ? '4.8' : '1.2'} km
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vulnerable Roads</div>
              </div>

              <div className="bg-flood-card/70 p-3 rounded-xl border border-flood-border/60 text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {location.criticalInfrastructureCount.reliefShelters}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ready Shelters</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 bg-flood-card/40 p-2.5 rounded-lg border border-flood-border/40">
              <strong className="text-white">Emergency Focus:</strong> Monitor Sarjapur / Outer Ring Road underpass
              junctions. Shelters at HAL Sports Club and Kaikondrahalli active on standby.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
