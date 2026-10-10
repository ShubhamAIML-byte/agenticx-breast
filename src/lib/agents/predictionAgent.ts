/**
 * AgenticX-Breast: Prediction Agent (Agent 1)
 * Validates inputs, executes tree ensemble inference, and computes calibrated risk metrics.
 */

import { computeModelPredictionAndShap } from '../ml/treeShapEngine';
import { PredictionAgentOutput, RiskTier } from './types';
import modelData from '../ml/model_data.json';

export function runPredictionAgent(
  inputFeatures: Record<string, number>
): { predictionOutput: PredictionAgentOutput; rawResult: ReturnType<typeof computeModelPredictionAndShap> } {
  const startTime = performance.now();
  const warnings: string[] = [];
  const stats = modelData.feature_stats as Record<string, any>;
  const featureNames = modelData.feature_names;

  // 1. Validate inputs and detect out-of-distribution values
  for (const feat of featureNames) {
    const val = inputFeatures[feat];
    if (val === undefined || isNaN(val)) {
      warnings.push(`Feature '${feat}' is missing or NaN; imputed using training median.`);
    } else {
      const featStat = stats[feat]?.overall;
      if (featStat) {
        if (val < featStat.min || val > featStat.max) {
          warnings.push(
            `Feature '${feat}' value (${val}) is outside training range [${featStat.min.toFixed(2)}, ${featStat.max.toFixed(2)}].`
          );
        }
      }
    }
  }

  // 2. Execute inference
  const mlResult = computeModelPredictionAndShap(inputFeatures);

  // 3. Calibrate risk tier
  let riskTier: RiskTier = 'low';
  let confidenceDescriptor = '';

  const prob = mlResult.probability;
  if (prob >= 0.90) {
    riskTier = 'very_high';
    confidenceDescriptor = 'High Confidence Malignancy Profile';
  } else if (prob >= 0.60) {
    riskTier = 'high';
    confidenceDescriptor = 'Suspicious / Elevated Risk of Malignancy';
  } else if (prob >= 0.30) {
    riskTier = 'indeterminate';
    confidenceDescriptor = 'Borderline / Diagnostic Uncertainty Zone';
  } else {
    riskTier = 'low';
    confidenceDescriptor = 'Low Risk / Consistent with Benign Cytology';
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    predictionOutput: {
      status: warnings.length > 5 ? 'warning' : 'success',
      predictedLabel: mlResult.predictedLabel,
      predictedClass: mlResult.predictedClass,
      probability: mlResult.probability,
      calibratedPercentage: Math.round(mlResult.probability * 1000) / 10,
      rawMargin: mlResult.rawMargin,
      riskTier,
      confidenceDescriptor,
      outOfDistributionWarnings: warnings.slice(0, 3),
      executionTimeMs,
    },
    rawResult: mlResult,
  };
}
