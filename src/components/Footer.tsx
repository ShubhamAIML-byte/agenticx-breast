import Link from 'next/link';
import { Activity, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">
                AgenticX<span className="text-teal-400">-Breast</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A production-style explainable oncology decision-support prototype combining calibrated XGBoost,
              exact polynomial Lundberg TreeSHAP, medical literature RAG, and multi-agent clinical verification.
              Deployed exclusively on Vercel Serverless infrastructure.
            </p>
            <div className="pt-1 flex items-center space-x-3 text-xs text-teal-400 font-mono">
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-teal-300" />
                <span>TreeSHAP: &lt;5ms</span>
              </span>
              <span>•</span>
              <span>Test ROC-AUC: 0.9970</span>
              <span>•</span>
              <span>Accuracy: 97.4%</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">System Pages</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/predict" className="hover:text-teal-300 transition-colors">
                  Clinical Intake & Predictions
                </Link>
              </li>
              <li>
                <Link href="/evaluation" className="hover:text-teal-300 transition-colors">
                  ROC & Evaluation Dashboard
                </Link>
              </li>
              <li>
                <Link href="/robustness" className="hover:text-teal-300 transition-colors">
                  Perturbation Robustness
                </Link>
              </li>
              <li>
                <Link href="/ablation" className="hover:text-teal-300 transition-colors">
                  Tri-Paradigm Ablation Study
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-teal-300 transition-colors">
                  Architecture & Equations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Research References */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Primary References</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Street, Wolberg, Mangasarian (1995) WDBC</li>
              <li>Lundberg et al. (Nature MI 2020) TreeSHAP</li>
              <li>ACR BI-RADS Atlas (5th Edition)</li>
              <li>CAP Cytopathology Practice Guidelines</li>
              <li>WHO Breast Tumours (5th Edition, 2019)</li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Educational Disclaimer */}
        <div className="border-t border-navy-800/80 pt-6 mt-6">
          <div className="bg-navy-900/60 rounded-xl p-4 border border-navy-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-2 text-teal-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Academic Research & Educational Decision-Support Notice</span>
            </div>
            <p className="leading-relaxed">
              AgenticX-Breast is an engineering and AI research prototype developed for academic evaluation. It is not an FDA-cleared, CE-marked, or clinically certified Software as a Medical Device (SaMD). Algorithmic predictions must never supersede the independent diagnostic judgement of licensed pathologists, oncologists, or multidisciplinary tumor boards.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>© 2026 AgenticX-Breast Research Project. Built for M.Tech AIML Dissertation.</span>
            <span>Deployed exclusively on Vercel Edge & Serverless Functions.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
