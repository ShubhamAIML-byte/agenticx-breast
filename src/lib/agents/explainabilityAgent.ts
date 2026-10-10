/**
 * AgenticX-Breast: Explainability Agent (Agent 2)
 * Computes exact TreeSHAP attributions, checks mathematical additivity, and identifies pathology drivers.
 */

import { PredictionAndShapResult } from '../ml/treeShapEngine';
import { ExplainabilityAgentOutput } from './types';

export function runExplainabilityAgent(
  mlResult: PredictionAndShapResult
): ExplainabilityAgentOutput {
  const startTime = performance.now();

  // 1. Determine dominant pathological dimension based on top SHAP features
  let contourPointsWeight = 0;
  let nuclearSizeWeight = 0;
  let chromatinTextureWeight = 0;

  mlResult.shapContributions.slice(0, 5).forEach((item) => {
    const f = item.feature.toLowerCase();
    if (f.includes('concav') || f.includes('compact') || f.includes('fractal')) {
      contourPointsWeight += item.absShap;
    } else if (f.includes('radius') || f.includes('perimeter') || f.includes('area')) {
      nuclearSizeWeight += item.absShap;
    } else if (f.includes('texture') || f.includes('smoothness') || f.includes('symmetry')) {
      chromatinTextureWeight += item.absShap;
    }
  });

  let dominantPathologyDimension = 'Nuclear Contour Indentation / Atypia';
  if (nuclearSizeWeight > contourPointsWeight && nuclearSizeWeight > chromatinTextureWeight) {
    dominantPathologyDimension = 'Nuclear Pleomorphism & Megakaryocytic Size Expansion';
  } else if (chromatinTextureWeight > contourPointsWeight && chromatinTextureWeight > nuclearSizeWeight) {
    dominantPathologyDimension = 'Chromatin Texture Heterogeneity & Nuclear Envelope Irregularity';
  }

  // 2. Additivity verification: sum(phi_i) + base_value ~ rawMargin
  const isAdditivityVerified = mlResult.additivityDiscrepancy < 0.05;

  const executionTimeMs = performance.now() - startTime;

  return {
    status: isAdditivityVerified ? 'success' : 'warning',
    baseValue: mlResult.baseValue,
    topRiskIncreasing: mlResult.topRiskIncreasing,
    topRiskDecreasing: mlResult.topRiskDecreasing,
    allContributions: mlResult.shapContributions,
    dominantPathologyDimension,
    additivityVerified: isAdditivityVerified,
    additivityDiscrepancy: mlResult.additivityDiscrepancy,
    executionTimeMs,
  };
}
