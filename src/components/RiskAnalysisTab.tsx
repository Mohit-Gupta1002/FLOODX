'use client';

import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  HelpCircle,
  Activity,
  CheckCircle2,
  Sliders,
  Scale,
} from 'lucide-react';
import { RiskAssessment, LocationData, WeatherObservation } from '@/types';
import { calculateSCSDirectRunoff } from '@/lib/hydrology-engine';

interface RiskAnalysisTabProps {
  assessment: RiskAssessment;
  location: LocationData;
  weather: WeatherObservation;
}

export default function RiskAnalysisTab({
  assessment,
  location,
  weather,
}: RiskAnalysisTabProps) {
  const [activeCN, setActiveCN] = useState<number>(location.soilCurveNumber);
  const scs = calculateSCSDirectRunoff(weather.past24hRainfallMm, activeCN);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Explainable AI (XAI) Risk Decomposition Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Hydrological Risk Factor Attribution
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Transparent breakdown of contributing weights, mathematical formulas, terrain sensitivities, and data quality metrics for {location.name}.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-flood-card/80 p-3 rounded-xl border border-flood-border">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Model Confidence</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {assessment.confidenceScore}% Optimal
            </div>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Factor Decomposition Bar Charts */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-flood-border space-y-5">
          <div className="flex items-center justify-between border-b border-flood-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Weighted Attribution (Weights Sum = 100%)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Composite Score: <strong className="text-white">{assessment.overallScore}/100</strong>
            </span>
          </div>

          <div className="space-y-4">
            {assessment.contributingFactors.map((f, idx) => (
              <div key={idx} className="bg-flood-card/60 p-4 rounded-xl border border-flood-border/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{f.factor}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      Weight: {(f.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Raw Score: <strong className="text-slate-200">{f.rawScore}/100</strong></span>
                    <span className="text-cyan-400 font-bold font-mono">
                      Contrib: +{f.weightedContribution.toFixed(1)} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      f.status === 'critical'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : f.status === 'moderate'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.max(5, f.rawScore)}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-300">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: SCS-CN Formula Card & Data Quality Audit */}
        <div className="space-y-6">
          {/* SCS-CN Scientific Card */}
          <div className="glass-panel rounded-2xl p-5 border border-flood-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>SCS-CN Hydrology Model Yield</span>
              </h3>
              <span className="font-mono text-xs font-bold text-cyan-300">CN {activeCN}</span>
            </div>

            {/* Interactive Land-Use / Soil Type Selector */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Simulate Land-Use Soil Permeability:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => setActiveCN(92)}
                  className={`p-1.5 rounded text-left border transition-all ${
                    activeCN === 92
                      ? 'bg-red-950/80 border-red-700 text-red-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Commercial / Concrete (CN 92)
                </button>
                <button
                  onClick={() => setActiveCN(86)}
                  className={`p-1.5 rounded text-left border transition-all ${
                    activeCN === 86
                      ? 'bg-cyan-950/80 border-cyan-700 text-cyan-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Dense Urban Paved (CN 86)
                </button>
                <button
                  onClick={() => setActiveCN(78)}
                  className={`p-1.5 rounded text-left border transition-all ${
                    activeCN === 78
                      ? 'bg-amber-950/80 border-amber-700 text-amber-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Suburban Permeable (CN 78)
                </button>
                <button
                  onClick={() => setActiveCN(68)}
                  className={`p-1.5 rounded text-left border transition-all ${
                    activeCN === 68
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Farmland / Green (CN 68)
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-cyan-300 space-y-0.5">
              <div>S = (25400 / CN) - 254 = {scs.retentionS} mm</div>
              <div>Ia = 0.2 × S = {scs.initialAbstractionIa} mm</div>
              <div>Q = (P - Ia)² / (P - Ia + S) = {scs.runoffMm} mm</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-flood-card/60 p-2 rounded-lg border border-flood-border/60">
                <span className="text-[10px] text-slate-400 block">Potential Retention (S)</span>
                <span className="text-sm font-bold text-white">{scs.retentionS} mm</span>
              </div>
              <div className="bg-flood-card/60 p-2 rounded-lg border border-flood-border/60">
                <span className="text-[10px] text-slate-400 block">Initial Infiltration (Ia)</span>
                <span className="text-sm font-bold text-white">{scs.initialAbstractionIa} mm</span>
              </div>
              <div className="bg-flood-card/60 p-2 rounded-lg border border-flood-border/60">
                <span className="text-[10px] text-slate-400 block">Runoff Volume (Q)</span>
                <span className="text-sm font-bold text-amber-300">{scs.runoffMm} mm</span>
              </div>
              <div className="bg-flood-card/60 p-2 rounded-lg border border-flood-border/60">
                <span className="text-[10px] text-slate-400 block">Runoff Ratio</span>
                <span className="text-sm font-bold text-cyan-400">{(scs.runoffRatio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Data Quality & Confidence Audit */}
          <div className="glass-panel rounded-2xl p-5 border border-flood-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Data Quality & Uncertainty Audit</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Active Sensor Feeds</span>
                <span className="text-white font-medium">{assessment.dataQualityAudit.sourceCount} Telemetry Channels</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Live API Feeds</span>
                <span className="text-emerald-400 font-medium">{assessment.dataQualityAudit.liveFeedsActive} Real-Time</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Estimated Uncertainty Margin</span>
                <span className="text-slate-300 font-medium">±{assessment.dataQualityAudit.uncertaintyMarginPercent}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Telemetry Completeness</span>
                <span className="text-cyan-400 font-semibold">{assessment.dataQualityAudit.completenessRating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Directives by Target Stakeholder */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>Recommended Precautionary Directives by Stakeholder</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assessment.recommendedActions.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                rec.urgency === 'immediate'
                  ? 'bg-red-950/30 border-red-800/60'
                  : rec.urgency === 'urgent'
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-flood-card/60 border-flood-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white">{rec.target}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      rec.urgency === 'immediate'
                        ? 'bg-red-900 text-red-200'
                        : rec.urgency === 'urgent'
                        ? 'bg-amber-900 text-amber-200'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {rec.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Scientific Transparency & Ethics Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <strong className="text-slate-200">Scientific Methodology Transparency Disclosure:</strong>
          <p>
            FLOODX computes flood risk via an empirical multi-criteria hydrological index combining SCS-CN surface runoff, topographic slope retention, and rainfall intensity thresholds. This provides rapid edge situational awareness during disaster response, but does not substitute for full 2D hydrodynamic hydrodynamic modeling (e.g. HEC-RAS / TUFLOW) or official statutory warnings from the India Meteorological Department (IMD) and Central Water Commission (CWC).
          </p>
        </div>
      </div>
    </div>
  );
}
