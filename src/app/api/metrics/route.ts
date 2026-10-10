import { NextResponse } from 'next/server';
import modelData from '@/lib/ml/model_data.json';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({
      metadata: modelData.metadata,
      feature_names: modelData.feature_names,
      feature_stats: modelData.feature_stats,
      metrics: modelData.metrics,
      roc_curve: modelData.roc_curve,
      pr_curve: modelData.pr_curve,
      calibration_curve: modelData.calibration_curve,
      global_importance: modelData.global_importance,
      presets: modelData.presets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load metrics' }, { status: 500 });
  }
}
