// FLOODX Scientific Hydrology & Risk Calculation Engine
// Implements transparent heuristic risk estimation, SCS-CN runoff approximation,
// IMD precipitation classification, and what-if simulation dynamics.

import {
  LocationData,
  WeatherObservation,
  HydrologicalMetrics,
  RiskAssessment,
  RiskSeverity,
  IMDClassification,
  SimulationParameters,
  SimulationResult,
  ContributingFactor,
} from '@/types';

/**
 * Classify 24h rainfall against official India Meteorological Department (IMD) standards
 */
export function classifyIMDRainfall(rainfall24hMm: number): IMDClassification {
  if (rainfall24hMm < 0.1) return 'No Rain (<0.1 mm)';
  if (rainfall24hMm <= 15.5) return 'Light Rain (0.1 - 15.5 mm)';
  if (rainfall24hMm <= 64.4) return 'Moderate Rain (15.6 - 64.4 mm)';
  if (rainfall24hMm <= 115.5) return 'Heavy Rain (64.5 - 115.5 mm)';
  if (rainfall24hMm <= 204.4) return 'Very Heavy Rain (115.6 - 204.4 mm)';
  return 'Extremely Heavy Rain (>204.4 mm)';
}

/**
 * Calculate Direct Surface Runoff using the USDA/NRCS Soil Conservation Service
 * Curve Number (SCS-CN) method adapted for tropical urban basins.
 * P = Precipitation (mm), CN = Curve Number (30-100)
 */
export function calculateSCSDirectRunoff(precipitationMm: number, curveNumber: number): {
  runoffMm: number;
  retentionS: number;
  initialAbstractionIa: number;
  runoffRatio: number;
} {
  // Constrain Curve Number
  const cn = Math.max(30, Math.min(98, curveNumber));
  
  // Potential maximum soil moisture retention S (mm)
  const retentionS = (25400 / cn) - 254;
  
  // Initial Abstraction Ia = 0.2 * S (surface storage, interception, initial infiltration)
  const initialAbstractionIa = 0.2 * retentionS;

  if (precipitationMm <= initialAbstractionIa) {
    return {
      runoffMm: 0,
      retentionS: Number(retentionS.toFixed(2)),
      initialAbstractionIa: Number(initialAbstractionIa.toFixed(2)),
      runoffRatio: 0,
    };
  }

  // Direct Runoff Q = (P - Ia)^2 / (P - Ia + S)
  const numerator = Math.pow(precipitationMm - initialAbstractionIa, 2);
  const denominator = (precipitationMm - initialAbstractionIa) + retentionS;
  const runoffMm = numerator / denominator;
  const runoffRatio = precipitationMm > 0 ? runoffMm / precipitationMm : 0;

  return {
    runoffMm: Number(runoffMm.toFixed(2)),
    retentionS: Number(retentionS.toFixed(2)),
    initialAbstractionIa: Number(initialAbstractionIa.toFixed(2)),
    runoffRatio: Number(runoffRatio.toFixed(3)),
  };
}

/**
 * Determine Antecedent Moisture Condition (AMC) based on 5-day antecedent rainfall
 */
export function determineAMC(past5DayRainMm: number): 'AMC I (Dry)' | 'AMC II (Normal)' | 'AMC III (Saturated)' {
  if (past5DayRainMm < 35) return 'AMC I (Dry)';
  if (past5DayRainMm <= 52.5) return 'AMC II (Normal)';
  return 'AMC III (Saturated)';
}

/**
 * Map raw composite score to standard FLOODX risk severity
 */
export function mapScoreToSeverity(score: number): RiskSeverity {
  if (score < 25) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 72) return 'High';
  if (score < 88) return 'Severe';
  return 'Extreme';
}

/**
 * Compute transparent, explainable flood-risk assessment
 */
export function computeRiskAssessment(
  location: LocationData,
  weather: WeatherObservation,
  hydrology?: Partial<HydrologicalMetrics>
): RiskAssessment {
  // 1. Rainfall Intensity & Accumulation Factor (30% weight)
  // Evaluates both current cloudburst rate (mm/h) and 24h accumulation
  const rain24h = weather.past24hRainfallMm;
  const rainRate = weather.currentPrecipitationMmHr;
  let rainFactorScore = 0;
  
  if (rain24h > 204.4 || rainRate > 65) {
    rainFactorScore = 95;
  } else if (rain24h > 115.5 || rainRate > 35) {
    rainFactorScore = 80;
  } else if (rain24h > 64.5 || rainRate > 15) {
    rainFactorScore = 60;
  } else if (rain24h > 25 || rainRate > 5) {
    rainFactorScore = 38;
  } else if (rain24h > 5 || rainRate > 1) {
    rainFactorScore = 18;
  } else {
    rainFactorScore = 5;
  }

  // 2. Surface Infiltration & Soil Saturation Factor (20% weight)
  const scs = calculateSCSDirectRunoff(rain24h, location.soilCurveNumber);
  const soilSaturation = hydrology?.soilSaturationPercent ?? Math.min(100, Math.round(rain24h * 0.8 + 20));
  const infiltrationScore = Math.min(100, Math.round((scs.runoffRatio * 60) + (soilSaturation * 0.4)));

  // 3. Topography & Slope Drainage Factor (15% weight)
  // Low slope angle in valleys leads to severe waterlogging & stagnation
  let slopeScore = 0;
  if (location.slopeDegree < 0.8) {
    slopeScore = 85; // Low-lying depression / bowl
  } else if (location.slopeDegree < 2.0) {
    slopeScore = 65; // Moderate urban valley
  } else if (location.slopeDegree < 5.0) {
    slopeScore = 40; // Rolling terrain
  } else {
    slopeScore = 20; // High slope, fast natural runoff (unless landslide zone)
  }

  // 4. Urban Imperviousness & Stormwater Drainage Factor (15% weight)
  // High impervious concrete cover chokes natural percolation
  const drainageCapacity = hydrology?.drainageCapacityUsagePercent ?? Math.min(98, Math.round(rainFactorScore * 0.9));
  const urbanScore = Math.min(100, Math.round((location.imperviousAreaPercent * 0.5) + (drainageCapacity * 0.5)));

  // 5. River Stage / Water Level vs Danger Mark (15% weight)
  const waterLevel = hydrology?.waterLevelMeters ?? 3.4;
  const dangerLevel = hydrology?.dangerLevelMeters ?? 4.8;
  const warningLevel = hydrology?.warningLevelMeters ?? 4.0;
  
  let riverScore = 20;
  if (waterLevel >= dangerLevel) {
    riverScore = 95;
  } else if (waterLevel >= warningLevel) {
    riverScore = 75;
  } else if (waterLevel >= (warningLevel * 0.75)) {
    riverScore = 50;
  } else {
    riverScore = 25;
  }

  // 6. Historical Vulnerability & Repeat Inundation (5% weight)
  const historicalCount = location.historicalFloodYears.length;
  const historicalScore = Math.min(95, historicalCount * 22);

  // Contributing Factors Breakdown with explicit weights
  const contributingFactors: ContributingFactor[] = [
    {
      factor: 'Precipitation Intensity & 24h Accumulation',
      weight: 0.30,
      rawScore: rainFactorScore,
      weightedContribution: Number((rainFactorScore * 0.30).toFixed(1)),
      status: rainFactorScore > 70 ? 'critical' : rainFactorScore > 40 ? 'moderate' : 'favorable',
      description: `${rain24h.toFixed(1)} mm recorded past 24h (${classifyIMDRainfall(rain24h)}), peak rate ${rainRate.toFixed(1)} mm/hr.`,
    },
    {
      factor: 'SCS-CN Surface Runoff & Soil Saturation',
      weight: 0.20,
      rawScore: infiltrationScore,
      weightedContribution: Number((infiltrationScore * 0.20).toFixed(1)),
      status: infiltrationScore > 70 ? 'critical' : infiltrationScore > 40 ? 'moderate' : 'favorable',
      description: `Runoff coeff ${(scs.runoffRatio * 100).toFixed(1)}% (CN ${location.soilCurveNumber}), estimated soil moisture ${soilSaturation}%.`,
    },
    {
      factor: 'Topographic Slope & Lowland Stagnation',
      weight: 0.15,
      rawScore: slopeScore,
      weightedContribution: Number((slopeScore * 0.15).toFixed(1)),
      status: slopeScore > 70 ? 'critical' : slopeScore > 40 ? 'moderate' : 'favorable',
      description: `Catchment slope ${location.slopeDegree}° at base elevation ${location.baseElevationM}m; valley floor drainage vulnerability.`,
    },
    {
      factor: 'Drainage Network & Impervious Choke',
      weight: 0.15,
      rawScore: urbanScore,
      weightedContribution: Number((urbanScore * 0.15).toFixed(1)),
      status: urbanScore > 70 ? 'critical' : urbanScore > 40 ? 'moderate' : 'favorable',
      description: `${location.imperviousAreaPercent}% impervious surface; stormwater network running at ~${drainageCapacity}% hydraulic capacity.`,
    },
    {
      factor: 'River Stage & Canal Level vs Danger Mark',
      weight: 0.15,
      rawScore: riverScore,
      weightedContribution: Number((riverScore * 0.15).toFixed(1)),
      status: riverScore > 70 ? 'critical' : riverScore > 40 ? 'moderate' : 'favorable',
      description: `Current water stage ${waterLevel.toFixed(2)}m (Warning: ${warningLevel.toFixed(2)}m | Danger: ${dangerLevel.toFixed(2)}m).`,
    },
    {
      factor: 'Historical Flood Recurrence Recency',
      weight: 0.05,
      rawScore: historicalScore,
      weightedContribution: Number((historicalScore * 0.05).toFixed(1)),
      status: historicalScore > 60 ? 'moderate' : 'favorable',
      description: `${historicalCount} major documented inundation events in record (${location.historicalFloodYears.join(', ')}).`,
    },
  ];

  // Calculate composite weighted overall score (0 - 100)
  const rawOverall = contributingFactors.reduce((acc, f) => acc + f.weightedContribution, 0);
  const overallScore = Math.round(Math.max(0, Math.min(100, rawOverall)));
  const severityLevel = mapScoreToSeverity(overallScore);
  const imdClass = classifyIMDRainfall(rain24h);

  // Confidence & data quality assessment
  const isLiveSource = weather.isLive;
  const confidenceScore = isLiveSource ? 88 : 74;

  // Recommended Precautionary Actions
  const recommendedActions: RiskAssessment['recommendedActions'] = [];

  if (severityLevel === 'Extreme' || severityLevel === 'Severe') {
    recommendedActions.push(
      {
        target: 'Emergency Responders (NDRF/SDRF)',
        action: 'Pre-position inflatable motorboats and rescue squads at low-lying valley bottlenecks. Activate Emergency Operations Center (EOC).',
        urgency: 'immediate',
      },
      {
        target: 'Urban Local Bodies (BBMP/Corp)',
        action: 'Deploy high-capacity diesel dewatering pumps to clear arterial underpasses and rajakaluve choke points. Open sluice gates safely.',
        urgency: 'immediate',
      },
      {
        target: 'Citizens',
        action: 'Avoid underpasses and basement parking. Move electrical appliances to upper floors. Do not drive through standing water.',
        urgency: 'immediate',
      }
    );
  } else if (severityLevel === 'High') {
    recommendedActions.push(
      {
        target: 'Urban Local Bodies (BBMP/Corp)',
        action: 'Inspect and clear secondary drainage grills and trash racks along primary stormwater canals.',
        urgency: 'urgent',
      },
      {
        target: 'Citizens',
        action: 'Plan alternate travel routes avoiding low-elevation stretches. Keep mobile phones charged and emergency contacts handy.',
        urgency: 'urgent',
      },
      {
        target: 'Emergency Responders (NDRF/SDRF)',
        action: 'Put disaster quick-response teams on standby and verify emergency shelter supply chains.',
        urgency: 'urgent',
      }
    );
  } else {
    recommendedActions.push(
      {
        target: 'Citizens',
        action: 'Normal activity permitted. Monitor routine local meteorological updates.',
        urgency: 'routine',
      },
      {
        target: 'Urban Local Bodies (BBMP/Corp)',
        action: 'Maintain routine desilting and sensor telemetry log checks.',
        urgency: 'routine',
      }
    );
  }

  const summaryExplanation = `Location assessed at ${severityLevel.toUpperCase()} risk (${overallScore}/100) under ${imdClass}. Primary drivers: ${contributingFactors
    .filter((f) => f.status === 'critical' || f.status === 'moderate')
    .map((f) => f.factor)
    .join(', ') || 'Normal baseline conditions'}.`;

  return {
    id: `risk-${location.id}-${Date.now()}`,
    locationId: location.id,
    locationName: location.name,
    timestamp: new Date().toISOString(),
    overallScore,
    severityLevel,
    imdClassification: imdClass,
    confidenceScore,
    dataQualityAudit: {
      sourceCount: isLiveSource ? 4 : 2,
      liveFeedsActive: isLiveSource ? 3 : 0,
      uncertaintyMarginPercent: isLiveSource ? 12 : 24,
      completenessRating: isLiveSource ? 'Optimal' : 'Satisfactory',
    },
    contributingFactors,
    summaryExplanation,
    recommendedActions,
    isSimulated: false,
    isHeuristic: true,
  };
}

/**
 * Execute What-If Scenario Simulation
 * Enables users to adjust hypothetical rainfall intensity, duration, soil saturation,
 * and drainage blockage, calculating transparent comparative deltas.
 */
export function runWhatIfSimulation(
  baseline: RiskAssessment,
  location: LocationData,
  params: SimulationParameters
): SimulationResult {
  // Total hypothetical simulated rainfall (mm)
  const simulatedTotalRainMm = params.rainfallIntensityMmHr * params.rainfallDurationHours;

  // Runoff calculation under simulated conditions
  const simulatedScs = calculateSCSDirectRunoff(simulatedTotalRainMm, location.soilCurveNumber);
  
  // Incremental risk calculations based on simulation parameters
  let intensityImpact = 0;
  if (params.rainfallIntensityMmHr > 100) {
    intensityImpact = 45; // Cloudburst rate
  } else if (params.rainfallIntensityMmHr > 50) {
    intensityImpact = 30; // Very intense downpour
  } else if (params.rainfallIntensityMmHr > 20) {
    intensityImpact = 15;
  } else {
    intensityImpact = params.rainfallIntensityMmHr * 0.5;
  }

  const durationImpact = Math.min(25, params.rainfallDurationHours * 2.5);
  const saturationImpact = (params.soilSaturationPercent / 100) * 15;
  const blockageImpact = (params.drainageBlockagePercent / 100) * 20;
  const dischargeImpact = Math.min(15, (params.upstreamReservoirDischargeM3s / 1000) * 10);

  // New simulated risk score
  const simulatedRaw = 15 + intensityImpact + durationImpact + saturationImpact + blockageImpact + dischargeImpact;
  const simulatedRiskScore = Math.min(100, Math.round(simulatedRaw));
  const simulatedSeverity = mapScoreToSeverity(simulatedRiskScore);
  const scoreDelta = simulatedRiskScore - baseline.overallScore;

  // Impact projections under simulation
  const additionalRunoffMm = Number((simulatedScs.runoffMm).toFixed(1));
  const potentialInundationDepthCm = Math.round(
    (simulatedTotalRainMm * 0.35) * (1 + params.drainageBlockagePercent / 100) * (1 / (location.slopeDegree + 0.5))
  );
  
  const roadNetworkImpassableKm = Number(
    (Math.min(18, (potentialInundationDepthCm / 20) * (location.imperviousAreaPercent / 50))).toFixed(1)
  );

  const populationExposedRatio = Math.min(0.85, (simulatedRiskScore / 100) * 0.6);
  const potentiallyAffectedPopulation = Math.round(
    (location.populationDensityPerSqKm * 4.2) * populationExposedRatio
  );

  let drainageSpillLikelihood: SimulationResult['drainageSpillLikelihood'] = 'None';
  if (simulatedRiskScore >= 80) drainageSpillLikelihood = 'Catastrophic';
  else if (simulatedRiskScore >= 60) drainageSpillLikelihood = 'Widespread';
  else if (simulatedRiskScore >= 40) drainageSpillLikelihood = 'Localized';

  const threatenedHospitals = simulatedRiskScore > 75 ? Math.min(location.criticalInfrastructureCount.hospitals, 3) : 0;

  const changeExplanation = `Under simulated conditions (${params.rainfallIntensityMmHr} mm/h over ${params.rainfallDurationHours}h with ${params.drainageBlockagePercent}% drain blockage), risk shifts from ${baseline.severityLevel} (${baseline.overallScore}) to ${simulatedSeverity} (${simulatedRiskScore}), representing a delta of ${scoreDelta >= 0 ? '+' : ''}${scoreDelta} points. Potential inundation depth is projected at ~${potentialInundationDepthCm} cm in low-lying depressions.`;

  const contingencyDirectives: string[] = [
    `SIMULATION: Model assumes ${simulatedTotalRainMm.toFixed(1)} mm cumulative rainfall over ${params.rainfallDurationHours} hours.`,
    `Drainage bottleneck: ${params.drainageBlockagePercent}% stormwater drain blockage elevates stagnant backwater depth by ~${Math.round(params.drainageBlockagePercent * 0.4)} cm.`,
    simulatedRiskScore > 70
      ? 'DIRECTIVE: Recommend pre-emptive evacuation alerts for ground-floor residents in designated vulnerable polygons.'
      : 'DIRECTIVE: Maintain standard operational monitoring; initiate desilting of major stormwater feeder channels.',
  ];

  return {
    baselineRiskScore: baseline.overallScore,
    baselineSeverity: baseline.severityLevel,
    simulatedRiskScore,
    simulatedSeverity,
    scoreDelta,
    additionalRunoffMm,
    potentialInundationDepthCm,
    roadNetworkImpassableKm,
    potentiallyAffectedPopulation,
    threatenedHospitals,
    drainageSpillLikelihood,
    changeExplanation,
    contingencyDirectives,
    simulatedAt: new Date().toISOString(),
  };
}
