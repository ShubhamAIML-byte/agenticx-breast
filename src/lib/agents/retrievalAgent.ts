/**
 * AgenticX-Breast: Retrieval Agent (Agent 3)
 * Orchestrates clinical evidence retrieval from the curated cytopathology and XAI knowledge base.
 */

import { retrieveMedicalEvidence } from '../rag/retriever';
import { RetrievalAgentOutput } from './types';
import { ShapContribution } from '../ml/treeShapEngine';

export function runRetrievalAgent(
  predictedLabel: 'Malignant' | 'Benign',
  probability: number,
  topShapContributions: ShapContribution[]
): RetrievalAgentOutput {
  const startTime = performance.now();

  const topFeatureNames = topShapContributions.map((c) => c.feature);
  const { retrievedDocuments, queryContext } = retrieveMedicalEvidence(
    predictedLabel,
    topFeatureNames,
    probability
  );

  const executionTimeMs = performance.now() - startTime;

  return {
    status: 'success',
    retrievedDocuments,
    queryContext,
    totalCorpusMatches: retrievedDocuments.length,
    executionTimeMs,
  };
}
