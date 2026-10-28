// FLOODX Offline-First Edge Intelligence Cache Service
// Manages local persistence, cached assessments, alerts history, and offline mode simulation.

import { RiskAssessment, WeatherObservation, AlertItem } from '@/types';

const STORAGE_KEYS = {
  ACTIVE_LOCATION: 'floodx_active_location_id',
  LATEST_ASSESSMENT: 'floodx_latest_assessment',
  ALERTS_LOG: 'floodx_alerts_log',
  OFFLINE_MODE_FORCED: 'floodx_offline_forced',
  LAST_SYNC_TIME: 'floodx_last_sync_time',
  CACHE_SNAPSHOTS: 'floodx_cached_snapshots',
};

export const CacheService = {
  saveAssessment(assessment: RiskAssessment) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LATEST_ASSESSMENT, JSON.stringify(assessment));
      localStorage.setItem(`${STORAGE_KEYS.CACHE_SNAPSHOTS}_${assessment.locationId}`, JSON.stringify(assessment));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
    } catch (e) {
      console.warn('Failed to save assessment to cache', e);
    }
  },

  getLatestAssessment(locationId?: string): RiskAssessment | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = locationId ? `${STORAGE_KEYS.CACHE_SNAPSHOTS}_${locationId}` : STORAGE_KEYS.LATEST_ASSESSMENT;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveAlerts(alerts: AlertItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS_LOG, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to cache', e);
    }
  },

  getAlerts(): AlertItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS_LOG);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isOfflineSimulated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_FORCED) === 'true';
  },

  setOfflineSimulated(val: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_FORCED, val ? 'true' : 'false');
  },

  getLastSyncTimestamp(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  },

  clearCache() {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
