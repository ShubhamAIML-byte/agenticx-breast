import { NextRequest, NextResponse } from 'next/server';
import { orchestrateBreastCancerCase } from '@/lib/agents/orchestrator';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { features, metadata } = body;

    if (!features || typeof features !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: "features" object is required with numerical WDBC attributes.' },
        { status: 400 }
      );
    }

    const result = await orchestrateBreastCancerCase(features, metadata);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in /api/predict:', error);
    return NextResponse.json(
      {
        error: 'Failed to process case',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
