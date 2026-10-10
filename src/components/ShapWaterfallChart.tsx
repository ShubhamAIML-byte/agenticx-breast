'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ShapContribution } from '@/lib/ml/treeShapEngine';
import { Info } from 'lucide-react';

interface Props {
  baseValue: number;
  contributions: ShapContribution[];
  rawMargin: number;
  probability: number;
}

export default function ShapWaterfallChart({
  baseValue,
  contributions,
  rawMargin,
  probability,
}: Props) {
  // Take top 8 contributors by magnitude
  const topItems = contributions.slice(0, 8);

  const chartData = topItems.map((c) => ({
    name: c.feature.replace(/_/g, ' '),
    rawFeature: c.feature,
    value: Math.round(c.shapValue * 1000) / 1000,
    absVal: Math.abs(c.shapValue),
    observed: c.featureValue,
    impact: c.impact,
    benignMean: c.populationBenignMean,
    malignantMean: c.populationMalignantMean,
    percentage: Math.round(c.percentage * 10) / 10,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-950 text-white p-3 rounded-xl border border-navy-700 shadow-xl text-xs max-w-xs">
          <p className="font-bold text-teal-300 mb-1">{data.rawFeature}</p>
          <div className="space-y-1 text-slate-300">
            <p>
              Observed Value: <span className="font-mono font-semibold text-white">{data.observed.toFixed(3)}</span>
            </p>
            <p>
              SHAP Attribution: <span className={`font-mono font-semibold ${data.value >= 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                {data.value >= 0 ? `+${data.value.toFixed(3)}` : data.value.toFixed(3)}
              </span>
            </p>
            <p>
              Share of Total Attribution: <span className="font-semibold text-white">{data.percentage}%</span>
            </p>
            <div className="pt-1.5 border-t border-navy-800 text-[11px] text-slate-400 space-y-0.5">
              <p>WDBC Benign Mean: <span className="text-emerald-400 font-mono">{data.benignMean.toFixed(2)}</span></p>
              <p>WDBC Malignant Mean: <span className="text-rose-400 font-mono">{data.malignantMean.toFixed(2)}</span></p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
            <span>Local Patient TreeSHAP Waterfall Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Additive attribution shifting model log-odds margin relative to base expectation E[f(x)] = {baseValue.toFixed(4)}.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs shrink-0 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
            <span className="text-slate-600">Increases Risk (+)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-600"></span>
            <span className="text-slate-600">Decreases Risk (-)</span>
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? '#f43f5e' : '#0d9488'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between border border-slate-200/80 gap-2">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Shapley Additivity:</strong> Base Margin ({baseValue.toFixed(3)}) + Total SHAP ({contributions.reduce((a,b)=>a+b.shapValue,0).toFixed(3)}) = Final Margin ({rawMargin.toFixed(3)})
          </span>
        </div>
        <div className="text-right shrink-0 font-mono text-slate-800">
          Calibrated P(Malignant) = <strong>{(probability * 100).toFixed(1)}%</strong>
        </div>
      </div>
    </div>
  );
}
