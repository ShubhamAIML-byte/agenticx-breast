'use client';

import React from 'react';
import { AgentStepLog } from '@/lib/agents/types';
import {
  Activity,
  Sliders,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  timeline: AgentStepLog[];
  totalLatencyMs: number;
}

export default function AgentTimeline({ timeline, totalLatencyMs }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'prediction':
        return <Activity className="w-4 h-4 text-teal-400" />;
      case 'explainability':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'retrieval':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'llm_explanation':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'validation':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-navy-900 text-white rounded-2xl p-5 border border-navy-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-navy-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
          <h3 className="font-bold text-sm tracking-tight">Agentic AI Execution Timeline</h3>
          <span className="text-[11px] px-2 py-0.5 rounded bg-navy-800 text-teal-300 border border-teal-500/20 font-mono">
            5 Discrete Specialized Agents
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>Total Pipeline Latency: <strong className="text-teal-300">{totalLatencyMs} ms</strong></span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-navy-700">
        {timeline.map((step, idx) => (
          <div key={step.agentId} className="relative group">
            {/* Step Node Dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-navy-950 border-2 border-teal-500 flex items-center justify-center text-[10px] font-bold text-teal-300">
              {idx + 1}
            </div>

            <div className="bg-navy-950/80 rounded-xl p-3.5 border border-navy-800/80 hover:border-teal-500/40 transition-colors space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-navy-800">
                    {getIcon(step.agentId)}
                  </div>
                  <span className="font-semibold text-xs text-slate-200">
                    {step.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded font-mono bg-navy-800/80 text-teal-300 border border-navy-700">
                    {step.latencyMs} ms
                  </span>
                  <span className={`flex items-center space-x-1 px-2 py-0.5 rounded font-medium ${
                    step.status === 'completed'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : step.status === 'fallback'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                  }`}>
                    {step.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    {step.status === 'fallback' && <AlertTriangle className="w-3 h-3" />}
                    <span className="capitalize">{step.status}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 pl-7">
                {step.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
