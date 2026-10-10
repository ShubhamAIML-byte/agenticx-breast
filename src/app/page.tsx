import Link from 'next/link';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Database,
  Sliders,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import modelData from '@/lib/ml/model_data.json';
import GlobalFeatureImportanceChart from '@/components/GlobalFeatureImportanceChart';

export default function HomePage() {
  const { metrics, metadata, global_importance, presets } = modelData;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900 text-white pt-16 pb-20 border-b border-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>M.Tech AIML Dissertation Project</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-navy-800/80 text-slate-300 border border-navy-700 text-xs font-mono">
              Wisconsin Diagnostic Breast Cancer (WDBC)
            </span>
            <span className="px-3 py-1 rounded-full bg-navy-800/80 text-teal-300 border border-teal-500/30 text-xs font-mono">
              Vercel Serverless Exclusively
            </span>
          </div>

          {/* Title & Pitch */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Agentic AI for Explainable{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                Breast Cancer
              </span>{' '}
              Classification
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
              A high-precision, production-grade oncology decision-support system. Integrates calibrated
              XGBoost binary classification, exact polynomial Lundberg TreeSHAP attributions, clinical literature RAG,
              and a 5-agent cooperative workflow with automated hallucination and causation guardrails.
            </p>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl pt-2">
            <div className="bg-navy-900/90 rounded-2xl p-4 border border-navy-800 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">
                {(metrics.roc_auc * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-slate-400 font-medium">Test ROC-AUC Score</div>
              <div className="text-[10px] text-teal-300 font-mono">95% CI: [{metrics.roc_auc_ci_95[0]}, {metrics.roc_auc_ci_95[1]}]</div>
            </div>

            <div className="bg-navy-900/90 rounded-2xl p-4 border border-navy-800 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400 font-medium">Test Accuracy (N=114)</div>
              <div className="text-[10px] text-slate-400 font-mono">Zero False Positives (FP=0)</div>
            </div>

            <div className="bg-navy-900/90 rounded-2xl p-4 border border-navy-800 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
                &lt; 5 ms
              </div>
              <div className="text-xs text-slate-400 font-medium">TreeSHAP Inference</div>
              <div className="text-[10px] text-cyan-400 font-mono">Pure TypeScript Engine</div>
            </div>

            <div className="bg-navy-900/90 rounded-2xl p-4 border border-navy-800 backdrop-blur">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                5 Agents
              </div>
              <div className="text-xs text-slate-400 font-medium">Multi-Agent Workflow</div>
              <div className="text-[10px] text-emerald-300 font-mono">With Guardrail Auditor</div>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/predict"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Clinical Predictor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/evaluation"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-sm border border-navy-700 transition-colors"
            >
              <Database className="w-4 h-4 text-teal-400" />
              <span>Model Evaluation Dashboard</span>
            </Link>

            <Link
              href="/methodology"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-transparent hover:bg-navy-800 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Architecture & Theory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Agentic Architecture Flowchart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs uppercase tracking-wider border border-teal-200">
            System Design
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Six-Stage Multi-Agent Orchestration Flow
          </h2>
          <p className="text-sm text-slate-600">
            Each stage is isolated, deterministic, and verifiable. The orchestrator enforces strict boundaries between classification math, clinical translation, and safety guardrails.
          </p>
        </div>

        {/* 6-Agent Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center font-mono">
                01
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100/70 text-teal-800">
                Inference
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Prediction Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validates 30 FNA feature inputs against WDBC training boundaries. Executes tree ensemble inference to calculate calibrated malignancy probability P(Malignant) and risk tier.
            </p>
            <div className="text-[11px] font-mono text-teal-700 bg-teal-50 p-2 rounded-lg">
              Output: Class (0/1), Risk Tier, Calibrated Probability
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 font-bold text-xs flex items-center justify-center font-mono">
                02
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-100/70 text-cyan-800">
                Attribution
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Explainability Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates polynomial Lundberg TreeSHAP in pure TypeScript (&lt;5ms). Verifies mathematical additivity Σφᵢ + E[f(x)] = margin(x) and isolates dominant contour drivers.
            </p>
            <div className="text-[11px] font-mono text-cyan-700 bg-cyan-50 p-2 rounded-lg">
              Output: Exact Local SHAP Values, Additivity Audit
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center font-mono">
                03
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100/70 text-emerald-800">
                Retrieval
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Evidence Retrieval Agent (RAG)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retrieves authoritative passages from a curated medical knowledge base containing CAP FNA guidelines, WHO Breast Tumours (5th Ed), ACR BI-RADS lexicon, and Nature XAI literature.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg">
              Output: 3-4 Grounded Excerpts with Relevance Scores
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center font-mono">
                04
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100/70 text-amber-800">
                Synthesis
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">LLM Explanation Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesizes an explainable, 5-part clinical report via Google Gemini API (or deterministic fallback) strictly conditioned on genuine computed SHAP values and retrieved literature citations.
            </p>
            <div className="text-[11px] font-mono text-amber-700 bg-amber-50 p-2 rounded-lg">
              Output: Structured 5-Section Oncology Narrative
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center font-mono">
                05
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100/70 text-rose-800">
                Guardrail
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Validation Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audits the synthesized narrative for classification concordance, verifies that features are framed as statistical attributions (not biological causes), and checks citation veracity.
            </p>
            <div className="text-[11px] font-mono text-rose-700 bg-rose-50 p-2 rounded-lg">
              Output: Integrity Score (0-100), Checklist Pass/Fail
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                06
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100/70 text-indigo-800">
                Control
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Master Orchestrator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Coordinates pipeline timing, handles network failures, logs per-agent latency in milliseconds, and returns a unified JSON response rendered in real-time in the clinical UI.
            </p>
            <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-lg">
              Output: Unified Payload with Full Traceability
            </div>
          </div>
        </div>
      </section>

      {/* Preset Clinical Cases Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Curated Diagnostic Patient Profiles
            </h2>
            <p className="text-xs text-slate-600">
              Representative held-out test cohort patients demonstrating diverse cytopathological scenarios.
            </p>
          </div>
          <Link
            href="/predict"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
          >
            <span>Open Predictor with custom inputs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    caseItem.true_label === 'Malignant'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {caseItem.true_label}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    P = {(caseItem.predicted_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">
                  {caseItem.name}
                </h4>
                <p className="text-xs text-slate-500 leading-normal line-clamp-3">
                  {caseItem.clinical_note}
                </p>
              </div>

              <Link
                href={`/predict?preset=${caseItem.id}`}
                className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-700 font-semibold text-xs transition-colors"
              >
                <span>Run Agentic Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Global Feature Attribution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlobalFeatureImportanceChart importance={global_importance} />
      </section>

      {/* Vercel Serverless Architecture Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-3xl p-6 sm:p-10 border border-navy-800 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-300 font-mono text-xs border border-teal-800 font-semibold uppercase">
              Vercel Deployment Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Zero External Backend Hosting Required
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Standard Python serverless deployments on Vercel fail due to the strict 250 MB uncompressed limit when bundling C-dependencies like scipy, numba, and scikit-learn. AgenticX-Breast solves this by evaluating exact Lundberg TreeSHAP directly in optimized TypeScript.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-navy-950/80 p-4 rounded-xl border border-navy-800 space-y-1">
              <span className="text-teal-400 font-bold block">1. 100% Mathematical Fidelity</span>
              <p className="text-slate-400 leading-normal">
                Verified against Python shap.TreeExplainer to 4.9 × 10⁻⁸ machine precision. Zero simulation or mock heuristics.
              </p>
            </div>
            <div className="bg-navy-950/80 p-4 rounded-xl border border-navy-800 space-y-1">
              <span className="text-teal-400 font-bold block">2. Lightning Fast Cold-Start</span>
              <p className="text-slate-400 leading-normal">
                Entire model artifact is only 129 KB. Executes in &lt;5ms with zero heavy container warm-up delays.
              </p>
            </div>
            <div className="bg-navy-950/80 p-4 rounded-xl border border-navy-800 space-y-1">
              <span className="text-teal-400 font-bold block">3. Single-Click Vercel Deploy</span>
              <p className="text-slate-400 leading-normal">
                No Streamlit, no Hugging Face Spaces, no AWS, no Render. Frontend, API routes, inference, and RAG run exclusively on Vercel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
