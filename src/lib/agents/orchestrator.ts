/**
 * AgenticX-Breast: Master Orchestrator
 * Coordinates multi-agent workflow: Input Validation -> Prediction -> TreeSHAP -> RAG -> LLM -> Validation
 */

import { runPredictionAgent } from './predictionAgent';
import { runExplainabilityAgent } from './explainabilityAgent';
import { runRetrievalAgent } from './retrievalAgent';
import { runLlmExplanationAgent } from './llmExplanationAgent';
import { runValidationAgent } from './validationAgent';
import { OrchestrationResponse, AgentStepLog } from './types';

export async function orchestrateBreastCancerCase(
  inputFeatures: Record<string, number>,
  caseMetadata?: { id?: string; presetName?: string; description?: string }
): Promise<OrchestrationResponse> {
  const overallStart = performance.now();
  const timeline: AgentStepLog[] = [];

  // Step 1: Prediction Agent
  const pStart = performance.now();
  const { predictionOutput, rawResult } = runPredictionAgent(inputFeatures);
  const pLatency = performance.now() - pStart;
  timeline.push({
    agentId: 'prediction',
    name: '1. Prediction Agent',
    status: predictionOutput.status === 'error' ? 'failed' : 'completed',
    latencyMs: Math.round(pLatency * 10) / 10,
    summary: `Classified as ${predictionOutput.predictedLabel} (${predictionOutput.calibratedPercentage}% probability, ${predictionOutput.riskTier.toUpperCase()} risk).`,
  });

  // Step 2: Explainability Agent
  const expStart = performance.now();
  const explainabilityOutput = runExplainabilityAgent(rawResult);
  const expLatency = performance.now() - expStart;
  const top1 = explainabilityOutput.topRiskIncreasing[0]?.feature || explainabilityOutput.allContributions[0]?.feature;
  timeline.push({
    agentId: 'explainability',
    name: '2. Explainability Agent',
    status: explainabilityOutput.status === 'error' ? 'failed' : 'completed',
    latencyMs: Math.round(expLatency * 10) / 10,
    summary: `Calculated 30 exact TreeSHAP attributions. Primary driver: '${top1}' (${explainabilityOutput.dominantPathologyDimension}).`,
  });

  // Step 3: Retrieval Agent
  const retStart = performance.now();
  const retrievalOutput = runRetrievalAgent(
    predictionOutput.predictedLabel,
    predictionOutput.probability,
    explainabilityOutput.allContributions
  );
  const retLatency = performance.now() - retStart;
  timeline.push({
    agentId: 'retrieval',
    name: '3. Evidence Retrieval Agent',
    status: retrievalOutput.status === 'error' ? 'failed' : 'completed',
    latencyMs: Math.round(retLatency * 10) / 10,
    summary: `Retrieved ${retrievalOutput.retrievedDocuments.length} relevant passages from CAP, WHO, BI-RADS, and XAI literature.`,
  });

  // Step 4: LLM Explanation Agent
  const llmStart = performance.now();
  const explanationOutput = await runLlmExplanationAgent(
    predictionOutput,
    explainabilityOutput,
    retrievalOutput
  );
  const llmLatency = performance.now() - llmStart;
  timeline.push({
    agentId: 'llm_explanation',
    name: '4. LLM Explanation Agent',
    status: explanationOutput.status === 'error' ? 'failed' : 'completed',
    latencyMs: Math.round(llmLatency * 10) / 10,
    summary: `Synthesized structured clinical report via ${explanationOutput.modelUsed}.`,
  });

  // Step 5: Validation Agent
  const valStart = performance.now();
  const validationOutput = runValidationAgent(
    predictionOutput,
    explainabilityOutput,
    retrievalOutput,
    explanationOutput
  );
  const valLatency = performance.now() - valStart;
  timeline.push({
    agentId: 'validation',
    name: '5. Validation Guardrail Agent',
    status: validationOutput.passed ? 'completed' : 'fallback',
    latencyMs: Math.round(valLatency * 10) / 10,
    summary: `Audited report: score ${validationOutput.overallScore}/100. Attribution vs causation: ${validationOutput.attributionVsCausationCompliant ? 'Passed' : 'Flagged'}.`,
  });

  const totalLatencyMs = Math.round((performance.now() - overallStart) * 10) / 10;

  return {
    success: true,
    timestamp: new Date().toISOString(),
    caseMetadata,
    prediction: predictionOutput,
    explainability: explainabilityOutput,
    retrieval: retrievalOutput,
    explanation: explanationOutput,
    validation: validationOutput,
    timeline,
    totalLatencyMs,
  };
}
