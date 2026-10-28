import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { SERVICES } from '../data/websiteData';

export default function GetQuote({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    services: ['web-development'],
    budget: '$5,000 - $15,000',
    timeline: '1-2 Months',
    description: '',
    hasExistingSite: 'yes',
    existingSiteUrl: ''
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [errors, setErrors] = useState({});

  const toggleService = (srvId) => {
    setFormData(prev => {
      const exists = prev.services.includes(srvId);
      if (exists) {
        if (prev.services.length === 1) return prev; // Keep at least one
        return { ...prev, services: prev.services.filter(s => s !== srvId) };
      } else {
        return { ...prev, services: [...prev.services, srvId] };
      }
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Valid email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid work email';
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      errs.description = 'Please describe your project scope (minimum 15 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Header Banner */}
      <section className="relative py-16 lg:py-20 overflow-hidden border-b border-slate-800/80 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-gradient-to-r from-cyan-500/10 via-blue-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Fast Project Estimation
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Request a Free Project{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Proposal & Quote
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Tell us about your objectives. We will analyze your scope, estimate engineering effort, and return a tailored fixed-price proposal within 24 business hours.
          </p>
        </div>
      </section>

      {/* Main Quote Form Container */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="card-glass p-8 sm:p-12 rounded-3xl border border-cyan-500/30 shadow-card-glow relative">
          
          {status === 'success' ? (
            <div className="text-center py-16 space-y-5 animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Proposal Request Received!</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.name}</strong>. Our solution architects have received your requirements and are currently reviewing your project scope.
              </p>
              <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 text-xs text-slate-400 max-w-md mx-auto text-left space-y-1">
                <div><span className="text-cyan-400 font-semibold">Selected Services:</span> {formData.services.join(', ')}</div>
                <div><span className="text-cyan-400 font-semibold">Target Budget:</span> {formData.budget}</div>
                <div><span className="text-cyan-400 font-semibold">Response Sent To:</span> {formData.email}</div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="btn-primary text-xs px-6 py-3 rounded-full font-bold"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              
              {/* Step 1: Select Services */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  1. Which digital capabilities do you require? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SERVICES.map((srv) => {
                    const isSelected = formData.services.includes(srv.id);
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-glow-cyan'
                            : 'bg-navy-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block mb-0.5">{srv.title}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{srv.category}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2" htmlFor="quote-budget">
                    2. Estimated Project Budget
                  </label>
                  <select
                    id="quote-budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Under $2,500">Under $2,500 (Starter project)</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000 (Standard website)</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000 (Custom build / Store)</option>
                    <option value="$15,000 - $30,000">$15,000 - $30,000 (Full-scale platform)</option>
                    <option value="$30,000+">$30,000+ (Enterprise transformation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2" htmlFor="quote-timeline">
                    3. Target Delivery Timeline
                  </label>
                  <select
                    id="quote-timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Urgent (< 3 weeks)">Urgent (&lt; 3 weeks)</option>
                    <option value="1-2 Months">1 - 2 Months (Recommended)</option>
                    <option value="2-4 Months">2 - 4 Months (Comprehensive)</option>
                    <option value="Flexible">Flexible / Ongoing Partnership</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Contact Details */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  4. Your Contact Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none ${
                        errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Work Email Address *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none ${
                        errors.email ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Company / Organization Name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700 focus:border-cyan-400 text-white text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Phone / WhatsApp (Optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700 focus:border-cyan-400 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Project Scope Description */}
              <div>
                <label className="block text-sm font-bold text-white mb-2" htmlFor="quote-desc">
                  5. Project Scope & Deliverables *
                </label>
                <textarea
                  id="quote-desc"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline what features you need, any reference websites you like, your target audience, and your primary commercial goal..."
                  className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none resize-none ${
                    errors.description ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-400'
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description}
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full btn-primary py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Scope & Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request for Free Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1 text-cyan-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Confidential
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> 24-Hour Proposal Turnaround
                </span>
                <span>No Obligation Proposal</span>
              </div>
            </form>
          )}

        </div>
      </section>

    </div>
  );
}
