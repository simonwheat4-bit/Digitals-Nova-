import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  Code, 
  Settings, 
  TrendingUp, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { PROCESS_STEPS } from '../data/websiteData';

export default function ProcessTimeline({ navigate }) {
  const [activeStep, setActiveStep] = useState(0);

  const stepIcons = [
    Search,     // 01 Discover
    FileText,   // 02 Plan
    Code,       // 03 Build
    Settings,   // 04 Refine
    TrendingUp  // 05 Grow
  ];

  return (
    <section 
      id="process-section"
      className="py-20 lg:py-24 relative overflow-hidden bg-[#040714] border-t border-[#122044] border-b"
    >
      {/* Background purple and cyan neon wave (faithfully matching approved reference) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-60">
        <svg 
          className="w-full h-full min-w-[1200px]" 
          viewBox="0 0 1440 320" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M-100 160 C 200 40, 500 280, 850 140 C 1150 20, 1400 240, 1600 160" 
            stroke="url(#wave-cyan-purple)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <path 
            d="M-50 190 C 250 80, 550 300, 900 170 C 1200 50, 1450 260, 1650 190" 
            stroke="url(#wave-purple-cyan)" 
            strokeWidth="2" 
            strokeDasharray="6 6"
            className="opacity-70"
          />
          <defs>
            <linearGradient id="wave-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="wave-purple-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#00f2fe" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
              OUR PROCESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple Steps to Big Results
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl">
              A clear and proven process to turn your ideas into digital success.
            </p>
          </div>

          <button
            onClick={() => navigate('/about')}
            className="btn-outline px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 group self-start sm:self-auto"
          >
            <span>View Our Process</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Desktop Connected Horizontal Timeline */}
        <div className="hidden lg:block relative pt-4 pb-8">
          
          {/* Connecting Line with glowing blue pulse */}
          <div className="absolute top-16 left-20 right-20 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-glow-cyan" />

          <div className="grid grid-cols-5 gap-6 relative z-10">
            {PROCESS_STEPS.map((step, idx) => {
              const Icon = stepIcons[idx] || Search;
              const isActive = activeStep === idx;

              return (
                <div 
                  key={step.step}
                  onMouseEnter={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300"
                >
                  {/* Glowing Circular Icon Container */}
                  <div className="relative mb-5">
                    <div className={`w-20 h-20 rounded-full p-[2px] transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-glow-cyan scale-110' 
                        : 'bg-[#1a2d5a] hover:bg-cyan-500/50 shadow-md'
                    }`}>
                      <div className="w-full h-full rounded-full bg-[#060b1d] flex items-center justify-center">
                        <Icon className={`w-7 h-7 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-blue-400 group-hover:text-cyan-300'
                        }`} />
                      </div>
                    </div>

                    {/* Arrow between steps */}
                    {idx < PROCESS_STEPS.length - 1 && (
                      <div className="absolute top-1/2 -right-4 -translate-y-1/2 text-cyan-400 z-20">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
                    {step.step}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                    {step.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[190px]">
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet Vertical Timeline */}
        <div className="lg:hidden relative pl-8 border-l-2 border-cyan-500/40 space-y-8">
          {PROCESS_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx] || Search;

            return (
              <div key={step.step} className="relative">
                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-[#060b1d] border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="bg-[#070e24] p-5 rounded-2xl border border-cyan-500/20">
                  <span className="text-xs font-mono font-bold text-cyan-400 block mb-1">
                    0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">{step.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
