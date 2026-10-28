import { NextResponse } from 'next/server';
import { SUPPORTED_LOCATIONS } from '@/data/mock-locations';
import { getFallbackWeatherData } from '@/lib/open-meteo-adapter';
import { computeRiskAssessment } from '@/lib/hydrology-engine';
import { evaluateAlertRules } from '@/lib/alert-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get('locationId') || SUPPORTED_LOCATIONS[0].id;
  const loc = SUPPORTED_LOCATIONS.find((l) => l.id === locationId) || SUPPORTED_LOCATIONS[0];

  const weather = getFallbackWeatherData(loc.lat, loc.lng, loc.name);
  const assessment = computeRiskAssessment(loc, weather);
  const alerts = evaluateAlertRules(loc, weather, assessment);

  return NextResponse.json({
    success: true,
    location: loc.name,
    count: alerts.length,
    data: alerts,
  });
}
