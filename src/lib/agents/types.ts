/**
 * AgenticX-Breast: Agent Architecture Types
 */

import { ShapContribution } from '../ml/treeShapEngine';

export type RiskTier = 'low' | 'indeterminate' | 'high' | 'very_high';

export interface RetrievedDocument {
  id: string;
  title: string;
  source: string;
  year: number;
  category: 'cytopathology' | 'guideline' | 'xai_methodology' | 'bi_rads';
  relevanceScore: number;
  matchedConcepts: string[];
  content: string;
}

export interface PredictionAgentOutput {
  status: 'success' | 'warning' | 'error';
  predictedLabel: 'Malignant' | 'Benign';
  predictedClass: 1 | 0;
  probability: number;
  calibratedPercentage: number;
  rawMargin: number;
  riskTier: RiskTier;
  confidenceDescriptor: string;
  outOfDistributionWarnings: string[];
  executionTimeMs: number;
}

export interface ExplainabilityAgentOutput {
  status: 'success' | 'warning' | 'error';
  baseValue: number;
  topRiskIncreasing: ShapContribution[];
  topRiskDecreasing: ShapContribution[];
  allContributions: ShapContribution[];
  dominantPathologyDimension: string;
  additivityVerified: boolean;
  additivityDiscrepancy: number;
  executionTimeMs: number;
}

export interface RetrievalAgentOutput {
  status: 'success' | 'warning' | 'error';
  retrievedDocuments: RetrievedDocument[];
  queryContext: string;
  totalCorpusMatches: number;
  executionTimeMs: number;
}

export interface LlmExplanationAgentOutput {
  status: 'success' | 'warning' | 'error';
  modelUsed: string;
  clinicalImpression: string;
  quantitativeAttributionSummary: string;
  cytopathologicalGrounding: string;
  clinicalUncertaintyAndCaveats: string;
  recommendedAction: string;
  fullNarrative: string;
  rawResponseAvailable: boolean;
  executionTimeMs: number;
}

export interface ValidationCheck {
  checkId: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface ValidationAgentOutput {
  status: 'success' | 'warning' | 'error';
  overallScore: number; // 0 - 100
  passed: boolean;
  checks: ValidationCheck[];
  attributionVsCausationCompliant: boolean;
  noHallucinatedFeatures: boolean;
  riskToneConsistentWithModel: boolean;
  groundingIntegrity: boolean;
  flaggedPhrases: string[];
  executionTimeMs: number;
}

export interface AgentStepLog {
  agentId: 'prediction' | 'explainability' | 'retrieval' | 'llm_explanation' | 'validation';
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'fallback';
  latencyMs: number;
  summary: string;
}

export interface OrchestrationResponse {
  success: boolean;
  timestamp: string;
  caseMetadata?: {
    id?: string;
    presetName?: string;
    description?: string;
  };
  prediction: PredictionAgentOutput;
  explainability: ExplainabilityAgentOutput;
  retrieval: RetrievalAgentOutput;
  explanation: LlmExplanationAgentOutput;
  validation: ValidationAgentOutput;
  timeline: AgentStepLog[];
  totalLatencyMs: number;
}
