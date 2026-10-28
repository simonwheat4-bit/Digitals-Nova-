import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  ChevronRight,
  Clock,
  HelpCircle,
  BarChart3,
  Code2,
  Palette,
  Bot,
  PenTool,
  ShoppingBag
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

export default function ServiceDetail({ serviceId, navigate }) {
  const service = SERVICES.find(s => s.id === serviceId) || SERVICES[0];
  const Icon = SERVICE_ICONS[service.id] || Sparkles;

  const otherServices = SERVICES.filter(s => s.id !== service.id);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Breadcrumb & Hero */}
      <section className="relative py-14 lg:py-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <button onClick={() => navigate('/')} className="hover:text-cyan-300">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => navigate('/services')} className="hover:text-cyan-300">Services</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cyan-400 font-semibold">{service.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs font-bold">
                  Service {service.number}
                </span>
                {service.badge && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
                    {service.badge}
                  </span>
                )}
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {service.category}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {service.title}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                {service.fullDesc}
              </p>

              {/* Status Note for AI & Automation */}
              {service.status === 'pilot' && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                  <span className="font-bold text-purple-300 block mb-1">Notice on Availability:</span>
                  This service is currently in active research & development with closed pilot deployments for select enterprise clients. Contact us to inquire about pilot availability.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => navigate('/quote')}
                  className="btn-primary px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 group shadow-glow-cyan"
                >
                  <span>Request a Custom Quote</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-outline px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2"
                >
                  <span>Schedule Consultation</span>
                </button>
              </div>
            </div>

            {/* Service Visual Box */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-sm card-glass rounded-3xl p-8 border border-cyan-500/30 flex flex-col items-center text-center shadow-card-glow">
                <div className="w-20 h-20 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan mb-4">
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {service.shortDesc}
                </p>
                {service.featuredGraphic && (
                  <div className="w-full h-32 rounded-xl bg-navy-900/60 p-2 border border-slate-800 flex items-center justify-center overflow-hidden">
                    <img 
                      src={service.featuredGraphic} 
                      alt={service.title} 
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Services Deep Dive */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-0.5 bg-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              DETAILED CAPABILITIES
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            What We Deliver in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{service.title}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {service.subServices.map((sub, idx) => (
            <div 
              key={idx}
              className="card-glass p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-navy-900 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{sub.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {sub.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center text-xs text-cyan-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Fully Managed Delivery</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering & Methodology Features */}
      <section className="py-16 bg-navy-900/60 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                Our Standards
              </span>
              <h3 className="text-2xl font-bold text-white mb-3">
                Why Brands Choose Our {service.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We combine industry-standard methodologies with proprietary optimization frameworks to ensure every deliverable generates verifiable business impact.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-navy-950/80 border border-slate-800">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other Services Navigation */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Explore Other Services</h3>
          <button 
            onClick={() => navigate('/services')}
            className="text-xs text-cyan-400 hover:text-cyan-200 font-medium flex items-center gap-1"
          >
            All Services <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {otherServices.map((other) => (
            <button
              key={other.id}
              onClick={() => navigate(`/services/${other.id}`)}
              className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="text-xs font-mono text-slate-500 mb-1">{other.number}</div>
              <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {other.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                {other.shortDesc}
              </p>
            </button>
          ))}
        </div>
      </section>

      <CtaSection navigate={navigate} />

    </div>
  );
}
