'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Flame,
  CloudRain,
  Clock,
  Droplets,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { LocationData, RiskAssessment, SimulationParameters } from '@/types';
import { runWhatIfSimulation } from '@/lib/hydrology-engine';

interface SimulationStudioProps {
  location: LocationData;
  baseline: RiskAssessment;
}

export default function SimulationStudio({ location, baseline }: SimulationStudioProps) {
  const [params, setParams] = useState<SimulationParameters>({
    rainfallIntensityMmHr: 45,
    rainfallDurationHours: 3,
    soilSaturationPercent: 65,
    drainageBlockagePercent: 30,
    upstreamReservoirDischargeM3s: 400,
    tideOrSurgeHeightM: 0,
  });

  // Calculate simulated result on parameters change
  const simResult = useMemo(() => {
    return runWhatIfSimulation(baseline, location, params);
  }, [baseline, location, params]);

  // Presets
  const applyPreset = (preset: 'moderate' | 'cloudburst' | 'choked' | 'dam_release') => {
    if (preset === 'moderate') {
      setParams({
        rainfallIntensityMmHr: 18,
        rainfallDurationHours: 4,
        soilSaturationPercent: 40,
        drainageBlockagePercent: 15,
        upstreamReservoirDischargeM3s: 200,
        tideOrSurgeHeightM: 0,
      });
    } else if (preset === 'cloudburst') {
      setParams({
        rainfallIntensityMmHr: 110,
        rainfallDurationHours: 2,
        soilSaturationPercent: 85,
        drainageBlockagePercent: 45,
        upstreamReservoirDischargeM3s: 800,
        tideOrSurgeHeightM: 0,
      });
    } else if (preset === 'choked') {
      setParams({
        rainfallIntensityMmHr: 50,
        rainfallDurationHours: 5,
        soilSaturationPercent: 90,
        drainageBlockagePercent: 70,
        upstreamReservoirDischargeM3s: 500,
        tideOrSurgeHeightM: 0,
      });
    } else if (preset === 'dam_release') {
      setParams({
        rainfallIntensityMmHr: 35,
        rainfallDurationHours: 6,
        soilSaturationPercent: 95,
        drainageBlockagePercent: 30,
        upstreamReservoirDischargeM3s: 2800,
        tideOrSurgeHeightM: 0,
      });
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Extreme':
        return 'bg-purple-900/60 text-purple-300 border-purple-500';
      case 'Severe':
        return 'bg-red-900/60 text-red-300 border-red-500';
      case 'High':
        return 'bg-orange-900/60 text-orange-300 border-orange-500';
      case 'Moderate':
        return 'bg-amber-900/60 text-amber-300 border-amber-500';
      default:
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive What-If Scenario Laboratory</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Hydrological Stress-Testing & Simulation
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simulate extreme precipitation spikes, stormwater rajakaluve choking, and reservoir discharges to model emergency impact shifts in {location.name}.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => applyPreset('moderate')}
            className="text-[11px] bg-flood-card hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-flood-border transition-colors"
          >
            Monsoon Shower
          </button>
          <button
            onClick={() => applyPreset('cloudburst')}
            className="text-[11px] bg-red-950/60 hover:bg-red-900 text-red-200 px-3 py-1.5 rounded-lg border border-red-800 transition-colors font-semibold"
          >
            ⚡ Cloudburst (110 mm/h)
          </button>
          <button
            onClick={() => applyPreset('choked')}
            className="text-[11px] bg-amber-950/60 hover:bg-amber-900 text-amber-200 px-3 py-1.5 rounded-lg border border-amber-800 transition-colors"
          >
            Choked Drains (70%)
          </button>
          <button
            onClick={() => applyPreset('dam_release')}
            className="text-[11px] bg-blue-950/60 hover:bg-blue-900 text-blue-200 px-3 py-1.5 rounded-lg border border-blue-800 transition-colors"
          >
            Dam Discharge (+2800 m³/s)
          </button>
        </div>
      </div>

      {/* Main Grid: Parameter Controls on Left, Comparative Projection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-flood-border space-y-5">
          <div className="flex items-center justify-between border-b border-flood-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Simulation Stress Parameters</span>
            </h3>
            <button
              onClick={() =>
                setParams({
                  rainfallIntensityMmHr: 45,
                  rainfallDurationHours: 3,
                  soilSaturationPercent: 65,
                  drainageBlockagePercent: 30,
                  upstreamReservoirDischargeM3s: 400,
                  tideOrSurgeHeightM: 0,
                })
              }
              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: Rainfall Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rainfall Intensity Rate</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {params.rainfallIntensityMmHr} mm/hr
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={params.rainfallIntensityMmHr}
              onChange={(e) =>
                setParams({ ...params, rainfallIntensityMmHr: Number(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Light (5 mm/h)</span>
              <span>Heavy (50 mm/h)</span>
              <span>Cloudburst (100+ mm/h)</span>
            </div>
          </div>

          {/* Slider 2: Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Rainfall Duration</span>
              </span>
              <span className="font-mono font-bold text-blue-300">
                {params.rainfallDurationHours} Hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={params.rainfallDurationHours}
              onChange={(e) =>
                setParams({ ...params, rainfallDurationHours: Number(e.target.value) })
              }
              className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Flash (1h)</span>
              <span>Continuous (12h)</span>
              <span>Extreme (24h)</span>
            </div>
          </div>

          {/* Slider 3: Soil Moisture Saturation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                <span>Antecedent Soil Saturation</span>
              </span>
              <span className="font-mono font-bold text-emerald-300">
                {params.soilSaturationPercent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={params.soilSaturationPercent}
              onChange={(e) =>
                setParams({ ...params, soilSaturationPercent: Number(e.target.value) })
              }
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Dry (AMC I)</span>
              <span>Normal (AMC II)</span>
              <span>Saturated (AMC III)</span>
            </div>
          </div>

          {/* Slider 4: Stormwater Drain Blockage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Drainage Choking / Blockage</span>
              </span>
              <span className="font-mono font-bold text-amber-300">
                {params.drainageBlockagePercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={params.drainageBlockagePercent}
              onChange={(e) =>
                setParams({ ...params, drainageBlockagePercent: Number(e.target.value) })
              }
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Clear (0%)</span>
              <span>Debris Choked (40%)</span>
              <span>Severe Siltation (80%)</span>
            </div>
          </div>

          {/* Slider 5: Reservoir Discharge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span>Upstream Dam / River Discharge</span>
              </span>
              <span className="font-mono font-bold text-purple-300">
                {params.upstreamReservoirDischargeM3s} m³/s
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="4000"
              step="50"
              value={params.upstreamReservoirDischargeM3s}
              onChange={(e) =>
                setParams({ ...params, upstreamReservoirDischargeM3s: Number(e.target.value) })
              }
              className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Nominal (200 m³/s)</span>
              <span>High (1500 m³/s)</span>
              <span>Surge Emergency (4000 m³/s)</span>
            </div>
          </div>
        </div>

        {/* Results & Comparative Impact Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Baseline vs Simulated Comparison Card */}
          <div className="glass-panel rounded-2xl p-6 border border-flood-border space-y-5">
            <div className="flex items-center justify-between border-b border-flood-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Baseline vs Hypothetical Stress Projection</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-700">
                SIMULATION SCENARIO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline Card */}
              <div className="bg-flood-card/60 p-4 rounded-xl border border-flood-border/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Baseline (Observed Telemetry)
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white">
                    {simResult.baselineRiskScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getSeverityBadge(
                      simResult.baselineSeverity
                    )}`}
                  >
                    {simResult.baselineSeverity} Risk
                  </span>
                </div>
              </div>

              {/* Simulated Card */}
              <div className="bg-gradient-to-br from-flood-card to-slate-900 p-4 rounded-xl border border-cyan-800/60 shadow-lg">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Simulated Outcome</span>
                  <span className="text-cyan-300 font-mono">
                    Delta: {simResult.scoreDelta >= 0 ? '+' : ''}{simResult.scoreDelta} pts
                  </span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white">
                    {simResult.simulatedRiskScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getSeverityBadge(
                      simResult.simulatedSeverity
                    )}`}
                  >
                    {simResult.simulatedSeverity} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Key Projected Delta Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-flood-card/80 p-3 rounded-xl border border-flood-border/60 text-center">
                <span className="text-[10px] text-slate-400 block">Projected Water Depth</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">
                  ~{simResult.potentialInundationDepthCm} cm
                </span>
              </div>

              <div className="bg-flood-card/80 p-3 rounded-xl border border-flood-border/60 text-center">
                <span className="text-[10px] text-slate-400 block">Impassable Roads</span>
                <span className="text-lg font-bold text-red-400 mt-1 block">
                  {simResult.roadNetworkImpassableKm} km
                </span>
              </div>

              <div className="bg-flood-card/80 p-3 rounded-xl border border-flood-border/60 text-center">
                <span className="text-[10px] text-slate-400 block">Exposed Population</span>
                <span className="text-lg font-bold text-cyan-400 mt-1 block">
                  {(simResult.potentiallyAffectedPopulation / 1000).toFixed(1)}k
                </span>
              </div>

              <div className="bg-flood-card/80 p-3 rounded-xl border border-flood-border/60 text-center">
                <span className="text-[10px] text-slate-400 block">Drainage Spill Risk</span>
                <span className="text-lg font-bold text-purple-400 mt-1 block">
                  {simResult.drainageSpillLikelihood}
                </span>
              </div>
            </div>

            {/* Narrative Explanation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <strong className="text-white">Hydrological Narrative:</strong>
              <p>{simResult.changeExplanation}</p>
            </div>

            {/* Contingency Directives */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Contingency Directives for Drills
              </span>
              {simResult.contingencyDirectives.map((dir, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-flood-card/40 border border-flood-border/40 text-[11px] text-slate-300 flex items-start space-x-2"
                >
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-200">Simulation Boundary Notice:</strong> These scenario calculations are hypothetical models intended for municipal contingency training, disaster response resource sizing, and tabletop drills. They do not represent observed precipitation or official forecasts.
        </p>
      </div>
    </div>
  );
}
