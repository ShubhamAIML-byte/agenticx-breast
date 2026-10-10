'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Activity, Sparkles, Database, Sliders, Layers, FileText, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/predict', label: 'Clinical Predictor', icon: Sparkles },
    { href: '/evaluation', label: 'Model Evaluation', icon: Database },
    { href: '/robustness', label: 'Robustness Testing', icon: Sliders },
    { href: '/ablation', label: 'Ablation Study', icon: Layers },
    { href: '/methodology', label: 'Methodology & Docs', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-800 text-white shadow-lg backdrop-blur-md">
      {/* Top Clinical Research Notice Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-navy-950 to-navy-900 px-4 py-1.5 text-xs text-teal-200 border-b border-teal-800/40 flex items-center justify-between">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-medium">RESEARCH DECISION-SUPPORT PROTOTYPE:</strong> Developed for M.Tech AIML dissertation. All outputs require clinical correlation within the Triple Assessment framework.
          </span>
          <span className="ml-auto hidden md:flex items-center space-x-1.5 text-teal-300 font-mono text-[11px] shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Vercel Serverless Edge Ready</span>
          </span>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-navy-950 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors">
                  AgenticX<span className="text-teal-400">-Breast</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                  M.Tech AIML
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Explainable Multi-Agent Breast Cancer Classification
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Badge */}
          <div className="flex items-center space-x-2">
            <Link
              href="/predict"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-navy-950 text-xs font-semibold shadow-sm transition-all hover:shadow-teal-500/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Intake</span>
            </Link>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto py-2 border-t border-navy-800 no-scrollbar">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
