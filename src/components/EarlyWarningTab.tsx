'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Radio,
  Sliders,
  Languages,
  Sparkles,
  Info,
} from 'lucide-react';
import { AlertItem, LocationData } from '@/types';
import { AlertRuleThresholds, DEFAULT_THRESHOLDS } from '@/lib/alert-engine';

interface EarlyWarningTabProps {
  alerts: AlertItem[];
  location: LocationData;
  onAcknowledgeAlert: (id: string) => void;
  onTriggerDemoAlert: (severity: AlertItem['severity']) => void;
  thresholds: AlertRuleThresholds;
  onUpdateThresholds: (th: AlertRuleThresholds) => void;
}

export default function EarlyWarningTab({
  alerts,
  location,
  onAcknowledgeAlert,
  onTriggerDemoAlert,
  thresholds,
  onUpdateThresholds,
}: EarlyWarningTabProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'hi' | 'ta'>('en');
  const [showConfig, setShowConfig] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'emergency':
        return 'bg-purple-950/80 text-purple-300 border-purple-600 animate-pulse';
      case 'warning':
        return 'bg-red-950/80 text-red-300 border-red-600';
      case 'watch':
        return 'bg-amber-950/80 text-amber-300 border-amber-600';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Operational Alert Engine & Early Warning Center</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Emergency Broadcast & Advisory Feeds
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Rule-based multi-tier early warning delivery across emergency services, local ward control rooms, and community public broadcast systems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerDemoAlert('warning')}
            className="flex items-center space-x-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Demo Alert</span>
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-1.5 bg-flood-panel hover:bg-flood-card border border-flood-borderLight text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showConfig ? 'Hide Thresholds' : 'Configure Rules'}</span>
          </button>
        </div>
      </div>

      {/* Thresholds Drawer / Configuration Form */}
      {showConfig && (
        <div className="glass-panel rounded-2xl p-5 border border-cyan-800/60 bg-flood-panel space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-flood-border pb-2">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4" />
              <span>Configurable Automated Trigger Thresholds</span>
            </h3>
            <button
              onClick={() => onUpdateThresholds(DEFAULT_THRESHOLDS)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Reset to IMD/CWC Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block font-medium mb-1">
                24h Heavy Rain Trigger (mm)
              </label>
              <input
                type="number"
                value={thresholds.heavyRainfallMm24h}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    heavyRainfallMm24h: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 64.5 mm (IMD Heavy Rain)</span>
            </div>

            <div>
              <label className="text-slate-300 block font-medium mb-1">
                Peak Cloudburst Rate Trigger (mm/hr)
              </label>
              <input
                type="number"
                value={thresholds.cloudburstRateMmHr}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    cloudburstRateMmHr: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 25.0 mm/hr</span>
            </div>

            <div>
              <label className="text-slate-300 block font-medium mb-1">
                Water Level Danger Ratio (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.05"
                value={thresholds.waterLevelDangerRatio}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    waterLevelDangerRatio: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 1.00 (Danger Mark)</span>
            </div>
          </div>
        </div>
      )}

      {/* Multilingual Broadcast Preview Switcher */}
      <div className="glass-panel rounded-2xl p-5 border border-flood-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Multilingual Emergency Broadcast Simulator</h3>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedLanguage === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('kn')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedLanguage === 'kn' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
            <button
              onClick={() => setSelectedLanguage('hi')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedLanguage === 'hi' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setSelectedLanguage('ta')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                selectedLanguage === 'ta' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Display broadcast message in selected language */}
        {alerts[0] && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-medium text-cyan-200">
            {alerts[0].multilingual[selectedLanguage]}
          </div>
        )}
      </div>

      {/* Alerts Filter & Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {['all', 'emergency', 'warning', 'watch', 'advisory'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterSeverity(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors ${
                  filterSeverity === f
                    ? 'bg-cyan-600 text-white'
                    : 'bg-flood-panel hover:bg-flood-card text-slate-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 border border-flood-border">
            No active alerts matching filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                className="glass-panel rounded-2xl p-5 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        a.severity
                      )}`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-xs text-slate-400">{a.locationName}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{a.freshness}</span>
                    {a.isDemonstrationAlert && (
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded">
                        DEMO ONLY
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white">{a.title}</h4>
                  <p className="text-xs text-slate-300">{a.recommendedAction}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Trigger: <strong className="text-slate-200">{a.triggerMetric}</strong> ({a.triggerValue})</span>
                    <span>Source: <strong className="text-slate-200">{a.source}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {a.acknowledged ? (
                    <div className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Acknowledged</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(a.id)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-200">Demonstration Warning Notice:</strong> Alerts generated in this demonstration interface are intended for testing warning delivery protocols and rule engines. Real-world public evacuations must adhere strictly to statutory directives issued by the National Disaster Management Authority (NDMA) and State Disaster Management Authorities (SDMAs).
        </p>
      </div>
    </div>
  );
}
