'use client';

import React from 'react';
import {
  Shield,
  MapPin,
  Phone,
  Zap,
  Activity,
  AlertTriangle,
  Navigation,
  Compass,
  CheckCircle2,
  AlertOctagon,
  Info,
} from 'lucide-react';
import { EvacuationShelter, LocationData } from '@/types';
import { BENGALURU_SHELTERS } from '@/data/mock-locations';

interface EvacuationTabProps {
  location: LocationData;
  shelters?: EvacuationShelter[];
}

export default function EvacuationTab({
  location,
  shelters = BENGALURU_SHELTERS,
}: EvacuationTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Evacuation Support & Designated Relief Shelters</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Safe Haven Locator & Routing Guidelines
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pre-designated municipal high-elevation relief centers, campus shelters, and hazard-avoidance ingress/egress corridors for {location.name}.
          </p>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Active Shelters</span>
            <span className="text-xl font-extrabold text-white">{shelters.length} Ready</span>
          </div>
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Mandatory Safety Notice: Never cross flooded water */}
      <div className="p-4 rounded-xl bg-red-950/50 border border-red-700/80 text-xs text-red-200 flex items-start space-x-3 shadow-lg">
        <AlertOctagon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <strong className="text-white text-sm">LIFE-SAFETY EVACUATION MANDATE: TURN AROUND, DON'T DROWN</strong>
          <p className="leading-relaxed">
            Never attempt to walk, swim, or drive through flooded roads or underpasses. Just <strong>15 cm (6 inches)</strong> of fast-moving water can knock an adult off their feet, and <strong>30 cm (12 inches)</strong> can carry away most passenger vehicles. If routing traverses a flooded or low-elevation valley, stop immediately and seek verified high ground.
          </p>
        </div>
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shelters.map((sh) => {
          const occupancyPercent = Math.round((sh.currentOccupancy / sh.totalCapacity) * 100);

          return (
            <div
              key={sh.id}
              className="glass-panel rounded-2xl p-6 border border-flood-border flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{sh.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{sh.address}</span>
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      sh.status === 'Ready'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>

                {/* Elevation & Distance Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-800 font-mono">
                    Elevation: <strong className="text-cyan-400">{sh.elevationM} m</strong>
                  </span>
                  <span className="bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-800 font-mono">
                    Distance: <strong className="text-white">{sh.distanceKm} km</strong>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                      sh.routePassable
                        ? 'bg-emerald-950/60 text-emerald-300'
                        : 'bg-red-950/60 text-red-300'
                    }`}
                  >
                    {sh.routePassable ? '✓ Route Passable' : '✗ Route Obstructed'}
                  </span>
                </div>

                {/* Capacity Progress */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Current Occupancy</span>
                    <span className="font-mono">
                      {sh.currentOccupancy} / {sh.totalCapacity} ({occupancyPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        occupancyPercent > 80
                          ? 'bg-red-500'
                          : occupancyPercent > 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center space-x-3 pt-2 text-xs text-slate-300">
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Medical Post {sh.hasMedicalPost ? '✓' : '—'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Backup Generator {sh.hasPowerBackup ? '✓' : '—'}</span>
                  </span>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="pt-3 border-t border-flood-border/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-cyan-400" />
                  <span className="font-mono text-slate-200">{sh.contactNumber}</span>
                </span>
                <button
                  onClick={() =>
                    alert(
                      `Safe Ingress Route: Navigate via elevated arterial ridge corridors. Avoid underpasses at EcoSpace and Bellandur lake culverts.`
                    )
                  }
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Safe Route &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Notice on Routing Limitations */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p>
          <strong className="text-slate-200">Routing Limitation Disclosure:</strong> Suggested evacuation directions are advisory recommendations computed from topographic elevation gradients and known static flood history. Dynamic real-time obstacles (such as downed electric cables, flash tree falls, or sudden stormwater manhole blowouts) must be confirmed via on-ground ward volunteer spotters before convoy movement.
        </p>
      </div>
    </div>
  );
}
