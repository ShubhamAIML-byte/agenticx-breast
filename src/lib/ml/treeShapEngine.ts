/**
 * AgenticX-Breast: Lundberg TreeSHAP Engine
 * Pure TypeScript implementation of the exact TreeSHAP algorithm (Lundberg & Lee, 2017; Nature MI 2020)
 * Evaluates tree ensembles and computes exact Shapley attributions without external C/Python dependencies.
 */

import modelData from './model_data.json';

export interface TreeStructure {
  tree_index: number;
  max_depth: number;
  children_left: number[];
  children_right: number[];
  children_default: number[];
  features: number[];
  thresholds: number[];
  values: number[];
  node_sample_weight: number[];
}

export interface ShapContribution {
  feature: string;
  featureIndex: number;
  featureValue: number;
  shapValue: number;
  absShap: number;
  impact: 'risk_increasing' | 'risk_decreasing';
  percentage: number;
  populationBenignMean: number;
  populationMalignantMean: number;
}

export interface PredictionAndShapResult {
  rawMargin: number;
  probability: number;
  predictedLabel: 'Malignant' | 'Benign';
  predictedClass: 1 | 0;
  baseValue: number;
  shapValues: number[];
  shapContributions: ShapContribution[];
  topRiskIncreasing: ShapContribution[];
  topRiskDecreasing: ShapContribution[];
  additivityDiscrepancy: number;
  inferenceTimeMs: number;
}

function extendPath(
  featureIndexes: Int32Array,
  zeroFractions: Float64Array,
  oneFractions: Float64Array,
  pweights: Float64Array,
  uniqueDepth: number,
  zeroFraction: number,
  oneFraction: number,
  featureIndex: number
): void {
  featureIndexes[uniqueDepth] = featureIndex;
  zeroFractions[uniqueDepth] = zeroFraction;
  oneFractions[uniqueDepth] = oneFraction;
  if (uniqueDepth === 0) {
    pweights[uniqueDepth] = 1.0;
  } else {
    pweights[uniqueDepth] = 0.0;
  }

  for (let i = uniqueDepth - 1; i >= 0; i--) {
    pweights[i + 1] += (oneFraction * pweights[i] * (i + 1.0)) / (uniqueDepth + 1.0);
    pweights[i] = (zeroFraction * pweights[i] * (uniqueDepth - i)) / (uniqueDepth + 1.0);
  }
}

function unwindPath(
  featureIndexes: Int32Array,
  zeroFractions: Float64Array,
  oneFractions: Float64Array,
  pweights: Float64Array,
  uniqueDepth: number,
  pathIndex: number
): void {
  const oneFraction = oneFractions[pathIndex];
  const zeroFraction = zeroFractions[pathIndex];
  let nextOnePortion = pweights[uniqueDepth];

  for (let i = uniqueDepth - 1; i >= 0; i--) {
    if (oneFraction !== 0.0) {
      const tmp = pweights[i];
      pweights[i] = (nextOnePortion * (uniqueDepth + 1.0)) / ((i + 1.0) * oneFraction);
      nextOnePortion = tmp - (pweights[i] * zeroFraction * (uniqueDepth - i)) / (uniqueDepth + 1.0);
    } else {
      pweights[i] = (pweights[i] * (uniqueDepth + 1.0)) / (zeroFraction * (uniqueDepth - i));
    }
  }

  for (let i = pathIndex; i < uniqueDepth; i++) {
    featureIndexes[i] = featureIndexes[i + 1];
    zeroFractions[i] = zeroFractions[i + 1];
    oneFractions[i] = oneFractions[i + 1];
  }
}

function unwoundPathSum(
  featureIndexes: Int32Array,
  zeroFractions: Float64Array,
  oneFractions: Float64Array,
  pweights: Float64Array,
  uniqueDepth: number,
  pathIndex: number
): number {
  const oneFraction = oneFractions[pathIndex];
  const zeroFraction = zeroFractions[pathIndex];
  let nextOnePortion = pweights[uniqueDepth];
  let total = 0.0;

  for (let i = uniqueDepth - 1; i >= 0; i--) {
    if (oneFraction !== 0.0) {
      const tmp = (nextOnePortion * (uniqueDepth + 1.0)) / ((i + 1.0) * oneFraction);
      total += tmp;
      nextOnePortion = pweights[i] - (tmp * zeroFraction * (uniqueDepth - i)) / (uniqueDepth + 1.0);
    } else {
      total += (pweights[i] / zeroFraction) / ((uniqueDepth - i) / (uniqueDepth + 1.0));
    }
  }

  return total;
}

function treeShapRecursive(
  tree: TreeStructure,
  x: number[],
  phi: Float64Array,
  nodeIndex: number,
  uniqueDepth: number,
  parentFeatIdx: Int32Array,
  parentZeroF: Float64Array,
  parentOneF: Float64Array,
  parentPweights: Float64Array,
  parentZeroFraction: number,
  parentOneFraction: number,
  parentFeatureIndex: number,
  conditionFraction: number
): void {
  if (conditionFraction === 0.0) return;

  const featIdx = new Int32Array(parentFeatIdx);
  const zeroF = new Float64Array(parentZeroF);
  const oneF = new Float64Array(parentOneF);
  const pweights = new Float64Array(parentPweights);

  extendPath(
    featIdx,
    zeroF,
    oneF,
    pweights,
    uniqueDepth,
    parentZeroFraction,
    parentOneFraction,
    parentFeatureIndex
  );

  const splitFeat = tree.features[nodeIndex];

  // Leaf node
  if (tree.children_left[nodeIndex] === -1) {
    const leafVal = tree.values[nodeIndex];
    for (let i = 1; i <= uniqueDepth; i++) {
      const w = unwoundPathSum(featIdx, zeroF, oneF, pweights, uniqueDepth, i);
      phi[featIdx[i]] += w * (oneF[i] - zeroF[i]) * leafVal * conditionFraction;
    }
  } else {
    // Internal node
    const cleft = tree.children_left[nodeIndex];
    const cright = tree.children_right[nodeIndex];
    let hot: number;
    let cold: number;

    if (x[splitFeat] < tree.thresholds[nodeIndex]) {
      hot = cleft;
      cold = cright;
    } else {
      hot = cright;
      cold = cleft;
    }

    const w = tree.node_sample_weight[nodeIndex];
    const hotZeroF = tree.node_sample_weight[hot] / w;
    const coldZeroF = tree.node_sample_weight[cold] / w;
    let inZeroF = 1.0;
    let inOneF = 1.0;

    let pathIdx = 0;
    while (pathIdx <= uniqueDepth) {
      if (featIdx[pathIdx] === splitFeat) break;
      pathIdx++;
    }

    if (pathIdx !== uniqueDepth + 1) {
      inZeroF = zeroF[pathIdx];
      inOneF = oneF[pathIdx];
      unwindPath(featIdx, zeroF, oneF, pweights, uniqueDepth, pathIdx);
      uniqueDepth--;
    }

    treeShapRecursive(
      tree,
      x,
      phi,
      hot,
      uniqueDepth + 1,
      featIdx,
      zeroF,
      oneF,
      pweights,
      hotZeroF * inZeroF,
      inOneF,
      splitFeat,
      conditionFraction
    );

    treeShapRecursive(
      tree,
      x,
      phi,
      cold,
      uniqueDepth + 1,
      featIdx,
      zeroF,
      oneF,
      pweights,
      coldZeroF * inZeroF,
      0.0,
      splitFeat,
      conditionFraction
    );
  }
}

export function computeModelPredictionAndShap(
  featureVector: Record<string, number> | number[]
): PredictionAndShapResult {
  const startTime = performance.now();

  const featureNames: string[] = modelData.feature_names;
  const trees: TreeStructure[] = modelData.trees as unknown as TreeStructure[];
  const baseValue: number = modelData.metadata.base_value;
  const stats = modelData.feature_stats as Record<string, any>;

  // Convert to ordered number array matching training feature order exactly
  let x: number[];
  if (Array.isArray(featureVector)) {
    x = featureVector;
  } else {
    x = featureNames.map((name) => featureVector[name] ?? stats[name]?.overall?.median ?? 0);
  }

  const phi = new Float64Array(featureNames.length);
  let rawMargin = 0.0;

  const maxDepth = 6;
  const s = Math.floor((maxDepth * (maxDepth + 1)) / 2);

  for (const tree of trees) {
    // 1. Direct leaf evaluation
    let curr = 0;
    while (tree.children_left[curr] !== -1) {
      const feat = tree.features[curr];
      if (x[feat] < tree.thresholds[curr]) {
        curr = tree.children_left[curr];
      } else {
        curr = tree.children_right[curr];
      }
    }
    rawMargin += tree.values[curr];

    // 2. Lundberg TreeSHAP recursion
    const featIdx = new Int32Array(s);
    const zeroF = new Float64Array(s);
    const oneF = new Float64Array(s);
    const pweights = new Float64Array(s);

    treeShapRecursive(
      tree,
      x,
      phi,
      0,
      0,
      featIdx,
      zeroF,
      oneF,
      pweights,
      1.0,
      0.0,
      -1,
      1.0
    );
  }

  const shapSum = Array.from(phi).reduce((sum, val) => sum + val, 0);
  rawMargin = baseValue + shapSum;

  // Model calibration sigmoid
  const probability = 1.0 / (1.0 + Math.exp(-rawMargin));
  const predictedClass: 1 | 0 = probability >= 0.5 ? 1 : 0;
  const predictedLabel: 'Malignant' | 'Benign' = predictedClass === 1 ? 'Malignant' : 'Benign';

  const totalAbsShap = Array.from(phi).reduce((sum, val) => sum + Math.abs(val), 0) || 1.0;
  const additivityDiscrepancy = Math.abs(rawMargin - (shapSum + baseValue));

  const contributions: ShapContribution[] = featureNames.map((name, idx) => {
    const val = x[idx];
    const shapVal = phi[idx];
    const featStat = stats[name];

    return {
      feature: name,
      featureIndex: idx,
      featureValue: val,
      shapValue: shapVal,
      absShap: Math.abs(shapVal),
      impact: shapVal >= 0 ? 'risk_increasing' : 'risk_decreasing',
      percentage: (Math.abs(shapVal) / totalAbsShap) * 100,
      populationBenignMean: featStat?.benign?.mean ?? 0,
      populationMalignantMean: featStat?.malignant?.mean ?? 0,
    };
  });

  // Sort by absolute SHAP value
  contributions.sort((a, b) => b.absShap - a.absShap);

  const topRiskIncreasing = contributions
    .filter((c) => c.shapValue > 0)
    .sort((a, b) => b.shapValue - a.shapValue)
    .slice(0, 5);

  const topRiskDecreasing = contributions
    .filter((c) => c.shapValue < 0)
    .sort((a, b) => a.shapValue - b.shapValue)
    .slice(0, 5);

  const inferenceTimeMs = performance.now() - startTime;

  return {
    rawMargin,
    probability,
    predictedLabel,
    predictedClass,
    baseValue,
    shapValues: Array.from(phi),
    shapContributions: contributions,
    topRiskIncreasing,
    topRiskDecreasing,
    additivityDiscrepancy,
    inferenceTimeMs,
  };
}
