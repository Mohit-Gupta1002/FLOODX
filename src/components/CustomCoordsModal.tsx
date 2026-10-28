'use client';

import React, { useState } from 'react';
import { X, MapPin, Compass, Check, AlertCircle } from 'lucide-react';
import { LocationData } from '@/types';

interface CustomCoordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLocation: (loc: LocationData) => void;
}

export default function CustomCoordsModal({
  isOpen,
  onClose,
  onSaveLocation,
}: CustomCoordsModalProps) {
  const [name, setName] = useState('Hebbal Valley / Nagavara Lake');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [lat, setLat] = useState('13.0358');
  const [lng, setLng] = useState('77.5970');
  const [catchment, setCatchment] = useState('Hebbal Lake Basin');
  const [elevation, setElevation] = useState('895');
  const [slope, setSlope] = useState('1.4');
  const [curveNumber, setCurveNumber] = useState('86');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const elevNum = parseFloat(elevation);
    const slopeNum = parseFloat(slope);
    const cnNum = parseInt(curveNumber, 10);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }
    if (isNaN(elevNum) || elevNum < 0) {
      setError('Elevation must be a non-negative number.');
      return;
    }

    const customLoc: LocationData = {
      id: `custom-${Date.now()}`,
      name,
      city,
      state,
      lat: latNum,
      lng: lngNum,
      catchmentBasin: catchment,
      primaryRiver: 'Local Stormwater Tributary',
      baseElevationM: elevNum,
      slopeDegree: slopeNum,
      imperviousAreaPercent: 75,
      soilCurveNumber: cnNum,
      criticalInfrastructureCount: {
        hospitals: 4,
        substations: 3,
        reliefShelters: 6,
        fireStations: 2,
      },
      populationDensityPerSqKm: 9800,
      historicalFloodYears: [2017, 2022],
      boundingCoords: [
        [latNum - 0.02, lngNum - 0.02],
        [latNum + 0.02, lngNum - 0.02],
        [latNum + 0.02, lngNum + 0.02],
        [latNum - 0.02, lngNum + 0.02],
      ],
    };

    onSaveLocation(customLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-flood-panel border border-flood-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-flood-border pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Analyze Custom Coordinates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Location / Ward Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">City & State</label>
              <input
                type="text"
                value={`${city}, ${state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCity(parts[0]?.trim() || '');
                  setState(parts[1]?.trim() || '');
                }}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Latitude (°N)</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Longitude (°E)</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Base Elevation (m)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Slope (°)</label>
              <input
                type="number"
                step="0.1"
                value={slope}
                onChange={(e) => setSlope(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Soil CN (30-98)</label>
              <input
                type="number"
                value={curveNumber}
                onChange={(e) => setCurveNumber(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-flood-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-md transition-all"
            >
              Analyze Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
