'use client';

import React, { useState } from 'react';
import { RetrievedDocument } from '@/lib/agents/types';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, BookmarkCheck } from 'lucide-react';

interface Props {
  documents: RetrievedDocument[];
  queryContext: string;
}

export default function EvidenceCards({ documents, queryContext }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(documents[0]?.id || null);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'cytopathology':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'guideline':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'bi_rads':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'xai_methodology':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Retrieved Clinical Reference Evidence (RAG)
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
            {documents.length} Grounded Citations
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono truncate max-w-sm">
          Query: {queryContext}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc) => {
          const isExpanded = expandedId === doc.id;
          return (
            <div
              key={doc.id}
              className={`rounded-xl border transition-all text-xs ${
                isExpanded
                  ? 'border-teal-500 bg-teal-50/20 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div
                className="p-3.5 cursor-pointer flex items-start justify-between gap-3"
                onClick={() => setExpandedId(isExpanded ? null : doc.id)}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">
                      [{doc.id}]
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider border ${getCategoryBadge(doc.category)}`}>
                      {doc.category.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{doc.source} ({doc.year})</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {doc.title}
                  </h4>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800 font-mono text-[11px] font-semibold">
                    {(doc.relevanceScore * 100).toFixed(0)}% match
                  </span>
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-slate-200/60">
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    {doc.content}
                  </p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                    <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Matched Biomedical Concepts:</span>
                    <div className="flex flex-wrap gap-1">
                      {doc.matchedConcepts.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
