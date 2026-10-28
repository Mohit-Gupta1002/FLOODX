'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Navigation,
  AlertTriangle,
  Hospital,
  Zap,
  Shield,
  Flame,
  Info,
} from 'lucide-react';
import { LocationData, RiskSeverity, CriticalFacility, EvacuationShelter } from '@/types';
import { BENGALURU_FACILITIES, BENGALURU_SHELTERS } from '@/data/mock-locations';

interface RiskMapProps {
  location: LocationData;
  severity: RiskSeverity;
  overallScore: number;
  waterLevelMeters?: number;
  dangerLevelMeters?: number;
  facilities?: CriticalFacility[];
  shelters?: EvacuationShelter[];
}

export default function RiskMap({
  location,
  severity,
  overallScore,
  waterLevelMeters = 3.6,
  dangerLevelMeters = 4.8,
  facilities = BENGALURU_FACILITIES,
  shelters = BENGALURU_SHELTERS,
}: RiskMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [basemap, setBasemap] = useState<'dark' | 'satellite' | 'topo'>('dark');
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showGauges, setShowGauges] = useState(true);
  const [waterSurgeMeters, setWaterSurgeMeters] = useState<number>(0);

  const [clickedCoord, setClickedCoord] = useState<{ lat: number; lng: number; approxElev: number } | null>(null);

  // Submerged facilities detection based on surge
  const submergedFacilities = facilities.filter(
    (f) => f.elevationM <= location.baseElevationM + waterSurgeMeters + 1.0
  );

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isMounted = true;

    import('leaflet').then((leafletModule) => {
      if (!isMounted) return;
      L = leafletModule.default || leafletModule;

      // Fix standard leaflet icon path issues in React
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [location.lat, location.lng],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        map.on('click', (e: any) => {
          // Synthetic elevation estimation around base elevation
          const distFromCenter = Math.sqrt(
            Math.pow(e.latlng.lat - location.lat, 2) + Math.pow(e.latlng.lng - location.lng, 2)
          );
          const elevDelta = Math.sin(distFromCenter * 500) * 12;
          const approxElev = Math.round(location.baseElevationM + elevDelta);

          setClickedCoord({
            lat: Number(e.latlng.lat.toFixed(5)),
            lng: Number(e.latlng.lng.toFixed(5)),
            approxElev,
          });
        });

        mapInstanceRef.current = map;
        layerGroupRef.current = L.layerGroup().addTo(map);
      }

      updateMapLayers(L);
    });

    return () => {
      isMounted = false;
    };
  }, [location.id]);

  // Update center when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 13);
    }
  }, [location.lat, location.lng]);

  // Update layers and basemaps dynamically
  const updateMapLayers = (L: any) => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group || !L) return;

    // Clear previous dynamic layers
    group.clearLayers();

    // 1. Add Basemap TileLayer
    let tileUrl = '';
    let attribution = '';

    if (basemap === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Maxar, Earthstar Geographics';
    } else if (basemap === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenTopoMap, &copy; OpenStreetMap contributors';
    } else {
      // Default: CartoDB Dark Matter
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
    }

    // Basemap is handled directly on map
    if ((map as any)._currentBaseLayer) {
      map.removeLayer((map as any)._currentBaseLayer);
    }
    const baseLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 18 });
    baseLayer.addTo(map);
    (map as any)._currentBaseLayer = baseLayer;

    // 2. Primary Location Center Pulse Marker
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #06b6d4; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(6,182,212,0.8);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const centerMarker = L.marker([location.lat, location.lng], { icon: centerIcon }).addTo(group);
    centerMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #38bdf8; font-size: 13px;">${location.name}</strong><br/>
        <span style="color: #94a3b8;">Catchment: ${location.catchmentBasin}</span><br/>
        <div style="margin-top: 6px; padding: 4px 8px; border-radius: 4px; background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3);">
          Elevation: <strong>${location.baseElevationM} m</strong> | Slope: <strong>${location.slopeDegree}°</strong>
        </div>
      </div>
    `);

    // 3. Illustrative Flood Inundation Hazard Zones
    if (showHazardZones) {
      // High-risk low-elevation polygon zone
      const lat = location.lat;
      const lng = location.lng;
      const expansion = waterSurgeMeters * 0.006;
      
      const highRiskCoords = [
        [lat - 0.012 - expansion, lng - 0.015 - expansion],
        [lat + 0.008 + expansion, lng - 0.008 - expansion],
        [lat + 0.015 + expansion, lng + 0.012 + expansion],
        [lat - 0.005 - expansion, lng + 0.022 + expansion],
        [lat - 0.018 - expansion, lng + 0.005 + expansion],
      ];

      const moderateRiskCoords = [
        [lat - 0.022 - expansion * 1.4, lng - 0.028 - expansion * 1.4],
        [lat + 0.018 + expansion * 1.4, lng - 0.020 - expansion * 1.4],
        [lat + 0.028 + expansion * 1.4, lng + 0.022 + expansion * 1.4],
        [lat - 0.012 - expansion * 1.4, lng + 0.038 + expansion * 1.4],
        [lat - 0.030 - expansion * 1.4, lng + 0.012 + expansion * 1.4],
      ];

      // Moderate Zone (Outer Amber)
      L.polygon(moderateRiskCoords, {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: Math.min(0.4, 0.18 + waterSurgeMeters * 0.05),
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(group).bindPopup(`
        <div style="font-size: 12px;">
          <strong style="color: #f59e0b;">Moderate Flood Risk Inundation Zone (Buffer)</strong><br/>
          <span style="color: #94a3b8;">Simulated Water Surge: +${waterSurgeMeters.toFixed(1)}m • Buffer expansion active</span>
        </div>
      `);

      // Critical Zone (Inner Red/Orange)
      L.polygon(highRiskCoords, {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: Math.min(0.6, 0.32 + waterSurgeMeters * 0.08),
        weight: 2,
      }).addTo(group).bindPopup(`
        <div style="font-size: 12px;">
          <strong style="color: #ef4444;">High-Hazard Inundation Zone (Valley Trough)</strong><br/>
          <span style="color: #94a3b8;">Direct overland runoff accumulation • Estimated depth ${(30 + waterSurgeMeters * 50).toFixed(0)} cm</span><br/>
          <span style="color: #fb7185; font-size: 11px;">Restricted pedestrian and small-vehicle transit.</span>
        </div>
      `);
    }

    // 4. Primary River & Stormwater Canals (Rajakaluves)
    if (showRivers) {
      const lat = location.lat;
      const lng = location.lng;
      const riverCoords = [
        [lat + 0.035, lng - 0.030],
        [lat + 0.020, lng - 0.015],
        [lat + 0.005, lng - 0.002],
        [lat - 0.010, lng + 0.015],
        [lat - 0.025, lng + 0.035],
      ];

      L.polyline(riverCoords, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
      }).addTo(group).bindPopup(`
        <div style="font-size: 12px;">
          <strong style="color: #06b6d4;">${location.primaryRiver} & Stormwater Trunk</strong><br/>
          <span style="color: #94a3b8;">Primary discharge gradient for ${location.catchmentBasin}</span>
        </div>
      `);
    }

    // 5. Critical Infrastructure Markers
    if (showInfrastructure) {
      facilities.forEach((fac) => {
        let iconBg = '#0284c7';
        let iconHtml = '🏥';
        if (fac.type === 'Hospital') {
          iconBg = '#dc2626';
          iconHtml = '🏥';
        } else if (fac.type === 'Substation') {
          iconBg = '#d97706';
          iconHtml = '⚡';
        } else if (fac.type === 'Fire Station') {
          iconBg = '#ea580c';
          iconHtml = '🚒';
        }

        const facIcon = L.divIcon({
          className: 'fac-marker',
          html: `
            <div style="width: 26px; height: 26px; border-radius: 6px; background: ${iconBg}; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 1.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
              ${iconHtml}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([fac.lat, fac.lng], { icon: facIcon }).addTo(group).bindPopup(`
          <div style="font-size: 12px;">
            <strong style="color: #ffffff;">${fac.name}</strong><br/>
            <span style="color: #38bdf8;">${fac.type} • Status: ${fac.status}</span><br/>
            <span style="color: #94a3b8; font-size: 11px;">${fac.vulnerabilityNotes}</span>
          </div>
        `);
      });
    }

    // 6. Evacuation Safe Shelters
    if (showShelters) {
      shelters.forEach((sh) => {
        const shIcon = L.divIcon({
          className: 'sh-marker',
          html: `
            <div style="width: 26px; height: 26px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1.5px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">
              🛡️
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([sh.lat, sh.lng], { icon: shIcon }).addTo(group).bindPopup(`
          <div style="font-size: 12px;">
            <strong style="color: #34d399;">${sh.name}</strong><br/>
            <span style="color: #94a3b8;">${sh.address}</span><br/>
            <div style="margin-top: 4px; font-size: 11px; color: #cbd5e1;">
              Elevation: <strong>${sh.elevationM} m</strong> | Capacity: <strong>${sh.currentOccupancy}/${sh.totalCapacity}</strong>
            </div>
            <div style="margin-top: 4px; color: #38bdf8; font-size: 11px;">
              Emergency Contact: ${sh.contactNumber}
            </div>
          </div>
        `);
      });
    }

    // 7. Water Level Telemetry Gauge
    if (showGauges) {
      const gaugeLat = location.lat + 0.008;
      const gaugeLng = location.lng + 0.005;
      const isBreached = waterLevelMeters >= dangerLevelMeters;

      const gaugeIcon = L.divIcon({
        className: 'gauge-marker',
        html: `
          <div style="padding: 2px 6px; border-radius: 4px; background: ${isBreached ? '#b91c1c' : '#0284c7'}; color: #fff; font-size: 10px; font-weight: bold; border: 1px solid #fff; white-space: nowrap; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
            📡 AWLR ${waterLevelMeters.toFixed(1)}m
          </div>
        `,
        iconSize: [70, 20],
        iconAnchor: [35, 10],
      });

      L.marker([gaugeLat, gaugeLng], { icon: gaugeIcon }).addTo(group).bindPopup(`
        <div style="font-size: 12px;">
          <strong style="color: #38bdf8;">Automated Water Level Recorder (AWLR-04)</strong><br/>
          <span style="color: #94a3b8;">Central Water Commission / BBMP Telemetry</span>
          <div style="margin-top: 6px; padding: 4px 6px; border-radius: 4px; background: rgba(14,23,42,0.6); border: 1px solid #334155;">
            Current Stage: <strong>${waterLevelMeters.toFixed(2)} m</strong><br/>
            Warning Level: <strong>${(dangerLevelMeters * 0.85).toFixed(2)} m</strong><br/>
            Danger Level: <strong>${dangerLevelMeters.toFixed(2)} m</strong>
          </div>
        </div>
      `);
    }
  };

  // Re-run layer updates when toggles, basemaps or water surge changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        updateMapLayers(L.default || L);
      });
    }
  }, [basemap, showHazardZones, showRivers, showInfrastructure, showShelters, showGauges, waterSurgeMeters]);

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-xl overflow-hidden border border-flood-border shadow-2xl bg-flood-panel">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Basemap Selector (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex bg-flood-panel/90 backdrop-blur-md rounded-lg p-1 border border-flood-border shadow-lg">
        <button
          onClick={() => setBasemap('dark')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
            basemap === 'dark' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setBasemap('satellite')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
            basemap === 'satellite' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setBasemap('topo')}
          className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
            basemap === 'topo' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Topography
        </button>
      </div>

      {/* Floating Layer Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-20 bg-flood-panel/95 backdrop-blur-md rounded-xl p-3 border border-flood-border shadow-xl text-xs space-y-2 max-w-[210px]">
        <div className="flex items-center space-x-1.5 font-bold text-slate-200 border-b border-flood-border pb-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Map Layers</span>
        </div>
        <div className="space-y-1.5 text-slate-300">
          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showHazardZones}
              onChange={(e) => setShowHazardZones(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 inline-block"></span>
              <span>Inundation Hazard</span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRivers}
              onChange={(e) => setShowRivers(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-1 rounded-sm bg-cyan-400 inline-block"></span>
              <span>River & Trunk Drains</span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showInfrastructure}
              onChange={(e) => setShowInfrastructure(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span>🏥</span>
              <span>Critical Facilities</span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span>🛡️</span>
              <span>Relief Shelters</span>
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showGauges}
              onChange={(e) => setShowGauges(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="flex items-center space-x-1">
              <span>📡</span>
              <span>Telemetry Gauges</span>
            </span>
          </label>
        </div>
      </div>

      {/* Interactive Water Surge Simulator Bar (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 bg-flood-panel/95 backdrop-blur-md rounded-xl p-3 border border-flood-border shadow-xl text-xs space-y-1.5 w-64">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-bold flex items-center space-x-1">
            <span className="text-cyan-400">🌊</span>
            <span>Simulate Water Surge</span>
          </span>
          <span className="font-mono font-bold text-cyan-300">+{waterSurgeMeters.toFixed(1)}m</span>
        </div>
        <input
          type="range"
          min="0"
          max="3.0"
          step="0.2"
          value={waterSurgeMeters}
          onChange={(e) => setWaterSurgeMeters(parseFloat(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0m (Normal)</span>
          <span>+1.5m (Warning)</span>
          <span>+3.0m (Extreme)</span>
        </div>
        {waterSurgeMeters > 0 && (
          <div className="pt-1 text-[10px] text-amber-300 border-t border-slate-800">
            ⚠️ Assets at risk: <strong>{submergedFacilities.length} facilities</strong>
          </div>
        )}
      </div>

      {/* Coordinate & Elevation Inspector (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-20 bg-flood-panel/90 backdrop-blur-md rounded-lg px-3 py-2 border border-flood-border shadow-lg text-[11px] text-slate-300 max-w-xs">
        {clickedCoord ? (
          <div>
            <div className="font-semibold text-cyan-400">Inspected Coordinates</div>
            <div>
              Lat: {clickedCoord.lat}°, Lng: {clickedCoord.lng}°
            </div>
            <div>
              Approx. Topo Elevation: <strong>{clickedCoord.approxElev} m</strong>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>Click map to query coordinates & elevation</span>
          </div>
        )}
      </div>

      {/* Prominent Scientific Disclaimer Pill (Center Bottom) */}
      <div className="hidden lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-flood-bg/90 backdrop-blur-md px-3 py-1 rounded-full border border-amber-600/40 text-[10px] text-amber-300 items-center space-x-1 shadow-md">
        <Info className="w-3 h-3 text-amber-400 flex-shrink-0" />
        <span>Heuristic hydrological simulation layer • Not a validated 2D hydrodynamic extent</span>
      </div>
    </div>
  );
}
