// FLOODX Rule-Based Early Warning & Alert Engine
// Generates tiered emergency advisories, watches, and warnings with multilingual broadcast messages.

import { AlertItem, AlertSeverity, RiskAssessment, WeatherObservation, LocationData } from '@/types';

export interface AlertRuleThresholds {
  heavyRainfallMm24h: number; // e.g. 64.5 mm
  cloudburstRateMmHr: number; // e.g. 30.0 mm/hr
  waterLevelWarningRatio: number; // e.g. 0.85
  waterLevelDangerRatio: number; // e.g. 1.00
  riskScoreWarning: number; // e.g. 70
}

export const DEFAULT_THRESHOLDS: AlertRuleThresholds = {
  heavyRainfallMm24h: 64.5,
  cloudburstRateMmHr: 25.0,
  waterLevelWarningRatio: 0.85,
  waterLevelDangerRatio: 1.00,
  riskScoreWarning: 70,
};

export function evaluateAlertRules(
  location: LocationData,
  weather: WeatherObservation,
  assessment: RiskAssessment,
  waterLevelMeters = 3.6,
  dangerLevelMeters = 4.8,
  thresholds: AlertRuleThresholds = DEFAULT_THRESHOLDS
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date().toISOString();

  // Rule 1: Cloudburst / Extreme Downpour Rate
  if (weather.currentPrecipitationMmHr >= thresholds.cloudburstRateMmHr) {
    alerts.push({
      id: `alert-rate-${location.id}-${Date.now()}`,
      severity: 'emergency',
      title: 'FLASH FLOOD EMERGENCY: Extreme Rainfall Rate Detected',
      locationName: location.name,
      timestamp: now,
      triggerMetric: 'Hourly Precipitation Intensity',
      triggerValue: `${weather.currentPrecipitationMmHr.toFixed(1)} mm/hr (Threshold: ${thresholds.cloudburstRateMmHr} mm/hr)`,
      freshness: '1m ago',
      source: weather.source,
      recommendedAction: 'Immediate evacuation of underground basements, low-lying storm channels, and railway underpasses.',
      acknowledged: false,
      isDemonstrationAlert: false,
      multilingual: {
        en: `EMERGENCY ALERT: Extreme rainfall intensity (${weather.currentPrecipitationMmHr.toFixed(1)} mm/h) detected in ${location.name}. Move to higher floors immediately.`,
        kn: `ತುರ್ತು ಎಚ್ಚರಿಕೆ: ${location.name} ನಲ್ಲಿ ತೀವ್ರ ಮಳೆಯಾಗುತ್ತಿದೆ (${weather.currentPrecipitationMmHr.toFixed(1)} mm/h). ತಕ್ಷಣ ಎತ್ತರದ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಿ.`,
        hi: `आपातकालीन चेतावनी: ${location.name} में अत्यधिक भारी बारिश (${weather.currentPrecipitationMmHr.toFixed(1)} mm/h)। तुरंत सुरक्षित ऊंचे स्थान पर जाएं।`,
        ta: `அவசர எச்சரிக்கை: ${location.name} பகுதியில் மிக பலத்த மழை (${weather.currentPrecipitationMmHr.toFixed(1)} mm/h). உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.`,
      },
    });
  }

  // Rule 2: 24h Heavy Rainfall Accumulation
  if (weather.past24hRainfallMm >= thresholds.heavyRainfallMm24h) {
    const isVeryHeavy = weather.past24hRainfallMm >= 115.5;
    const severity: AlertSeverity = isVeryHeavy ? 'warning' : 'watch';
    
    alerts.push({
      id: `alert-rain24-${location.id}-${Date.now()}`,
      severity,
      title: `${isVeryHeavy ? 'ORANGE WARNING' : 'YELLOW WATCH'}: ${assessment.imdClassification}`,
      locationName: location.name,
      timestamp: now,
      triggerMetric: '24h Accumulated Rainfall',
      triggerValue: `${weather.past24hRainfallMm.toFixed(1)} mm (Threshold: ${thresholds.heavyRainfallMm24h} mm)`,
      freshness: '5m ago',
      source: weather.source,
      recommendedAction: 'ULBs inspect secondary storm drains. Citizens avoid non-essential commute across low bridges.',
      acknowledged: false,
      isDemonstrationAlert: false,
      multilingual: {
        en: `FLOOD WATCH: ${weather.past24hRainfallMm.toFixed(1)} mm rainfall recorded in 24h across ${location.name}. Waterlogging expected on low-lying roads.`,
        kn: `ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ: ${location.name} ವ್ಯಾಪ್ತಿಯಲ್ಲಿ 24 ಗಂಟೆಗಳಲ್ಲಿ ${weather.past24hRainfallMm.toFixed(1)} mm ಮಳೆ ದಾಖಲಾಗಿದೆ. ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲುವ ಸಾಧ್ಯತೆ.`,
        hi: `बाढ़ की चेतावनी: ${location.name} में 24 घंटों में ${weather.past24hRainfallMm.toFixed(1)} mm बारिश दर्ज की गई। निचले इलाकों में जलभराव की संभावना।`,
        ta: `வெள்ள எச்சரிக்கை: ${location.name} பகுதியில் 24 மணி நேரத்தில் ${weather.past24hRainfallMm.toFixed(1)} mm மழை பதிவாகியுள்ளது. தாழ்வான சாலைகளில் வெள்ளப்பெருக்கு அபாயம்.`,
      },
    });
  }

  // Rule 3: Water Level River Stage vs Danger Mark
  const waterRatio = waterLevelMeters / dangerLevelMeters;
  if (waterRatio >= thresholds.waterLevelDangerRatio) {
    alerts.push({
      id: `alert-river-danger-${location.id}-${Date.now()}`,
      severity: 'emergency',
      title: 'CRITICAL RIVER STAGE: Water Exceeds Danger Mark',
      locationName: location.name,
      timestamp: now,
      triggerMetric: 'CWC Telemetry Water Level',
      triggerValue: `${waterLevelMeters.toFixed(2)}m (Danger Level: ${dangerLevelMeters.toFixed(2)}m)`,
      freshness: '2m ago',
      source: 'CWC Telemetry AWLR',
      recommendedAction: 'Initiate targeted evacuation of riverbanks and rajakaluve buffer zones. Deploy NDRF swift-water rescue teams.',
      acknowledged: false,
      isDemonstrationAlert: false,
      multilingual: {
        en: `CRITICAL RIVER ALERT: River stage at ${location.name} has breached the Danger Mark (${waterLevelMeters.toFixed(2)}m). Evacuate bank buffer zones.`,
        kn: `ನದಿ ಪ್ರವಾಹ ಅಪಾಯ: ${location.name} ನದಿ ನೀರಿನ ಮಟ್ಟ ಅಪಾಯದ ಮಟ್ಟವನ್ನು (${waterLevelMeters.toFixed(2)}m) ಮೀರಿದೆ. ನದಿ ತೀರದ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಸ್ಥಳಾಂತರಗೊಳ್ಳಿ.`,
        hi: `गंभीर नदी जलस्तर चेतावनी: ${location.name} में जलस्तर खतरे के निशान (${waterLevelMeters.toFixed(2)}m) को पार कर गया है। तटवर्ती इलाकों को खाली करें।`,
        ta: `ஆற்று வெள்ள அபாயம்: ${location.name} ஆற்றில் நீர்மட்டம் அபாய அளவை (${waterLevelMeters.toFixed(2)}m) தாண்டியுள்ளது. உடனடியாக பாதுகாப்பான இடத்திற்கு வெளியேறவும்.`,
      },
    });
  } else if (waterRatio >= thresholds.waterLevelWarningRatio) {
    alerts.push({
      id: `alert-river-watch-${location.id}-${Date.now()}`,
      severity: 'watch',
      title: 'HYDROLOGICAL WATCH: River Stage Nearing Warning Mark',
      locationName: location.name,
      timestamp: now,
      triggerMetric: 'CWC Telemetry Water Level',
      triggerValue: `${waterLevelMeters.toFixed(2)}m (${Math.round(waterRatio * 100)}% of danger mark)`,
      freshness: '6m ago',
      source: 'CWC Telemetry AWLR',
      recommendedAction: 'Pre-alert municipal pump operators. Clear trash screens at culverts.',
      acknowledged: false,
      isDemonstrationAlert: false,
      multilingual: {
        en: `HYDROLOGICAL WATCH: Water level at ${location.name} is rising rapidly (${waterLevelMeters.toFixed(2)}m). Stay vigilant.`,
        kn: `ಜಲಮಟ್ಟ ವೀಕ್ಷಣೆ: ${location.name} ನಲ್ಲಿ ನೀರಿನ ಮಟ್ಟ ವೇಗವಾಗಿ ಏರುತ್ತಿದೆ (${waterLevelMeters.toFixed(2)}m). ಜಾಗರೂಕರಾಗಿರಿ.`,
        hi: `जलस्तर अलर्ट: ${location.name} में जलस्तर तेजी से बढ़ रहा है (${waterLevelMeters.toFixed(2)}m)। सतर्क रहें।`,
        ta: `நீர்மட்ட கண்காணிப்பு: ${location.name} பகுதியில் நீர்மட்டம் உயர்ந்து வருகிறது (${waterLevelMeters.toFixed(2)}m). விழிப்புடன் இருங்கள்.`,
      },
    });
  }

  // Fallback advisory if no high-severity alerts triggered
  if (alerts.length === 0) {
    alerts.push({
      id: `alert-advisory-${location.id}-${Date.now()}`,
      severity: 'advisory',
      title: 'ROUTINE DISASTER MANAGEMENT ADVISORY',
      locationName: location.name,
      timestamp: now,
      triggerMetric: 'Composite Risk Heuristic',
      triggerValue: `${assessment.overallScore}/100 (${assessment.severityLevel})`,
      freshness: '10m ago',
      source: 'FLOODX Edge Heuristic Engine',
      recommendedAction: 'Normal status. Maintain automated telemetry monitoring and drain clearance schedules.',
      acknowledged: true,
      isDemonstrationAlert: false,
      multilingual: {
        en: `ADVISORY: Flood conditions in ${location.name} are currently nominal (${assessment.severityLevel} Risk).`,
        kn: `ಮಾಹಿತಿ: ${location.name} ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಪ್ರವಾಹ ಪರಿಸ್ಥಿತಿ ಸದ್ಯಕ್ಕೆ ಸಹಜವಾಗಿದೆ (${assessment.severityLevel} ರಿಸ್ಕ್).`,
        hi: `सलाह: ${location.name} में बाढ़ की स्थिति सामान्य है (${assessment.severityLevel} जोखिम)।`,
        ta: `தகவல்: ${location.name} பகுதியில் வெள்ள நிலைமை தற்போது இயல்பாக உள்ளது (${assessment.severityLevel} ஆபத்து).`,
      },
    });
  }

  return alerts;
}

/**
 * Generate a synthetic demonstration alert for UI testing / hackathon presentations
 */
export function createDemonstrationAlert(location: LocationData, severity: AlertSeverity = 'warning'): AlertItem {
  return {
    id: `demo-alert-${Date.now()}`,
    severity,
    title: `[DEMO ALERT] Simulated ${severity.toUpperCase()} Inundation Advisory`,
    locationName: location.name,
    timestamp: new Date().toISOString(),
    triggerMetric: 'Demonstration Injected Trigger',
    triggerValue: 'Synthetic Cloudburst Event (+45mm/h)',
    freshness: 'Just now',
    source: 'FLOODX Simulation Studio (Synthetic)',
    recommendedAction: 'DEMO ONLY: Verify that emergency sirens, mobile push notifications, and shelter routing triggers respond appropriately.',
    acknowledged: false,
    isDemonstrationAlert: true,
    multilingual: {
      en: `[DEMO] Synthetic ${severity} flood notification generated for testing disaster response workflows in ${location.name}.`,
      kn: `[ಡೆಮೊ] ${location.name} ನಲ್ಲಿ ಪರೀಕ್ಷಾರ್ಥ ತುರ್ತು ಮುನ್ಸೂಚನೆ ಎಚ್ಚರಿಕೆ.`,
      hi: `[डेमो] ${location.name} में आपदा प्रतिक्रिया परीक्षण हेतु सिमुलेटेड अलर्ट।`,
      ta: `[டெமோ] ${location.name} பகுதியில் ஒத்திகை வெள்ள அவசர அறிவிப்பு.`,
    },
  };
}
