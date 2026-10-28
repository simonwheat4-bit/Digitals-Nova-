import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/websiteData';

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const current = TESTIMONIALS[currentIndex];

  return (
    <section 
      id="testimonials-section"
      className="py-20 lg:py-24 relative overflow-hidden bg-[#030611] border-b border-[#122044]"
      aria-label="Client Testimonials"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
            WHAT OUR CLIENTS SAY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Businesses Worldwide
          </h2>
        </div>

        {/* Carousel Presentation */}
        <div className="relative flex items-center justify-center">
          
          {/* Left Arrow Button */}
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-[#08102a] border border-[#1e3a78] hover:border-cyan-400 flex items-center justify-center text-cyan-400 transition-all shrink-0 mr-4 sm:mr-6 shadow-md"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Centered Card */}
          <div className="flex-1 max-w-2xl bg-[#08102a] rounded-2xl p-6 sm:p-8 border border-[#1a3875] text-left relative flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-2xl">
            <img 
              src={current.avatar} 
              alt={current.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shrink-0"
            />
            <div className="flex-1">
              <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                "{current.quote}"
              </blockquote>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#13234d] pt-3">
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {current.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {current.role}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-[#08102a] border border-[#1e3a78] hover:border-cyan-400 flex items-center justify-center text-cyan-400 transition-all shrink-0 ml-4 sm:ml-6 shadow-md"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx 
                  ? 'w-6 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-glow-cyan' 
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
