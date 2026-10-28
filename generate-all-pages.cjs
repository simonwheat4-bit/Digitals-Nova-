const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitals Nove/digitalsnove-hostinger';
const cssContent = fs.readFileSync(path.join(baseDir, 'css/style.css'), 'utf8');
const heroGlobeJs = fs.readFileSync(path.join(baseDir, 'js/3d-hero-globe.js'), 'utf8');
const cubesJs = fs.readFileSync(path.join(baseDir, 'js/3d-cubes.js'), 'utf8');
const ctaGlobeJs = fs.readFileSync(path.join(baseDir, 'js/3d-cta-globe.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(baseDir, 'js/main.js'), 'utf8');

function getHead(title, desc) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | DigitalSnove</title>
  <meta name="description" content="${desc}">
  <link rel="icon" type="image/png" href="assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="css/style.css">

  <!-- Embedded Full Stylesheet (Guarantees 100% Styling Across All Pages Without 404s) -->
  <style>
${cssContent}
  </style>
</head>
<body>
`;
}

function getHeader(activePage) {
  return `
  <!-- HEADER & NAVIGATION BAR (With Mega Menu) -->
  <header class="site-header">
    <div class="container nav-wrapper">
      <a href="index.html" class="brand-logo" aria-label="DigitalSnove Home">
        <div class="logo-badge"><div class="logo-inner">DS</div></div>
        <div class="brand-text">
          <h1>DigitalSnove</h1>
          <span>Think Digital. Go Global.</span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="main-nav" aria-label="Main Navigation">
        <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
        
        <!-- Services with Mega Dropdown -->
        <div class="dropdown-parent">
          <a href="services.html" class="nav-link ${activePage.startsWith('service') ? 'active' : ''}">Services &#9662;</a>
          <div class="dropdown-menu">
            <!-- 01. Digital Marketing -->
            <a href="service-digital-marketing.html" class="dropdown-item">
              <span class="icon-box">&#128227;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Digital Marketing</div>
                <div class="dropdown-item-sub">SEO, PPC, Social Ads &amp; CRO</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">SEO</span>
                  <span class="dropdown-subtag">Google Ads</span>
                  <span class="dropdown-subtag">Meta Ads</span>
                  <span class="dropdown-subtag">CRO</span>
                </div>
              </div>
            </a>

            <!-- 02. Web Development -->
            <a href="service-web-development.html" class="dropdown-item">
              <span class="icon-box">&lt;/&gt;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Web Development</div>
                <div class="dropdown-item-sub">Custom Web Apps &amp; WordPress</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">Custom Apps</span>
                  <span class="dropdown-subtag">Corporate</span>
                  <span class="dropdown-subtag">WordPress</span>
                  <span class="dropdown-subtag">UI/UX</span>
                </div>
              </div>
            </a>

            <!-- 03. Graphic Design & Branding -->
            <a href="service-graphic-design.html" class="dropdown-item">
              <span class="icon-box">&#9670;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Graphic Design &amp; Branding</div>
                <div class="dropdown-item-sub">Logos, Guidelines &amp; Creatives</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">Logo Design</span>
                  <span class="dropdown-subtag">Branding</span>
                  <span class="dropdown-subtag">Packaging</span>
                </div>
              </div>
            </a>

            <!-- 04. AI Tools & Automation -->
            <a href="service-ai-automation.html" class="dropdown-item">
              <span class="icon-box">&#9881;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">AI Tools &amp; Automation</div>
                <div class="dropdown-item-sub">Chatbots, CRM &amp; Workflows</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">AI Bots</span>
                  <span class="dropdown-subtag">Workflows</span>
                  <span class="dropdown-subtag">APIs</span>
                </div>
              </div>
            </a>

            <!-- 05. Content Creation -->
            <a href="service-content-creation.html" class="dropdown-item">
              <span class="icon-box">&#9998;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Content Creation</div>
                <div class="dropdown-item-sub">Copywriting &amp; SEO Blogs</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">Website Copy</span>
                  <span class="dropdown-subtag">SEO Blogs</span>
                  <span class="dropdown-subtag">Email Funnels</span>
                </div>
              </div>
            </a>

            <!-- 06. E-Commerce Solutions -->
            <a href="service-ecommerce.html" class="dropdown-item">
              <span class="icon-box">&#128722;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">E-Commerce Solutions</div>
                <div class="dropdown-item-sub">Shopify &amp; WooCommerce</div>
                <div class="dropdown-subtags">
                  <span class="dropdown-subtag">Shopify</span>
                  <span class="dropdown-subtag">WooCommerce</span>
                  <span class="dropdown-subtag">Checkout</span>
                </div>
              </div>
            </a>

            <!-- Footer link to all services -->
            <div class="dropdown-footer">
              <a href="services.html">View All 6 Services &amp; Sub-Categories &rarr;</a>
            </div>
          </div>
        </div>

        <a href="about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About Us</a>
        <a href="portfolio.html" class="nav-link ${activePage === 'portfolio' ? 'active' : ''}">Portfolio</a>
        <a href="blog.html" class="nav-link ${activePage === 'blog' ? 'active' : ''}">Blog</a>
        <a href="contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
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
        <a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="services.html" class="${activePage === 'services' ? 'active' : ''}">All Services</a>
        <div class="drawer-sub-services">
          <a href="service-digital-marketing.html">&bull; Digital Marketing</a>
          <a href="service-web-development.html">&bull; Web Development</a>
          <a href="service-graphic-design.html">&bull; Graphic Design &amp; Branding</a>
          <a href="service-ai-automation.html">&bull; AI Tools &amp; Automation</a>
          <a href="service-content-creation.html">&bull; Content Creation</a>
          <a href="service-ecommerce.html">&bull; E-commerce Solutions</a>
        </div>
        <a href="about.html" class="${activePage === 'about' ? 'active' : ''}">About Us</a>
        <a href="portfolio.html" class="${activePage === 'portfolio' ? 'active' : ''}">Portfolio</a>
        <a href="blog.html" class="${activePage === 'blog' ? 'active' : ''}">Blog</a>
        <a href="contact.html" class="${activePage === 'contact' ? 'active' : ''}">Contact</a>
      </nav>
    </div>
    <div>
      <a href="quote.html" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 24px;">Get a Free Quote &rarr;</a>
      <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 14px;">&copy; 2026 DigitalSnove</p>
    </div>
  </aside>
  `;
}

function getFooter() {
  return `
  <!-- FOOTER -->
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

  <!-- SCRIPTS -->
  <script src="js/three.min.js"></script>
  <script>
    if (typeof THREE === 'undefined') {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>');
    }
  </script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

// 1. Build Index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DigitalSnove — Think Digital. Go Global. | Your Growth Partner in the Digital World</title>
  <meta name="description" content="At DigitalSnove, we help businesses grow globally with innovative digital marketing, powerful web solutions, AI tools and a wide range of digital services.">
  <link rel="icon" type="image/png" href="assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="css/style.css">

  <style>
${cssContent}
  </style>
</head>
<body>
${getHeader('home')}

  <!-- SECTION 1: HERO SECTION -->
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

      <!-- Right 3D Interactive Scene: 3D Globe Canvas + Image 4 Photorealistic Devices + 4 Floating Badges -->
      <div class="hero-3d-wrapper" style="position: relative; width: 100%; min-height: 480px; display: flex; align-items: center; justify-content: center; overflow: visible;">
        <!-- Pure 3D Three.js Rotating Digital Earth Globe Canvas -->
        <div id="hero-globe-canvas-container"></div>

        <!-- Photorealistic Devices Container matching Image 4 -->
        <div class="devices-3d-scene" style="position: relative; z-index: 5; width: 100%; max-width: 520px; display: flex; align-items: center; justify-content: center; overflow: visible;">
          <img src="assets/hero-devices.png" alt="DigitalSnove 3D Digital Devices" style="width: 100%; max-width: 500px; height: auto; display: block; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.85));">

          <!-- 4 Interactive Floating Badges overlaid with hover effects and direct links -->
          <a href="service-digital-marketing.html" class="floating-badge badge-marketing">
            <span style="color: #00e5ff; font-size: 14px;">&#128227;</span> Digital Marketing
          </a>
          <a href="service-web-development.html" class="floating-badge badge-web">
            <span style="color: #ffffff; font-size: 13px;">&lt;/&gt;</span> Web Development
          </a>
          <a href="service-ai-automation.html" class="floating-badge badge-ai">
            <span style="color: #00e5ff; font-size: 14px;">&#9881;</span> AI Tools
          </a>
          <a href="services.html" class="floating-badge badge-services">
            <span style="color: #00e5ff; font-size: 13px;">&#9638;</span> Digital Services
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 2: SERVICES SECTION -->
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
            <img src="assets/service-marketing-graphic.png" alt="Digital Marketing Growth" class="card-art-img">
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
            <img src="assets/service-web-graphic.png" alt="Web Development" class="card-art-img">
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

  <!-- SECTION 3: ABOUT DIGITALSNOVE -->
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
        <img src="assets/about-office.png" alt="DigitalSnove Office" style="width: 100%; height: auto; display: block;">
      </div>
    </div>
  </section>

  <!-- SECTION 4: FEATURED PROJECTS / PORTFOLIO -->
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
            <img src="assets/project-ai.png" alt="Smart Tools for a Better Tomorrow" loading="lazy">
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
            <img src="assets/project-ecommerce.png" alt="E-Commerce Store" loading="lazy">
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
            <img src="assets/project-business.png" alt="Business Website Brand Growth" loading="lazy">
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
            <img src="assets/project-seo.png" alt="Digital Marketing SEO Success" loading="lazy">
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

  <!-- SECTION 5: OUR PROCESS -->
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

  <!-- SECTION 6: WHY CHOOSE US (ENLARGED 3D CUBES) -->
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

      <!-- Right Column: 3D Floating Isometric Cubes Canvas (Enlarged) -->
      <div class="cubes-canvas-wrapper">
        <div id="why-choose-cubes-canvas"></div>
      </div>
    </div>
  </section>

  <!-- SECTION 7: CLIENT TESTIMONIALS -->
  <section class="testimonials-section section-divider" id="testimonials">
    <div class="container">
      <span class="eyebrow">WHAT OUR CLIENTS SAY</span>
      <h2 class="section-title">Trusted by Businesses Worldwide</h2>

      <div class="testimonials-slider-wrap">
        <button class="slider-nav-btn" id="test-prev-btn" aria-label="Previous review">&#8592;</button>

        <!-- Testimonial 1 -->
        <div class="testimonial-card testimonial-slide-item">
          <img src="assets/testimonial-avatar.png" alt="Sarah Johnson" class="testimonial-avatar">
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
          <img src="assets/testimonial-avatar.png" alt="Marcus Vance" class="testimonial-avatar">
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

  <!-- SECTION 8: CTA BANNER -->
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

  <!-- SECTION 9: FAQ ACCORDION -->
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
        <div style="max-width: 200px;">
          <img src="assets/faq-graphic.png" alt="Frequently Asked Questions" style="width: 100%; height: auto; filter: drop-shadow(0 0 20px rgba(0,229,255,0.4));">
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

${getFooter()}

  <!-- Embedded 3D Engines -->
  <script>
${heroGlobeJs}
${cubesJs}
${ctaGlobeJs}
  </script>
`;

fs.writeFileSync(path.join(baseDir, 'index.html'), indexHtml, 'utf8');
console.log('index.html written successfully.');

// Write style.css to root as well
fs.writeFileSync(path.join(baseDir, 'style.css'), cssContent, 'utf8');

console.log('Completed successfully!');
