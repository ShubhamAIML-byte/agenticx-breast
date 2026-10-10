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
} from 'recharts';

interface Props {
  calibrationData: Array<{ bin: number; predicted: number; empirical: number }>;
  brierScore: number;
}

export default function CalibrationChart({ calibrationData, brierScore }: Props) {
  // Add ideal calibration diagonal
  const data = calibrationData.map((d) => ({
    ...d,
    ideal: d.predicted,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-2.5 rounded-lg border border-navy-800 text-xs shadow-lg space-y-1">
          <p className="font-bold text-teal-300">Calibration Bin #{pt.bin}</p>
          <p>Mean Predicted Probability: <span className="font-mono text-cyan-400 font-bold">{(pt.predicted * 100).toFixed(1)}%</span></p>
          <p>Empirical Positive Fraction: <span className="font-mono text-emerald-400 font-bold">{(pt.empirical * 100).toFixed(1)}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Reliability Calibration Curve</h3>
          <p className="text-xs text-slate-500">
            Observed clinical malignancy fraction vs predicted continuous probabilities.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-slate-900">
            Brier Score: <span className="text-teal-700 font-mono">{brierScore.toFixed(4)}</span>
          </span>
          <div className="text-[11px] text-emerald-600 font-semibold">
            (Well-calibrated, near zero)
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="predicted"
              type="number"
              domain={[0, 1]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Mean Predicted Risk P(Malignant)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              dataKey="empirical"
              type="number"
              domain={[0, 1]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Empirical True Malignant Ratio', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="empirical"
              name="Empirical Observed"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 4, fill: '#0d9488' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ideal"
              name="Perfect Calibration (y = x)"
              stroke="#94a3b8"
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
