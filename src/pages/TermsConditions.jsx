import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { COMPANY_INFO } from '../data/websiteData';

export default function TermsConditions({ navigate }) {
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
            <FileText className="w-4 h-4" /> Legal Documentation
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-400 mb-8">
            Last updated: October 2025 • Editable Corporate Terms Template
          </p>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
              <p>
                By accessing our website or engaging DigitalSnove for design, development, marketing, or automation services, you agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using our website and services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">2. Scope of Services & Statements of Work</h2>
              <p>
                All digital deliverables, project timelines, milestone disbursements, and acceptance criteria are governed by individual written proposals or Statements of Work (SOW) executed between DigitalSnove and the client.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">3. Intellectual Property Rights</h2>
              <p>
                Upon receipt of full payment for custom design and web development projects, all custom code, graphical assets, and content created specifically for the client become the client's sole intellectual property, unless otherwise stipulated in the governing SOW. DigitalSnove retains the right to showcase non-confidential deliverables in our portfolio.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">4. Client Responsibilities</h2>
              <p>
                Clients agree to provide timely feedback, necessary credentials, and approved content required for project milestones. Delays resulting from missing client approvals may adjust project timelines accordingly.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
              <p>
                DigitalSnove provides services using professional industry care and best practices. Under no circumstances shall DigitalSnove be liable for indirect, incidental, or consequential damages resulting from third-party hosting failures, ad platform policy adjustments, or client-modified codebases.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-white">6. Inquiries & Governance</h2>
              <p>
                For questions concerning these terms or formal contract executions, please reach us at:
              </p>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300">
                Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-cyan-400 underline">{COMPANY_INFO.email}</a><br />
                Entity: DigitalSnove — Think Digital. Go Global.
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
