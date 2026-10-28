================================================================================
DIGITALSNOVE — HOSTINGER / CPANEL UPLOAD & EDITING GUIDE
Tagline: Think Digital. Go Global.
================================================================================

Assalamu Alaikum / Welcome!
Yeh complete package aapke Hostinger cPanel File Manager ke liye tayyar kiya gaya hai.
Isme koi complex React/Vite build ka jhanjhat nahi hai — simple, clean HTML, CSS aur 
JavaScript files hain jinko aap Hostinger File Manager ke web editor mein directly 
khol kar kisi bhi section ka text, headings, numbers ya images change kar sakte hain.

Aur aapke order ke mutabiq 3 main sections ko static images ke bajaye REAL 3D CODE 
se banaya gaya hai (Three.js):
1. Hero Section: 3D Animated Holographic Globe + 3D CSS Laptop & Phone + 4 Floating Badges
2. Why Choose Us Section: 3D Floating Glowing Isometric Cubes Canvas
3. CTA Banner Section: 3D Rotating Cyber Earth Canvas with network arcs

--------------------------------------------------------------------------------
STEP 1: HOSTINGER PAR UPLOAD KAISE KAREN (1-Minute Process)
--------------------------------------------------------------------------------
1. Hostinger hPanel login karein aur apne Hosting account ke "File Manager" par jayein.
2. "public_html" folder open karein.
   (Agar pehle se koi purani files hain to unka backup rakh kar public_html khali karein).
3. "Upload" button par click karein aur `digitalsnove-hostinger-cpanel.zip` upload karein.
4. ZIP file par Right-Click karke "Extract" dabayein (extract directly into public_html).
5. Bus! Aapki website live ho jayegi.

--------------------------------------------------------------------------------
STEP 2: CONTENT KAISE EDIT KAREIN (Section by Section Guide)
--------------------------------------------------------------------------------
Aap Hostinger File Manager mein kisi bhi file par right-click karke "Edit" daba sakte hain:

1. HOMEPAGE (index.html):
   - Har section ke upar clear comment likha hua hai:
     <!-- SECTION 1: HERO SECTION --> -> Title, description, trust numbers
     <!-- SECTION 2: SERVICES SECTION --> -> Services cards, sub-services list
     <!-- SECTION 3: ABOUT DIGITALSNOVE --> -> Company story aur glowing stats
     <!-- SECTION 4: FEATURED PROJECTS --> -> Portfolio cards
     <!-- SECTION 5: OUR PROCESS --> -> 5 steps timeline
     <!-- SECTION 6: WHY CHOOSE US --> -> 4 benefits
     <!-- SECTION 7: CLIENT TESTIMONIALS --> -> Client reviews & names
     <!-- SECTION 8: FAQ ACCORDION --> -> Questions aur answers
     <!-- SECTION 9: CTA BANNER --> -> Phone number, email aur heading
     <!-- SECTION 10: FOOTER --> -> Social media links aur navigation

2. SERVICES PAGES:
   - `services.html` -> All 6 services overview
   - `service-digital-marketing.html` -> SEO, PPC, Social Ads details
   - `service-web-development.html` -> Web engineering details
   - `service-graphic-design.html` -> Branding details
   - `service-ai-automation.html` -> AI chatbots & automation details
   - `service-content-creation.html` -> Content & copywriting details
   - `service-ecommerce.html` -> Shopify & WooCommerce details

3. CONTACT & QUOTE PAGES:
   - `contact.html` -> Email, phone, address, contact form
   - `quote.html` -> Interactive quote cost estimator form

4. ABOUT & PORTFOLIO:
   - `about.html` -> Company mission, story, leadership, values
   - `portfolio.html` -> Filterable case studies with metrics

--------------------------------------------------------------------------------
FILE STRUCTURE:
--------------------------------------------------------------------------------
public_html/
  ├── index.html
  ├── services.html
  ├── service-digital-marketing.html
  ├── service-web-development.html
  ├── service-graphic-design.html
  ├── service-ai-automation.html
  ├── service-content-creation.html
  ├── service-ecommerce.html
  ├── about.html
  ├── portfolio.html
  ├── contact.html
  ├── quote.html
  ├── blog.html
  ├── privacy-policy.html
  ├── terms-conditions.html
  ├── 404.html
  ├── .htaccess
  ├── css/
  │    └── style.css
  ├── js/
  │    ├── three.min.js
  │    ├── 3d-hero-globe.js
  │    ├── 3d-cubes.js
  │    ├── 3d-cta-globe.js
  │    └── main.js
  └── assets/
       ├── logo.png
       ├── hero-devices.png
       ├── about-office.png
       ├── service-marketing-graphic.png
       ├── service-web-graphic.png
       ├── project-ai.png
       ├── project-ecommerce.png
       ├── project-business.png
       ├── project-seo.png
       ├── testimonial-avatar.png
       ├── faq-graphic.png
       ├── why-choose-cubes.png
       └── cta-globe.png

Agar koi bhi mazeed cheez customize karni ho to style.css ya main.js mein 
clean comments ke sath easily edit ki ja sakti hai.
================================================================================
