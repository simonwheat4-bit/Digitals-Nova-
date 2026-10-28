import React from 'react';
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { COMPANY_INFO } from '../data/websiteData';

export default function PrivacyPolicy({ navigate }) {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="card-glass rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Legal Documentation
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 mb-8">
            Last updated: October 2025 • Editable Corporate Template
          </p>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">1. Introduction</h2>
              <p>
                DigitalSnove ("we", "our", or "us") respects your privacy and is committed to protecting the personal information you may share with us through our website and digital services. This Privacy Policy outlines our practices concerning data collection, usage, and protection.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
              <p>
                When you interact with our website, request a quote, or contact us, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Contact information (such as your name, corporate email address, and phone number).</li>
                <li>Project details and specifications submitted via our consultation or quote forms.</li>
                <li>Technical browsing information (such as IP address, browser type, and general geographic location) collected through standard web logs and analytics.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">3. How We Use Your Information</h2>
              <p>
                We use the information collected solely for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Providing requested proposals, quotes, and project discovery evaluations.</li>
                <li>Delivering agreed digital marketing, web engineering, and design services.</li>
                <li>Communicating project updates, invoices, and service notifications.</li>
                <li>Improving our website performance and user experience.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">4. Confidentiality & Non-Disclosure</h2>
              <p>
                All proprietary client assets, source code, data strategies, and commercial ideas shared with DigitalSnove are held strictly confidential. We do not sell, rent, or trade your personal information or business data to third-party brokers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">5. Cookies & Tracking Technologies</h2>
              <p>
                Our website uses standard essential cookies and anonymized analytics to gauge page performance and optimize navigation. You may configure your browser settings to reject non-essential cookies at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">6. Contacting Our Data Privacy Team</h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to request data deletion or review, please contact our team:
              </p>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300">
                Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-cyan-400 underline">{COMPANY_INFO.email}</a><br />
                Address: DigitalSnove Global Operations
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
