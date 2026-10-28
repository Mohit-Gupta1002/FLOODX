import { NextResponse } from 'next/server';
import { fetchLiveWeatherData, getFallbackWeatherData } from '@/lib/open-meteo-adapter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9352');
  const lng = parseFloat(searchParams.get('lng') || '77.6744');
  const name = searchParams.get('name') || 'Bengaluru';

  try {
    const weather = await fetchLiveWeatherData(lat, lng, name);
    return NextResponse.json({
      success: true,
      data: weather,
    });
  } catch (error: any) {
    const fallback = getFallbackWeatherData(lat, lng, name);
    return NextResponse.json({
      success: true,
      data: fallback,
      warning: 'Live meteorological link unavailable, serving calibrated station benchmark.',
    });
  }
}
