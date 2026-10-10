/**
 * AgenticX-Breast: Validation Agent (Agent 5)
 * Automated clinical and scientific verification guardrail.
 * Audits report fidelity against XGBoost predictions, enforces attribution vs causation,
 * and detects hallucinations or unsupported statements.
 */

import {
  PredictionAgentOutput,
  ExplainabilityAgentOutput,
  RetrievalAgentOutput,
  LlmExplanationAgentOutput,
  ValidationAgentOutput,
  ValidationCheck,
} from './types';
import { MEDICAL_KNOWLEDGE_CORPUS } from '../rag/knowledgeBase';

export function runValidationAgent(
  prediction: PredictionAgentOutput,
  explainability: ExplainabilityAgentOutput,
  retrieval: RetrievalAgentOutput,
  explanation: LlmExplanationAgentOutput
): ValidationAgentOutput {
  const startTime = performance.now();
  const checks: ValidationCheck[] = [];
  const flaggedPhrases: string[] = [];
  let score = 100;

  const narrative = explanation.fullNarrative.toLowerCase();
  const validDocIds = new Set(MEDICAL_KNOWLEDGE_CORPUS.map((d) => d.id.toLowerCase()));

  // 1. Prediction Label & Risk Tone Consistency Check
  const isMalignant = prediction.predictedLabel === 'Malignant';
  let toneConsistent = true;
  if (isMalignant) {
    if (narrative.includes('classified as benign') || narrative.includes('negative for malignancy')) {
      toneConsistent = false;
      score -= 35;
      flaggedPhrases.push('Inverted diagnostic tone: text claims benign for malignant prediction');
    }
  } else {
    if (narrative.includes('classified as malignant') || narrative.includes('acute carcinoma confirmed')) {
      toneConsistent = false;
      score -= 35;
      flaggedPhrases.push('Inverted diagnostic tone: text claims malignant for benign prediction');
    }
  }

  checks.push({
    checkId: 'check-label-tone-consistency',
    name: 'Prediction Concordance Check',
    description: 'Verifies that LLM report tone and diagnostic category strictly mirror model classification.',
    passed: toneConsistent,
    details: toneConsistent
      ? `Report concordant with model classification: ${prediction.predictedLabel} (${prediction.calibratedPercentage}%)`
      : 'Inconsistent diagnostic tone detected between XGBoost output and text narrative.',
    severity: 'critical',
  });

  // 2. Model Attribution vs Causation Guardrail
  const dogmaticPhrases = [
    'proves the patient has cancer',
    'causes malignancy',
    'definite proof of oncogenesis',
    'causes the cancer',
    'proves that the mass is malignant',
  ];

  let attributionCompliant = true;
  dogmaticPhrases.forEach((phrase) => {
    if (narrative.includes(phrase)) {
      attributionCompliant = false;
      score -= 20;
      flaggedPhrases.push(`Causal overstatement detected: "${phrase}"`);
    }
  });

  const acknowledgesAttribution =
    narrative.includes('attribution') ||
    narrative.includes('credit assignment') ||
    narrative.includes('shift in') ||
    narrative.includes('shap') ||
    narrative.includes('associated with') ||
    narrative.includes('contributed');

  if (!acknowledgesAttribution) {
    score -= 10;
    flaggedPhrases.push('Report lacks explicit clarification of statistical attribution.');
  }

  checks.push({
    checkId: 'check-attribution-vs-causation',
    name: 'Attribution vs Causation Guardrail',
    description: 'Enforces that SHAP features are framed as model statistical attributions rather than biological causes.',
    passed: attributionCompliant && acknowledgesAttribution,
    details: attributionCompliant && acknowledgesAttribution
      ? 'Compliant: Report properly distinguishes algorithmic feature attribution from biological causality.'
      : 'Non-compliant: Report contains causal overstatements or lacks attribution framing.',
    severity: 'critical',
  });

  // 3. Hallucination Guardrail: Feature Name Fidelity
  const topFeatures = explainability.allContributions.slice(0, 5).map((c) => c.feature.toLowerCase());
  const validFeatures = new Set(explainability.allContributions.map((c) => c.feature.toLowerCase()));

  // Check if text mentions non-WDBC features as numerical model predictors
  const fabricatedFeatures = ['her2_neu', 'er_pr_expression', 'ki67_index', 'brca1_mutation'];
  let noFabricatedFeatures = true;
  fabricatedFeatures.forEach((feat) => {
    if (narrative.includes(feat)) {
      noFabricatedFeatures = false;
      score -= 15;
      flaggedPhrases.push(`Hallucinated feature as numerical predictor: "${feat}"`);
    }
  });

  // Check if top SHAP features are acknowledged
  const top1Found = narrative.includes(topFeatures[0].replace(/_/g, ' ')) || narrative.includes(topFeatures[0]);

  checks.push({
    checkId: 'check-shap-feature-fidelity',
    name: 'SHAP Numerical & Feature Fidelity',
    description: 'Verifies that cited top predictors match computed TreeSHAP attributions without hallucinated clinical biomarkers.',
    passed: noFabricatedFeatures && top1Found,
    details: noFabricatedFeatures && top1Found
      ? `Primary mathematical driver '${topFeatures[0]}' verified in explanation without fabricated biomarkers.`
      : 'Discrepancy: Primary SHAP driver absent or ungrounded biomarkers introduced.',
    severity: 'warning',
  });

  // 4. Evidence Grounding & Citation Check
  const citationsFound: string[] = [];
  retrieval.retrievedDocuments.forEach((doc) => {
    if (narrative.includes(doc.id.toLowerCase()) || narrative.includes(doc.title.toLowerCase().slice(0, 20))) {
      citationsFound.push(doc.id);
    }
  });

  const groundingIntegrity = citationsFound.length > 0;
  if (!groundingIntegrity) {
    score -= 10;
  }

  checks.push({
    checkId: 'check-evidence-grounding',
    name: 'RAG Reference Grounding',
    description: 'Confirms that clinical recommendations and cytopathology points trace to retrieved knowledge base entries.',
    passed: groundingIntegrity,
    details: groundingIntegrity
      ? `Verified ${citationsFound.length} valid corpus citations: ${citationsFound.join(', ')}`
      : 'No formal corpus citations detected in narrative.',
    severity: 'info',
  });

  // 5. Educational Decision-Support Disclaimer Check
  const hasDisclaimer =
    narrative.includes('decision-support') ||
    narrative.includes('prototype') ||
    narrative.includes('triple assessment') ||
    narrative.includes('correlation') ||
    narrative.includes('research');

  checks.push({
    checkId: 'check-decision-support-disclaimer',
    name: 'Clinical Prototype Disclaimer Check',
    description: 'Ensures output frames recommendations within the Triple Assessment framework and disclaims standalone clinical diagnostics.',
    passed: hasDisclaimer,
    details: hasDisclaimer
      ? 'Compliant: Clear decision-support framing and non-diagnostic caveats present.'
      : 'Missing recommended clinical disclaimer statements.',
    severity: 'info',
  });

  const finalScore = Math.max(10, Math.min(100, score));
  const passed = finalScore >= 75 && toneConsistent && attributionCompliant;
  const executionTimeMs = performance.now() - startTime;

  return {
    status: passed ? 'success' : 'warning',
    overallScore: finalScore,
    passed,
    checks,
    attributionVsCausationCompliant: attributionCompliant,
    noHallucinatedFeatures: noFabricatedFeatures,
    riskToneConsistentWithModel: toneConsistent,
    groundingIntegrity,
    flaggedPhrases,
    executionTimeMs,
  };
}
