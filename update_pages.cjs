const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'digitalsnove-hostinger');

const filesToUpdate = [
  'about.html',
  'services.html',
  'portfolio.html',
  'blog.html',
  'contact.html',
  'quote.html',
  'service-ai-automation.html',
  'service-content-creation.html',
  'service-digital-marketing.html',
  'service-ecommerce.html',
  'service-graphic-design.html',
  'service-web-development.html',
  'privacy-policy.html',
  'terms-conditions.html',
  '404.html'
];

const newFooterHtml = `  <!-- FOOTER -->
  <footer class="site-footer">
    <div class="container footer-grid-wrap">
      <!-- Brand & Socials -->
      <div class="footer-col-brand">
        <a href="index.html" class="brand-logo">
          <div class="logo-badge"><div class="logo-inner">DS</div></div>
          <div class="brand-text">
            <h1 style="font-size: 15px;">DigitalSnove</h1>
            <span style="font-size: 8px;">Think Digital. Go Global.</span>
          </div>
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 16px; line-height: 1.6; max-width: 320px;">
          Premier digital agency &amp; SaaS provider empowering healthcare clinics, pharmacies, and high-growth businesses.
        </p>
        <div class="social-links" style="padding-left: 0; border-left: none;">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">&#9670; Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">&#9670; X</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">&#9670; LinkedIn</a>
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">&#9670; Instagram</a>
        </div>
      </div>

      <!-- Quick Nav Links -->
      <div class="footer-col">
        <h4 style="font-size: 13px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Company</h4>
        <nav class="footer-nav-vertical">
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="portfolio.html">Portfolio</a>
          <a href="blog.html">Blog</a>
          <a href="contact.html">Contact Us</a>
          <a href="quote.html">Get a Quote</a>
        </nav>
      </div>

      <!-- Services & Solutions Column -->
      <div class="footer-col">
        <h4 style="font-size: 13px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Services &amp; Solutions</h4>
        <nav class="footer-nav-vertical">
          <a href="cloud-pos-saas.html" style="color: #00e5ff; font-weight: 700;">&#9889; Cloud POS &amp; Business SaaS</a>
          <a href="cloud-pos-saas.html#clinic">&bull; Clinic &amp; Hospital Management</a>
          <a href="cloud-pos-saas.html#pharmacy">&bull; Pharmacy &amp; Retail POS</a>
          <a href="service-web-development.html">&bull; Web &amp; Custom Software</a>
          <a href="service-digital-marketing.html">&bull; Digital Marketing &amp; SEO</a>
          <a href="service-ai-automation.html">&bull; AI Tools &amp; Automation</a>
        </nav>
      </div>
    </div>

    <!-- Legal & Copyright -->
    <div class="container footer-bottom-strip">
      <p>&copy; 2026 DigitalSnove. All rights reserved.</p>
      <div class="footer-legal-links">
        <a href="privacy-policy.html">Privacy Policy</a>
        <span>&bull;</span>
        <a href="terms-conditions.html">Terms &amp; Conditions</a>
      </div>
    </div>
  </footer>`;

filesToUpdate.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add Cloud POS & SaaS to desktop navigation if not present
  if (!content.includes('cloud-pos-saas.html') || !content.includes('Cloud POS &amp; SaaS')) {
    // Insert after dropdown-parent
    const targetDropdownEnd = /<\/div>\s*<\/div>\s*<a href="about\.html"/;
    if (targetDropdownEnd.test(content)) {
      content = content.replace(targetDropdownEnd, `</div>\n        </div>\n\n        <!-- NEW SaaS & Cloud POS Portal Link -->\n        <a href="cloud-pos-saas.html" class="nav-link" style="color: #00e5ff; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">\n          Cloud POS &amp; SaaS\n          <span style="background: linear-gradient(90deg, #00e5ff, #3b82f6); color: #020617; font-size: 9px; padding: 2px 6px; border-radius: 9999px; font-weight: 900; letter-spacing: 0.05em;">PORTAL</span>\n        </a>\n\n        <a href="about.html"`);
    }
  }

  // 2. Update Header CTA
  content = content.replace(
    /<a href="quote\.html" class="btn-primary header-cta">Get a Free Quote &rarr;<\/a>/g,
    `<a href="cloud-pos-saas.html#pricing" class="btn-primary header-cta" style="background: linear-gradient(90deg, #00e5ff, #2563eb); color: #020617; font-weight: 800; box-shadow: 0 0 15px rgba(0, 229, 255, 0.35);">Get Started / Free Trial &rarr;</a>`
  );

  // 3. Add to Mobile Drawer
  const targetDrawer = /(<nav class="drawer-nav">\s*<a href="index\.html"[^>]*>Home<\/a>)/;
  if (targetDrawer.test(content) && !content.includes('Cloud POS &amp; SaaS (Portal)')) {
    content = content.replace(
      targetDrawer,
      `$1\n        <a href="cloud-pos-saas.html" style="color: #00e5ff; font-weight: 700; display: flex; align-items: center; justify-content: space-between;">\n          Cloud POS &amp; SaaS (Portal)\n          <span style="background: linear-gradient(90deg, #00e5ff, #3b82f6); color: #020617; font-size: 9px; padding: 2px 6px; border-radius: 9999px; font-weight: 900;">NEW</span>\n        </a>`
    );
  }

  // 4. Update Drawer CTA button
  content = content.replace(
    /<a href="quote\.html" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 24px;">Get a Free Quote &rarr;<\/a>/g,
    `<a href="cloud-pos-saas.html#pricing" class="btn-primary" style="width: 100%; justify-content: center; margin-top: 24px; background: linear-gradient(90deg, #00e5ff, #2563eb); color: #020617; font-weight: 800;">Get Started / Free Trial &rarr;</a>`
  );

  // 5. Replace Footer
  const footerRegex = /<!-- FOOTER -->[\s\S]*?<footer class="site-footer">[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, newFooterHtml);
  } else {
    const rawFooter = /<footer class="site-footer">[\s\S]*?<\/footer>/;
    if (rawFooter.test(content)) {
      content = content.replace(rawFooter, newFooterHtml);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
});

console.log('Finished updating all HTML files.');
