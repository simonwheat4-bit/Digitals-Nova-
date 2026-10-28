import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { FAQS } from '../data/websiteData';

export default function FaqAccordion({ navigate }) {
  // First item open by default
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section 
      id="faq-section"
      className="py-20 lg:py-24 relative overflow-hidden bg-[#030611] border-b border-[#122044]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Heading, Description & 3D Artwork */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Got Questions? <br />
                We've Got Answers.
              </h2>
              <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                Find quick answers to the most common questions about our services, process, pricing and more.
              </p>
            </div>

            {/* Glowing 3D Question Mark Artwork (from approved mockup) */}
            <div className="pt-2">
              <div className="w-56 h-28 flex items-center justify-start">
                <img 
                  src="/assets/faq-graphic.png" 
                  alt="Frequently Asked Questions Artwork" 
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 5 Rounded Accordion Rows */}
          <div className="lg:col-span-7 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              const contentId = `faq-content-${idx}`;
              const buttonId = `faq-btn-${idx}`;

              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-[#08102a] border border-[#1a3875] hover:border-cyan-400/50 transition-all overflow-hidden"
                >
                  <h3>
                    <button
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => toggle(idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none rounded-2xl group"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors pr-4">
                        {faq.question}
                      </span>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors">
                        {isOpen ? <Minus className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                  </h3>

                  {isOpen && (
                    <div 
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#13234d]"
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
