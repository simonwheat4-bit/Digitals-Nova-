import React from 'react';
import { 
  ArrowRight, 
  Globe2, 
  ShieldCheck, 
  Target, 
  Users, 
  Zap, 
  Award, 
  Sparkles,
  CheckCircle2,
  Briefcase,
  Star
} from 'lucide-react';
import { COMPANY_INFO, WHY_CHOOSE_US } from '../data/websiteData';
import StatsCounter from '../components/StatsCounter';
import ProcessTimeline from '../components/ProcessTimeline';
import CtaSection from '../components/CtaSection';

export default function About({ navigate }) {
  const VALUES = [
    {
      title: "Think Digital. Go Global.",
      desc: "We believe geographical boundaries should never limit commercial growth. Our architectures and marketing systems are built for international reach from day one.",
      icon: Globe2
    },
    {
      title: "Radical Engineering Transparency",
      desc: "Clear timelines, predictable sprint milestones, transparent codebases, and zero hidden costs or technical debt.",
      icon: ShieldCheck
    },
    {
      title: "Obsession with Client Outcomes",
      desc: "We measure our success purely by the business impact, conversion lift, and verified return on investment delivered to our partners.",
      icon: Target
    },
    {
      title: "Continuous Innovation & AI",
      desc: "We continuously master emerging technologies, modern frontend standards, and automated workflows to keep our clients ahead of market curves.",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Hero Banner */}
      <section className="relative py-16 lg:py-24 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> About DigitalSnove
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Architecting Global Success Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Strategy & Technology
            </span>
          </h1>

          <p className="mt-5 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            DigitalSnove is a full-service digital agency founded on one bold mission: helping businesses scale globally with modern digital marketing, robust web applications, creative branding, and intelligent workflows.
          </p>
        </div>
      </section>

      {/* Main Story & Office Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              OUR MISSION & IDENTITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              We Don't Just Build Websites. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                We Build Long-Term Commercial Partnerships.
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              At DigitalSnove, our collaborative team combines senior software engineers, creative brand designers, data analysts, and conversion specialists. We treat your digital presence as a mission-critical revenue engine.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Whether you need to dominate search rankings in competitive international niches, engineer a high-throughput e-commerce store, or modernize your visual brand identity, we deliver tailored solutions engineered to outperform.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/quote')}
                className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-full font-bold flex items-center gap-2"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Office Photo with DigitalSnove Logo */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl relative group">
              <img 
                src="/assets/about-office.png" 
                alt="DigitalSnove Global Office" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-navy-950/85 backdrop-blur-md border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="font-semibold text-white">DigitalSnove Studio & Operations</span>
                <span className="text-cyan-400">Global Reach</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Verified Verified Statistics */}
      <section className="py-16 bg-navy-900/60 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPANY_INFO.stats.map((stat, idx) => {
              const iconMap = { Globe: Globe2, Briefcase, Star, Users };
              const IconComponent = iconMap[stat.icon] || Globe2;

              return (
                <div key={idx} className="p-6 rounded-2xl card-glass border border-slate-800 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan mb-3">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">
                    <StatsCounter 
                      targetValue={stat.value} 
                      suffix={stat.suffix} 
                      isDecimal={stat.isDecimal} 
                    />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2">
            WHAT WE STAND FOR
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VALUES.map((val, idx) => {
            const IconComponent = val.icon;
            return (
              <div key={idx} className="card-glass p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1 shadow-glow-cyan">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{val.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5-Step Process */}
      <ProcessTimeline navigate={navigate} />

      <CtaSection navigate={navigate} />

    </div>
  );
}
