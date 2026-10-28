import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Code2,
  Palette,
  Bot,
  PenTool,
  ShoppingBag,
  Zap,
  Globe2
} from 'lucide-react';
import { SERVICES } from '../data/websiteData';
import CtaSection from '../components/CtaSection';

const SERVICE_ICONS = {
  'digital-marketing': BarChart3,
  'web-development': Code2,
  'graphic-design': Palette,
  'ai-automation': Bot,
  'content-creation': PenTool,
  'ecommerce-solutions': ShoppingBag
};

export default function ServicesOverview({ navigate }) {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Services Header Banner */}
      <section className="relative py-16 lg:py-24 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Comprehensive Digital Capabilities
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            High-Performance Digital Services Built For{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Global Scale
            </span>
          </h1>

          <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From strategic digital marketing campaigns and bespoke web platforms to creative brand identities and intelligent automation workflows.
          </p>
        </div>
      </section>

      {/* 6 Comprehensive Service Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id] || Sparkles;

            return (
              <div 
                key={service.id}
                className="card-glass rounded-3xl p-8 flex flex-col justify-between relative group hover:border-cyan-400/50 shadow-card-glow"
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {service.badge && (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {service.badge}
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {service.number}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
                    {service.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {service.shortDesc}
                  </p>

                  {/* Subservice List */}
                  <div className="space-y-2.5 mb-8">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Core Offerings:
                    </span>
                    {service.subServices.map((sub, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{sub.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-200 flex items-center gap-2 group/btn"
                  >
                    <span>Explore Full Service</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                  </button>
                  <span className="text-xs text-slate-500 font-mono">
                    {service.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global CTA Strip */}
      <CtaSection navigate={navigate} />

    </div>
  );
}
