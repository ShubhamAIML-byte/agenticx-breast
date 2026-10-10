import { NextRequest, NextResponse } from 'next/server';
import { computeModelPredictionAndShap } from '@/lib/ml/treeShapEngine';
import modelData from '@/lib/ml/model_data.json';

export const runtime = 'nodejs';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 1.0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baselineFeatures, featureToPerturb, perturbationSteps } = body;

    if (!baselineFeatures || !featureToPerturb) {
      return NextResponse.json(
        { error: 'baselineFeatures and featureToPerturb are required.' },
        { status: 400 }
      );
    }

    const steps: number[] = perturbationSteps || [-20, -10, -5, 0, 5, 10, 20];
    const baseResult = computeModelPredictionAndShap(baselineFeatures);
    const featureNames = modelData.feature_names;
    const featIdx = featureNames.indexOf(featureToPerturb);

    if (featIdx === -1) {
      return NextResponse.json(
        { error: `Feature '${featureToPerturb}' is not a valid WDBC feature.` },
        { status: 400 }
      );
    }

    const baseVal = baselineFeatures[featureToPerturb] ?? 0;
    const baseShap = baseResult.shapValues[featIdx];

    const results = steps.map((pct) => {
      const multiplier = 1 + pct / 100;
      const perturbedFeatures = { ...baselineFeatures, [featureToPerturb]: baseVal * multiplier };
      const perturbedResult = computeModelPredictionAndShap(perturbedFeatures);
      const perturbedShap = perturbedResult.shapValues[featIdx];
      const stabilityIndex = cosineSimilarity(baseResult.shapValues, perturbedResult.shapValues);

      return {
        percentageShift: pct,
        featureValue: Math.round(baseVal * multiplier * 1000) / 1000,
        probability: Math.round(perturbedResult.probability * 10000) / 100,
        predictedLabel: perturbedResult.predictedLabel,
        featureShap: Math.round(perturbedShap * 10000) / 10000,
        shapDelta: Math.round((perturbedShap - baseShap) * 10000) / 10000,
        explanationStabilityIndex: Math.round(stabilityIndex * 10000) / 10000,
      };
    });

    return NextResponse.json({
      feature: featureToPerturb,
      baselineValue: baseVal,
      baselineProbability: Math.round(baseResult.probability * 10000) / 100,
      baselineLabel: baseResult.predictedLabel,
      baselineShap: Math.round(baseShap * 10000) / 10000,
      perturbations: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Robustness computation failed' }, { status: 500 });
  }
}
