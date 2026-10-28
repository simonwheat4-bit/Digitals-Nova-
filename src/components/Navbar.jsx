import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  Globe, 
  Search, 
  Sparkles,
  BarChart3,
  Code2,
  Palette,
  Bot,
  PenTool,
  ShoppingBag
} from 'lucide-react';
import { SERVICES } from '../data/websiteData';

const SERVICE_ICONS = {
  'digital-marketing': BarChart3,
  'web-development': Code2,
  'graphic-design': Palette,
  'ai-automation': Bot,
  'content-creation': PenTool,
  'ecommerce-solutions': ShoppingBag
};

export default function Navbar({ currentRoute, navigate, openSearchModal }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServicesOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setServicesOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 15);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setServicesOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/' && currentRoute === '/') return true;
    if (path !== '/' && currentRoute.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#030612]/95 backdrop-blur-xl border-b border-[#13234d] py-3.5 shadow-xl' 
        : 'bg-[#030612]/80 backdrop-blur-md border-b border-[#122044] py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo (Matching mockup) */}
          <button 
            onClick={() => handleNavClick('/')} 
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            aria-label="DigitalSnove Home"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[1.5px] shadow-glow-cyan">
              <div className="w-full h-full bg-[#040714] rounded-[9px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tighter text-base">
                  DS
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight">
                Digital<span className="text-cyan-400">Snove</span>
              </span>
              <span className="text-[9px] font-medium tracking-wider text-slate-400 uppercase">
                Think Digital. Go Global.
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold" aria-label="Main Navigation">
            <button
              onClick={() => handleNavClick('/')}
              className={`transition-colors relative py-1 ${
                isActive('/') 
                  ? 'text-cyan-400' 
                  : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
              )}
            </button>

            {/* Services Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                onMouseEnter={() => setServicesOpen(true)}
                aria-expanded={servicesOpen}
                className={`flex items-center gap-1 transition-colors relative py-1 ${
                  isActive('/services') || servicesOpen
                    ? 'text-cyan-400'
                    : 'text-slate-300 hover:text-cyan-300'
                }`}
              >
                Services
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                {isActive('/services') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
                )}
              </button>

              {/* Mega Dropdown Panel */}
              {servicesOpen && (
                <div 
                  onMouseLeave={() => setServicesOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] rounded-2xl bg-[#060b1e]/98 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 px-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Core Services
                    </span>
                    <button 
                      onClick={() => handleNavClick('/services')}
                      className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      All Services <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map((srv) => {
                      const Icon = SERVICE_ICONS[srv.id] || Sparkles;
                      return (
                        <button
                          key={srv.id}
                          onClick={() => handleNavClick(`/services/${srv.id}`)}
                          className="flex items-start gap-3 p-2 rounded-xl text-left hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/30 transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-[#0b1432] border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                                {srv.title}
                              </span>
                              {srv.badge && (
                                <span className="text-[8px] font-semibold px-1.5 py-0.2 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40">
                                  {srv.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {srv.shortDesc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cloud POS & SaaS Portal Link */}
            <a
              href="/cloud-pos-saas.html"
              className="flex items-center gap-1.5 py-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors relative"
            >
              <span>Cloud POS &amp; SaaS</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wide">
                PORTAL
              </span>
            </a>

            <button
              onClick={() => handleNavClick('/about')}
              className={`transition-colors relative py-1 ${
                isActive('/about') ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              About Us
              {isActive('/about') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('/portfolio')}
              className={`transition-colors relative py-1 ${
                isActive('/portfolio') ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              Portfolio
              {isActive('/portfolio') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('/blog')}
              className={`transition-colors relative py-1 ${
                isActive('/blog') ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              Blog
              {isActive('/blog') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('/contact')}
              className={`transition-colors relative py-1 ${
                isActive('/contact') ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-300'
              }`}
            >
              Contact
              {isActive('/contact') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Header Controls (Matching mockup) */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Global Language / Region */}
            <div className="flex items-center gap-1 text-xs text-slate-300 font-medium cursor-pointer hover:text-cyan-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Quick Search */}
            <button
              onClick={openSearchModal}
              aria-label="Search website"
              className="p-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Permanent Login Button */}
            <a
              href="/cloud-pos-saas.html#login"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              <span>Login</span>
            </a>

            {/* Primary CTA (Cyan-to-purple gradient pill matching mockup) */}
            <button
              onClick={() => handleNavClick('/quote')}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#00b4d8] via-[#2563eb] to-[#7c3aed] flex items-center gap-1.5 shadow-glow-cyan hover:opacity-95 transition-opacity"
            >
              <span>Get a Free Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu & Search Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={openSearchModal}
              aria-label="Search"
              className="p-2 text-slate-300 hover:text-cyan-400"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-cyan-400 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bottom-0 bg-[#030612]/98 backdrop-blur-2xl border-t border-[#122044] px-6 py-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <button
              onClick={() => handleNavClick('/')}
              className={`block w-full text-left py-2 text-base font-semibold border-b border-slate-800 ${
                isActive('/') ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              Home
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center justify-between text-base font-semibold text-slate-200 mb-2">
                <span>Services</span>
                <button
                  onClick={() => handleNavClick('/services')}
                  className="text-xs text-cyan-400 underline font-normal"
                >
                  View All
                </button>
              </div>
              <div className="space-y-1.5 pl-2">
                {SERVICES.map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => handleNavClick(`/services/${srv.id}`)}
                    className="block w-full py-1.5 text-xs text-slate-400 hover:text-cyan-300 text-left"
                  >
                    {srv.number} {srv.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud POS & SaaS Mobile Link */}
            <a
              href="/cloud-pos-saas.html"
              className="flex items-center justify-between w-full py-2 text-base font-bold text-cyan-400 border-b border-slate-800"
            >
              <span>Cloud POS &amp; SaaS</span>
              <span className="bg-cyan-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">PORTAL</span>
            </a>

            <button
              onClick={() => handleNavClick('/about')}
              className={`block w-full text-left py-2 text-base font-semibold border-b border-slate-800 ${
                isActive('/about') ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              About Us
            </button>

            <button
              onClick={() => handleNavClick('/portfolio')}
              className={`block w-full text-left py-2 text-base font-semibold border-b border-slate-800 ${
                isActive('/portfolio') ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              Portfolio
            </button>

            <button
              onClick={() => handleNavClick('/blog')}
              className={`block w-full text-left py-2 text-base font-semibold border-b border-slate-800 ${
                isActive('/blog') ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              Blog
            </button>

            <button
              onClick={() => handleNavClick('/contact')}
              className={`block w-full text-left py-2 text-base font-semibold border-b border-slate-800 ${
                isActive('/contact') ? 'text-cyan-400' : 'text-slate-200'
              }`}
            >
              Contact
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-2.5">
            <a
              href="/cloud-pos-saas.html#login"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              <span>Login to My Portal</span>
            </a>
            <button
              onClick={() => handleNavClick('/quote')}
              className="w-full py-3 rounded-full font-bold text-xs bg-gradient-to-r from-[#00b4d8] via-[#2563eb] to-[#7c3aed] text-white flex items-center justify-center gap-2 shadow-glow-cyan"
            >
              <span>Get a Free Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
