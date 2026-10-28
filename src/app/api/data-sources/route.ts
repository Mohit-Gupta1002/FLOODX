import { NextResponse } from 'next/server';
import { INITIAL_DATA_SOURCES } from '@/data/mock-locations';

export async function GET() {
  return NextResponse.json({
    success: true,
    totalSources: INITIAL_DATA_SOURCES.length,
    timestamp: new Date().toISOString(),
    data: INITIAL_DATA_SOURCES,
  });
}
