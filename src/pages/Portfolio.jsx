import React, { useState } from 'react';
import { 
  ArrowRight, 
  ExternalLink, 
  Tag, 
  Calendar, 
  User, 
  CheckCircle2, 
  Sparkles,
  X,
  Filter
} from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../data/websiteData';
import CtaSection from '../components/CtaSection';

export default function Portfolio({ navigate }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'marketing', label: 'Digital Marketing' },
    { id: 'web', label: 'Web Development' },
    { id: 'ai', label: 'AI & Innovation' },
    { id: 'ecommerce', label: 'E-Commerce' },
  ];

  const filteredProjects = selectedFilter === 'all'
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter(p => p.filterTag === selectedFilter);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* Portfolio Header */}
      <section className="relative py-16 lg:py-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Proven Track Record
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Our Work Speaks Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Measurable Results
            </span>
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Explore our featured client partnerships, enterprise platforms, and revenue-generating digital campaigns executed across industries worldwide.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? 'btn-primary text-navy-950 shadow-glow-cyan'
                    : 'bg-navy-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="cursor-pointer card-glass rounded-3xl overflow-hidden border border-slate-800/80 hover:border-cyan-400/50 group flex flex-col justify-between shadow-card-glow"
            >
              {/* Artwork Box */}
              <div className="h-64 sm:h-72 bg-navy-900/80 p-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-950/60 z-10" />
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_20px_rgba(0,242,254,0.25)] group-hover:scale-105 transition-transform duration-500 relative z-0"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-navy-950/90 border border-cyan-500/30 text-cyan-300 backdrop-blur-md">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" /> {project.client}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {project.year}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {project.summary}
                  </p>

                  {/* Measurable Outcome Callout */}
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-medium mb-5 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{project.outcome}</span>
                  </div>

                  {/* Technology Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-navy-900 border border-slate-700/60 text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-200">
                  <span>View Case Study Breakdown</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="w-full max-w-2xl bg-navy-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 inline-block mb-3">
              {selectedProject.category} Case Study
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {selectedProject.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 mb-4 border-b border-slate-800">
              <span>Client: <strong className="text-slate-200">{selectedProject.client}</strong></span>
              <span>Year: <strong className="text-slate-200">{selectedProject.year}</strong></span>
            </div>

            <div className="w-full h-48 bg-navy-950 rounded-2xl p-4 flex items-center justify-center border border-slate-800 mb-6">
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              <h4 className="font-bold text-white text-base">Project Challenge & Solution:</h4>
              <p>{selectedProject.summary}</p>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Verified Client Outcome: {selectedProject.outcome}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => { setSelectedProject(null); navigate('/quote'); }}
                className="btn-primary text-xs px-5 py-2.5 rounded-full font-bold flex items-center gap-1.5"
              >
                <span>Request Similar Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}

      <CtaSection navigate={navigate} />

    </div>
  );
}
