import React from 'react';
import { COMPANY_INFO } from '../data/websiteData';

const SocialIcon = ({ name }) => {
  switch (name) {
    case 'Facebook':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case 'Twitter/X':
      return (
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'LinkedIn':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case 'Instagram':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Footer({ navigate }) {
  const currentYear = 2025; // Matching approved mockup

  return (
    <footer className="bg-[#030611] border-t border-[#122044] py-8 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Logo & Social Icons */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px]">
                <div className="w-full h-full bg-[#040714] rounded-[6px] flex items-center justify-center">
                  <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tighter text-sm">
                    DS
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white leading-tight">
                  Digital<span className="text-cyan-400">Snove</span>
                </span>
                <span className="text-[9px] font-medium tracking-wider text-slate-400 uppercase">
                  {COMPANY_INFO.tagline}
                </span>
              </div>
            </button>

            {/* Social Icons row */}
            <div className="flex items-center space-x-3 text-slate-400 pl-0 sm:pl-3 sm:border-l sm:border-slate-800">
              {COMPANY_INFO.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="hover:text-cyan-400 transition-colors p-1"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          {/* Center: Horizontal Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/services')} className="hover:text-cyan-400 transition-colors">
              Services
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-cyan-400 transition-colors">
              About Us
            </button>
            <button onClick={() => navigate('/portfolio')} className="hover:text-cyan-400 transition-colors">
              Portfolio
            </button>
            <button onClick={() => navigate('/blog')} className="hover:text-cyan-400 transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/contact')} className="hover:text-cyan-400 transition-colors">
              Contact
            </button>
          </nav>

          {/* Right: Copyright and Legal */}
          <div className="flex flex-col items-center lg:items-end text-[11px] text-slate-500 gap-1">
            <p>© {currentYear} DigitalSnove. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/privacy-policy')}
                className="hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/terms-conditions')}
                className="hover:text-slate-300 transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
