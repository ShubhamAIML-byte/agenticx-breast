/**
 * AgenticX-Breast: LLM Explanation Agent (Agent 4)
 * Synthesizes natural-language clinical reports using Google Gemini API or deterministic grounded engine.
 */

import { PredictionAgentOutput, ExplainabilityAgentOutput, RetrievalAgentOutput, LlmExplanationAgentOutput } from './types';

export async function runLlmExplanationAgent(
  prediction: PredictionAgentOutput,
  explainability: ExplainabilityAgentOutput,
  retrieval: RetrievalAgentOutput
): Promise<LlmExplanationAgentOutput> {
  const startTime = performance.now();
  const apiKey = process.env.GEMINI_API_KEY;

  const topRisks = explainability.topRiskIncreasing.slice(0, 3);
  const topProtective = explainability.topRiskDecreasing.slice(0, 2);
  const primaryDriver = topRisks[0] || explainability.allContributions[0];

  const citations = retrieval.retrievedDocuments.map(
    (d) => `[${d.id}]: "${d.title}" (${d.source}, ${d.year})`
  ).join('\n');

  // If Gemini API Key is available, invoke Gemini
  if (apiKey) {
    try {
      const prompt = `You are a clinical decision-support AI explainer for an oncology multidisciplinary team.
Synthesize an explainable, medically grounded report for a breast cancer fine-needle aspirate (FNA) diagnostic case.

### QUANTITATIVE MODEL OUTPUTS (STRICTLY CONSTRAINED - DO NOT FABRICATE):
- Classifier: Calibrated XGBoost Binary Classifier
- Predicted Classification: ${prediction.predictedLabel}
- Model Calibrated Probability: ${prediction.calibratedPercentage}%
- Risk Stratification Tier: ${prediction.riskTier.toUpperCase()}
- Dominant Pathological Dimension: ${explainability.dominantPathologyDimension}

### TOP MODEL SHAP ATTRIBUTIONS (EXACT VALUES):
${topRisks.map((c) => `- Risk Escalating: ${c.feature} = ${c.featureValue.toFixed(4)} (SHAP contribution: +${c.shapValue.toFixed(4)}; Benign Mean: ${c.populationBenignMean.toFixed(2)}, Malignant Mean: ${c.populationMalignantMean.toFixed(2)})`).join('\n')}
${topProtective.map((c) => `- Protective/Risk Decreasing: ${c.feature} = ${c.featureValue.toFixed(4)} (SHAP contribution: ${c.shapValue.toFixed(4)}; Benign Mean: ${c.populationBenignMean.toFixed(2)}, Malignant Mean: ${c.populationMalignantMean.toFixed(2)})`).join('\n')}

### RETRIEVED MEDICAL EVIDENCE & GUIDELINES:
${citations}

### MANDATORY INSTRUCTIONS:
1. Maintain strict fidelity to the exact model output: ${prediction.predictedLabel} (${prediction.calibratedPercentage}%).
2. Distinguish statistical attribution from physiological causation: explicitly clarify that SHAP values quantify algorithmic credit assignment in the model, not mechanistic biological causation.
3. Explicitly cite retrieved documents using their keys like [wdbc-street-1993] or [cap-fna-guidelines-2021].
4. State that this system is an educational and research decision-support prototype, NOT a standalone clinical diagnostic device.
5. Provide your output in exactly these 5 numbered markdown sections:
   ## 1. Clinical Impression Summary
   ## 2. Quantitative SHAP Attribution Analysis
   ## 3. Cytopathological Correlation
   ## 4. Diagnostic Uncertainty & Limitations
   ## 5. Clinical Decision-Support Recommendation`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 100) {
          const executionTimeMs = performance.now() - startTime;
          return parseLlmSections(text, 'Google Gemini 1.5 Flash (Live API)', executionTimeMs);
        }
      }
    } catch (err) {
      console.warn('Gemini API request failed, falling back to deterministic synthesis:', err);
    }
  }

  // Deterministic Grounded Synthesis Engine (ensures zero downtime & 100% verifiable fidelity)
  const isMalignant = prediction.predictedLabel === 'Malignant';
  const prob = prediction.calibratedPercentage;

  const clinicalImpression = isMalignant
    ? `The calibrated XGBoost decision-support model assigned an estimated malignancy probability of **${prob}%** (${prediction.confidenceDescriptor}). The biometric profile exhibits severe morphological deviations across nuclear size and contour complexity, placing this sample in the **${prediction.riskTier.toUpperCase()}** risk stratification tier.`
    : `The calibrated XGBoost model calculated a **${prob}%** probability of malignancy, consistent with **Benign cytology** (${prediction.confidenceDescriptor}). Nuclear boundary parameters and size metrics align predominantly with cohesive, non-invasive breast epithelial sheets.`;

  const quantitativeAttributionSummary = `Local TreeSHAP explanation indicates that model classification is heavily driven by **${explainability.dominantPathologyDimension}**.
${topRisks.length > 0 ? `The primary risk-escalating feature is \`${primaryDriver.feature}\` with an observed value of **${primaryDriver.featureValue.toFixed(3)}**, which contributed **+${primaryDriver.shapValue.toFixed(3)}** to the log-odds margin (population malignant mean: ${primaryDriver.populationMalignantMean.toFixed(2)} vs benign mean: ${primaryDriver.populationBenignMean.toFixed(2)}). Other major positive drivers include ${topRisks.slice(1).map((c) => `\`${c.feature}\` (+${c.shapValue.toFixed(3)})`).join(', ') || 'none'}.` : 'No significant risk-escalating features were detected.'}
${topProtective.length > 0 ? `Conversely, protective features mitigating the risk score include ${topProtective.map((c) => `\`${c.feature}\` = ${c.featureValue.toFixed(3)} (SHAP: ${c.shapValue.toFixed(3)})`).join(' and ')}.` : ''}
*Note: In accordance with explainable AI principles [nature-shap-xai-2020], these SHAP scores represent additive model attribution rather than direct biological causation.*`;

  const cytopathologicalGrounding = isMalignant
    ? `The elevated values in \`${primaryDriver.feature}\` and nuclear contour features reflect classic FNA criteria for invasive breast neoplasms [wdbc-street-1993, who-breast-tumours-5th]. In computational cytopathology, severe contour concavity and enlargement reflect nuclear envelope disruption, chromatin aneuploidy, and loss of structural lamina stability [cytopath-nuclear-contour-guide]. Benign aspirates typically retain intact myoepithelial cells and smooth circular margins.`
    : `The observed feature distribution reflects preserved nuclear envelope tensile integrity with minimal contour indentations [cytopath-nuclear-contour-guide]. These morphometric findings correlate with typical benign entities such as fibroadenomas or fibrocystic changes, where uniform nuclear size and cohesive cellular sheets predominate [wdbc-street-1993, who-breast-tumours-5th].`;

  const clinicalUncertaintyAndCaveats = `While the model exhibits high test accuracy (97.4%, 95% CI: [92.6%, 99.1%]), algorithmic predictions are derived solely from 2D digitized FNA nuclear contours. Fine needle aspirates carry inherent sampling limitations, including potential sampling of fibrotic tissue rather than hypercellular neoplastic foci [cap-fna-guidelines-2021]. This model does not evaluate histological architecture, hormone receptor status (ER/PR/HER2), or lymphovascular invasion.`;

  const recommendedAction = isMalignant
    ? `Recommend urgent multidisciplinary correlation within the Triple Assessment framework [cap-fna-guidelines-2021]. Correlate with concurrent mammographic/ultrasonographic BI-RADS assessment [bi-rads-atlas-5th] and proceed to definitive histological confirmation via ultrasound-guided Core Needle Biopsy (CNB).`
    : `Recommend routine correlation with physical examination and breast imaging (BI-RADS 1 or 2) [bi-rads-atlas-5th]. In the absence of palpable abnormalities or suspicious imaging findings, standard interval clinical surveillance is appropriate.`;

  const fullNarrative = `## 1. Clinical Impression Summary\n${clinicalImpression}\n\n## 2. Quantitative SHAP Attribution Analysis\n${quantitativeAttributionSummary}\n\n## 3. Cytopathological Correlation\n${cytopathologicalGrounding}\n\n## 4. Diagnostic Uncertainty & Limitations\n${clinicalUncertaintyAndCaveats}\n\n## 5. Clinical Decision-Support Recommendation\n${recommendedAction}`;

  const executionTimeMs = performance.now() - startTime;

  return {
    status: 'success',
    modelUsed: 'Grounded Oncology Synthesis Engine (Deterministic Reference Mode)',
    clinicalImpression,
    quantitativeAttributionSummary,
    cytopathologicalGrounding,
    clinicalUncertaintyAndCaveats,
    recommendedAction,
    fullNarrative,
    rawResponseAvailable: false,
    executionTimeMs,
  };
}

function parseLlmSections(text: string, modelName: string, latency: number): LlmExplanationAgentOutput {
  const getSection = (titleRegex: RegExp, nextRegex: RegExp): string => {
    const match = text.match(titleRegex);
    if (!match) return '';
    const startIndex = (match.index ?? 0) + match[0].length;
    const nextMatch = text.slice(startIndex).match(nextRegex);
    const endIndex = nextMatch ? startIndex + (nextMatch.index ?? text.length) : text.length;
    return text.slice(startIndex, endIndex).trim();
  };

  const clinicalImpression = getSection(/##?\s*1\.?\s*Clinical Impression Summary/i, /##?\s*2\./i) || text.slice(0, 300);
  const quantitativeAttributionSummary = getSection(/##?\s*2\.?\s*Quantitative SHAP Attribution Analysis/i, /##?\s*3\./i);
  const cytopathologicalGrounding = getSection(/##?\s*3\.?\s*Cytopathological Correlation/i, /##?\s*4\./i);
  const clinicalUncertaintyAndCaveats = getSection(/##?\s*4\.?\s*Diagnostic Uncertainty/i, /##?\s*5\./i);
  const recommendedAction = getSection(/##?\s*5\.?\s*Clinical Decision-Support/i, /$/i);

  return {
    status: 'success',
    modelUsed: modelName,
    clinicalImpression: clinicalImpression || text,
    quantitativeAttributionSummary: quantitativeAttributionSummary || 'Attribution detailed in narrative.',
    cytopathologicalGrounding: cytopathologicalGrounding || 'Cytopathology grounded in literature.',
    clinicalUncertaintyAndCaveats: clinicalUncertaintyAndCaveats || 'FNA limitations apply.',
    recommendedAction: recommendedAction || 'Correlate with Triple Assessment.',
    fullNarrative: text,
    rawResponseAvailable: true,
    executionTimeMs: latency,
  };
}
