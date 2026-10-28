import { NextResponse } from 'next/server';
import { SUPPORTED_LOCATIONS } from '@/data/mock-locations';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase();

  let locations = SUPPORTED_LOCATIONS;
  if (query) {
    locations = locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.catchmentBasin.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    success: true,
    count: locations.length,
    data: locations,
  });
}
