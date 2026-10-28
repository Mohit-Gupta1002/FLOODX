'use client';

import React from 'react';
import {
  Waves,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  WifiOff,
  Bell,
  ArrowRight,
  Compass,
  CheckCircle2,
  Cpu,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenSimulation: () => void;
}

export default function LandingPage({
  onOpenDashboard,
  onOpenSimulation,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-flood-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-b border-cyan-800/40 px-4 py-2 text-center text-xs text-cyan-300 font-medium">
        <span>
          Smart India Hackathon 2026 Initiative • <strong>Presidency University, Bengaluru</strong> • Operational Disaster Intelligence MVP
        </span>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="text-center space-y-6 max-w-3xl mx-auto relative z-10">
          {/* Logo Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-semibold shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Predict. Understand. Simulate. Act.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AI-Powered Flood Intelligence for a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Safer Tomorrow
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A unified flood disaster intelligence platform built for disaster management authorities (NDMA/SDMA), urban local bodies, emergency responders, and vulnerable communities. Rapid hydrological estimation, what-if inundation scenarios, and offline-first edge resilience.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenDashboard}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Open Flood Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSimulation}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-flood-panel hover:bg-flood-card border border-flood-borderLight text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Simulate What-If Scenarios</span>
            </button>
          </div>
        </div>

        {/* 5 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-20">
          <div className="glass-panel p-5 rounded-2xl border border-flood-border hover:border-cyan-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Flood-Risk Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent multi-factor heuristic risk scoring combining SCS-CN runoff, IMD precipitation rates, and valley slope retention.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-flood-border hover:border-cyan-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Geospatial GIS Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Leaflet GIS with multi-basemap satellite imagery, hazard inundation zones, telemetry gauges, and critical facilities.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-flood-border hover:border-cyan-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">What-If Simulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time parameter sliders to simulate cloudbursts, drain clogging, and dam releases with side-by-side comparative deltas.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-flood-border hover:border-cyan-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Early Warnings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rule-based emergency alert engine generating multilingual broadcasts in Kannada, Hindi, Tamil, and English for rapid dissemination.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-flood-border hover:border-cyan-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Offline Resilience</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edge caching architecture preserves recent risk maps, alerts, and calculations when cyclone winds or floods take cell towers offline.
            </p>
          </div>
        </div>

        {/* Live Supported Locations Ticker */}
        <div className="mt-16 glass-card rounded-2xl p-6 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Calibrated National Catchment Basins
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant operational intelligence available for vulnerable Indian urban and riverine centers:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              'Bengaluru (Bellandur/Varthur)',
              'Chennai (Adyar Basin)',
              'Mumbai (Mithi River)',
              'Guwahati (Brahmaputra)',
              'Patna (Ganga Plain)',
              'Wayanad (Meppadi Hills)',
            ].map((city, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-medium"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-flood-border bg-flood-panel/80 px-4 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            FLOODX © 2026 • Presidency University, Bengaluru • Smart India Hackathon 2026
          </span>
          <span className="text-[11px] text-slate-500">
            Engineered in compliance with NDMA National Flood Guidelines & WMO Standards
          </span>
        </div>
      </footer>
    </div>
  );
}
