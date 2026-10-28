import { NextResponse } from 'next/server';
import { LocationData, WeatherObservation, HydrologicalMetrics } from '@/types';
import { computeRiskAssessment } from '@/lib/hydrology-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, weather, hydrology } = body as {
      location: LocationData;
      weather: WeatherObservation;
      hydrology?: Partial<HydrologicalMetrics>;
    };

    if (!location || !weather) {
      return NextResponse.json(
        { success: false, error: 'Both location and weather payloads are required.' },
        { status: 400 }
      );
    }

    const assessment = computeRiskAssessment(location, weather, hydrology);
    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal evaluation failure.' },
      { status: 500 }
    );
  }
}
