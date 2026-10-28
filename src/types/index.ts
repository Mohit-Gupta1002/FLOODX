// FLOODX Data Models & Types

export type RiskSeverity = 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extreme';

export type AlertSeverity = 'advisory' | 'watch' | 'warning' | 'emergency';

export type IMDClassification = 
  | 'No Rain (<0.1 mm)' 
  | 'Light Rain (0.1 - 15.5 mm)' 
  | 'Moderate Rain (15.6 - 64.4 mm)' 
  | 'Heavy Rain (64.5 - 115.5 mm)' 
  | 'Very Heavy Rain (115.6 - 204.4 mm)' 
  | 'Extremely Heavy Rain (>204.4 mm)';

export interface LocationData {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  catchmentBasin: string;
  primaryRiver: string;
  baseElevationM: number;
  slopeDegree: number;
  imperviousAreaPercent: number;
  soilCurveNumber: number; // SCS-CN (e.g., 75-90 for urban/clay)
  criticalInfrastructureCount: {
    hospitals: number;
    substations: number;
    reliefShelters: number;
    fireStations: number;
  };
  populationDensityPerSqKm: number;
  historicalFloodYears: number[];
  boundingCoords: [number, number][]; // Polygon bounding box for hazard map
}

export interface WeatherObservation {
  timestamp: string;
  temperatureC: number;
  currentPrecipitationMmHr: number;
  past24hRainfallMm: number;
  past72hRainfallMm: number;
  forecast24hRainfallMm: number;
  humidityPercent: number;
  surfacePressureHpa: number;
  windSpeedKmh: number;
  source: 'Open-Meteo Live API' | 'IMD Gridded Dataset' | 'Local Gauge Telemetry' | 'Cached Baseline';
  isLive: boolean;
  freshnessMinutes: number;
  hourlyRainfallSeries: { time: string; rainfallMm: number; runoffMm: number }[];
}

export interface HydrologicalMetrics {
  runoffVolumeMm: number;
  runoffCoefficient: number;
  soilSaturationPercent: number;
  antecedentMoistureCondition: 'AMC I (Dry)' | 'AMC II (Normal)' | 'AMC III (Saturated)';
  drainageCapacityUsagePercent: number;
  waterLevelMeters: number;
  dangerLevelMeters: number;
  warningLevelMeters: number;
  riverStageTrend: 'rising' | 'steady' | 'falling';
  dischargeM3s: number;
}

export interface ContributingFactor {
  factor: string;
  weight: number; // 0 - 1
  rawScore: number; // 0 - 100
  weightedContribution: number;
  status: 'favorable' | 'moderate' | 'critical';
  description: string;
}

export interface RiskAssessment {
  id: string;
  locationId: string;
  locationName: string;
  timestamp: string;
  overallScore: number; // 0 - 100
  severityLevel: RiskSeverity;
  imdClassification: IMDClassification;
  confidenceScore: number; // 0 - 100
  dataQualityAudit: {
    sourceCount: number;
    liveFeedsActive: number;
    uncertaintyMarginPercent: number;
    completenessRating: 'Optimal' | 'Satisfactory' | 'Degraded';
  };
  contributingFactors: ContributingFactor[];
  summaryExplanation: string;
  recommendedActions: {
    target: 'Citizens' | 'Urban Local Bodies (BBMP/Corp)' | 'Emergency Responders (NDRF/SDRF)';
    action: string;
    urgency: 'routine' | 'urgent' | 'immediate';
  }[];
  isSimulated: boolean;
  isHeuristic: boolean;
}

export interface SimulationParameters {
  rainfallIntensityMmHr: number;
  rainfallDurationHours: number;
  soilSaturationPercent: number;
  drainageBlockagePercent: number;
  upstreamReservoirDischargeM3s: number;
  tideOrSurgeHeightM: number;
}

export interface SimulationResult {
  baselineRiskScore: number;
  baselineSeverity: RiskSeverity;
  simulatedRiskScore: number;
  simulatedSeverity: RiskSeverity;
  scoreDelta: number;
  additionalRunoffMm: number;
  potentialInundationDepthCm: number;
  roadNetworkImpassableKm: number;
  potentiallyAffectedPopulation: number;
  threatenedHospitals: number;
  drainageSpillLikelihood: 'None' | 'Localized' | 'Widespread' | 'Catastrophic';
  changeExplanation: string;
  contingencyDirectives: string[];
  simulatedAt: string;
}

export interface RoadAsset {
  id: string;
  name: string;
  type: 'Arterial' | 'Sub-Arterial' | 'Ring Road' | 'Local';
  lengthKm: number;
  elevationM: number;
  inundationRisk: 'Passable' | 'Caution (Puddling)' | 'High Risk' | 'Impassable / Flooded';
  waterDepthCm: number;
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Substation' | 'Relief Center' | 'Fire Station' | 'School';
  lat: number;
  lng: number;
  elevationM: number;
  status: 'Operational' | 'Caution' | 'At Risk of Submergence' | 'Critical';
  vulnerabilityNotes: string;
}

export interface ImpactAssessment {
  locationId: string;
  timestamp: string;
  totalExposedPopulation: number;
  vulnerableGroups: {
    elderly: number;
    childrenUnder5: number;
    informalSettlementResidents: number;
  };
  roads: RoadAsset[];
  facilities: CriticalFacility[];
  residentialBuildingsAtRisk: number;
  commercialStructuresAtRisk: number;
  estimatedEconomicExposureLakhs: number;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  locationName: string;
  timestamp: string;
  triggerMetric: string;
  triggerValue: string;
  freshness: string;
  source: string;
  recommendedAction: string;
  acknowledged: boolean;
  isDemonstrationAlert: boolean;
  multilingual: {
    en: string;
    kn: string; // Kannada (Karnataka / Presidency Univ)
    hi: string; // Hindi (National)
    ta: string; // Tamil (Regional South)
  };
}

export interface EvacuationShelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  elevationM: number;
  totalCapacity: number;
  currentOccupancy: number;
  hasMedicalPost: boolean;
  hasPowerBackup: boolean;
  contactNumber: string;
  status: 'Ready' | 'Operating' | 'Near Capacity' | 'Closed';
  distanceKm: number;
  routePassable: boolean;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  provider: string;
  dataType: string;
  endpoint: string;
  status: 'active' | 'degraded' | 'cached' | 'demo';
  lastPing: string;
  latencyMs: number;
  description: string;
}
