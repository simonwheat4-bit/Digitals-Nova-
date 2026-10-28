import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

// Pages
import Home from './pages/Home';
import ServicesOverview from './pages/ServicesOverview';
import ServiceDetail from './pages/ServiceDetail';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import GetQuote from './pages/GetQuote';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import NotFound from './pages/NotFound';

export default function App() {
  // Normalize current path from window.location.pathname or hash
  const getInitialRoute = () => {
    const path = window.location.pathname || '/';
    return path;
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Navigate handler that pushes to history and updates state
  const navigate = (toPath) => {
    if (toPath.startsWith('/#')) {
      // Anchor link on home or current page
      const sectionId = toPath.substring(2);
      if (currentRoute !== '/') {
        window.history.pushState({}, '', '/');
        setCurrentRoute('/');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (toPath !== currentRoute) {
      window.history.pushState({}, '', toPath);
      setCurrentRoute(toPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global keyboard shortcut: Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update document title dynamically based on route
  useEffect(() => {
    const titles = {
      '/': 'DigitalSnove — Think Digital. Go Global. | Full-Service Digital Agency',
      '/services': 'Services Overview — Digital Capabilities | DigitalSnove',
      '/services/digital-marketing': 'Digital Marketing & SEO Services | DigitalSnove',
      '/services/web-development': 'Web Development & Custom Apps | DigitalSnove',
      '/services/graphic-design': 'Graphic Design & Brand Identity | DigitalSnove',
      '/services/ai-automation': 'AI Tools & Automation Solutions | DigitalSnove',
      '/services/content-creation': 'Content Creation & Copywriting | DigitalSnove',
      '/services/ecommerce-solutions': 'E-Commerce & Shopify Solutions | DigitalSnove',
      '/portfolio': 'Portfolio & Client Case Studies | DigitalSnove',
      '/about': 'About Us — Mission & Global Standards | DigitalSnove',
      '/contact': 'Contact DigitalSnove — Start Your Project',
      '/quote': 'Get a Free Project Proposal & Quote | DigitalSnove',
      '/blog': 'Blog & Technical Insights | DigitalSnove',
      '/privacy-policy': 'Privacy Policy | DigitalSnove',
      '/terms-conditions': 'Terms & Conditions | DigitalSnove',
      '/cloud-pos-saas': 'DigitalsNova Portal — Cloud POS & SaaS Management System',
    };

    document.title = titles[currentRoute] || 'DigitalSnove — Think Digital. Go Global.';
  }, [currentRoute]);

  // Route matching
  const renderCurrentPage = () => {
    if (currentRoute === '/') {
      return <Home navigate={navigate} />;
    }
    if (currentRoute === '/services') {
      return <ServicesOverview navigate={navigate} />;
    }
    if (currentRoute.startsWith('/services/')) {
      const serviceId = currentRoute.replace('/services/', '');
      return <ServiceDetail serviceId={serviceId} navigate={navigate} />;
    }
    if (currentRoute === '/portfolio') {
      return <Portfolio navigate={navigate} />;
    }
    if (currentRoute === '/about') {
      return <About navigate={navigate} />;
    }
    if (currentRoute === '/contact') {
      return <Contact navigate={navigate} />;
    }
    if (currentRoute === '/quote') {
      return <GetQuote navigate={navigate} />;
    }
    if (currentRoute === '/blog') {
      return <Blog navigate={navigate} />;
    }
    if (currentRoute === '/privacy-policy') {
      return <PrivacyPolicy navigate={navigate} />;
    }
    if (currentRoute === '/terms-conditions') {
      return <TermsConditions navigate={navigate} />;
    }
    if (currentRoute === '/cloud-pos-saas' || currentRoute === '/cloud-pos-saas.html') {
      window.location.href = '/cloud-pos-saas.html';
      return null;
    }
    return <NotFound navigate={navigate} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-navy-950">
      {/* Universal Header */}
      <Navbar 
        currentRoute={currentRoute} 
        navigate={navigate} 
        openSearchModal={() => setSearchModalOpen(true)} 
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Universal Footer */}
      <Footer navigate={navigate} />

      {/* Quick Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen} 
        onClose={() => setSearchModalOpen(false)} 
        navigate={navigate} 
      />
    </div>
  );
}
