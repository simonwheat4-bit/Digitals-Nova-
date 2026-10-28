import React from 'react';
import { ArrowRight, Mail, Phone, Globe } from 'lucide-react';
import { COMPANY_INFO } from '../data/websiteData';

export default function CtaSection({ navigate }) {
  return (
    <section className="py-14 sm:py-16 relative px-4 sm:px-6 lg:px-8 bg-[#030611] border-b border-[#122044]">
      <div className="max-w-7xl mx-auto rounded-3xl relative overflow-hidden bg-gradient-to-r from-[#0d1e56] via-[#081338] to-[#030718] border border-[#1a3875] p-8 sm:p-12 lg:p-14 shadow-2xl">
        
        {/* Glow behind globe */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left / Center content */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              LET'S WORK TOGETHER
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Grow Your <br />
              Business Digitally?
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-lg leading-relaxed">
              Get in touch with us today and let's turn your ideas into success.
            </p>

            <div className="pt-1">
              <button
                onClick={() => navigate('/quote')}
                className="px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#00b4d8] via-[#2563eb] to-[#7c3aed] flex items-center gap-2 shadow-glow-cyan hover:opacity-95 transition-all"
              >
                <span>Get a Free Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Contact details row */}
            <div className="pt-6 border-t border-[#132b5e] flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <a 
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-center gap-2.5 hover:text-cyan-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0d1f4d] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span className="font-semibold text-white">{COMPANY_INFO.email}</span>
                </div>
              </a>

              <a 
                href={`tel:${COMPANY_INFO.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2.5 hover:text-cyan-300 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0d1f4d] border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-semibold text-white">{COMPANY_INFO.phone}</span>
                </div>
              </a>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0d1f4d] border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Location</span>
                  <span className="font-semibold text-white">{COMPANY_INFO.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 3D Holographic Globe Artwork */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-72 sm:w-80 h-auto">
              <img 
                src="/assets/cta-globe.png" 
                alt="Global Digital Connectivity" 
                className="w-full h-auto object-contain filter drop-shadow-[0_0_30px_rgba(0,242,254,0.4)]"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
