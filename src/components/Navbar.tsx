'use client';

import React, { useState, useEffect } from 'react';
import {
  Waves,
  MapPin,
  Wifi,
  WifiOff,
  Database,
  SlidersHorizontal,
  Bell,
  Clock,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { LocationData, RiskSeverity } from '@/types';
import { SUPPORTED_LOCATIONS } from '@/data/mock-locations';

interface NavbarProps {
  activeLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onOpenDataSources: () => void;
  onOpenCustomCoords: () => void;
  severityLevel: RiskSeverity;
  activeAlertCount: number;
  lastUpdated: string;
}

export default function Navbar({
  activeLocation,
  onSelectLocation,
  isOfflineMode,
  onToggleOfflineMode,
  onOpenDataSources,
  onOpenCustomCoords,
  severityLevel,
  activeAlertCount,
  lastUpdated,
}: NavbarProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setTimeStr(
        new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = () => {
    switch (severityLevel) {
      case 'Extreme':
        return 'bg-purple-900/80 text-purple-300 border-purple-500 animate-pulse';
      case 'Severe':
        return 'bg-red-900/80 text-red-300 border-red-500 animate-pulse';
      case 'High':
        return 'bg-orange-900/80 text-orange-300 border-orange-500';
      case 'Moderate':
        return 'bg-amber-900/80 text-amber-300 border-amber-500';
      default:
        return 'bg-emerald-900/80 text-emerald-300 border-emerald-500';
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { searchLocationsOnline } = await import('@/lib/geocoding-adapter');
        const res = await searchLocationsOnline(searchQuery);
        setSearchResults(res);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = async (res: any) => {
    const { convertGeocodedToLocationData } = await import('@/lib/geocoding-adapter');
    const locData = convertGeocodedToLocationData(res);
    onSelectLocation(locData);
    setIsLocationDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 bg-flood-bg/90 backdrop-blur-md border-b border-flood-border px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Team Info */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Waves className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
                FLOOD<span className="text-cyan-400">X</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                SIH 2026 • Presidency Univ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Operational AI-Powered Flood Disaster Intelligence
            </p>
          </div>
        </div>

        {/* Location Selector & Live Search */}
        <div className="relative">
          <button
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="flex items-center space-x-2 bg-flood-panel hover:bg-flood-card border border-flood-borderLight/60 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <div className="text-left max-w-[180px] sm:max-w-[220px] truncate">
              <div className="font-semibold text-white truncate">{activeLocation.name}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {activeLocation.city}, {activeLocation.state}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 bg-flood-panel border border-flood-border rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search any Indian city, ward, river..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                {isSearching && (
                  <span className="absolute right-2.5 top-2 text-[10px] text-cyan-400 animate-pulse">
                    Searching...
                  </span>
                )}
              </div>

              {/* Dynamic Geocoded Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-cyan-800/60 bg-cyan-950/30 rounded-lg p-1.5 space-y-1">
                  <div className="text-[9px] uppercase font-bold text-cyan-300 px-1.5">
                    Live Geocoding Results (OSM)
                  </div>
                  {searchResults.map((res) => (
                    <button
                      key={res.placeId}
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left p-1.5 rounded text-xs hover:bg-cyan-900/60 text-slate-200 flex items-start space-x-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white truncate">{res.displayName.split(',')[0]}</div>
                        <div className="text-[10px] text-slate-400 truncate">{res.displayName}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Benchmark Locations */}
              <div className="text-[10px] uppercase font-bold text-slate-400 px-1.5 pt-1 tracking-wider">
                Benchmark Catchment Basins
              </div>
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {SUPPORTED_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsLocationDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-start space-x-2 ${
                      loc.id === activeLocation.id
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                        : 'hover:bg-flood-card text-slate-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-cyan-400 flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {loc.city} • {loc.catchmentBasin}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-flood-border pt-1.5">
                <button
                  onClick={() => {
                    setIsLocationDropdownOpen(false);
                    onOpenCustomCoords();
                  }}
                  className="w-full text-center py-1.5 rounded-lg text-xs text-cyan-400 hover:bg-cyan-950/50 font-medium transition-colors"
                >
                  + Enter Custom Coordinates
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Risk Severity Badge */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge()}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{severityLevel} Risk</span>
          </div>

          {/* Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-flood-panel/80 text-[11px] font-mono text-slate-300 border border-flood-border">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          {/* Offline Resilience Toggle */}
          <button
            onClick={onToggleOfflineMode}
            title={isOfflineMode ? 'Click to reconnect live' : 'Click to test offline resilience'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              isOfflineMode
                ? 'bg-amber-950/60 border-amber-600/70 text-amber-300 hover:bg-amber-900/60'
                : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/40'
            }`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live Feeds</span>
              </>
            )}
          </button>

          {/* Data Sources Modal Trigger */}
          <button
            onClick={onOpenDataSources}
            title="Inspect Data Sources & Telemetry Health"
            className="flex items-center space-x-1 px-2.5 py-1 bg-flood-panel hover:bg-flood-card border border-flood-border rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Sources</span>
          </button>
        </div>
      </div>
    </header>
  );
}
