const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitals Nove/digitalsnove-hostinger';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html') && f !== 'index.html');

const megaMenuHtml = `        <!-- Services with Mega Dropdown -->
        <div class="dropdown-parent">
          <a href="services.html" class="nav-link">Services &#9662;</a>
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
        </div>`;

files.forEach(f => {
  const filePath = path.join(baseDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace old dropdown-parent block with megaMenuHtml
  const oldDropdownRegex = /<div class="dropdown-parent">[\s\S]*?<\/div>\s*<\/div>/;
  if (oldDropdownRegex.test(content)) {
    content = content.replace(oldDropdownRegex, megaMenuHtml.trim());
    console.log('Updated dropdown in', f);
  }

  // Also make sure <link rel="stylesheet" href="style.css"> is included
  if (!content.includes('<link rel="stylesheet" href="style.css">')) {
    content = content.replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="style.css">\n  <link rel="stylesheet" href="css/style.css">');
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('All subpages updated with mega menu and fallback stylesheet links.');
