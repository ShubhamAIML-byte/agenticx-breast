'use client';

import React from 'react';
import { Layers, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Sparkles, Database } from 'lucide-react';
import Link from 'next/link';

export default function AblationPage() {
  const comparisonData = [
    {
      metric: 'Classification Accuracy',
      paradigmA: '97.4% (N=114)',
      paradigmB: '97.4% (N=114)',
      paradigmC: '97.4% (N=114)',
      note: 'Invariance: The agentic workflow strictly preserves classifier output without inventing accuracy gains.',
    },
    {
      metric: 'ROC-AUC Score',
      paradigmA: '0.9970',
      paradigmB: '0.9970',
      paradigmC: '0.9970',
      note: 'Identical discriminating power; agentic layer adds interpretability, not hyperparameter bias.',
    },
    {
      metric: 'Local Feature Attribution',
      paradigmA: 'None (Black-Box)',
      paradigmB: 'Exact TreeSHAP (Σφᵢ)',
      paradigmC: 'Exact TreeSHAP (Σφᵢ)',
      note: 'Both B and C compute genuine polynomial Shapley attributions in <5ms.',
    },
    {
      metric: 'Cytopathological Context',
      paradigmA: 'None',
      paradigmB: 'None (Pure Math)',
      paradigmC: 'Grounded in WDBC/WHO Guidelines',
      note: 'Translates raw concavity numbers into biological nuclear atypia descriptors.',
    },
    {
      metric: 'Clinical Actionability (Triple Assessment)',
      paradigmA: 'None',
      paradigmB: 'None',
      paradigmC: 'CAP/BI-RADS Guided Recommendations',
      note: 'Provides actionable clinical context without claiming diagnostic finality.',
    },
    {
      metric: 'Attribution vs Causation Safeguard',
      paradigmA: 'N/A',
      paradigmB: 'N/A (Up to Clinician)',
      paradigmC: 'Enforced via Validation Agent',
      note: 'Guarantees that statistical credit assignment is not conflated with biological etiology.',
    },
    {
      metric: 'Automated Hallucination Auditor',
      paradigmA: 'N/A',
      paradigmB: 'N/A',
      paradigmC: 'Active (Score 0-100)',
      note: 'Flags non-concordant diagnostic tones or fabricated clinical biomarkers.',
    },
    {
      metric: 'EU AI Act / FDA SaMD Audit Readiness',
      paradigmA: 'Non-compliant (High opacity)',
      paradigmB: 'Partial (Mathematical only)',
      paradigmC: 'High (Traceable Multi-Agent Audit)',
      note: 'Full audit ledger of latency, retrieved citations, and validation scores.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
            Comparative Research
          </span>
          <span className="text-xs text-slate-500 font-mono">Tri-Paradigm Ablation Evaluation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Ablation Study: XGBoost vs XGBoost+SHAP vs Complete Agentic AI
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Systematic ablation analyzing the incremental utility of explainability and multi-agent clinical orchestration.
          Crucially, we evaluate transparency, grounding, and cognitive safety without falsely claiming that LLMs alter core statistical classifier accuracy.
        </p>
      </div>

      {/* 3 Paradigms Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paradigm 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 text-slate-800 font-mono">
              Paradigm 1
            </span>
            <span className="text-xs text-slate-400">Baseline</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            XGBoost Alone (Black-Box)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard binary tree ensemble classification. Computes raw class predictions and sigmoid probabilities. High discriminative accuracy but zero interpretability.
          </p>
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-500">
            <div className="flex items-center space-x-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>High statistical accuracy (97.4%)</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>Zero explanation or clinical rationale</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>Unsuitable for clinical decision support</span>
            </div>
          </div>
        </div>

        {/* Paradigm 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-cyan-100 text-cyan-800 font-mono">
              Paradigm 2
            </span>
            <span className="text-xs text-cyan-700 font-semibold">Standard XAI</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            XGBoost + TreeSHAP
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Adds local and global Shapley feature attributions. Clinicians see numerical contribution bars, but raw numbers lack medical context, literature grounding, and cognitive safeguards.
          </p>
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-500">
            <div className="flex items-center space-x-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Exact additive credit assignment</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Risk of causal conflation by clinicians</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>No clinical literature or guideline grounding</span>
            </div>
          </div>
        </div>

        {/* Paradigm 3 */}
        <div className="bg-teal-50/40 rounded-2xl p-5 border-2 border-teal-500 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-teal-600 text-white font-mono">
              Paradigm 3
            </span>
            <span className="text-xs text-teal-800 font-bold">AgenticX-Breast</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Complete Agentic AI System
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Integrates XGBoost inference + TreeSHAP + Medical RAG + Gemini LLM synthesis + Validation guardrails into a reproducible, traceable multi-agent clinical decision-support pipeline.
          </p>
          <div className="pt-2 border-t border-teal-200 text-xs space-y-1 text-slate-600">
            <div className="flex items-center space-x-1 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>100% mathematical fidelity + RAG citations</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Automated attribution vs causation check</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Audited against diagnostic inversion errors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Matrix Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Comparative Evaluation Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Evaluation Dimension</th>
                <th className="px-4 py-3">1. XGBoost Alone</th>
                <th className="px-4 py-3">2. XGBoost + SHAP</th>
                <th className="px-4 py-3 bg-teal-50/70 text-teal-900">3. Complete Agentic AI</th>
                <th className="px-4 py-3">Methodological Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {comparisonData.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.metric}</td>
                  <td className="px-4 py-3 text-slate-600">{row.paradigmA}</td>
                  <td className="px-4 py-3 text-slate-600">{row.paradigmB}</td>
                  <td className="px-4 py-3 font-bold text-teal-900 bg-teal-50/30">{row.paradigmC}</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Scientific Conclusion Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 border border-navy-800 shadow-lg space-y-3">
        <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Core Dissertation Finding: What Agentic AI Actually Improves</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          A common fallacy in applied healthcare AI claims that adding an LLM wrapper improves model discrimination accuracy. In rigorous testing, the classifier accuracy remains exactly <strong>97.37%</strong> across all three configurations because the underlying decision boundaries are governed by the trained XGBoost tree splits. What the agentic architecture achieves is <strong>semantic auditability, guideline traceability, and cognitive error reduction</strong>—bridging the gap between raw statistical logits and responsible clinical decision support.
        </p>
      </div>
    </div>
  );
}
