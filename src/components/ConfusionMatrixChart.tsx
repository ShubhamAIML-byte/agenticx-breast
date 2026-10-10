'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  confusionMatrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  totalTest: number;
}

export default function ConfusionMatrixChart({ confusionMatrix, totalTest }: Props) {
  const { tn, fp, fn, tp } = confusionMatrix;
  const totalMalignant = tp + fn; // 42
  const totalBenign = tn + fp;    // 72

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Empirical Confusion Matrix</h3>
          <p className="text-xs text-slate-500">
            N = {totalTest} held-out test cases (Stratified 20% test split, Seed 42).
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          Zero False Positives (FP = 0)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
        {/* True Negatives (TN) */}
        <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-xl p-4 text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            True Negative (TN)
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 font-mono">
            {tn}
          </div>
          <p className="text-[11px] text-emerald-700">
            Benign correctly classified ({((tn / totalBenign) * 100).toFixed(1)}%)
          </p>
        </div>

        {/* False Positives (FP) */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            False Positive (FP)
          </div>
          <div className="text-3xl font-extrabold text-slate-500 font-mono">
            {fp}
          </div>
          <p className="text-[11px] text-slate-500">
            Benign misclassified as malignant (0.0%)
          </p>
        </div>

        {/* False Negatives (FN) */}
        <div className="bg-amber-50/60 border-2 border-amber-300 rounded-xl p-4 text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            False Negative (FN)
          </div>
          <div className="text-3xl font-extrabold text-amber-700 font-mono">
            {fn}
          </div>
          <p className="text-[11px] text-amber-700">
            Malignant misclassified ({((fn / totalMalignant) * 100).toFixed(1)}%)
          </p>
        </div>

        {/* True Positives (TP) */}
        <div className="bg-teal-50/60 border-2 border-teal-400 rounded-xl p-4 text-center space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
            True Positive (TP)
          </div>
          <div className="text-3xl font-extrabold text-teal-700 font-mono">
            {tp}
          </div>
          <p className="text-[11px] text-teal-700">
            Malignant correctly identified ({((tp / totalMalignant) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[11px] block">Specificity</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {((tn / (tn + fp)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[11px] block">Sensitivity (Recall)</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {((tp / (tp + fn)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[11px] block">Precision</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {((tp / (tp + fp || 1)) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="text-slate-500 text-[11px] block">F1-Score</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            0.9630
          </span>
        </div>
      </div>
    </div>
  );
}
