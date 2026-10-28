import { NextResponse } from 'next/server';
import { RiskAssessment, LocationData, SimulationParameters } from '@/types';
import { runWhatIfSimulation } from '@/lib/hydrology-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { baseline, location, parameters } = body as {
      baseline: RiskAssessment;
      location: LocationData;
      parameters: SimulationParameters;
    };

    if (!baseline || !location || !parameters) {
      return NextResponse.json(
        { success: false, error: 'baseline, location, and parameters are required.' },
        { status: 400 }
      );
    }

    const result = runWhatIfSimulation(baseline, location, parameters);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Simulation processing failed.' },
      { status: 500 }
    );
  }
}
