'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  BookOpen,
} from 'lucide-react';
import modelData from '@/lib/ml/model_data.json';
import { OrchestrationResponse } from '@/lib/agents/types';
import ShapWaterfallChart from '@/components/ShapWaterfallChart';
import AgentTimeline from '@/components/AgentTimeline';
import EvidenceCards from '@/components/EvidenceCards';
import ValidationScorecard from '@/components/ValidationScorecard';

function PredictContent() {
  const searchParams = useSearchParams();
  const presets = modelData.presets;
  const featureNames = modelData.feature_names;
  const featureStats = modelData.feature_stats as Record<string, any>;

  // Selected Preset or Custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0].id);
  const [features, setFeatures] = useState<Record<string, number>>(presets[0].features);
  const [activeTab, setActiveTab] = useState<'size' | 'contour' | 'texture'>('contour');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<OrchestrationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Group features into 3 medical categories
  const featureCategories = {
    contour: featureNames.filter(
      (f) => f.includes('concav') || f.includes('compact') || f.includes('fractal')
    ),
    size: featureNames.filter(
      (f) => f.includes('radius') || f.includes('perimeter') || f.includes('area')
    ),
    texture: featureNames.filter(
      (f) => f.includes('texture') || f.includes('smoothness') || f.includes('symmetry')
    ),
  };

  // Handle URL query param ?preset=
  useEffect(() => {
    const pId = searchParams.get('preset');
    if (pId) {
      const match = presets.find((p) => p.id === pId);
      if (match) {
        setSelectedPresetId(match.id);
        setFeatures(match.features);
      }
    }
  }, [searchParams]);

  const handlePresetChange = (pId: string) => {
    setSelectedPresetId(pId);
    if (pId === 'custom') return;
    const match = presets.find((p) => p.id === pId);
    if (match) {
      setFeatures(match.features);
      setResult(null);
    }
  };

  const handleFeatureChange = (name: string, valStr: string) => {
    const val = parseFloat(valStr);
    setSelectedPresetId('custom');
    setFeatures((prev) => ({
      ...prev,
      [name]: isNaN(val) ? 0 : val,
    }));
  };

  const handleRunPipeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedPreset = presets.find((p) => p.id === selectedPresetId);
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features,
          metadata: {
            id: selectedPresetId,
            presetName: selectedPreset?.name || 'Custom Clinical Specimen',
            description: selectedPreset?.clinical_note || 'Custom user-specified FNA measurements.',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Pipeline execution failed.');
      }

      const data: OrchestrationResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to communicate with prediction API.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on first load
  useEffect(() => {
    handleRunPipeline();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
              Agentic Inference
            </span>
            <span className="text-xs text-slate-500 font-mono">30-Dimensional WDBC Vector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Clinical Diagnostic Intake & Multi-Agent Analysis
          </h1>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Case Preset:</label>
          <select
            value={selectedPresetId}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.true_label})
              </option>
            ))}
            <option value="custom">-- Custom Manual Specimen --</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 30 Feature Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">FNA Biometric Measurements</h3>
                <p className="text-xs text-slate-500">Fine needle aspirate digitized nuclei</p>
              </div>
              <button
                onClick={() => handlePresetChange('case_malignant')}
                className="text-xs text-slate-500 hover:text-teal-700 flex items-center space-x-1"
                title="Reset to default preset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('contour')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'contour'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Contour ({featureCategories.contour.length})
              </button>
              <button
                onClick={() => setActiveTab('size')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'size'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Size ({featureCategories.size.length})
              </button>
              <button
                onClick={() => setActiveTab('texture')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'texture'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                Texture ({featureCategories.texture.length})
              </button>
            </div>

            {/* Feature Inputs List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {featureCategories[activeTab].map((fName) => {
                const stat = featureStats[fName]?.overall;
                const curVal = features[fName] ?? 0;
                const isOutOfRange = stat && (curVal < stat.min || curVal > stat.max);

                return (
                  <div key={fName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-800 font-mono text-[11px]">
                        {fName}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Train: [{stat?.min.toFixed(2)}, {stat?.max.toFixed(2)}]
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        value={curVal}
                        onChange={(e) => handleFeatureChange(fName, e.target.value)}
                        className={`w-full text-xs font-mono px-3 py-1.5 rounded-lg border shadow-sm focus:outline-none focus:ring-2 ${
                          isOutOfRange
                            ? 'border-amber-400 bg-amber-50/40 text-amber-900 focus:ring-amber-500'
                            : 'border-slate-300 bg-slate-50/50 text-slate-900 focus:ring-teal-500'
                        }`}
                      />
                      {isOutOfRange && (
                        <span className="absolute right-2.5 top-2 text-[10px] text-amber-600 font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>OOD</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                onClick={handleRunPipeline}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-400 text-navy-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all hover:shadow-teal-500/25"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Orchestrating 5 Agents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Multi-Agent Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Output & Agent Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              {/* Primary Diagnostic Banner */}
              <div
                className={`rounded-2xl p-6 border shadow-sm space-y-4 ${
                  result.prediction.predictedLabel === 'Malignant'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                        result.prediction.predictedLabel === 'Malignant'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {result.prediction.predictedLabel}
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-2">
                      {result.prediction.confidenceDescriptor}
                    </h2>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-3xl font-extrabold font-mono">
                      {result.prediction.calibratedPercentage}%
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      P(Malignancy Risk)
                    </div>
                  </div>
                </div>

                {/* Calibrated Risk Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.prediction.predictedLabel === 'Malignant'
                          ? 'bg-rose-600'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.max(4, result.prediction.calibratedPercentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0% Benign Baseline</span>
                    <span>Threshold: 50%</span>
                    <span>100% Extreme Malignancy</span>
                  </div>
                </div>
              </div>

              {/* Agent Execution Timeline */}
              <AgentTimeline
                timeline={result.timeline}
                totalLatencyMs={result.totalLatencyMs}
              />

              {/* Interactive SHAP Waterfall Chart */}
              <ShapWaterfallChart
                baseValue={result.explainability.baseValue}
                contributions={result.explainability.allContributions}
                rawMargin={result.prediction.rawMargin}
                probability={result.prediction.probability}
              />

              {/* LLM-Generated Oncology Explanation Report */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Synthesized Oncology Decision-Support Report
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {result.explanation.modelUsed}
                  </span>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span>1. Clinical Impression Summary</span>
                    </h4>
                    <p>{result.explanation.clinicalImpression}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span>2. Quantitative SHAP Attribution Analysis</span>
                    </h4>
                    <p>{result.explanation.quantitativeAttributionSummary}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span>3. Cytopathological Correlation</span>
                    </h4>
                    <p>{result.explanation.cytopathologicalGrounding}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span>4. Diagnostic Uncertainty & Limitations</span>
                    </h4>
                    <p>{result.explanation.clinicalUncertaintyAndCaveats}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-200 space-y-1">
                    <h4 className="font-bold text-teal-900 text-xs flex items-center space-x-1.5">
                      <span>5. Clinical Decision-Support Recommendation</span>
                    </h4>
                    <p className="text-teal-950 font-medium">{result.explanation.recommendedAction}</p>
                  </div>
                </div>
              </div>

              {/* RAG Retrieved Evidence */}
              <EvidenceCards
                documents={result.retrieval.retrievedDocuments}
                queryContext={result.retrieval.queryContext}
              />

              {/* Validation Guardrail Scorecard */}
              <ValidationScorecard validation={result.validation} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500 font-mono">
          Loading clinical predictor intake...
        </div>
      }
    >
      <PredictContent />
    </React.Suspense>
  );
}
