'use client';

import React from 'react';
import modelData from '@/lib/ml/model_data.json';
import RocCurveChart from '@/components/RocCurveChart';
import ConfusionMatrixChart from '@/components/ConfusionMatrixChart';
import CalibrationChart from '@/components/CalibrationChart';
import GlobalFeatureImportanceChart from '@/components/GlobalFeatureImportanceChart';
import { Database, CheckCircle2, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function EvaluationPage() {
  const { metrics, metadata, roc_curve, calibration_curve, global_importance } = modelData;

  const metricCards = [
    {
      label: 'Test Accuracy',
      value: `${(metrics.accuracy * 100).toFixed(1)}%`,
      ci: `95% CI: [${(metrics.accuracy_ci_95[0] * 100).toFixed(1)}%, ${(metrics.accuracy_ci_95[1] * 100).toFixed(1)}%]`,
      method: 'Wilson Score Interval',
      color: 'text-slate-900',
    },
    {
      label: 'ROC-AUC Score',
      value: metrics.roc_auc.toFixed(4),
      ci: `95% CI: [${metrics.roc_auc_ci_95[0].toFixed(4)}, ${metrics.roc_auc_ci_95[1].toFixed(4)}]`,
      method: '1,000 Bootstrap Resamples',
      color: 'text-teal-700',
    },
    {
      label: 'Sensitivity (Recall)',
      value: `${(metrics.recall * 100).toFixed(1)}%`,
      ci: `95% CI: [${(metrics.recall_ci_95[0] * 100).toFixed(1)}%, ${(metrics.recall_ci_95[1] * 100).toFixed(1)}%]`,
      method: 'Wilson Score Interval',
      color: 'text-teal-700',
    },
    {
      label: 'Specificity (TNR)',
      value: `${(metrics.specificity * 100).toFixed(1)}%`,
      ci: `95% CI: [${(metrics.specificity_ci_95[0] * 100).toFixed(1)}%, ${(metrics.specificity_ci_95[1] * 100).toFixed(1)}%]`,
      method: 'Wilson Score Interval',
      color: 'text-emerald-700',
    },
    {
      label: 'Precision (PPV)',
      value: `${(metrics.precision * 100).toFixed(1)}%`,
      ci: `95% CI: [${(metrics.precision_ci_95[0] * 100).toFixed(1)}%, ${(metrics.precision_ci_95[1] * 100).toFixed(1)}%]`,
      method: 'Wilson Score Interval',
      color: 'text-slate-900',
    },
    {
      label: 'F1-Score',
      value: metrics.f1_score.toFixed(4),
      ci: `95% CI: [${metrics.f1_ci_95[0].toFixed(4)}, ${metrics.f1_ci_95[1].toFixed(4)}]`,
      method: '1,000 Bootstrap Resamples',
      color: 'text-slate-900',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
            Statistical Validation
          </span>
          <span className="text-xs text-slate-500 font-mono">Stratified N=114 Test Cohort</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Model Evaluation & Statistical Audit Dashboard
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Empirical evaluation of the trained XGBoost tree ensemble on Wisconsin Diagnostic Breast Cancer (WDBC) test split.
          All numbers reflect genuine computed metrics with 95% confidence bounds. Zero simulated metrics.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1"
          >
            <span className="text-xs font-semibold text-slate-500 block">
              {m.label}
            </span>
            <div className={`text-2xl font-extrabold font-mono ${m.color}`}>
              {m.value}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">{m.ci}</p>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block pt-1 border-t border-slate-100">
              {m.method}
            </span>
          </div>
        ))}
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RocCurveChart
          rocCurve={roc_curve}
          auc={metrics.roc_auc}
          aucCi={metrics.roc_auc_ci_95 as [number, number]}
        />

        <ConfusionMatrixChart
          confusionMatrix={metrics.confusion_matrix}
          totalTest={metadata.test_samples}
        />

        <CalibrationChart
          calibrationData={calibration_curve}
          brierScore={metrics.brier_score}
        />

        <GlobalFeatureImportanceChart
          importance={global_importance}
        />
      </div>

      {/* Statistical Methodology Deep Dive */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Database className="w-4 h-4 text-teal-600" />
          <span>Evaluation Methodology & Data Leakage Prevention</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block">1. Stratified Partitioning</span>
            <p className="leading-relaxed">
              The 569 instances of WDBC were partitioned with an 80/20 stratified split (seed 42). Both training (N=455) and test (N=114) splits strictly mirror the natural dataset prevalence of 37.3% Malignant vs 62.7% Benign.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block">2. Strict Leakage Prevention</span>
            <p className="leading-relaxed">
              Pre-processing parameters, population quartiles, and background expected values E[f(x)] were calculated strictly on the training subset. Zero test sample information leaked into feature normalizations or tree splitting.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 block">3. 95% Confidence Intervals</span>
            <p className="leading-relaxed">
              Wilson Score Intervals were computed for proportions (Accuracy, Sensitivity, Specificity, Precision) to account for sample size limits. Non-parametric bootstrap resampling (B=1,000 iterations) generated 95% empirical CIs for ROC-AUC and F1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
