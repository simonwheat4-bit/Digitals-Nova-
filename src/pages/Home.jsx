import React from 'react';
import { 
  ArrowRight, 
  Globe2, 
  Clock, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Star, 
  Target, 
  Award, 
  MessageSquareCheck
} from 'lucide-react';
import ServicesCarousel from '../components/ServicesCarousel';
import ProcessTimeline from '../components/ProcessTimeline';
import TestimonialsSlider from '../components/TestimonialsSlider';
import CtaSection from '../components/CtaSection';
import FaqAccordion from '../components/FaqAccordion';
import StatsCounter from '../components/StatsCounter';
import { COMPANY_INFO, PORTFOLIO_PROJECTS, WHY_CHOOSE_US } from '../data/websiteData';

export default function Home({ navigate }) {
  return (
    <div className="min-h-screen bg-[#030611] text-slate-100">
      
      {/* =========================================================================
          1. HERO SECTION (100% faithful to approved mockup)
          ========================================================================= */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden border-b border-[#122044]">
        {/* Ambient subtle glow behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Eyebrow */}
              <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span>DIGITAL MARKETING</span>
                <span className="text-slate-600">•</span>
                <span>WEB DEVELOPMENT</span>
                <span className="text-slate-600">•</span>
                <span>AI TOOLS</span>
                <span className="text-slate-600">•</span>
                <span>MORE</span>
              </div>

              {/* Main Heading: "Digital World" in solid cyan */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Your Growth Partner <br />
                in the <span className="text-[#00e5ff]">Digital World</span>
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                At DigitalSnove, we help businesses grow globally with innovative digital marketing, powerful web solutions, AI tools and a wide range of digital services. We turn your ideas into digital success.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => navigate('/quote')}
                  className="px-7 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[#00b4d8] via-[#2563eb] to-[#7c3aed] text-white flex items-center gap-2 shadow-glow-cyan hover:opacity-95 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/services')}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#070e24] border border-[#1e3a78] text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Explore Our Services</span>
                </button>
              </div>

              {/* 3 Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#13234d]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0a1435] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Global Reach</h4>
                    <p className="text-[10px] text-slate-400">Worldwide Services</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0a1435] border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">24/7 Support</h4>
                    <p className="text-[10px] text-slate-400">Always Here for You</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0a1435] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">100% Satisfaction</h4>
                    <p className="text-[10px] text-slate-400">Your Success, Our Priority</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Globe + Devices Mockup */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-full max-w-xl">
                <img 
                  src="/assets/hero-devices.png" 
                  alt="DigitalSnove 3D Globe and Devices" 
                  className="w-full h-auto object-contain filter drop-shadow-[0_0_35px_rgba(0,242,254,0.3)]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SERVICES SECTION (2 featured cards + supporting cards)
          ========================================================================= */}
      <ServicesCarousel navigate={navigate} />

      {/* =========================================================================
          3. ABOUT DIGITALSNOVE SECTION (3-column layout)
          ========================================================================= */}
      <section className="py-20 lg:py-24 relative overflow-hidden bg-[#030611] border-b border-[#122044]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block">
                ABOUT DIGITALSNOVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                More Than Just a Service <br />
                We Build Long-Term Partnerships
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                DigitalSnove is a full-service digital agency helping businesses worldwide with digital marketing, web development, AI tools and more. Our mission is to deliver innovative, scalable and affordable solutions that create real value and long-term growth.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/about')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#070e24] border border-[#1e3a78] text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Center Column: 4 Circular Glowing Stats */}
            <div className="lg:col-span-3 space-y-5">
              {COMPANY_INFO.stats.map((stat, idx) => {
                const iconMap = { Globe: Globe2, Briefcase, Star, Users };
                const IconComponent = iconMap[stat.icon] || Globe2;

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#0a1538] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-white tracking-tight">
                        <StatsCounter 
                          targetValue={stat.value} 
                          suffix={stat.suffix} 
                          isDecimal={stat.isDecimal} 
                        />
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Office Photo */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-[#1a3875] shadow-2xl">
                <img 
                  src="/assets/about-office.png" 
                  alt="DigitalSnove Global Headquarters" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. FEATURED PROJECTS SECTION (Matching 4 card layout)
          ========================================================================= */}
      <section className="py-20 lg:py-24 relative overflow-hidden bg-[#030611] border-b border-[#122044]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                OUR WORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Projects
              </h2>
              <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl">
                Real solutions. Measurable results. Explore some of our recent projects and see how we help businesses grow.
              </p>
            </div>

            <button
              onClick={() => navigate('/portfolio')}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#070e24] border border-[#1e3a78] text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group self-start sm:self-auto"
            >
              <span>View Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 4 Clean Project Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PORTFOLIO_PROJECTS.map((proj) => (
              <div 
                key={proj.id}
                onClick={() => navigate('/portfolio')}
                className="cursor-pointer bg-[#08102a] rounded-2xl overflow-hidden border border-[#1a3875] hover:border-cyan-400/70 transition-all flex flex-col justify-between group shadow-lg"
              >
                {/* Artwork */}
                <div className="p-4 bg-[#050b1d] h-40 flex items-center justify-center overflow-hidden">
                  <img 
                    src={proj.image} 
                    alt={proj.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Bottom title & round arrow button */}
                <div className="p-4 flex items-center justify-between border-t border-[#13234d] gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. OUR PROCESS (Connected 5-step timeline with wave)
          ========================================================================= */}
      <ProcessTimeline navigate={navigate} />

      {/* =========================================================================
          6. WHY CHOOSE US SECTION
          ========================================================================= */}
      <section className="py-20 lg:py-24 relative overflow-hidden bg-[#030611] border-b border-[#122044]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Heading & Copy */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block">
                WHY CHOOSE US
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                More Than Just a Service <br />
                We Build Long-Term Partnerships
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                We take time to understand your business, your goals and your audience. Our focus is on delivering real results through strategy, creativity and technology.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/about')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#070e24] border border-[#1e3a78] text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Center: 4 Benefits */}
            <div className="lg:col-span-4 space-y-4">
              {WHY_CHOOSE_US.map((benefit, idx) => {
                const iconMap = { Target, Award, MessageSquareCheck, Clock };
                const IconComponent = iconMap[benefit.icon] || Target;

                return (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#0a1538] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">{benefit.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: 3D Cubes */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="w-64 h-64 flex items-center justify-center">
                <img 
                  src="/assets/why-choose-cubes.png" 
                  alt="3D Glowing Isometric Cubes"
                  className="w-full h-auto object-contain filter drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. TESTIMONIALS SLIDER
          ========================================================================= */}
      <TestimonialsSlider />

      {/* =========================================================================
          8. CONTACT CTA / GLOBAL EARTH BANNER
          ========================================================================= */}
      <CtaSection navigate={navigate} />

      {/* =========================================================================
          9. FAQ SECTION
          ========================================================================= */}
      <FaqAccordion navigate={navigate} />

    </div>
  );
}
