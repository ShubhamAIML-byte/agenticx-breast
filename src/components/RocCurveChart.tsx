'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Props {
  rocCurve: Array<{ fpr: number; tpr: number; threshold: number }>;
  auc: number;
  aucCi: [number, number];
}

export default function RocCurveChart({ rocCurve, auc, aucCi }: Props) {
  // Add random line points for baseline
  const data = rocCurve.map((pt) => ({
    ...pt,
    random: pt.fpr,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-2.5 rounded-lg border border-navy-800 text-xs shadow-lg space-y-1">
          <p className="font-bold text-teal-300">ROC Operating Point</p>
          <p>True Positive Rate (Sensitivity): <span className="font-mono text-emerald-400 font-bold">{(pt.tpr * 100).toFixed(1)}%</span></p>
          <p>False Positive Rate (1 - Specificity): <span className="font-mono text-rose-400 font-bold">{(pt.fpr * 100).toFixed(1)}%</span></p>
          <p className="text-[11px] text-slate-400">Threshold: <span className="font-mono text-slate-200">{pt.threshold.toFixed(4)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Receiver Operating Characteristic (ROC)</h3>
          <p className="text-xs text-slate-500">
            Empirical test set performance across continuous classification thresholds.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-slate-900">
            ROC-AUC: <span className="text-teal-700 font-mono">{auc.toFixed(4)}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            95% Bootstrap CI: [{aucCi[0].toFixed(4)}, {aucCi[1].toFixed(4)}]
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="fpr"
              type="number"
              domain={[0, 1]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              dataKey="tpr"
              type="number"
              domain={[0, 1]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="tpr"
              name="Calibrated XGBoost"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 2, fill: '#0d9488' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="random"
              name="Random Chance (AUC=0.50)"
              stroke="#cbd5e1"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
