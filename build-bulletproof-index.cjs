const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitals Nove/digitalsnove-hostinger';
const cssContent = fs.readFileSync(path.join(baseDir, 'css/style.css'), 'utf8');
const heroGlobeJs = fs.readFileSync(path.join(baseDir, 'js/3d-hero-globe.js'), 'utf8');
const cubesJs = fs.readFileSync(path.join(baseDir, 'js/3d-cubes.js'), 'utf8');
const ctaGlobeJs = fs.readFileSync(path.join(baseDir, 'js/3d-cta-globe.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(baseDir, 'js/main.js'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DigitalSnove — Think Digital. Go Global. | Your Growth Partner in the Digital World</title>
  <meta name="description" content="At DigitalSnove, we help businesses grow globally with innovative digital marketing, powerful web solutions, AI tools and a wide range of digital services.">
  <link rel="icon" type="image/png" href="assets/logo.png">
  
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- External Master Stylesheet -->
  <link rel="stylesheet" href="css/style.css">
  
  <!-- Embedded Fallback Stylesheet (Guarantees 100% styling even if css folder is missing) -->
  <style>
${cssContent}
  </style>
</head>
<body>

  <!-- =========================================================================
       HEADER & NAVIGATION BAR
       ========================================================================= -->
  <header class="site-header">
    <div class="container nav-wrapper">
      <!-- Brand Logo -->
      <a href="index.html" class="brand-logo" aria-label="DigitalSnove Home">
        <div class="logo-badge">
          <div class="logo-inner">DS</div>
        </div>
        <div class="brand-text">
          <h1>DigitalSnove</h1>
          <span>Think Digital. Go Global.</span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="main-nav" aria-label="Main Navigation">
        <a href="index.html" class="nav-link active">Home</a>
        
        <!-- Services with Mega Dropdown -->
        <div class="dropdown-parent">
          <a href="services.html" class="nav-link">Services &#9662;</a>
          <div class="dropdown-menu">
            <a href="service-digital-marketing.html" class="dropdown-item">
              <span class="icon-box">&#9733;</span>
              <div>
                <strong>Digital Marketing</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">SEO, PPC, Social Ads</p>
              </div>
            </a>
            <a href="service-web-development.html" class="dropdown-item">
              <span class="icon-box">&lt;/&gt;</span>
              <div>
                <strong>Web Development</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Custom, Responsive, CMS</p>
              </div>
            </a>
            <a href="service-graphic-design.html" class="dropdown-item">
              <span class="icon-box">&#9670;</span>
              <div>
                <strong>Graphic Design &amp; Branding</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Logos &amp; Identity</p>
              </div>
            </a>
            <a href="service-ai-automation.html" class="dropdown-item">
              <span class="icon-box">&#9881;</span>
              <div>
                <strong>AI &amp; Automation</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Bots, Workflows &amp; APIs</p>
              </div>
            </a>
            <a href="service-content-creation.html" class="dropdown-item">
              <span class="icon-box">&#9998;</span>
              <div>
                <strong>Content Creation</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Copywriting &amp; SEO Blogs</p>
              </div>
            </a>
            <a href="service-ecommerce.html" class="dropdown-item">
              <span class="icon-box">&#128722;</span>
              <div>
                <strong>E-Commerce Solutions</strong>
                <p style="font-size: 10px; color: #94a3b8; margin: 0;">Shopify &amp; WooCommerce</p>
              </div>
            </a>
          </div>
        </div>

        <a href="about.html" class="nav-link">About Us</a>
        <a href="portfolio.html" class="nav-link">Portfolio</a>
        <a href="blog.html" class="nav-link">Blog</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>

      <!-- Header Right Utilities & CTA -->
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 4px; cursor: pointer;">
          &#127760; EN &#9662;
        </span>
        <a href="quote.html" class="btn-primary header-cta">Get a Free Quote &rarr;</a>
        <button class="mobile-toggle" aria-label="Toggle navigation menu">&#9776;</button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div class="mobile-overlay"></div>
  <aside class="mobile-nav-drawer" aria-label="Mobile Navigation Drawer">
    <div>
      <div class="drawer-header">
        <a href="index.html" class="brand-logo">
          <div class="logo-badge"><div class="logo-inner">DS</div></div>
          <div class="brand-text"><h1 style="font-size: 16px;">DigitalSnove</h1></div>
        </a>
        <button class="drawer-close-btn" aria-label="Close menu">&times;</button>
      </div>
      <nav class="drawer-nav">
        <a href="index.html" class="active">Home</a>
        <a href="services.html">All Services</a>
        <div class="drawer-sub-services">
          <a href="service-digital-marketing.html">&bull; Digital Marketing</a>
          <a href="service-web-development.html">&bull; Web Development</a>
          <a href="service-graphic-design.html">&bull; Graphic Design &amp; Branding</a>
          <a href="service-ai-automation.html">&bull; AI Tools &amp; Automation</a>
          <a href="service-content-creation.html">&bull; Content Creation</a>
          <a href="service-ecommerce.html">&bull; E-commerce Solutions</a>
        </div>
        <a href="about.html">About Us</a>
        <a href="portfolio.html">Portfolio</a>
        <a href="blog.html">Blog</a>
        <a href="contact.html">Contact</a>
      </nav>
    </div>
    <div>
      <a href="quote.html" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 24px;">Get a Free Quote &rarr;</a>
      <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 14px;">&copy; 2026 DigitalSnove</p>
    </div>
  </aside>

  <!-- =========================================================================
       SECTION 1: HERO SECTION
       3D Animated Holographic Globe + 3D CSS Laptop & Phone + 4 Floating Badges
       ========================================================================= -->
  <section class="hero-section" id="hero">
    <div class="container hero-grid">
      <!-- Left Content -->
      <div class="hero-content">
        <span class="eyebrow" style="letter-spacing: 0.12em;">DIGITAL MARKETING &bull; WEB DEVELOPMENT &bull; AI TOOLS &bull; MORE</span>
        <h2 class="hero-title" style="font-size: 54px; font-weight: 900; line-height: 1.12;">
          Your Growth Partner in the <span class="text-cyan">Digital World</span>
        </h2>
        <p class="hero-desc" style="font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 28px;">
          At DigitalSnove, we help businesses grow globally with innovative digital marketing, powerful web solutions, AI tools and a wide range of digital services. We turn your ideas into digital success.
        </p>

        <div class="hero-actions">
          <a href="quote.html" class="btn-primary" style="padding: 13px 30px; font-size: 14px;">Get Started &rarr;</a>
          <a href="services.html" class="btn-outline" style="padding: 12px 26px; font-size: 14px;">Explore Our Services</a>
        </div>

        <!-- 3 Trust Badges -->
        <div class="hero-badges-row">
          <div class="trust-badge-item">
            <div class="badge-icon-circle">&#127760;</div>
            <div>
              <h5>Global Reach</h5>
              <p>Worldwide Services</p>
            </div>
          </div>
          <div class="trust-badge-item">
            <div class="badge-icon-circle">&#9201;</div>
            <div>
              <h5>24/7 Support</h5>
              <p>Always Here For You</p>
            </div>
          </div>
          <div class="trust-badge-item">
            <div class="badge-icon-circle">&#128737;</div>
            <div>
              <h5>100% Satisfaction</h5>
              <p>Your Success, Our Priority</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 3D Interactive Scene: 3D Globe Canvas + 3D Devices + 4 Floating Badges -->
      <div class="hero-3d-wrapper">
        <!-- Pure 3D Three.js Rotating Digital Earth Globe Canvas -->
        <div id="hero-globe-canvas-container"></div>

        <!-- 3D CSS Devices Scene -->
        <div class="devices-3d-scene">
          <!-- 3D Angled Laptop -->
          <div class="laptop-3d">
            <div class="laptop-screen">
              <div class="screen-header">
                <div class="screen-dot dot-r"></div>
                <div class="screen-dot dot-y"></div>
                <div class="screen-dot dot-g"></div>
                <span class="screen-title">digitalsnove.com</span>
              </div>
              <div class="screen-body">
                <div style="text-align: center; margin-top: 20px;">
                  <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <div class="logo-badge" style="width: 26px; height: 26px;"><div class="logo-inner" style="font-size: 11px;">DS</div></div>
                    <span style="font-size: 15px; font-weight: 900; color: #fff;">DigitalSnove</span>
                  </div>
                  <p style="font-size: 10px; color: #94a3b8; margin-bottom: 14px;">Think Digital. Go Global.</p>
                  <a href="quote.html" class="btn-primary" style="font-size: 10px; padding: 6px 16px;">Get Started</a>
                </div>
              </div>
            </div>
            <div class="laptop-base"></div>
          </div>

          <!-- 3D Angled Smartphone -->
          <div class="phone-3d">
            <div class="phone-speaker"></div>
            <div class="phone-content">
              <div class="logo-badge" style="width: 22px; height: 22px; margin: 0 auto 6px;"><div class="logo-inner" style="font-size: 9px;">DS</div></div>
              <h4>Build<br>Your Digital<br>Future</h4>
              <a href="quote.html" class="phone-btn" style="text-decoration: none; display: inline-block;">Get Started</a>
            </div>
            <div style="height: 10px; background: #0b1535; border-radius: 6px;"></div>
          </div>

          <!-- 4 Floating Badges -->
          <div class="floating-badge badge-marketing">
            <span style="color: #00e5ff;">&#128227;</span> Digital Marketing
          </div>
          <div class="floating-badge badge-web">
            <span style="color: #c084fc;">&lt;/&gt;</span> Web Development
          </div>
          <div class="floating-badge badge-ai">
            <span style="color: #38bdf8;">&#9881;</span> AI Tools
          </div>
          <div class="floating-badge badge-services">
            <span style="color: #10b981;">&#9638;</span> Digital Services
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 2: SERVICES SECTION
       2 Large Featured Cards + 2 Right Stacked Cards
       ========================================================================= -->
  <section class="services-section section-divider" id="services">
    <div class="container">
      <div class="section-header-flex">
        <div>
          <span class="eyebrow">OUR SERVICES</span>
          <h2 class="section-title">Digital Solutions Built Around Your Goals</h2>
          <p style="font-size: 13px; color: #94a3b8; max-width: 600px; margin-top: 6px;">
            From your first website to a more effective digital marketing strategy, focus on the work your business needs.
          </p>
        </div>
        <div>
          <a href="services.html" class="btn-outline">View All Services &rarr;</a>
        </div>
      </div>

      <!-- Services Grid: 2 Featured + Supporting Stack -->
      <div class="services-grid">
        <!-- Featured Card 1: Digital Marketing -->
        <div class="service-card">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="card-num-badge">01</span>
              <span style="color: var(--accent-cyan); font-size: 14px;">&#128227;</span>
            </div>
            <h3>Digital Marketing</h3>
            <p class="card-desc">
              Get found, attract the right audience and turn visitors into loyal customers with data-driven marketing strategies.
            </p>
            <ul class="subservice-list">
              <li><span class="check-icon">&#10003;</span> SEO &amp; Technical SEO</li>
              <li><span class="check-icon">&#10003;</span> Social Media Marketing</li>
              <li><span class="check-icon">&#10003;</span> Paid Advertising &amp; PPC</li>
              <li><span class="check-icon">&#10003;</span> Conversion Rate Optimization</li>
            </ul>
          </div>
          <div class="card-footer">
            <a href="service-digital-marketing.html" class="card-link">Explore Digital Marketing &rarr;</a>
            <!-- 3D Bar Chart Visual -->
            <svg width="90" height="70" viewBox="0 0 100 80" fill="none">
              <rect x="10" y="45" width="14" height="30" rx="3" fill="#0284c7" opacity="0.6"/>
              <rect x="32" y="30" width="14" height="45" rx="3" fill="#00e5ff" opacity="0.8"/>
              <rect x="54" y="15" width="14" height="60" rx="3" fill="#38bdf8"/>
              <rect x="76" y="5" width="14" height="70" rx="3" fill="#00e5ff"/>
              <path d="M12 40 L38 25 L60 12 L84 2" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="84" cy="2" r="3.5" fill="#ffffff"/>
            </svg>
          </div>
        </div>

        <!-- Featured Card 2: Web Development -->
        <div class="service-card">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="card-num-badge">02</span>
              <span style="color: var(--accent-cyan); font-size: 14px;">&lt;/&gt;</span>
            </div>
            <h3>Web Development</h3>
            <p class="card-desc">
              Build fast, secure and scalable websites that look great and perform even better.
            </p>
            <ul class="subservice-list">
              <li><span class="check-icon">&#10003;</span> Business &amp; Corporate Websites</li>
              <li><span class="check-icon">&#10003;</span> E-commerce Solutions</li>
              <li><span class="check-icon">&#10003;</span> Responsive Web Design</li>
              <li><span class="check-icon">&#10003;</span> Website Maintenance &amp; Optimization</li>
            </ul>
          </div>
          <div class="card-footer">
            <a href="service-web-development.html" class="card-link">Explore Web Development &rarr;</a>
            <!-- 3D Laptop Visual -->
            <svg width="90" height="70" viewBox="0 0 100 80" fill="none">
              <rect x="15" y="10" width="70" height="46" rx="4" fill="#0a1535" stroke="#00e5ff" stroke-width="1.5"/>
              <rect x="20" y="15" width="60" height="36" rx="2" fill="#03081a"/>
              <path d="M5 60 L95 60 L85 66 L15 66 Z" fill="#1e293b"/>
              <rect x="40" y="61" width="20" height="2" rx="1" fill="#475569"/>
            </svg>
          </div>
        </div>

        <!-- Supporting Stack: Graphic Design & AI Tools -->
        <div class="supporting-stack">
          <!-- Card 03: Graphic Design & Branding -->
          <a href="service-graphic-design.html" class="supporting-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="card-num-badge">03</span>
                <span class="tag-pill">Branding</span>
              </div>
              <h4>Graphic Design &amp; Branding</h4>
              <p>Create a strong visual identity that makes your brand stand out.</p>
            </div>
            <span class="card-link" style="margin-top: 14px;">Learn More &rarr;</span>
          </a>

          <!-- Card 04: AI & Automation -->
          <a href="service-ai-automation.html" class="supporting-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="card-num-badge" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; border-color: rgba(139,92,246,0.4);">Future Offering</span>
                <span class="tag-pill" style="background: rgba(0, 229, 255, 0.15); color: #00e5ff;">AI Tech</span>
              </div>
              <h4>AI &amp; Automation</h4>
              <p>Tools and workflow solutions to help you work smarter.</p>
            </div>
            <span class="card-link" style="margin-top: 14px;">Learn More &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 3: ABOUT DIGITALSNOVE
       ========================================================================= -->
  <section class="about-section section-divider" id="about">
    <div class="container about-grid">
      <!-- Left Column: Story -->
      <div>
        <span class="eyebrow">ABOUT DIGITALSNOVE</span>
        <h2 style="font-size: 34px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 18px;">
          More Than Just a Service We Build Long-Term Partnerships
        </h2>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px;">
          DigitalSnove is a full-service digital agency helping businesses worldwide with digital marketing, web development, AI tools and more. Our mission is to deliver innovative, scalable and affordable solutions that create real value and long-term growth.
        </p>
        <a href="about.html" class="btn-primary">Learn More About Us &rarr;</a>
      </div>

      <!-- Center Column: Stats List -->
      <div class="stats-list">
        <div class="stat-item">
          <div class="stat-icon">&#127760;</div>
          <div>
            <h3 class="stat-count" data-target="500" data-suffix="+">500+</h3>
            <span>Global Clients</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">&#128193;</div>
          <div>
            <h3 class="stat-count" data-target="1200" data-suffix="+">1,200+</h3>
            <span>Projects Completed</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">&#9733;</div>
          <div>
            <h3>4.9/5</h3>
            <span>Client Satisfaction</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">&#128101;</div>
          <div>
            <h3 class="stat-count" data-target="50" data-suffix="+">50+</h3>
            <span>Expert Team Members</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Office Image with Glowing Signage -->
      <div class="office-img-wrapper" style="position: relative; background: #060b1d; min-height: 280px; display: flex; align-items: center; justify-content: center;">
        <img src="assets/about-office.png" alt="DigitalSnove Office" onerror="this.style.display='none'; document.getElementById('office-fallback').style.display='block';" style="width: 100%; height: auto; display: block;">
        <div id="office-fallback" style="display: none; padding: 40px; text-align: center;">
          <div class="logo-badge" style="width: 50px; height: 50px; margin: 0 auto 12px;"><div class="logo-inner" style="font-size: 20px;">DS</div></div>
          <h3 style="font-size: 22px; color: #fff; font-weight: 900;">DigitalSnove</h3>
          <p style="font-size: 11px; color: var(--accent-cyan);">Think Digital. Go Global.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 4: FEATURED PROJECTS / PORTFOLIO
       ========================================================================= -->
  <section class="projects-section section-divider" id="portfolio">
    <div class="container">
      <div class="section-header-flex">
        <div>
          <span class="eyebrow">OUR WORK</span>
          <h2 class="section-title">Featured Projects</h2>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">
            Real solutions. Measurable results. Explore some of our recent projects and see how we help businesses grow.
          </p>
        </div>
        <a href="portfolio.html" class="btn-outline">View Portfolio &rarr;</a>
      </div>

      <div class="projects-grid">
        <!-- Project 1 -->
        <a href="portfolio.html" class="project-card">
          <div class="project-art">
            <img src="assets/project-ai.png" alt="AI Neural Platform" onerror="this.src=''; this.style.display='none';" loading="lazy">
            <span style="font-size: 32px; color: var(--accent-cyan); font-weight: 900;">AI</span>
          </div>
          <div class="project-info">
            <div>
              <h4>Smart Tools for a Better Tomorrow</h4>
            </div>
            <div class="round-arrow-btn">&rarr;</div>
          </div>
        </a>

        <!-- Project 2 -->
        <a href="portfolio.html" class="project-card">
          <div class="project-art">
            <img src="assets/project-ecommerce.png" alt="E-Commerce Store" onerror="this.src=''; this.style.display='none';" loading="lazy">
            <span style="font-size: 28px; color: #34d399;">&#128722; Store</span>
          </div>
          <div class="project-info">
            <div>
              <h4>E-Commerce Store</h4>
            </div>
            <div class="round-arrow-btn">&rarr;</div>
          </div>
        </a>

        <!-- Project 3 -->
        <a href="portfolio.html" class="project-card">
          <div class="project-art">
            <img src="assets/project-business.png" alt="Business Website" onerror="this.src=''; this.style.display='none';" loading="lazy">
            <span style="font-size: 28px; color: #38bdf8;">&lt;/&gt; Web</span>
          </div>
          <div class="project-info">
            <div>
              <h4>Business Website Brand Growth</h4>
            </div>
            <div class="round-arrow-btn">&rarr;</div>
          </div>
        </a>

        <!-- Project 4 -->
        <a href="portfolio.html" class="project-card">
          <div class="project-art">
            <img src="assets/project-seo.png" alt="Digital Marketing SEO" onerror="this.src=''; this.style.display='none';" loading="lazy">
            <span style="font-size: 28px; color: #c084fc;">&#128200; SEO</span>
          </div>
          <div class="project-info">
            <div>
              <h4>Digital Marketing SEO Success</h4>
            </div>
            <div class="round-arrow-btn">&rarr;</div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 5: OUR PROCESS
       ========================================================================= -->
  <section class="process-section section-divider" id="process">
    <div class="container" style="text-align: center;">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; text-align: left; margin-bottom: 20px;">
        <div>
          <span class="eyebrow">OUR PROCESS</span>
          <h2 class="section-title">Simple Steps to Big Results</h2>
          <p style="font-size: 13px; color: #94a3b8; max-width: 580px; margin-top: 6px;">
            A clear and proven process to turn your ideas into digital success.
          </p>
        </div>
        <a href="services.html" class="btn-outline">View Our Process &rarr;</a>
      </div>

      <div class="process-timeline">
        <!-- Step 1 -->
        <div class="process-step">
          <div class="step-circle">&#128269;</div>
          <span class="step-num">01</span>
          <h4>Discover</h4>
          <p>Understand your business goals and challenges.</p>
        </div>

        <!-- Step 2 -->
        <div class="process-step">
          <div class="step-circle">&#128203;</div>
          <span class="step-num">02</span>
          <h4>Plan</h4>
          <p>Create a tailored strategy and project roadmap.</p>
        </div>

        <!-- Step 3 -->
        <div class="process-step">
          <div class="step-circle">&lt;/&gt;</div>
          <span class="step-num">03</span>
          <h4>Build</h4>
          <p>Design and develop with modern technologies.</p>
        </div>

        <!-- Step 4 -->
        <div class="process-step">
          <div class="step-circle">&#9881;</div>
          <span class="step-num">04</span>
          <h4>Refine</h4>
          <p>Test, optimize and ensure the best performance.</p>
        </div>

        <!-- Step 5 -->
        <div class="process-step">
          <div class="step-circle">&#128200;</div>
          <span class="step-num">05</span>
          <h4>Grow</h4>
          <p>Track results and scale your success further.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 6: WHY CHOOSE US
       Pure 3D Floating Isometric Cubes Canvas (Code Animation!)
       ========================================================================= -->
  <section class="why-section section-divider" id="why-choose-us">
    <div class="container why-grid">
      <!-- Left Column -->
      <div>
        <span class="eyebrow">WHY CHOOSE US</span>
        <h2 style="font-size: 34px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 16px;">
          More Than Just a Service We Build Long-Term Partnerships
        </h2>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px;">
          We take time to understand your business, your goals and your audience. Our focus is on delivering real results through strategy, creativity and technology.
        </p>
        <a href="about.html" class="btn-primary">Learn More About Us &rarr;</a>
      </div>

      <!-- Center Column: Benefits -->
      <div class="why-benefits">
        <div class="benefit-row">
          <div class="benefit-icon">&#128161;</div>
          <div>
            <h4>Strategic Approach</h4>
            <p>Data-driven decisions</p>
          </div>
        </div>
        <div class="benefit-row">
          <div class="benefit-icon">&#128101;</div>
          <div>
            <h4>Expert Team</h4>
            <p>Skilled &amp; experienced</p>
          </div>
        </div>
        <div class="benefit-row">
          <div class="benefit-icon">&#128172;</div>
          <div>
            <h4>Transparent Communication</h4>
            <p>No hidden costs</p>
          </div>
        </div>
        <div class="benefit-row">
          <div class="benefit-icon">&#9201;</div>
          <div>
            <h4>On-Time Delivery</h4>
            <p>Your time matters</p>
          </div>
        </div>
      </div>

      <!-- Right Column: 3D Floating Isometric Cubes Canvas -->
      <div class="cubes-canvas-wrapper">
        <div id="why-choose-cubes-canvas"></div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 7: CLIENT TESTIMONIALS
       ========================================================================= -->
  <section class="testimonials-section section-divider" id="testimonials">
    <div class="container">
      <span class="eyebrow">WHAT OUR CLIENTS SAY</span>
      <h2 class="section-title">Trusted by Businesses Worldwide</h2>

      <div class="testimonials-slider-wrap">
        <button class="slider-nav-btn" id="test-prev-btn" aria-label="Previous review">&#8592;</button>

        <!-- Testimonial 1 -->
        <div class="testimonial-card testimonial-slide-item">
          <img src="assets/testimonial-avatar.png" alt="Sarah Johnson" class="testimonial-avatar" onerror="this.src=''; this.style.display='none';">
          <div>
            <p class="testimonial-text">
              "DigitalSnove transformed our online presence. Their team is professional, creative and always supportive. Our traffic and sales have grown significantly."
            </p>
            <div class="author-name">Sarah Johnson</div>
            <div class="author-role">CEO, LUXE</div>
            <div class="star-rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div class="testimonial-card testimonial-slide-item" style="display: none;">
          <img src="assets/testimonial-avatar.png" alt="Marcus Vance" class="testimonial-avatar" onerror="this.src=''; this.style.display='none';">
          <div>
            <p class="testimonial-text">
              "The AI automation workflows DigitalSnove integrated into our customer portal cut our support response times by 75% while boosting qualified leads."
            </p>
            <div class="author-name">Marcus Vance</div>
            <div class="author-role">Director of Operations, CloudScale Global</div>
            <div class="star-rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          </div>
        </div>

        <button class="slider-nav-btn" id="test-next-btn" aria-label="Next review">&#8594;</button>
      </div>

      <!-- Dots Indicators -->
      <div class="slider-dots">
        <button class="dot active" aria-label="Slide 1"></button>
        <button class="dot" aria-label="Slide 2"></button>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 8: CTA BANNER
       Pure 3D Rotating Cyber Earth Canvas (Code Animation!)
       ========================================================================= -->
  <section class="cta-banner-section section-divider" id="cta">
    <div class="container">
      <div class="cta-banner-box">
        <div>
          <span class="eyebrow" style="color: #00e5ff;">LET'S WORK TOGETHER</span>
          <h2>Ready to Grow Your Business Digitally?</h2>
          <p>
            Get in touch with us today and let's turn your ideas into success. Stay succeed.
          </p>
          <a href="quote.html" class="btn-primary" style="font-size: 14px; padding: 14px 32px;">Get a Free Quote &rarr;</a>

          <!-- Direct Contact Row matching screenshot -->
          <div class="cta-contact-row">
            <a href="mailto:info@digitalsnove.com" class="cta-contact-item">
              <div class="contact-icon-box">&#9993;</div>
              <div>
                <span style="font-size: 10px; color: #94a3b8; display: block;">Email</span>
                <strong style="color: #fff;">info@digitalsnove.com</strong>
              </div>
            </a>
            <a href="tel:+923019643900" class="cta-contact-item">
              <div class="contact-icon-box">&#9742;</div>
              <div>
                <span style="font-size: 10px; color: #94a3b8; display: block;">Phone</span>
                <strong style="color: #fff;">+92 301 964 3900</strong>
              </div>
            </a>
            <div class="cta-contact-item">
              <div class="contact-icon-box">&#127760;</div>
              <div>
                <span style="font-size: 10px; color: #94a3b8; display: block;">Location</span>
                <strong style="color: #fff;">Worldwide</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 3D Rotating Cyber Earth Canvas -->
        <div class="cta-3d-globe-wrapper">
          <div id="cta-globe-canvas"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 9: FAQ ACCORDION
       ========================================================================= -->
  <section class="faq-section section-divider" id="faq">
    <div class="container faq-grid">
      <!-- Left Column -->
      <div>
        <span class="eyebrow">FREQUENTLY ASKED QUESTIONS</span>
        <h2 style="font-size: 34px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 14px;">
          Got Questions? We've Got Answers.
        </h2>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
          Find quick answers to the most common questions about our services, process, pricing and more.
        </p>
        
        <!-- Glowing Question Marks Sphere Illustration -->
        <div style="margin-top: 20px;">
          <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
            <circle cx="110" cy="90" r="60" fill="url(#faq-glow)" opacity="0.15"/>
            <circle cx="110" cy="90" r="40" fill="url(#faq-glow)" opacity="0.3"/>
            <text x="110" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="44" font-weight="900" fill="#00e5ff" text-anchor="middle">?</text>
            <circle cx="50" cy="50" r="18" fill="rgba(139,92,246,0.2)"/>
            <text x="50" y="56" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800" fill="#c084fc" text-anchor="middle">?</text>
            <circle cx="170" cy="130" r="22" fill="rgba(0,229,255,0.2)"/>
            <text x="170" y="137" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800" fill="#00e5ff" text-anchor="middle">?</text>
            <defs>
              <radialGradient id="faq-glow" cx="0.5" cy="0.5" r="0.5">
                <stop stop-color="#00e5ff"/>
                <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Right Column: Accordion Items -->
      <div class="accordion-list">
        <!-- Item 1 -->
        <div class="accordion-item open">
          <button class="accordion-trigger">
            <span>What services does DigitalSnove offer?</span>
            <div class="trigger-icon">+</div>
          </button>
          <div class="accordion-content">
            DigitalSnove offers six core services: Digital Marketing (SEO &amp; PPC), Custom Web Development, Graphic Design &amp; Brand Identity, AI Tools &amp; Automation, Content Creation &amp; Copywriting, and E-Commerce Solutions (Shopify &amp; WooCommerce).
          </div>
        </div>

        <!-- Item 2 -->
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>How long does a project take?</span>
            <div class="trigger-icon">+</div>
          </button>
          <div class="accordion-content">
            Typical custom web projects range from 2 to 6 weeks depending on requirements and integrations. We establish clear milestone deliverables and communicate progress weekly.
          </div>
        </div>

        <!-- Item 3 -->
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>Do you work with international clients?</span>
            <div class="trigger-icon">+</div>
          </button>
          <div class="accordion-content">
            Yes! We work with clients globally across the US, UK, Middle East, Europe, and Asia, offering 24/7 support and flexible communication schedules.
          </div>
        </div>

        <!-- Item 4 -->
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>What is the pricing model?</span>
            <div class="trigger-icon">+</div>
          </button>
          <div class="accordion-content">
            We provide fixed-price milestone contracts with no hidden fees, as well as monthly growth retainer agreements for ongoing marketing and technical maintenance.
          </div>
        </div>

        <!-- Item 5 -->
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>How can I get started?</span>
            <div class="trigger-icon">+</div>
          </button>
          <div class="accordion-content">
            Click on "Get a Free Quote" or visit our Contact page. Share your project requirements and our team will provide a tailored proposal and quote within 24 hours.
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- =========================================================================
       SECTION 10: SINGLE-TIER COMPACT FOOTER
       ========================================================================= -->
  <footer class="site-footer">
    <div class="container footer-flex">
      <!-- Brand & Socials -->
      <div class="footer-brand-wrap">
        <a href="index.html" class="brand-logo">
          <div class="logo-badge"><div class="logo-inner">DS</div></div>
          <div class="brand-text">
            <h1 style="font-size: 15px;">DigitalSnove</h1>
            <span style="font-size: 8px;">Think Digital. Go Global.</span>
          </div>
        </a>
        <div class="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">&#9670; Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">&#9670; X</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">&#9670; LinkedIn</a>
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">&#9670; Instagram</a>
          <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">&#9670; YouTube</a>
        </div>
      </div>

      <!-- Quick Nav Links -->
      <nav class="footer-nav" aria-label="Footer Navigation">
        <a href="index.html">Home</a>
        <a href="services.html">Services</a>
        <a href="about.html">About Us</a>
        <a href="portfolio.html">Portfolio</a>
        <a href="blog.html">Blog</a>
        <a href="contact.html">Contact</a>
      </nav>

      <!-- Legal & Copyright -->
      <div class="footer-legal">
        <p>&copy; 2026 DigitalSnove. All rights reserved.</p>
        <div class="footer-legal-links">
          <a href="privacy-policy.html">Privacy Policy</a>
          <span>&bull;</span>
          <a href="terms-conditions.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>
  </footer>

  <!-- =========================================================================
       SCRIPTS: THREE.JS WITH CDN FALLBACK + 3D ENGINES + MAIN
       ========================================================================= -->
  <script src="js/three.min.js"></script>
  <script>
    if (typeof THREE === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>');
    }
  </script>

  <!-- Embedded 3D Engines & Interaction Code (Guarantees animations even if js folder is missing) -->
  <script>
${heroGlobeJs}
${cubesJs}
${ctaGlobeJs}
${mainJs}
  </script>

  <!-- External scripts for modularity -->
  <script src="js/3d-hero-globe.js"></script>
  <script src="js/3d-cubes.js"></script>
  <script src="js/3d-cta-globe.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(baseDir, 'index.html'), html, 'utf8');
console.log('Successfully generated self-contained index.html. Size:', html.length);
