export const COMPANY_INFO = {
  name: "DigitalSnove",
  tagline: "Think Digital. Go Global.",
  email: "info@digitalsnove.com",
  phone: "+92 301 964 3900",
  location: "Worldwide Services",
  stats: [
    { label: "Global Clients", value: 500, suffix: "+", icon: "Globe" },
    { label: "Projects Completed", value: 1200, suffix: "+", icon: "Briefcase" },
    { label: "Client Satisfaction", value: 4.9, suffix: "/5", isDecimal: true, icon: "Star" },
    { label: "Expert Team Members", value: 50, suffix: "+", icon: "Users" }
  ],
  socials: [
    { name: "Facebook", url: "https://facebook.com/digitalsnove", icon: "Facebook" },
    { name: "Twitter/X", url: "https://twitter.com/digitalsnove", icon: "Twitter" },
    { name: "LinkedIn", url: "https://linkedin.com/company/digitalsnove", icon: "Linkedin" },
    { name: "Instagram", url: "https://instagram.com/digitalsnove", icon: "Instagram" },
    { name: "YouTube", url: "https://youtube.com/@digitalsnove", icon: "Youtube" }
  ]
};

export const SERVICES = [
  {
    id: "digital-marketing",
    number: "01",
    title: "Digital Marketing",
    shortDesc: "Get found, attract the right audience and turn visitors into loyal customers with data-driven marketing strategies.",
    fullDesc: "Our full-funnel digital marketing services combine strategic market intelligence, data analytics, and high-converting creative campaigns to drive measurable revenue growth for brands globally.",
    featuredGraphic: "/assets/service-marketing-graphic.png",
    category: "Marketing",
    status: "active",
    subServices: [
      { name: "SEO & Technical SEO", desc: "Enterprise keyword strategy, on-page optimization, site architecture, and algorithmic search ranking growth." },
      { name: "Social Media Marketing", desc: "Organic audience engagement, content calendar management, and community-driven brand amplification." },
      { name: "Paid Advertising & PPC", desc: "High-ROI Google Ads, Meta Ads, LinkedIn Ads, and precision retargeting campaigns." },
      { name: "Conversion Rate Optimization", desc: "A/B testing, user journey mapping, and conversion funnel optimization to maximize revenue per visitor." },
      { name: "Local SEO & Google Business", desc: "Geotargeted search optimization and local map pack dominance for targeted regional exposure." }
    ],
    features: [
      "Custom KPI tracking & automated reporting",
      "Omnichannel attribution modeling",
      "Audience segmentation & psychographic profiling",
      "Continuous multivariate creative testing"
    ]
  },
  {
    id: "web-development",
    number: "02",
    title: "Web Development",
    shortDesc: "Build fast, secure and scalable websites that look great and perform even better across all modern devices.",
    fullDesc: "We engineer state-of-the-art web applications, custom corporate platforms, and performance-optimized digital experiences tailored to business requirements.",
    featuredGraphic: "/assets/service-web-graphic.png",
    category: "Development",
    status: "active",
    subServices: [
      { name: "Business & Corporate Websites", desc: "Architected for credibility, compliance, lead capture, and brand elevation." },
      { name: "Custom Web Applications", desc: "React, Next.js, and bespoke full-stack solutions built for speed, scalability, and security." },
      { name: "WordPress & CMS Solutions", desc: "Flexible, client-editable content systems with secure custom themes and zero bloat." },
      { name: "Responsive Web Design & UI/UX", desc: "Mobile-first layouts crafted for intuitive user journeys and accessibility." },
      { name: "Website Maintenance & Optimization", desc: "Core Web Vitals tuning, uptime monitoring, security audits, and continuous updates." }
    ],
    features: [
      "Sub-second load times & Core Web Vitals optimization",
      "Full WCAG 2.1 AA accessibility standards",
      "Mobile-first responsive architecture",
      "End-to-end SSL & hardened cloud deployment"
    ]
  },
  {
    id: "graphic-design",
    number: "03",
    title: "Graphic Design & Branding",
    shortDesc: "Create a strong visual identity that makes your brand stand out and resonates with your target market.",
    fullDesc: "From comprehensive visual identity systems to high-impact marketing collateral, our design studio produces memorable creative assets that command attention.",
    featuredGraphic: "/assets/why-choose-cubes.png",
    category: "Creative",
    status: "active",
    subServices: [
      { name: "Logo & Brand Identity Systems", desc: "Distinctive emblems, typography guidelines, color palettes, and comprehensive brand books." },
      { name: "Social Media Graphics & Templates", desc: "Cohesive visual styles for Instagram, LinkedIn, YouTube, and multi-channel campaigns." },
      { name: "Advertising Creatives", desc: "High-click-through banners, motion graphics, and paid media advertising assets." },
      { name: "Packaging & Print Collateral", desc: "Product packaging, stationery, corporate brochures, and trade show displays." },
      { name: "Pitch Decks & Presentations", desc: "Investor-ready presentations and executive slide decks designed to convince." }
    ],
    features: [
      "Vector-first multi-format exports (SVG, PDF, EPS)",
      "Strict brand style guides and asset kits",
      "High-resolution print-ready CMYK deliverables",
      "Modern dark/light mode visual consistency"
    ]
  },
  {
    id: "ai-automation",
    number: "04",
    title: "AI & Automation",
    badge: "Future Offering",
    shortDesc: "Tools and workflow solutions to help you work smarter, eliminate repetitive tasks, and scale customer support.",
    fullDesc: "We are actively developing and piloting next-generation AI agents, conversational customer support systems, and cross-platform automation pipelines. Pilot programs available for select partners.",
    featuredGraphic: "/assets/project-ai.png",
    category: "Automation",
    status: "pilot", // Clearly marked as upcoming/pilot
    subServices: [
      { name: "AI Chatbots & Virtual Assistants", desc: "Context-aware conversational agents for 24/7 lead capture and tier-1 support (In Development)." },
      { name: "Customer Support Automation", desc: "Intelligent ticket routing, automated triage, and response drafting." },
      { name: "Workflow & CRM Automation", desc: "Zapier, Make, and API integrations connecting HubSpot, Salesforce, and internal databases." },
      { name: "Lead Management Systems", desc: "Automated scoring, enrichment, and nurturing sequences to empower sales teams." },
      { name: "Business Process Optimization", desc: "Data synchronization pipelines and repetitive task elimination." }
    ],
    features: [
      "Upcoming enterprise pilot program enrollment",
      "Secure zero-data-retention AI model integration",
      "Seamless bridge into existing CRM/ERP platforms",
      "Human-in-the-loop oversight mechanisms"
    ]
  },
  {
    id: "content-creation",
    number: "05",
    title: "Content Creation",
    shortDesc: "Compelling social media content, persuasive website copy, and SEO blogs that engage, educate, and convert.",
    fullDesc: "Words that build authority and drive revenue. We craft engaging digital storytelling, conversion-focused sales copywriting, and research-backed thought leadership.",
    featuredGraphic: "/assets/project-seo.png",
    category: "Content",
    status: "active",
    subServices: [
      { name: "Social Media Content & Calendars", desc: "Engaging short-form copy, carousels, and platform-specific storytelling." },
      { name: "Website Copywriting", desc: "High-converting value propositions, landing page copy, and product descriptions." },
      { name: "SEO Blogs & Thought Leadership", desc: "In-depth, keyword-targeted articles designed to rank on Google and establish topical authority." },
      { name: "Brand Storytelling & Mission", desc: "Authentic narratives that humanize your brand and build lasting community trust." },
      { name: "Advertising & Video Scripts", desc: "Punchy, persuasive hooks and scripts for video ads, reels, and product demos." }
    ],
    features: [
      "Thorough competitor and audience research",
      "Native SEO optimization and semantic keyword clustering",
      "Rigorous editorial review and plagiarism verification",
      "Tailored tone-of-voice adaptation"
    ]
  },
  {
    id: "ecommerce-solutions",
    number: "06",
    title: "E-Commerce Solutions",
    shortDesc: "High-converting online stores built on Shopify, WooCommerce, and custom platforms engineered for sales.",
    fullDesc: "Turn store visitors into high-value repeat customers. We create smooth shopping experiences with rapid checkout flows, secure payment gateways, and conversion-optimized architectures.",
    featuredGraphic: "/assets/project-ecommerce.png",
    category: "E-Commerce",
    status: "active",
    subServices: [
      { name: "Shopify Store Development", desc: "Custom Shopify theme design, Liquid development, app integrations, and checkout customization." },
      { name: "WooCommerce & Custom Stores", desc: "Scalable WordPress e-commerce setups with tailored catalog hierarchies." },
      { name: "Product Page Optimization", desc: "High-converting product displays, 3D/video embeds, and trust badges." },
      { name: "Payment Gateway Integration", desc: "Seamless Stripe, PayPal, Apple Pay, and local merchant processor integration." },
      { name: "Store Speed & E-Commerce SEO", desc: "Sub-second product catalog browsing and structured product schema for rich Google snippets." }
    ],
    features: [
      "One-click checkout optimization and cart abandonment recovery",
      "Omnichannel inventory synchronization",
      "Real-time analytics and customer lifetime value tracking",
      "Multi-currency and international tax compliance"
    ]
  }
];

export const PORTFOLIO_PROJECTS = [
  {
    id: "ai-smart-tools",
    title: "Smart Tools for a Better Tomorrow",
    category: "AI & Innovation",
    filterTag: "ai",
    image: "/assets/project-ai.png",
    client: "NeuroTech AI Labs",
    year: "2025",
    summary: "Intelligent analytics and automated workflow dashboard featuring real-time natural language query handling and predictive lead forecasting.",
    outcome: "+180% efficiency in repetitive administrative workflows",
    tags: ["AI Tools", "Cloud Architecture", "Next.js", "Python"]
  },
  {
    id: "ecommerce-fashion-store",
    title: "E-Commerce Store & Fashion Brand",
    category: "E-Commerce",
    filterTag: "ecommerce",
    image: "/assets/project-ecommerce.png",
    client: "Aura Apparel Global",
    year: "2025",
    summary: "Bespoke Shopify Plus storefront with custom visual product customizer, frictionless mobile cart, and localized multi-currency support.",
    outcome: "+42% increase in mobile checkout conversions in 90 days",
    tags: ["Shopify Plus", "Responsive UI", "Payment Gateway", "Speed Tuning"]
  },
  {
    id: "business-website-growth",
    title: "Business Website Brand Growth",
    category: "Web Development",
    filterTag: "web",
    image: "/assets/project-business.png",
    client: "Apex Enterprise Solutions",
    year: "2024",
    summary: "Complete digital identity revamp and headless corporate portal engineered for high-performance enterprise lead acquisition.",
    outcome: "99/100 Google Lighthouse Core Web Vitals across all pages",
    tags: ["Corporate Web", "React", "Tailwind CSS", "Enterprise SEO"]
  },
  {
    id: "seo-digital-marketing",
    title: "Digital Marketing SEO Success",
    category: "Digital Marketing",
    filterTag: "marketing",
    image: "/assets/project-seo.png",
    client: "Vanguard Wealth Management",
    year: "2025",
    summary: "Comprehensive multi-channel search strategy combining technical site restructuring, topical authority clustering, and precision PPC.",
    outcome: "+240% organic qualified search traffic within 6 months",
    tags: ["Search Engine Optimization", "Google Ads", "Content Strategy", "Analytics"]
  }
];

export const PROCESS_STEPS = [
  {
    step: "01",
    name: "Discover",
    title: "Understand your business goals and challenges.",
    description: "We dive deep into your market positioning, competitor landscape, target audience pain points, and commercial objectives to establish clear project benchmarks.",
    icon: "Compass"
  },
  {
    step: "02",
    name: "Plan",
    title: "Create a tailored strategy and project roadmap.",
    description: "Our strategists define technical architectures, UX wireframes, content outlines, and milestone timelines with clear deliverables and risk mitigations.",
    icon: "FileSpreadsheet"
  },
  {
    step: "03",
    name: "Build",
    title: "Design and develop with modern technologies.",
    description: "Senior designers and engineers craft high-performance code, pixel-perfect visual interfaces, and secure integrations following best industry practices.",
    icon: "Code"
  },
  {
    step: "04",
    name: "Refine",
    title: "Test, optimize and ensure the best performance.",
    description: "Thorough multi-device quality assurance, accessibility audits, Core Web Vitals speed tuning, and end-to-end security verification before deployment.",
    icon: "SlidersHorizontal"
  },
  {
    step: "05",
    name: "Grow",
    title: "Track results and scale your success further.",
    description: "Launch is only the beginning. We analyze real-world analytics, conduct continuous conversion optimizations, and scale your digital footprint globally.",
    icon: "TrendingUp"
  }
];

export const WHY_CHOOSE_US = [
  {
    title: "Strategic Approach",
    desc: "Data-driven decisions tailored to your exact business model and measurable ROI metrics.",
    icon: "Target"
  },
  {
    title: "Expert Team",
    desc: "Skilled & experienced engineers, designers, and growth strategists dedicated to your brand.",
    icon: "Award"
  },
  {
    title: "Transparent Communication",
    desc: "Clear timelines, proactive updates, and zero hidden costs or surprise change-orders.",
    icon: "MessageSquareCheck"
  },
  {
    title: "On-Time Delivery",
    desc: "Disciplined agile execution ensuring your milestones and launch dates are always respected.",
    icon: "Clock"
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CEO, LUXE",
    rating: 5,
    avatar: "/assets/testimonial-avatar.png",
    quote: "DigitalSnove transformed our online presence. Their team is professional, creative and always supportive. Our traffic and sales have grown significantly.",
    verified: true
  },
  {
    id: 2,
    name: "Marcus Vance",
    role: "Managing Director, Apex Global",
    rating: 5,
    avatar: "/assets/testimonial-avatar.png",
    quote: "The web application delivered by DigitalSnove exceeded our executive team's expectations. Lightning fast, beautifully designed, and converts visitors like clockwork.",
    verified: true
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Head of Marketing, CloudVibe",
    rating: 5,
    avatar: "/assets/testimonial-avatar.png",
    quote: "Outstanding SEO and digital marketing execution. Within 4 months, our inbound demo requests tripled. They are true partners in every sense.",
    verified: true
  }
];

export const FAQS = [
  {
    question: "What services does DigitalSnove offer?",
    answer: "DigitalSnove provides complete full-service digital solutions spanning six core areas: Digital Marketing (SEO, PPC, Social Media), Web Development (custom websites, web apps, WordPress), Graphic Design & Branding (logos, packaging, marketing collateral), AI & Automation (workflows, customer chatbots — currently in selective pilot development), Content Creation (copywriting, SEO blogs, video scripts), and E-Commerce Solutions (Shopify, WooCommerce, payment gateways)."
  },
  {
    question: "How long does a project take?",
    answer: "Project timelines depend on the scope and complexity. Standard brand websites and landing pages typically take 2 to 4 weeks. Custom e-commerce platforms and complex web applications require 6 to 10 weeks. Ongoing marketing and SEO retainers run on month-to-month or quarterly growth cycles with regular sprint reviews."
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes, absolutely! DigitalSnove was founded on the principle 'Think Digital. Go Global.' We partner with ambitious businesses across North America, Europe, the Middle East, Asia, and worldwide. Our project management tools and timezone-flexible communication keep collaboration seamless."
  },
  {
    question: "What is the pricing model?",
    answer: "We offer transparent, value-based pricing tailored to your objectives. We provide fixed-price quotes for defined projects (such as website development or brand identity kits) and flexible monthly retainers for ongoing digital marketing, SEO, and maintenance. Every proposal includes a clear breakdown with zero hidden charges."
  },
  {
    question: "How can I get started?",
    answer: "Getting started is simple! Click the 'Get a Free Quote' or 'Start a Project' button, submit your project details via our inquiry form, or email us at info@digitalsnove.com. Our strategy team will review your requirements and schedule a 30-minute discovery consultation within 24 business hours."
  }
];

export const BLOG_POSTS = [
  {
    id: "seo-trends-2025",
    title: "The Future of SEO: How AI and Semantic Search Are Changing Rankings",
    category: "Digital Marketing",
    readTime: "5 min read",
    date: "October 10, 2025",
    author: "DigitalSnove Strategy Team",
    excerpt: "Discover how search algorithms are evolving from raw keyword matching to intent-based semantic entities, and what your brand must do to stay ahead.",
    content: "Search engines are experiencing the most dramatic transformation in decades. The rise of conversational AI and generative search experiences means that old keyword stuffing tactics are dead. To thrive in the modern landscape, websites must establish topical authority, optimize for Core Web Vitals, and build genuine engagement signals..."
  },
  {
    id: "high-converting-ecommerce-tips",
    title: "10 Proven UX Strategies to Double Your E-Commerce Store Conversions",
    category: "E-Commerce",
    readTime: "7 min read",
    date: "September 28, 2025",
    author: "DigitalSnove UX Lab",
    excerpt: "From frictionless one-tap mobile checkout to social proof placement, explore actionable UX enhancements that drive immediate revenue lifts.",
    content: "Shopping cart abandonment averages nearly 70% across e-commerce industries. By optimizing your mobile micro-interactions, streamlining checkout fields, and displaying transparent security badges, store owners can recover significant lost revenue..."
  },
  {
    id: "web-development-modern-stack",
    title: "Why Modern Businesses Are Switching to High-Performance Headless Web Architectures",
    category: "Web Development",
    readTime: "6 min read",
    date: "September 15, 2025",
    author: "DigitalSnove Engineering",
    excerpt: "Why slow legacy CMS platforms are costing you customers, and how modern reactive architectures deliver sub-second load times and unmatched security.",
    content: "Performance is no longer just a technical metric — it is a direct driver of sales and search rankings. Google's Core Web Vitals benchmark real-world user experience. Modern headless architectures separate the frontend presentation layer from backend content management..."
  }
];
