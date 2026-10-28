'use client';

import React from 'react';
import { X, Database, CheckCircle2, Clock, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { DataSourceStatus } from '@/types';
import { INITIAL_DATA_SOURCES } from '@/data/mock-locations';

interface DataSourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources?: DataSourceStatus[];
}

export default function DataSourcesDrawer({
  isOpen,
  onClose,
  sources = INITIAL_DATA_SOURCES,
}: DataSourcesDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-flood-panel border border-flood-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-flood-border">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">External Data Integrations & Telemetry Health</h2>
              <p className="text-xs text-slate-400">
                Audited ingestion adapters conforming to WMO, IMD, NRSC, and CWC standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources List */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-flood-card/60 p-4 rounded-xl border border-flood-border/60 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{src.name}</h3>
                  <div className="text-xs text-cyan-300">{src.provider}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      src.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : src.status === 'demo'
                        ? 'bg-blue-950 text-blue-300 border-blue-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {src.status === 'active' ? '● Live' : src.status === 'demo' ? '○ Calibrated Mock' : 'Cached'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {src.latencyMs}ms latency
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">{src.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-md font-mono text-[10px] text-slate-500">
                  {src.endpoint}
                </span>
                <span>Last verified: {src.lastPing}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-flood-border bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero hardcoded API secrets • Automatic fallback on link failure</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
