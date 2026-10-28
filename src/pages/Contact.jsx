import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { COMPANY_INFO, SERVICES } from '../data/websiteData';

export default function Contact({ navigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'web-development',
    budget: '$5,000 - $10,000',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide at least 10 characters describing your project';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    // Simulate backend delivery / webhook post
    setTimeout(() => {
      setStatus('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Header Banner */}
      <section className="relative py-16 lg:py-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Start the Conversation
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Let's Discuss Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Next Digital Milestone
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Have a project in mind, need technical consultation, or want to scale your digital presence? We're ready to help.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Info Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2">
                CONTACT DETAILS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                We're Here For You.
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Reach out to our global strategy team through any of the verified channels below. We respond within 24 business hours.
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-navy-850 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Inquiry</h3>
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {COMPANY_INFO.email}
                  </p>
                  <span className="text-[11px] text-slate-500">24/7 Monitoring</span>
                </div>
              </a>

              <a 
                href={`tel:${COMPANY_INFO.phone.replace(/\s+/g, '')}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-navy-850 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-glow-blue shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Phone</h3>
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {COMPANY_INFO.phone}
                  </p>
                  <span className="text-[11px] text-slate-500">Mon - Sat: 9:00 AM - 6:00 PM</span>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-navy-900/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-navy-850 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-glow-purple shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Reach</h3>
                  <p className="text-sm font-semibold text-white">
                    {COMPANY_INFO.location}
                  </p>
                  <span className="text-[11px] text-slate-500">Serving clients across 30+ nations</span>
                </div>
              </div>
            </div>

            {/* Response Time Guarantee Box */}
            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Quick Response Commitment</span>
              </div>
              <p className="leading-relaxed">
                Every inquiry is reviewed by our lead technical architects and growth directors. You will receive an initial assessment within 24 hours.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="card-glass p-8 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-card-glow relative">
              
              {status === 'success' ? (
                <div className="text-center py-12 space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Transmitted!</h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.name}</strong>. Our team has received your project briefing and will contact you at <strong className="text-cyan-400">{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        service: 'web-development',
                        budget: '$5,000 - $10,000',
                        message: ''
                      });
                    }}
                    className="btn-outline px-6 py-2.5 rounded-full text-xs font-semibold mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="contact-name">
                        Your Full Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alexander Vance"
                        className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none transition-colors ${
                          errors.name ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700/80 focus:border-cyan-400'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="contact-email">
                        Work Email Address <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alexander@company.com"
                        className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none transition-colors ${
                          errors.email ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700/80 focus:border-cyan-400'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="contact-phone">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700/80 focus:border-cyan-400 text-white text-sm focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Service Selection */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="contact-service">
                        Required Service
                      </label>
                      <select
                        id="contact-service"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700/80 focus:border-cyan-400 text-white text-sm focus:outline-none transition-colors"
                      >
                        {SERVICES.map((s) => (
                          <option key={s.id} value={s.id} className="bg-navy-950 text-white">
                            {s.title} {s.badge ? `(${s.badge})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="contact-msg">
                      Project Goals & Details <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your brand, what you want to achieve, timeline, and any specific requirements..."
                      className={`w-full px-4 py-3 rounded-xl bg-navy-900 border text-white text-sm focus:outline-none transition-colors resize-none ${
                        errors.message ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700/80 focus:border-cyan-400'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow-cyan transition-all disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                          <span>Encrypting & Sending Brief...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Project Brief</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center pt-1">
                    🔒 We respect your privacy. All details are kept confidential under our mutual NDA protocol.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
