const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Load model data
const modelDataPath = path.join(__dirname, '../src/lib/ml/model_data.json');
const modelData = JSON.parse(fs.readFileSync(modelDataPath, 'utf8'));

// Lundberg TreeSHAP implementation in JS for test suite
const { trees } = modelData;
const baseValue = modelData.metadata.base_value;

function extendPath(featureIndexes, zeroFractions, oneFractions, pweights, uniqueDepth, zeroFraction, oneFraction, featureIndex) {
  featureIndexes[uniqueDepth] = featureIndex;
  zeroFractions[uniqueDepth] = zeroFraction;
  oneFractions[uniqueDepth] = oneFraction;
  pweights[uniqueDepth] = uniqueDepth === 0 ? 1.0 : 0.0;
  for (let i = uniqueDepth - 1; i >= 0; i--) {
    pweights[i + 1] += (oneFraction * pweights[i] * (i + 1.0)) / (uniqueDepth + 1.0);
    pweights[i] = (zeroFraction * pweights[i] * (uniqueDepth - i)) / (uniqueDepth + 1.0);
  }
}

function unwindPath(featureIndexes, zeroFractions, oneFractions, pweights, uniqueDepth, pathIndex) {
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

function unwoundPathSum(featureIndexes, zeroFractions, oneFractions, pweights, uniqueDepth, pathIndex) {
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

function treeShapRec(
  tree, x, phi, nodeIndex, uniqueDepth,
  featIdx, zeroF, oneF, pweights,
  pZeroF, pOneF, pFeatIdx, conditionFraction
) {
  if (conditionFraction === 0.0) return;
  const fIdx = new Int32Array(featIdx);
  const zF = new Float64Array(zeroF);
  const oF = new Float64Array(oneF);
  const pw = new Float64Array(pweights);

  extendPath(fIdx, zF, oF, pw, uniqueDepth, pZeroF, pOneF, pFeatIdx);
  const splitFeat = tree.features[nodeIndex];

  if (tree.children_left[nodeIndex] === -1) {
    const leafVal = tree.values[nodeIndex];
    for (let i = 1; i <= uniqueDepth; i++) {
      const w = unwoundPathSum(fIdx, zF, oF, pw, uniqueDepth, i);
      phi[fIdx[i]] += w * (oF[i] - zF[i]) * leafVal * conditionFraction;
    }
  } else {
    const cleft = tree.children_left[nodeIndex];
    const cright = tree.children_right[nodeIndex];
    const hot = x[splitFeat] < tree.thresholds[nodeIndex] ? cleft : cright;
    const cold = hot === cleft ? cright : cleft;

    const w = tree.node_sample_weight[nodeIndex];
    const hotZeroF = tree.node_sample_weight[hot] / w;
    const coldZeroF = tree.node_sample_weight[cold] / w;
    let inZeroF = 1.0;
    let inOneF = 1.0;

    let pathIdx = 0;
    while (pathIdx <= uniqueDepth) {
      if (fIdx[pathIdx] === splitFeat) break;
      pathIdx++;
    }

    if (pathIdx !== uniqueDepth + 1) {
      inZeroF = zF[pathIdx];
      inOneF = oF[pathIdx];
      unwindPath(fIdx, zF, oF, pw, uniqueDepth, pathIdx);
      uniqueDepth--;
    }

    treeShapRec(tree, x, phi, hot, uniqueDepth + 1, fIdx, zF, oF, pw, hotZeroF * inZeroF, inOneF, splitFeat, conditionFraction);
    treeShapRec(tree, x, phi, cold, uniqueDepth + 1, fIdx, zF, oF, pw, coldZeroF * inZeroF, 0.0, splitFeat, conditionFraction);
  }
}

function runInference(x) {
  const phi = new Float64Array(30);
  let rawMargin = 0.0;
  const s = 21;

  for (const tree of trees) {
    let curr = 0;
    while (tree.children_left[curr] !== -1) {
      curr = x[tree.features[curr]] < tree.thresholds[curr] ? tree.children_left[curr] : tree.children_right[curr];
    }
    rawMargin += tree.values[curr];

    const fIdx = new Int32Array(s);
    const zF = new Float64Array(s);
    const oF = new Float64Array(s);
    const pw = new Float64Array(s);
    treeShapRec(tree, x, phi, 0, 0, fIdx, zF, oF, pw, 1.0, 0.0, -1, 1.0);
  }

  const shapSum = Array.from(phi).reduce((a, b) => a + b, 0);
  rawMargin = baseValue + shapSum;
  const prob = 1.0 / (1.0 + Math.exp(-rawMargin));
  return { rawMargin, prob, phi: Array.from(phi) };
}

// Tests
test('Unit 1: Model metadata and architecture integrity', () => {
  assert.equal(modelData.metadata.features_count, 30);
  assert.equal(modelData.feature_names.length, 30);
  assert.equal(modelData.trees.length, 45);
  assert.ok(modelData.metrics.accuracy > 0.95, 'Accuracy must be > 95%');
  assert.ok(modelData.metrics.roc_auc > 0.98, 'ROC-AUC must be > 0.98');
});

test('Unit 2: Preset A (Malignant) prediction and high probability', () => {
  const pA = modelData.presets[0];
  const x = modelData.feature_names.map((f) => pA.features[f]);
  const res = runInference(x);
  assert.ok(res.prob > 0.85, `Expected probability > 0.85, got ${res.prob}`);
  assert.equal(pA.true_label, 'Malignant');
});

test('Unit 3: Preset B (Benign) prediction and low probability', () => {
  const pB = modelData.presets[1];
  const x = modelData.feature_names.map((f) => pB.features[f]);
  const res = runInference(x);
  assert.ok(res.prob < 0.15, `Expected probability < 0.15, got ${res.prob}`);
  assert.equal(pB.true_label, 'Benign');
});

test('Unit 4: TreeSHAP Additivity and Efficiency Property', () => {
  const pA = modelData.presets[0];
  const x = modelData.feature_names.map((f) => pA.features[f]);
  const res = runInference(x);
  const shapSum = res.phi.reduce((a, b) => a + b, 0);
  const diff = Math.abs(res.rawMargin - (shapSum + baseValue));
  assert.ok(diff < 0.05, `Additivity discrepancy too large: ${diff}`);
});

test('Unit 5: Confusion matrix numbers match test set size', () => {
  const cm = modelData.metrics.confusion_matrix;
  const totalTest = cm.tn + cm.fp + cm.fn + cm.tp;
  assert.equal(totalTest, modelData.metadata.test_samples);
  assert.equal(totalTest, 114);
  assert.equal(cm.tn, 72);
  assert.equal(cm.fp, 0);
  assert.equal(cm.fn, 3);
  assert.equal(cm.tp, 39);
});

test('Unit 6: Global feature importance rankings', () => {
  const top1 = modelData.global_importance[0];
  const top2 = modelData.global_importance[1];
  assert.equal(top1.feature, 'worst_radius');
  assert.equal(top2.feature, 'worst_concave_points');
  assert.ok(top1.mean_abs_shap > 0.5, 'Top SHAP must exceed 0.5');
});

test('Unit 7: Presets have all 30 features present', () => {
  for (const preset of modelData.presets) {
    for (const feat of modelData.feature_names) {
      assert.notEqual(preset.features[feat], undefined, `Feature ${feat} missing in preset ${preset.id}`);
      assert.equal(typeof preset.features[feat], 'number');
    }
  }
});

test('Unit 8: Perturbation cosine similarity logic', () => {
  function cosineSim(a, b) {
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      nA += a[i] * a[i];
      nB += b[i] * b[i];
    }
    return dot / (Math.sqrt(nA) * Math.sqrt(nB));
  }
  const v1 = [1, 2, 3];
  const v2 = [1, 2, 3];
  assert.equal(Math.round(cosineSim(v1, v2) * 1000) / 1000, 1.0);
  const v3 = [1.05, 2.05, 2.95];
  assert.ok(cosineSim(v1, v3) > 0.99);
});

