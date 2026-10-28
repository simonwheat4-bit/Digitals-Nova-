import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Palette,
  Bot,
  Megaphone,
  Code
} from 'lucide-react';
import { SERVICES } from '../data/websiteData';

export default function ServicesCarousel({ navigate }) {
  const servicePairs = [
    [SERVICES[0], SERVICES[1]], // Digital Marketing + Web Development
    [SERVICES[2], SERVICES[3]], // Graphic Design & Branding + AI Tools & Automation
    [SERVICES[4], SERVICES[5]]  // Content Creation + E-commerce Solutions
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || isPaused) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentSlide((prev) => (prev + 1) % servicePairs.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused, servicePairs.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % servicePairs.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + servicePairs.length) % servicePairs.length);

  const currentPair = servicePairs[currentSlide];

  return (
    <section 
      id="services-section"
      className="py-20 lg:py-24 relative overflow-hidden bg-[#040714] border-t border-[#122044] border-b"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
              OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Digital Solutions Built <br className="hidden sm:block" />
              Around Your Goals
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-xl">
              From your first website to a more effective digital marketing strategy, focus on the work your business needs.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/services')}
              className="px-5 py-2 rounded-full text-xs font-semibold text-slate-200 border border-[#1e3a78] hover:border-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group bg-[#070e24]"
            >
              <span>View All Services</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Slider Controls */}
            <div className="flex items-center gap-2 bg-[#070e24] p-1 rounded-full border border-[#1e3a78]">
              <button
                onClick={prevSlide}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors"
                aria-label="Previous service slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-cyan-400 px-1 font-bold">
                0{currentSlide + 1} / 0{servicePairs.length}
              </span>
              <button
                onClick={nextSlide}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors"
                aria-label="Next service slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2 Featured Large Cards + Right Stacked Supporting Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Featured Card A */}
          <div className="lg:col-span-5 flex">
            <div className="w-full bg-[#08102a] rounded-2xl p-6 sm:p-7 border border-[#1a3875] flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/60 transition-all duration-300 shadow-lg">
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {currentPair[0].number}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Megaphone className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {currentPair[0].title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-5 max-w-sm">
                  {currentPair[0].shortDesc}
                </p>

                <div className="space-y-2 mb-6">
                  {currentPair[0].subServices.slice(0, 4).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="truncate">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Bottom: Explore Link & Graphic Art */}
              <div className="flex items-end justify-between pt-4 border-t border-[#13234d] relative z-10">
                <button
                  onClick={() => navigate(`/services/${currentPair[0].id}`)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-200 flex items-center gap-1.5 group/btn"
                >
                  <span>Explore {currentPair[0].title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                {currentPair[0].featuredGraphic && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-end justify-end shrink-0">
                    <img 
                      src={currentPair[0].featuredGraphic} 
                      alt={currentPair[0].title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(0,242,254,0.35)]" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Card B */}
          <div className="lg:col-span-4 flex">
            <div className="w-full bg-[#08102a] rounded-2xl p-6 sm:p-7 border border-[#1a3875] flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400/60 transition-all duration-300 shadow-lg">
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {currentPair[1].number}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Code className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {currentPair[1].title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-5 max-w-sm">
                  {currentPair[1].shortDesc}
                </p>

                <div className="space-y-2 mb-6">
                  {currentPair[1].subServices.slice(0, 4).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="truncate">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-[#13234d] relative z-10">
                <button
                  onClick={() => navigate(`/services/${currentPair[1].id}`)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-200 flex items-center gap-1.5 group/btn"
                >
                  <span>Explore {currentPair[1].title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                {currentPair[1].featuredGraphic && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-end justify-end shrink-0">
                    <img 
                      src={currentPair[1].featuredGraphic} 
                      alt={currentPair[1].title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Supporting Cards */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4">
            
            {/* Supporting Card 03 */}
            <div 
              onClick={() => navigate('/services/graphic-design')}
              className="cursor-pointer bg-[#08102a] rounded-2xl p-5 border border-[#1a3875] hover:border-cyan-400/60 transition-all flex flex-col justify-between flex-1 group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-bold">03</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Graphic Design & Branding
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Create a strong visual identity that makes your brand stand out.
                </p>
              </div>
              <div className="pt-3 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Supporting Card 04 */}
            <div 
              onClick={() => navigate('/services/ai-automation')}
              className="cursor-pointer bg-[#08102a] rounded-2xl p-5 border border-[#1a3875] hover:border-cyan-400/60 transition-all flex flex-col justify-between flex-1 group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/50 font-semibold">
                    Future Offering
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  AI & Automation
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Tools and workflow solutions to help you work smarter.
                </p>
              </div>
              <div className="pt-3 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {servicePairs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentSlide === idx 
                  ? 'w-7 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-glow-cyan' 
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
