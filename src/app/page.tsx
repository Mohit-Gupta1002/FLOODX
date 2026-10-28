'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Map as MapIcon,
  Brain,
  Sparkles,
  Users,
  Bell,
  Shield,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Radio,
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import DashboardTab from '@/components/DashboardTab';
import RiskAnalysisTab from '@/components/RiskAnalysisTab';
import SimulationStudio from '@/components/SimulationStudio';
import ImpactAssessmentTab from '@/components/ImpactAssessmentTab';
import EarlyWarningTab from '@/components/EarlyWarningTab';
import EvacuationTab from '@/components/EvacuationTab';
import DataSourcesDrawer from '@/components/DataSourcesDrawer';
import CustomCoordsModal from '@/components/CustomCoordsModal';

import { LocationData, WeatherObservation, RiskAssessment, AlertItem } from '@/types';
import { SUPPORTED_LOCATIONS } from '@/data/mock-locations';
import { computeRiskAssessment } from '@/lib/hydrology-engine';
import { fetchLiveWeatherData, getFallbackWeatherData } from '@/lib/open-meteo-adapter';
import { evaluateAlertRules, createDemonstrationAlert, DEFAULT_THRESHOLDS, AlertRuleThresholds } from '@/lib/alert-engine';
import { CacheService } from '@/lib/cache-service';

// Dynamically import Leaflet Map to prevent SSR errors
const RiskMap = dynamic(() => import('@/components/RiskMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] lg:h-[620px] rounded-xl bg-flood-panel border border-flood-border flex flex-col items-center justify-center text-slate-400">
      <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
      <span className="text-sm font-semibold">Initializing Interactive GIS Map Layers...</span>
    </div>
  ),
});

export default function Home() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [activeLocation, setActiveLocation] = useState<LocationData>(SUPPORTED_LOCATIONS[0]);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [thresholds, setThresholds] = useState<AlertRuleThresholds>(DEFAULT_THRESHOLDS);

  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isCustomCoordsOpen, setIsCustomCoordsOpen] = useState(false);

  // Weather & Risk State
  const [weather, setWeather] = useState<WeatherObservation>(() =>
    getFallbackWeatherData(SUPPORTED_LOCATIONS[0].lat, SUPPORTED_LOCATIONS[0].lng, SUPPORTED_LOCATIONS[0].name)
  );

  const [assessment, setAssessment] = useState<RiskAssessment>(() =>
    computeRiskAssessment(SUPPORTED_LOCATIONS[0], weather)
  );

  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    evaluateAlertRules(SUPPORTED_LOCATIONS[0], weather, assessment)
  );

  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Initialize offline mode preference from cache
  useEffect(() => {
    const forcedOffline = CacheService.isOfflineSimulated();
    setIsOfflineMode(forcedOffline);
  }, []);

  // Fetch Weather & Recalculate Risk when Location or Offline Mode changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoadingWeather(true);
      let weatherData: WeatherObservation;

      if (isOfflineMode) {
        weatherData = getFallbackWeatherData(activeLocation.lat, activeLocation.lng, activeLocation.name);
      } else {
        weatherData = await fetchLiveWeatherData(activeLocation.lat, activeLocation.lng, activeLocation.name);
      }

      if (isCancelled) return;

      setWeather(weatherData);

      // Hydrological metrics defaults
      const hydroMetrics = {
        waterLevelMeters: 3.6,
        dangerLevelMeters: 4.8,
        warningLevelMeters: 4.0,
      };

      const newAssessment = computeRiskAssessment(activeLocation, weatherData, hydroMetrics);
      setAssessment(newAssessment);

      const newAlerts = evaluateAlertRules(
        activeLocation,
        weatherData,
        newAssessment,
        hydroMetrics.waterLevelMeters,
        hydroMetrics.dangerLevelMeters,
        thresholds
      );
      setAlerts(newAlerts);

      // Save to cache
      CacheService.saveAssessment(newAssessment);
      CacheService.saveAlerts(newAlerts);

      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoadingWeather(false);
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [activeLocation.id, isOfflineMode, thresholds]);

  // Handle Offline Toggle
  const handleToggleOfflineMode = () => {
    const nextState = !isOfflineMode;
    setIsOfflineMode(nextState);
    CacheService.setOfflineSimulated(nextState);
  };

  // Alert Actions
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleTriggerDemoAlert = (severity: AlertItem['severity']) => {
    const demo = createDemonstrationAlert(activeLocation, severity);
    setAlerts((prev) => [demo, ...prev]);
  };

  // If on landing view, render Landing Page
  if (view === 'landing') {
    return (
      <LandingPage
        onOpenDashboard={() => {
          setView('app');
          setActiveTab('dashboard');
        }}
        onOpenSimulation={() => {
          setView('app');
          setActiveTab('simulation');
        }}
      />
    );
  }

  // Navigation tabs config
  const navTabs = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Flood Map', icon: MapIcon },
    { id: 'analysis', label: 'Risk XAI Engine', icon: Brain },
    { id: 'simulation', label: 'What-If Simulation', icon: Sparkles },
    { id: 'impact', label: 'Impact Assessment', icon: Users },
    {
      id: 'alerts',
      label: 'Early Warnings',
      icon: Bell,
      badge: alerts.filter((a) => !a.acknowledged).length,
    },
    { id: 'evacuation', label: 'Safe Shelters', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-flood-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeLocation={activeLocation}
        onSelectLocation={(loc) => setActiveLocation(loc)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={handleToggleOfflineMode}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onOpenCustomCoords={() => setIsCustomCoordsOpen(true)}
        severityLevel={assessment.severityLevel}
        activeAlertCount={alerts.length}
        lastUpdated={lastUpdated}
      />

      {/* Persistent Offline Resilience Banner */}
      {isOfflineMode && (
        <div className="bg-amber-950/80 border-b border-amber-700/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>OFFLINE EDGE RESILIENCE ENGAGED:</strong> Disconnected from live network feeds. Operating seamlessly on cached telemetry snapshots and local heuristic models.
            </span>
          </div>
          <button
            onClick={handleToggleOfflineMode}
            className="text-[11px] underline font-bold hover:text-white ml-2 flex-shrink-0"
          >
            Reconnect Live Feeds
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-flood-border/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
                    : 'bg-flood-panel/70 hover:bg-flood-card text-slate-300 hover:text-white border border-transparent hover:border-flood-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-cyan-900' : 'bg-red-500 text-white animate-pulse'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="flex-1"></div>

          {/* Quick Return to Landing Page */}
          <button
            onClick={() => setView('landing')}
            className="text-xs text-slate-400 hover:text-cyan-300 px-3 py-2 whitespace-nowrap font-medium"
          >
            &larr; Platform Overview
          </button>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            location={activeLocation}
            weather={weather}
            assessment={assessment}
            alerts={alerts}
            waterLevelMeters={3.6}
            dangerLevelMeters={4.8}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <MapIcon className="w-5 h-5 text-cyan-400" />
                  <span>Interactive Geospatial GIS Hazard Map</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time overlay of flood hazard polygons, river stormwater trunks, critical facilities, and telemetry gauges.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-slate-900 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
                  Lat: {activeLocation.lat.toFixed(4)}°, Lng: {activeLocation.lng.toFixed(4)}°
                </span>
                <span className="bg-slate-900 px-2.5 py-1 rounded text-slate-300 border border-slate-800">
                  Base Elev: {activeLocation.baseElevationM}m
                </span>
              </div>
            </div>

            <RiskMap
              location={activeLocation}
              severity={assessment.severityLevel}
              overallScore={assessment.overallScore}
              waterLevelMeters={3.6}
              dangerLevelMeters={4.8}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <RiskAnalysisTab
            assessment={assessment}
            location={activeLocation}
            weather={weather}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationStudio
            location={activeLocation}
            baseline={assessment}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactAssessmentTab
            location={activeLocation}
            assessment={assessment}
          />
        )}

        {activeTab === 'alerts' && (
          <EarlyWarningTab
            alerts={alerts}
            location={activeLocation}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onTriggerDemoAlert={handleTriggerDemoAlert}
            thresholds={thresholds}
            onUpdateThresholds={setThresholds}
          />
        )}

        {activeTab === 'evacuation' && (
          <EvacuationTab location={activeLocation} />
        )}
      </main>

      {/* Modals & Drawers */}
      <DataSourcesDrawer
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
      />

      <CustomCoordsModal
        isOpen={isCustomCoordsOpen}
        onClose={() => setIsCustomCoordsOpen(false)}
        onSaveLocation={(loc) => {
          setActiveLocation(loc);
        }}
      />

      {/* Persistent Mission Operations Footer */}
      <footer className="border-t border-flood-border bg-flood-panel/90 px-4 py-3 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white">FLOODX Intelligence Platform</span>
            <span>•</span>
            <span className="text-cyan-400">Presidency University Bengaluru (SIH 2026)</span>
            <span>•</span>
            <span className="text-slate-500">v1.0.0 MVP</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span>Methodology: SCS-CN + IMD Gridded Thresholds</span>
            <span>•</span>
            <span className="text-emerald-400">Zero Paid API Dependency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
