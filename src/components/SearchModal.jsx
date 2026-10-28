import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, FileText, Briefcase } from 'lucide-react';
import { SERVICES, PORTFOLIO_PROJECTS, BLOG_POSTS } from '../data/websiteData';

export default function SearchModal({ isOpen, onClose, navigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter services
  const matchingServices = SERVICES.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
    s.subServices.some(sub => sub.name.toLowerCase().includes(query.toLowerCase()))
  );

  // Filter projects
  const matchingProjects = PORTFOLIO_PROJECTS.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  // Filter blogs
  const matchingBlogs = BLOG_POSTS.filter(b => 
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-navy-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, case studies, technologies, insights..."
            className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-base sm:text-lg"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-5 pr-1">
          {/* Quick Shortcuts if query is empty */}
          {!query.trim() && (
            <div className="py-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {['Web Development', 'Digital Marketing', 'Shopify Store', 'AI Tools', 'SEO Services', 'Portfolio Case Studies'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-3 py-1.5 rounded-full bg-navy-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Services Matches */}
          {matchingServices.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Services ({matchingServices.length})
              </span>
              <div className="space-y-1.5">
                {matchingServices.map(srv => (
                  <button
                    key={srv.id}
                    onClick={() => handleSelect(`/services/${srv.id}`)}
                    className="w-full p-3 rounded-xl bg-navy-850/60 hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 text-left flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        {srv.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {srv.shortDesc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Project Matches */}
          {matchingProjects.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Portfolio Projects ({matchingProjects.length})
              </span>
              <div className="space-y-1.5">
                {matchingProjects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => handleSelect('/portfolio')}
                    className="w-full p-3 rounded-xl bg-navy-850/60 hover:bg-slate-800/80 border border-transparent hover:border-blue-500/30 text-left flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-blue-300">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {proj.summary}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blog Matches */}
          {matchingBlogs.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Articles & Insights ({matchingBlogs.length})
              </span>
              <div className="space-y-1.5">
                {matchingBlogs.map(blog => (
                  <button
                    key={blog.id}
                    onClick={() => handleSelect('/blog')}
                    className="w-full p-3 rounded-xl bg-navy-850/60 hover:bg-slate-800/80 border border-transparent hover:border-purple-500/30 text-left flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-purple-300">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {blog.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim() && matchingServices.length === 0 && matchingProjects.length === 0 && matchingBlogs.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No results found for "{query}".</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "web", "marketing", "SEO", or "Shopify".</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press ESC to close</span>
          <span>DigitalSnove Global Search</span>
        </div>
      </div>
    </div>
  );
}
