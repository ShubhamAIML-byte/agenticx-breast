'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface Props {
  importance: Array<{
    rank: number;
    feature: string;
    mean_abs_shap: number;
    direction_summary: string;
  }>;
}

export default function GlobalFeatureImportanceChart({ importance }: Props) {
  const topFeatures = importance.slice(0, 10).map((item) => ({
    name: item.feature.replace(/_/g, ' '),
    score: item.mean_abs_shap,
    rank: item.rank,
    direction: item.direction_summary,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-2.5 rounded-lg border border-navy-800 text-xs shadow-lg">
          <p className="font-bold text-teal-300">Rank #{data.rank}: {data.name}</p>
          <p className="text-slate-300">Mean |SHAP|: <span className="font-mono text-white font-semibold">{data.score.toFixed(4)}</span></p>
          <p className="text-[11px] text-slate-400 mt-1">{data.direction}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Global Feature Attribution Ranking</h3>
          <p className="text-xs text-slate-500">
            Mean absolute SHAP contribution across the 114 test cohort samples.
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={topFeatures}
            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 'dataMax + 0.1']}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: '#1e293b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
