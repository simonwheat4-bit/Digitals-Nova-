import React from 'react';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound({ navigate }) {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center px-4 pt-28 pb-16">
      <div className="max-w-lg w-full text-center card-glass p-10 sm:p-14 rounded-3xl border border-cyan-500/30 shadow-2xl">
        
        <div className="w-20 h-20 rounded-2xl bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan mx-auto mb-6">
          <span className="text-3xl font-black font-mono">404</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">
          Page Lost in Orbit
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          The page or digital asset you are looking for has been relocated or is currently under maintenance. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto btn-primary px-6 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <button
            onClick={() => navigate('/services')}
            className="w-full sm:w-auto btn-outline px-6 py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Explore Services</span>
          </button>
        </div>

      </div>
    </div>
  );
}
