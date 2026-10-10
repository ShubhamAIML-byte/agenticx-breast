'use client';

import React from 'react';
import { ValidationAgentOutput } from '@/lib/agents/types';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface Props {
  validation: ValidationAgentOutput;
}

export default function ValidationScorecard({ validation }: Props) {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          {validation.passed ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          )}
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Validation Guardrail Audit Scorecard (Agent 5)
            </h3>
            <p className="text-xs text-slate-500">
              Automated multi-point verification auditing clinical narrative agreement with model math.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Integrity Score</div>
            <div className={`font-mono text-base font-bold ${
              validation.overallScore >= 80 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {validation.overallScore} / 100
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            validation.passed
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {validation.passed ? 'PASSED' : 'FLAGGED'}
          </span>
        </div>
      </div>

      {/* List of 5 Verification Checks */}
      <div className="space-y-2.5">
        {validation.checks.map((check) => (
          <div
            key={check.checkId}
            className={`p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
              check.passed
                ? 'bg-emerald-50/30 border-emerald-200/80'
                : 'bg-rose-50/40 border-rose-300'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{check.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider border ${getSeverityBadge(check.severity)}`}>
                    {check.severity}
                  </span>
                </div>
                <p className="text-slate-600 leading-normal">{check.details}</p>
              </div>
            </div>

            <span className={`font-mono font-bold text-[11px] shrink-0 ${
              check.passed ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {check.passed ? '✓ OK' : '✗ FAILED'}
            </span>
          </div>
        ))}
      </div>

      {/* Flagged Phrases Warning if any */}
      {validation.flaggedPhrases && validation.flaggedPhrases.length > 0 && (
        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Auditor Flagged Phrases Detected:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {validation.flaggedPhrases.map((phrase, i) => (
              <li key={i}>{phrase}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
