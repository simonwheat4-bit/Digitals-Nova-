const fs = require('fs');
const path = require('path');

const sectorsData = {
  clinics: {
    fileName: 'clinics.html',
    sectorKey: 'CLINIC_HMS',
    apkName: 'DigitalsNova-Clinic-HMS.apk',
    batName: 'DigitalsNova-Clinic-HMS-Windows-Setup.bat',
    industryName: 'Clinic / Hospital',
    pageTitle: 'Clinics & Hospitals (HMS) — DigitalsNova Cloud Healthcare Management SaaS',
    metaDesc: 'Streamline patient care with DigitalsNova Clinic & Hospital Management System (HMS). OPD thermal queue, patient QR health cards, doctor fee splits, multi-session installment ledgers, and pharmacy prescription sync.',
    heroEyebrow: '🏥 DEDICATED HEALTHCARE HOSPITAL & CLINIC SUITE (HMS)',
    heroH1: "Pakistan's Premier Cloud Hospital & Clinic Management System",
    heroDesc: 'Engineered for medical practices, dental clinics, aesthetic centers, physiotherapy hubs, and multi-specialty hospitals. Process OPD tokens in seconds, automate doctor commission splits, eliminate treatment dues discrepancies, and sync patient records seamlessly.',
    monthlyPriceNum: '7,999',
    annualPriceNum: '79,990',
    annualEquiv: '6,665',
    annualSave: '15,998',
    threeYearPriceNum: '229,000',
    threeYearSave: '58,964',
    featuresEyebrow: 'TAILORED ARCHITECTURE FOR HEALTHCARE & HMS',
    featuresList: [
      {
        icon: '🏥',
        title: 'Digital OPD Reception & Thermal Queue',
        desc: 'Issue instant thermal OPD tokens with live queue broadcast on clinic waiting room monitors. Minimize patient waiting friction and track doctor consultations in real-time.',
        pill: '✓ 1.5s Token Print • Live Waiting Display'
      },
      {
        icon: '📱',
        title: 'Patient QR Identification & Digital EMR',
        desc: 'Scan patient QR cards to instantly retrieve longitudinal treatment records, doctor visit notes, diagnostic lab files, and prescriptions with zero paper searching.',
        pill: '✓ Instant QR Lookups • Cloud EMR History'
      },
      {
        icon: '🩺',
        title: 'Doctor Appointment Scheduling & Split Fee',
        desc: 'Automate doctor visit scheduling with configurable consultation fees and instant commission splits (e.g., 70% Doctor / 30% Clinic) calculated automatically at checkout.',
        pill: '✓ Real-time Commission Splits • Doctor Portals'
      },
      {
        icon: '📋',
        title: 'Treatment Catalog & Multi-Session Dues Ledger',
        desc: 'Manage procedures (Root Canal, Laser sessions, Dialysis) requiring multiple visits. Accept partial advance deposits, track remaining dues, and send automatic SMS payment receipts.',
        pill: '✓ Installment Ledgers • Session Tracking'
      },
      {
        icon: '💊',
        title: 'In-House Pharmacy & Medicine Batch Dispensing',
        desc: 'Seamlessly link doctor prescriptions to your clinic pharmacy. Instant stock deduction with batch expiry warnings, strip/tablet breakdown, and laser barcode scanning.',
        pill: '✓ Zero Prescription Leakage • Expiry Alerts'
      },
      {
        icon: '📊',
        title: 'Clinic Admin Daily Financial Closing (Z-Report)',
        desc: 'Lock daily shift cash drawers with 1-click closing reports. Audit cash, card, and online transactions with dual doctor/receptionist authentication to prevent theft.',
        pill: '✓ Cash Drawer Balancing • Audit Lock'
      }
    ]
  },
  restaurants: {
    fileName: 'restaurants.html',
    sectorKey: 'RESTAURANT',
    apkName: 'DigitalsNova-Restaurant-POS.apk',
    batName: 'DigitalsNova-Restaurant-POS-Windows-Setup.bat',
    industryName: 'Restaurants, Cafes & Food Outlets',
    pageTitle: 'Restaurants, Cafes & Food Outlets — DigitalsNova Cloud Restaurant ERP & POS',
    metaDesc: 'Manage your dining floor with DigitalsNova Restaurant POS. Instant Kitchen Order Tickets (KOT/BOT), live table layout T1-T12, waiter management, recipe-level raw ingredient inventory, and takeaway dispatch.',
    heroEyebrow: '🍽️ DEDICATED RESTAURANT, CAFE & FOOD OUTLET SUITE',
    heroH1: "Pakistan's Premier Restaurant & Cafe Cloud POS System",
    heroDesc: 'Engineered for fine dining restaurants, fast-food joints, cafes, BBQ houses, and cloud kitchens. Instant thermal Kitchen Order Tickets (KOT), visual table floor layouts (T1 to T12), waiter commission tracking, recipe stock deduction, and live food item photos.',
    monthlyPriceNum: '6,999',
    annualPriceNum: '69,990',
    annualEquiv: '5,832',
    annualSave: '13,998',
    threeYearPriceNum: '199,000',
    threeYearSave: '52,964',
    featuresEyebrow: 'TAILORED ARCHITECTURE FOR FOOD & BEVERAGE',
    featuresList: [
      {
        icon: '🍳',
        title: 'Instant Kitchen Order Tickets (KOT & BOT)',
        desc: 'Route customer orders to kitchen or beverage station thermal printers in under 1 second. Include chef notes, spice levels, and order modifications to eliminate kitchen chaos.',
        pill: '✓ 1-Click KOT Firing • Chef Special Notes'
      },
      {
        icon: '🪑',
        title: 'Interactive Dining Room Table Floor Plans',
        desc: 'Visual floor plan supporting T1 to T12, VIP halls, Takeaway counter, and Delivery dispatch. Monitor occupied tables, live running orders, and bill checkout states at a glance.',
        pill: '✓ Visual Table Status • Running Order Buffers'
      },
      {
        icon: '👔',
        title: 'Waiter Assignment & Server Performance',
        desc: 'Assign tables to specific captains and waiters (e.g. Waiter Ali, Waiter Ahmed). Track orders handled, total food sales generated, and tips by staff member for transparent management.',
        pill: '✓ Waiter Order Tagging • Commission Logs'
      },
      {
        icon: '🥩',
        title: 'Recipe-Level Raw Ingredient Stock Deduction',
        desc: 'Link menu dishes to backend kitchen raw ingredients (chicken, flour, oil, cheese). Every burger, pizza, or karahi sold automatically deducts exact grams from your kitchen stock.',
        pill: '✓ Recipe Yield Calculations • Waste Reduction'
      },
      {
        icon: '🛵',
        title: 'Unified Dine-In, Takeaway & Delivery Dispatch',
        desc: 'Process delivery orders with customer phone lookup, rider assignment, and address tracking. Print thermal rider slips with Google Maps GPS coordinates and total dues.',
        pill: '✓ Rider Dispatch Slips • Customer Caller ID'
      },
      {
        icon: '📸',
        title: 'Custom Menu Categories, Portions & Photos',
        desc: 'Store owners can dynamically add menu categories (Fast Food, BBQ, Karahi, Desserts) and serving sizes (Full, Half, Quarter, Family Pack) with food item image uploads.',
        pill: '✓ Dynamic Category Manager • Dish Photo Uploads'
      }
    ]
  },
  pharmacy: {
    fileName: 'pharmacy.html',
    sectorKey: 'PHARMACY',
    apkName: 'DigitalsNova-Pharmacy-POS.apk',
    batName: 'DigitalsNova-Pharmacy-POS-Windows-Setup.bat',
    industryName: 'Pharmacy & Medical Store',
    pageTitle: 'Pharmacies & Medical Stores — DigitalsNova High-Velocity Cloud Pharmacy POS',
    metaDesc: 'Accelerate retail pharmacy counter sales with DigitalsNova. Batch expiry tracking, strip & tablet unit dispenser, 1.8s barcode scanning, controlled drugs registry, and automated wholesale inward.',
    heroEyebrow: '💊 DEDICATED PHARMACY & MEDICAL STORE SUITE',
    heroH1: "Pakistan's High-Velocity Cloud Pharmacy & Medical Store POS",
    heroDesc: 'Engineered for retail chemists, hospital pharmacies, and medical stores. Ultra-fast laser barcode counter checkout, automatic batch & expiry date countdown, strip and loose tablet dispensing, controlled narcotics register, and automated distributor purchase orders.',
    monthlyPriceNum: '5,999',
    annualPriceNum: '59,990',
    annualEquiv: '4,999',
    annualSave: '11,998',
    threeYearPriceNum: '169,000',
    threeYearSave: '46,964',
    featuresEyebrow: 'TAILORED ARCHITECTURE FOR PHARMACIES & CHEMISTS',
    featuresList: [
      {
        icon: '⚡',
        title: '1.8-Second Laser Barcode Scanning',
        desc: 'Scan 2D Datamatrix and GS1 barcodes with instant item identification, price calculation, and stock reduction. Zero keystrokes needed for high-rush pharmacy counters.',
        pill: '✓ Ultra-fast Scanner Buffer • Auto-Cash Calculation'
      },
      {
        icon: '🔬',
        title: 'Drug Formulary & Generic Molecule Search',
        desc: 'Search 50,000+ medicines by brand name, active generic salt/molecule, dosage strength (500mg, 250mg), and formulation (tablets, syrups, injections, drops).',
        pill: '✓ Generic Formula Matching • Alternative Suggestions'
      },
      {
        icon: '⏳',
        title: 'Batch Expiry Countdown & Dead Stock Alert',
        desc: 'Color-coded visual warnings for batches nearing 90, 60, or 30 days to expiration. Return near-expiry stock to pharmaceutical distributors on time to prevent total losses.',
        pill: '✓ 90-Day Expiry Flags • Automated Vendor Returns'
      },
      {
        icon: '💊',
        title: 'Strip, Blister & Loose Tablet Unit Dispenser',
        desc: 'Break whole boxes into blisters or single tablets with exact fractional price and inventory calculation. Eliminate loose tablet discrepancies at closing time.',
        pill: '✓ Strip / Box Unit Fractions • Accurate Inventory'
      },
      {
        icon: '🔒',
        title: 'Controlled Drugs & Narcotics Registry',
        desc: 'Log prescriptions for Schedule G and controlled narcotics. Require prescribing doctor name and patient CNIC with automated audit logs compliant with DRAP guidelines.',
        pill: '✓ DRAP Audit Compliance • Controlled Logbook'
      },
      {
        icon: '📦',
        title: 'Automated Supplier POs & Wholesale Inward',
        desc: 'Generate supplier purchase orders based on minimum stock threshold alerts. Scan wholesale vendor invoices with purchase price, batch, and bonus schemes in minutes.',
        pill: '✓ Bonus Scheme Calculations • Wholesale Margin Audits'
      }
    ]
  },
  retail: {
    fileName: 'retail.html',
    sectorKey: 'RETAIL_MART',
    apkName: 'DigitalsNova-Retail-POS.apk',
    batName: 'DigitalsNova-Retail-POS-Windows-Setup.bat',
    industryName: 'Retail Mart / General Store',
    pageTitle: 'Retail Marts & General Stores — DigitalsNova Enterprise Cloud Retail POS',
    metaDesc: 'Power high-volume supermarket & retail checkout with DigitalsNova. Multi-customer Hold Bill buffer, 1-click Z-Report cash drawer balancing, SKU inventory control, and thermal printer engine.',
    heroEyebrow: '🛒 DEDICATED RETAIL MART & SUPERSTORE SUITE',
    heroH1: "Pakistan's Enterprise Cloud Retail Mart & Superstore POS",
    heroDesc: 'Engineered for supermarkets, grocery marts, apparel boutiques, departmental stores, and wholesale traders. High-speed barcode checkout, Hold Bill multi-customer buffer (F4), automated cash drawer reconciliation, customer loyalty points, and thermal receipt printing.',
    monthlyPriceNum: '4,999',
    annualPriceNum: '49,990',
    annualEquiv: '4,165',
    annualSave: '9,998',
    threeYearPriceNum: '139,000',
    threeYearSave: '40,964',
    featuresEyebrow: 'TAILORED ARCHITECTURE FOR RETAIL MARTS & GENERAL STORES',
    featuresList: [
      {
        icon: '⚡',
        title: 'High-Speed Barcode Scanner Checkout',
        desc: 'Laser gun scanner integration reads standard UPC, EAN-13, and custom store barcodes instantly. Automatic cash change calculator keeps checkout queues moving at peak hours.',
        pill: '✓ Sub-second Item Lookups • Fast Cash Change Counter'
      },
      {
        icon: '⏸️',
        title: "'Hold Bill' Multi-Customer Buffer [F4]",
        desc: 'Park a customer cart with 1 click when they step away to grab another item. Serve the next customer immediately without losing scanned items or voiding receipts.',
        pill: '✓ Instant Cart Parking • Zero Queue Stalls'
      },
      {
        icon: '🧾',
        title: '1-Click Automated Z-Report Cash Balancing',
        desc: 'End-of-day register closing report automatically reconciles actual drawer cash against recorded sales. Detect discrepancies, cashier shortages, and refunds with audit security.',
        pill: '✓ Shift Drawer Reconciliation • Shortage Tracking'
      },
      {
        icon: '📦',
        title: 'Daily Shelf Stock & Shrinkage Detection',
        desc: 'Track opening, sold, and damaged inventory. Get instant reorder alerts when items hit critical shelf thresholds and spot inventory shrinkage before it impacts your bottom line.',
        pill: '✓ Threshold Alerts • Shrinkage Detection'
      },
      {
        icon: '👥',
        title: 'Multi-Cashier Shift Handover & Drawer Lock',
        desc: 'Authorize multiple cashier shifts with secure 4-digit PIN access. Lock register drawers between shifts with clear transfer logs and supervisor sign-off.',
        pill: '✓ Cashier PIN Verification • Supervisor Overrides'
      },
      {
        icon: '🎁',
        title: 'Customer Loyalty Points & WhatsApp E-Slips',
        desc: 'Build repeat footfall with points earned per rupee spent. Send paperless branded WhatsApp receipts directly to customer mobile phones with zero paper cost.',
        pill: '✓ Free WhatsApp E-Slips • Points Redemptions'
      }
    ]
  }
};

function generateSectorPageHtml(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.pageTitle}</title>
  <meta name="description" content="${data.metaDesc}">
  <link rel="canonical" href="https://digitalsnova.com/${data.fileName}">
  <meta name="theme-color" content="#030718">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://digitalsnova.com/${data.fileName}">
  <meta property="og:title" content="${data.pageTitle}">
  <meta property="og:description" content="${data.metaDesc}">
  <link rel="manifest" href="/portal/manifest.json">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="css/style.css">

  <style>
    /* Sector Subpage Hero & Architecture Styles */
    .sector-hero {
      padding: 140px 0 80px;
      background: radial-gradient(circle at 50% 15%, rgba(0, 229, 255, 0.15) 0%, rgba(3, 7, 24, 1) 70%);
      position: relative;
      overflow: hidden;
    }
    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 50px;
      align-items: center;
    }
    @media (max-width: 992px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 40px;
      }
      .sector-hero { padding: 120px 0 60px; }
    }
    .sector-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: #00e5ff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .sector-title {
      font-size: 44px;
      line-height: 1.15;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    @media (max-width: 768px) {
      .sector-title { font-size: 32px; }
    }
    .sector-desc {
      font-size: 16px;
      line-height: 1.65;
      color: #94a3b8;
      margin-bottom: 30px;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 36px;
    }
    @media (max-width: 992px) {
      .hero-actions { justify-content: center; }
    }
    .btn-apk-install {
      background: linear-gradient(90deg, #10b981, #059669);
      color: #ffffff !important;
      font-weight: 800;
      font-size: 14px;
      padding: 14px 24px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
      transition: all 0.25s ease;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-apk-install:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
      background: linear-gradient(90deg, #059669, #047857);
    }
    .hero-trust-list {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      font-size: 13px;
      color: #cbd5e1;
      font-weight: 600;
    }
    @media (max-width: 992px) {
      .hero-trust-list { justify-content: center; }
    }
    .hero-trust-list span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #38bdf8;
    }

    /* Hero Mockup Card */
    .hero-mockup-card {
      background: #08122c;
      border: 1px solid rgba(0, 229, 255, 0.3);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 229, 255, 0.15);
      position: relative;
    }
    .mockup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .mockup-dots {
      display: flex;
      gap: 6px;
    }
    .mockup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* 3-Column Features Grid */
    .features-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      max-width: 1200px;
      margin: 0 auto;
    }
    @media (max-width: 992px) {
      .features-grid-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 640px) {
      .features-grid-3 {
        grid-template-columns: 1fr;
      }
    }

    /* Pricing Section */
    .pricing-billing-toggle-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 32px auto 44px;
      padding: 6px;
      background: rgba(11, 23, 60, 0.9);
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 9999px;
      width: fit-content;
      max-width: 95vw;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.15);
      flex-wrap: wrap;
    }
    .billing-toggle-option {
      font-size: 13px;
      font-weight: 700;
      color: #94a3b8;
      background: none;
      border: none;
      cursor: pointer;
      padding: 9px 20px;
      border-radius: 9999px;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .billing-toggle-option.active {
      background: linear-gradient(90deg, #00e5ff, #2563eb);
      color: #020617;
      font-weight: 900;
      box-shadow: 0 0 18px rgba(0, 229, 255, 0.45);
    }
    .billing-discount-badge {
      background: #10b981;
      color: #ffffff;
      font-size: 10px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 9999px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .sector-pricing-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      max-width: 1200px;
      margin: 0 auto 50px;
      align-items: stretch;
    }
    @media (max-width: 992px) {
      .sector-pricing-grid-3 {
        grid-template-columns: 1fr;
        max-width: 500px;
      }
    }
    .sector-plan-card {
      background: #08122c;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 36px 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .sector-plan-card:hover {
      transform: translateY(-6px);
      border-color: rgba(0, 229, 255, 0.4);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .sector-plan-card.featured {
      background: linear-gradient(180deg, #0d1e44 0%, #08122c 100%);
      border: 2px solid #00e5ff;
      box-shadow: 0 0 35px rgba(0, 229, 255, 0.25);
    }
    .sector-plan-card.enterprise {
      background: linear-gradient(180deg, #191c36 0%, #08122c 100%);
      border: 2px solid #f59e0b;
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.25);
    }
    .plan-badge-top {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      padding: 5px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .plan-badge-cyan {
      background: linear-gradient(90deg, #00e5ff, #3b82f6);
      color: #030718;
      box-shadow: 0 4px 15px rgba(0, 229, 255, 0.5);
    }
    .plan-badge-gold {
      background: linear-gradient(90deg, #f59e0b, #d97706);
      color: #030718;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);
    }

    /* Modal Styling */
    .saas-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .saas-modal-backdrop.open {
      display: flex;
    }
    .saas-modal-window {
      background: #08122c;
      border: 1px solid rgba(0, 229, 255, 0.35);
      border-radius: 24px;
      max-width: 580px;
      width: 100%;
      padding: 32px;
      position: relative;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 229, 255, 0.2);
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-close-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .modal-close-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    /* Download Options Grid inside Modal */
    .download-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 20px 0;
    }
    @media (max-width: 540px) {
      .download-grid { grid-template-columns: 1fr; }
    }
    .download-card-opt {
      background: #0d1e44;
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 16px;
      padding: 18px;
      text-align: left;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    .download-card-opt:hover {
      border-color: #00e5ff;
      background: #112555;
      transform: translateY(-2px);
    }
  </style>
</head>

<body class="dark-theme" style="background-color: #030718; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;">

  <!-- SITE HEADER / NAVBAR -->
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
        <a href="index.html" class="nav-link">Home</a>
        
        <div class="dropdown-parent">
          <a href="services.html" class="nav-link">Services &#9662;</a>
          <div class="dropdown-menu">
            <a href="service-digital-marketing.html" class="dropdown-item">
              <span class="icon-box">&#128227;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Digital Marketing</div>
                <div class="dropdown-item-sub">SEO, PPC, Social Ads &amp; CRO</div>
              </div>
            </a>
            <a href="service-web-development.html" class="dropdown-item">
              <span class="icon-box">&lt;/&gt;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Web Development</div>
                <div class="dropdown-item-sub">Custom Web Apps &amp; WordPress</div>
              </div>
            </a>
            <a href="service-graphic-design.html" class="dropdown-item">
              <span class="icon-box">&#127912;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Graphic Design &amp; Branding</div>
                <div class="dropdown-item-sub">Logos, Guidelines &amp; Creatives</div>
              </div>
            </a>
            <a href="service-ai-automation.html" class="dropdown-item">
              <span class="icon-box">&#9881;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">AI Tools &amp; Automation</div>
                <div class="dropdown-item-sub">Chatbots, CRM &amp; Workflows</div>
              </div>
            </a>
            <a href="service-content-creation.html" class="dropdown-item">
              <span class="icon-box">&#9998;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">Content Creation</div>
                <div class="dropdown-item-sub">Copywriting &amp; SEO Blogs</div>
              </div>
            </a>
            <a href="service-ecommerce.html" class="dropdown-item">
              <span class="icon-box">&#128722;</span>
              <div class="dropdown-item-content">
                <div class="dropdown-item-title">E-Commerce Solutions</div>
                <div class="dropdown-item-sub">Shopify &amp; WooCommerce</div>
              </div>
            </a>
          </div>
        </div>

        <a href="cloud-pos-saas.html" class="nav-link active" style="color: #00e5ff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
          Cloud POS &amp; SaaS
          <span style="background: linear-gradient(90deg, #00e5ff, #3b82f6); color: #020617; font-size: 9px; padding: 2px 6px; border-radius: 9999px; font-weight: 900;">PORTAL</span>
        </a>

        <a href="#features" class="nav-link">Features</a>
        <a href="#pricing" class="nav-link">Pricing</a>
        <a href="contact.html" class="nav-link">Contact</a>
      </nav>

      <!-- Header Right Utilities & CTA -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="btn-saas-secondary" onclick="openDownloadAppModal()" style="padding: 9px 16px; font-size: 13px;">
          <span>📲</span> Download App
        </button>
        <a href="/portal/?sector=${data.sectorKey}" class="btn-saas-login" style="padding: 9px 18px; font-size: 13px; background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.45); color: #00e5ff; border-radius: 9999px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Login
        </a>
        <button class="btn-saas-primary" onclick="openTrialModal('${data.industryName}')" style="padding: 10px 20px; font-size: 13px;">
          Start Free Trial &rarr;
        </button>
        <button class="mobile-toggle" aria-label="Toggle navigation menu">&#9776;</button>
      </div>
    </div>
  </header>

  <!-- SECTOR HERO SECTION -->
  <section class="sector-hero">
    <div class="hero-container">
      <div>
        <div class="sector-badge">
          <span>${data.heroEyebrow}</span>
        </div>
        <h1 class="sector-title">${data.heroH1}</h1>
        <p class="sector-desc">${data.heroDesc}</p>

        <div class="hero-actions">
          <button class="btn-saas-primary" onclick="openTrialModal('${data.industryName}')" style="font-size: 15px; padding: 14px 28px;">
            Start 3-Day Free Trial &rarr;
          </button>
          <button class="btn-apk-install" id="btnInstallPwa" onclick="openDownloadAppModal()">
            📲 Install App / Android APK
          </button>
          <a href="#pricing" class="btn-saas-secondary" style="font-size: 14px; padding: 14px 20px; text-decoration: none;">
            View All 3 Pricing Plans
          </a>
        </div>

        <div class="hero-trust-list">
          <span>&#10003; Zero Setup Fee</span>
          <span>&#10003; 100% Offline Capable</span>
          <span>&#10003; Free WhatsApp E-Slips</span>
          <span>&#10003; Thermal Receipt Printer Ready</span>
        </div>
      </div>

      <!-- Live Terminal Session Preview Card -->
      <div class="hero-mockup-card">
        <div class="mockup-header">
          <div class="mockup-dots">
            <div class="mockup-dot" style="background: #ef4444;"></div>
            <div class="mockup-dot" style="background: #f59e0b;"></div>
            <div class="mockup-dot" style="background: #10b981;"></div>
          </div>
          <span style="font-family: monospace; font-size: 11px; color: #64748b;">demo.${data.sectorKey.toLowerCase()}.digitalsnova.com LIVE DEMO</span>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #00e5ff; text-transform: uppercase;">ACTIVE TERMINAL SESSION</span>
            <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 8px; border-radius: 9999px; font-weight: 800;">ONLINE SYNCED</span>
          </div>
          <h3 style="color: #fff; font-size: 18px; font-weight: 800; margin: 0 0 6px;">Dedicated ${data.industryName.toUpperCase()} SUITE</h3>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Tailored workflows, zero irrelevant fields, lightning-fast execution.</p>
        </div>

        <div style="background: #04091a; border-radius: 12px; padding: 16px; border: 1px solid #1c2b54; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #94a3b8;">Monthly Plan:</span>
            <strong id="heroPriceMonthly" style="color: #fff; font-family: monospace;">PKR ${data.monthlyPriceNum} / mo</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #94a3b8;">1-Year Annual (2 Months Free):</span>
            <strong id="heroPriceYearly" style="color: #00e5ff; font-family: monospace;">PKR ${data.annualPriceNum} / yr</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: #94a3b8;">3-Year Long Term License:</span>
            <strong id="heroPrice3Yr" style="color: #fbbf24; font-family: monospace;">PKR ${data.threeYearPriceNum} locked</strong>
          </div>
        </div>

        <button class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 13px; padding: 12px;" onclick="openTrialModal('${data.industryName}', 'TRIAL_3_DAYS')">
          Claim 3-Day Free Trial For This Store &rarr;
        </button>
      </div>
    </div>
  </section>

  <!-- FEATURES ARCHITECTURE SECTION -->
  <section class="saas-features-section" id="features" style="padding: 90px 0; background: #030718;">
    <div class="section-heading-center" style="text-align: center; max-width: 800px; margin: 0 auto 50px; padding: 0 20px;">
      <span class="section-eyebrow" style="color: #00e5ff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">${data.featuresEyebrow}</span>
      <h2 style="font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 16px;">Engineered Exclusively For Your Daily Operations</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">Every tool and workflow you need to run your business with clinical accuracy and zero operational downtime.</p>
    </div>

    <div class="features-grid-3">
      ${data.featuresList.map(feat => `
      <div class="feature-card-saas" style="background: #08122c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 30px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="feature-icon-badge" style="font-size: 28px; margin-bottom: 16px;">${feat.icon}</div>
          <h3 style="color: #fff; font-size: 18px; font-weight: 800; margin-bottom: 12px;">${feat.title}</h3>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">${feat.desc}</p>
        </div>
        <div class="feature-pill-stat" style="font-size: 11px; font-weight: 800; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 6px 12px; border-radius: 9999px; width: fit-content;">
          <span>${feat.pill}</span>
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <!-- 3-TIER DETAILED PRICING SECTION -->
  <section class="saas-pricing-section" id="pricing" style="padding: 90px 0; background: radial-gradient(circle at 50% 50%, rgba(13, 30, 68, 0.8) 0%, rgba(3, 7, 24, 1) 100%);">
    <div class="section-heading-center" style="text-align: center; max-width: 800px; margin: 0 auto 30px; padding: 0 20px;">
      <span class="section-eyebrow" style="color: #00e5ff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">TRANSPARENT VALUE-BASED LICENSING</span>
      <h2 style="font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 16px;">Simple, Predictable Pricing For Your Business</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">No unexpected surcharges. Every license includes automated cloud backups, thermal print engine, and offline POS capability.</p>
    </div>

    <!-- Interactive Billing Cycle Switcher -->
    <div class="pricing-billing-toggle-wrapper">
      <button type="button" class="billing-toggle-option active" id="btnOptMonthly" onclick="switchPricingCycle('MONTHLY')">
        Monthly Billing
      </button>
      <button type="button" class="billing-toggle-option" id="btnOptYearly" onclick="switchPricingCycle('YEARLY')">
        Annual / 1-Year
        <span class="billing-discount-badge">2 Months Free</span>
      </button>
      <button type="button" class="billing-toggle-option" id="btnOpt3Years" onclick="switchPricingCycle('3_YEARS')">
        3-Year Enterprise
        <span class="billing-discount-badge" style="background: rgba(245,158,11,0.25); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4);">&#9733; Best Value</span>
      </button>
    </div>

    <!-- 3 Pricing Cards Grid -->
    <div class="sector-pricing-grid-3">
      
      <!-- CARD 1: Monthly Starter -->
      <div class="sector-plan-card" id="cardMonthly">
        <div>
          <span style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">STANDARD MONTHLY</span>
          <h3 style="color: #fff; font-size: 22px; font-weight: 900; margin: 8px 0 16px;">Flexible Monthly Plan</h3>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">Ideal for businesses wanting full cloud capabilities with month-to-month flexibility and no commitments.</p>

          <div style="margin: 20px 0 16px;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="color: #64748b; font-size: 16px; font-weight: 800;">PKR</span>
              <span id="cardPriceMonthly" style="color: #fff; font-size: 38px; font-weight: 900; font-family: monospace;">${data.monthlyPriceNum}</span>
              <span style="color: #94a3b8; font-size: 13px;">/ month</span>
            </div>
            <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">Includes 3-Day Full Feature Free Trial</div>
          </div>

          <ul style="list-style: none; padding: 0; margin: 24px 0; space-y: 10px; font-size: 13px; color: #cbd5e1;">
            <li style="margin-bottom: 10px;">&#10003; <strong>Full ${data.industryName} Features</strong></li>
            <li style="margin-bottom: 10px;">&#10003; 100% Offline SQLite/IndexedDB Failover</li>
            <li style="margin-bottom: 10px;">&#10003; Thermal Receipt &amp; KOT Print Engine</li>
            <li style="margin-bottom: 10px;">&#10003; Multi-Cashier Shift Drawer Reconciliation</li>
            <li style="margin-bottom: 10px;">&#10003; Free WhatsApp Digital E-Slips</li>
            <li style="margin-bottom: 10px;">&#10003; Daily Automated Cloud Database Backup</li>
          </ul>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          <button class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 14px; padding: 12px;" onclick="openTrialModal('${data.industryName}', 'MONTHLY')">
            Start Monthly Plan &rarr;
          </button>
          <button class="btn-apk-install" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px;" onclick="openDownloadAppModal()">
            📲 Download App / APK
          </button>
        </div>
      </div>

      <!-- CARD 2: 1-Year Annual Pro (FEATURED) -->
      <div class="sector-plan-card featured" id="cardYearly">
        <div class="plan-badge-top plan-badge-cyan">&#9733; MOST POPULAR &bull; 2 MONTHS FREE</div>
        <div>
          <span style="color: #00e5ff; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">ANNUAL PRO (1-YEAR)</span>
          <h3 style="color: #fff; font-size: 22px; font-weight: 900; margin: 8px 0 16px;">1-Year Annual Pro</h3>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">Best value for established stores. Pay for 10 months and get <strong>2 Months Completely Free</strong>.</p>

          <div style="margin: 20px 0 16px;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="color: #64748b; font-size: 16px; font-weight: 800;">PKR</span>
              <span id="cardPriceYearly" style="color: #00e5ff; font-size: 38px; font-weight: 900; font-family: monospace;">${data.annualPriceNum}</span>
              <span style="color: #94a3b8; font-size: 13px;">/ year</span>
            </div>
            <div id="cardAnnualMeta" style="font-size: 11px; color: #38bdf8; font-weight: 700; margin-top: 4px;">Equivalent to PKR ${data.annualEquiv}/mo &bull; Save PKR ${data.annualSave}</div>
          </div>

          <ul style="list-style: none; padding: 0; margin: 24px 0; space-y: 10px; font-size: 13px; color: #e2e8f0;">
            <li style="margin-bottom: 10px;">&#10003; <strong>Everything in Monthly Plan</strong></li>
            <li style="margin-bottom: 10px;">&#10003; <strong>2 Months Completely FREE</strong></li>
            <li style="margin-bottom: 10px;">&#10003; Priority WhatsApp &amp; Phone Support (9AM - 11PM)</li>
            <li style="margin-bottom: 10px;">&#10003; Complimentary Subdomain &amp; Branding Setup</li>
            <li style="margin-bottom: 10px;">&#10003; Free Legacy Data Migration (Excel / Old POS)</li>
            <li style="margin-bottom: 10px;">&#10003; Automated Nightly Multi-Region Backups</li>
          </ul>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          <button class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 14px; padding: 12px; background: linear-gradient(90deg, #00e5ff, #2563eb); color: #020617; font-weight: 900;" onclick="openTrialModal('${data.industryName}', 'YEARLY')">
            Get 1-Year Annual Pro &rarr;
          </button>
          <button class="btn-apk-install" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px;" onclick="openDownloadAppModal()">
            📲 Download App / APK
          </button>
        </div>
      </div>

      <!-- CARD 3: 3-Year Enterprise License -->
      <div class="sector-plan-card enterprise" id="card3Years">
        <div class="plan-badge-top plan-badge-gold">&#128081; LIFETIME OFFLINE LICENSE &bull; MAX ROI</div>
        <div>
          <span style="color: #fbbf24; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">3-YEAR LONG TERM</span>
          <h3 style="color: #fff; font-size: 22px; font-weight: 900; margin: 8px 0 16px;">3-Year Long Term License</h3>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 20px;">Zero recurring monthly bills for 3 full years. Complete inflation protection with lifetime offline cryptographic license key.</p>

          <div style="margin: 20px 0 16px;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="color: #64748b; font-size: 16px; font-weight: 800;">PKR</span>
              <span id="cardPrice3Yr" style="color: #fbbf24; font-size: 38px; font-weight: 900; font-family: monospace;">${data.threeYearPriceNum}</span>
              <span style="color: #94a3b8; font-size: 13px;">locked / 3 yrs</span>
            </div>
            <div id="cardThreeYearMeta" style="font-size: 11px; color: #fbbf24; font-weight: 700; margin-top: 4px;">Save PKR ${data.threeYearSave} &bull; No Monthly Renewals</div>
          </div>

          <ul style="list-style: none; padding: 0; margin: 24px 0; space-y: 10px; font-size: 13px; color: #e2e8f0;">
            <li style="margin-bottom: 10px;">&#10003; <strong>Everything in 1-Year Annual Plan</strong></li>
            <li style="margin-bottom: 10px;">&#10003; <strong>Zero Monthly Bills for 36 Months</strong></li>
            <li style="margin-bottom: 10px;">&#10003; Unlimited Cashier Terminals &amp; Staff Accounts</li>
            <li style="margin-bottom: 10px;">&#10003; Dedicated 1-on-1 Account Manager &amp; VIP Onboarding</li>
            <li style="margin-bottom: 10px;">&#10003; Lifetime Cryptographic Offline License Key</li>
            <li style="margin-bottom: 10px;">&#10003; Lifetime Free Feature Updates &amp; Security Patches</li>
          </ul>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          <button class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 14px; padding: 12px; background: linear-gradient(90deg, #f59e0b, #d97706); color: #020617; font-weight: 900;" onclick="openTrialModal('${data.industryName}', '3_YEARS')">
            Get 3-Year Enterprise License &rarr;
          </button>
          <button class="btn-apk-install" style="width: 100%; justify-content: center; font-size: 13px; padding: 10px;" onclick="openDownloadAppModal()">
            📲 Download App / APK
          </button>
        </div>
      </div>

    </div>
  </section>

  <!-- SITE FOOTER -->
  <footer class="site-footer">
    <div class="container footer-grid-wrap">
      <div class="footer-col-brand">
        <a href="index.html" class="brand-logo">
          <div class="logo-badge"><div class="logo-inner">DS</div></div>
          <div class="brand-text">
            <h2 style="font-size: 15px; margin: 0; color: #fff;">DigitalSnove</h2>
            <span style="font-size: 8px;">Think Digital. Go Global.</span>
          </div>
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 16px; line-height: 1.6; max-width: 320px;">
          DigitalsNova Portal is Pakistan's leading Cloud POS &amp; Business Management SaaS, engineered by DigitalSnove.
        </p>
        <div class="social-links" style="padding-left: 0; border-left: none;">
          <a href="https://facebook.com" target="_blank" rel="noopener">&#9670; Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener">&#9670; X</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener">&#9670; LinkedIn</a>
          <a href="https://instagram.com" target="_blank" rel="noopener">&#9670; Instagram</a>
        </div>
      </div>

      <div class="footer-links-col">
        <h3>Cloud POS Solutions</h3>
        <a href="clinics.html">&bull; Clinics &amp; Hospital HMS</a>
        <a href="restaurants.html">&bull; Restaurants &amp; Cafes</a>
        <a href="pharmacy.html">&bull; Pharmacy &amp; Medical Store</a>
        <a href="retail.html">&bull; Retail Mart &amp; Superstore</a>
      </div>

      <div class="footer-links-col">
        <h3>Agency Services</h3>
        <a href="service-digital-marketing.html">&bull; Digital Marketing</a>
        <a href="service-web-development.html">&bull; Web Development</a>
        <a href="service-graphic-design.html">&bull; Graphic Design</a>
        <a href="service-ai-automation.html">&bull; AI Automation</a>
      </div>

      <div class="footer-links-col">
        <h3>Direct Contact</h3>
        <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;"><strong>Phone / WhatsApp:</strong><br>+92 301 9643900</p>
        <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;"><strong>Email:</strong><br>contact@digitalsnova.com</p>
        <p style="font-size: 12px; color: #cbd5e1;"><strong>Hours:</strong><br>Mon &ndash; Sat: 9:00 AM &ndash; 11:00 PM</p>
      </div>
    </div>

    <div class="container footer-bottom">
      <div style="font-size: 12px; color: #64748b;">
        &copy; 2026 DigitalSnove. All Rights Reserved. Multi-Tenant Cloud POS &amp; Healthcare SaaS Architecture.
      </div>
      <div class="footer-legal">
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="terms-conditions.html">Terms of Service</a>
      </div>
    </div>
  </footer>

  <!-- ============================================================================== -->
  <!-- MODAL 1: DOWNLOAD APP & APK MODAL (AUTO DOWNLOADS + 3 CLEAR OPTIONS)          -->
  <!-- ============================================================================== -->
  <div class="saas-modal-backdrop" id="downloadAppModal">
    <div class="saas-modal-window">
      <button class="modal-close-btn" onclick="closeDownloadAppModal()">&times;</button>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="billing-discount-badge" style="background: rgba(0, 229, 255, 0.2); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.4); margin-bottom: 8px; display: inline-block;">
          v2.6.0 STABLE &bull; OFFLINE CAPABLE SOFTWARE
        </span>
        <h3 style="font-size: 22px; font-weight: 900; color: #fff; margin: 8px 0 6px;">
          Download ${data.industryName} Software
        </h3>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">
          Run in standalone application mode with local IndexedDB offline storage &amp; instant printer support.
        </p>
      </div>

      <div class="download-grid">
        <!-- Option 1: Android APK Package -->
        <a href="/downloads/${data.apkName}" download="${data.apkName}" class="download-card-opt" onclick="trackDownload('APK')">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
            <h4 style="color: #fff; font-size: 15px; font-weight: 800; margin: 0 0 4px;">Android APK Package</h4>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              Native Android installer (.apk). Install on any Android tablet, phone, or POS terminal.
            </p>
          </div>
          <div style="margin-top: 14px; font-size: 11px; font-weight: 800; color: #10b981; display: flex; align-items: center; justify-content: space-between;">
            <span>Direct .APK File</span>
            <span style="background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 9999px;">⬇️ Download</span>
          </div>
        </a>

        <!-- Option 2: Windows PC Software Launcher -->
        <a href="/downloads/${data.batName}" download="${data.batName}" class="download-card-opt" onclick="trackDownload('WINDOWS')">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">💻</div>
            <h4 style="color: #fff; font-size: 15px; font-weight: 800; margin: 0 0 4px;">Windows PC Software</h4>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              Standalone desktop application with dedicated desktop icon &amp; borderless window.
            </p>
          </div>
          <div style="margin-top: 14px; font-size: 11px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: space-between;">
            <span>Windows Setup (.bat)</span>
            <span style="background: rgba(56,189,248,0.2); padding: 2px 8px; border-radius: 9999px;">⬇️ Download</span>
          </div>
        </a>

        <!-- Option 3: 1-Click PWA App Install -->
        <div class="download-card-opt" style="cursor: pointer;" onclick="triggerPwaPrompt()">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
            <h4 style="color: #fff; font-size: 15px; font-weight: 800; margin: 0 0 4px;">1-Click PWA Install</h4>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              Pin directly to your Desktop or Android Home Screen with zero download wait time.
            </p>
          </div>
          <div style="margin-top: 14px; font-size: 11px; font-weight: 800; color: #00e5ff; display: flex; align-items: center; justify-content: space-between;">
            <span>Native Browser App</span>
            <span style="background: rgba(0,229,255,0.2); padding: 2px 8px; border-radius: 9999px;">📲 Install Now</span>
          </div>
        </div>

        <!-- Option 4: Open Online Web Cloud Portal -->
        <a href="/portal/?sector=${data.sectorKey}" class="download-card-opt">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">🌐</div>
            <h4 style="color: #fff; font-size: 15px; font-weight: 800; margin: 0 0 4px;">Launch Cloud Portal</h4>
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.4;">
              Open full software in your browser without installing anything.
            </p>
          </div>
          <div style="margin-top: 14px; font-size: 11px; font-weight: 800; color: #a855f7; display: flex; align-items: center; justify-content: space-between;">
            <span>Instant Web Access</span>
            <span style="background: rgba(168,85,247,0.2); padding: 2px 8px; border-radius: 9999px;">Open &rarr;</span>
          </div>
        </a>
      </div>

      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
        💡 <strong>Offline Guarantee:</strong> Once launched, your software functions 100% offline. Cash sales and transactions queue in local memory and automatically sync when connected.
      </div>
    </div>
  </div>

  <!-- ============================================================================== -->
  <!-- MODAL 2: 3-DAY FREE TRIAL ONBOARDING MODAL                                     -->
  <!-- ============================================================================== -->
  <div class="saas-modal-backdrop" id="trialModal">
    <div class="saas-modal-window">
      <button class="modal-close-btn" onclick="closeTrialModal()">&times;</button>

      <div id="modalFormView">
        <span id="modalPlanBadge" class="billing-discount-badge" style="background: rgba(0, 229, 255, 0.2); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.4); margin-bottom: 8px; display: inline-block;">
          3-DAY FULL ENTERPRISE TRIAL ACTIVATION
        </span>
        <h3 style="font-size: 22px; font-weight: 900; color: #fff; margin: 8px 0 6px;">Launch Your ${data.industryName} Portal</h3>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">
          Instantly provision your isolated cloud tenant and 16-character license key. No credit card required.
        </p>

        <form id="onboardingForm" onsubmit="handleOnboardingSubmit(event)">
          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Full Name *</label>
            <input type="text" id="obName" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="e.g. Dr. Salman / Muhammad Ali" required>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Store / Business Name *</label>
            <input type="text" id="obBusiness" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="e.g. Apex Health & Care" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">WhatsApp Phone *</label>
              <input type="tel" id="obPhone" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="0300 1234567" required>
            </div>
            <div>
              <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Industry Vertical *</label>
              <select id="obType" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;">
                <option value="${data.industryName}" selected>${data.industryName}</option>
                <option value="Clinic / Hospital">Clinic &amp; Hospital (HMS)</option>
                <option value="Restaurants, Cafes & Food Outlets">Restaurants, Cafes &amp; Food Outlets</option>
                <option value="Pharmacy & Medical Store">Pharmacy &amp; Medical Store</option>
                <option value="Retail Mart / General Store">Retail Mart &amp; General Store</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Work Email Address *</label>
            <input type="email" id="obEmail" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="admin@mybusiness.com" required>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Create Master Admin Password *</label>
            <input type="password" id="obPass" style="width: 100%; padding: 12px 14px; background: #04091a; border: 1px solid #1c2b54; border-radius: 10px; color: #fff; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="At least 6 characters" minlength="6" required>
          </div>

          <button type="submit" class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 15px; padding: 14px;" id="btnSubmitOnboarding">
            Activate Cloud Portal &amp; Generate License &rarr;
          </button>
        </form>
      </div>

      <!-- Success View -->
      <div id="modalSuccessView" style="display: none; text-align: center; padding: 20px 0;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h3 style="color: #fff; font-size: 22px; font-weight: 900; margin-bottom: 8px;">Portal Successfully Provisioned!</h3>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Your 16-character license key has been generated and your isolated database is ready.</p>
        
        <div style="background: #04091a; border: 1px solid #1c2b54; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">License Key:</div>
          <div id="resLicense" style="font-family: monospace; font-size: 16px; font-weight: 900; color: #00e5ff; letter-spacing: 0.1em; margin-bottom: 12px;">DNOV-XXXX-XXXX-XXXX</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Portal Access URL:</div>
          <div id="resPortalUrl" style="font-family: monospace; font-size: 13px; color: #fff; word-break: break-all;">https://digitalsnova.com/portal/</div>
        </div>

        <a id="btnGoToStore" href="/portal/?sector=${data.sectorKey}" class="btn-saas-primary" style="width: 100%; justify-content: center; font-size: 15px; padding: 14px; text-decoration: none;">
          Launch Dedicated Store Portal &rarr;
        </a>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    // Pre-select sector in localStorage
    try {
      localStorage.setItem('digitalsnova_active_sector', '${data.sectorKey}');
    } catch(e) {}

    // PWA Prompt Storage
    let deferredPwaInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaInstallPrompt = e;
      window.deferredPwaPrompt = e;
      window._deferredPwaPrompt = e;
    });

    // Open Download Modal & Auto-Trigger Direct Download
    function openDownloadAppModal() {
      const modal = document.getElementById('downloadAppModal');
      if (modal) modal.classList.add('open');
      
      // Auto-trigger direct APK download
      try {
        const autoLink = document.createElement('a');
        autoLink.href = '/downloads/${data.apkName}';
        autoLink.download = '${data.apkName}';
        document.body.appendChild(autoLink);
        autoLink.click();
        document.body.removeChild(autoLink);
      } catch(err) {
        console.warn('Auto-download note:', err);
      }
    }

    function closeDownloadAppModal() {
      const modal = document.getElementById('downloadAppModal');
      if (modal) modal.classList.remove('open');
    }

    function triggerPwaPrompt() {
      if (deferredPwaInstallPrompt) {
        deferredPwaInstallPrompt.prompt();
        deferredPwaInstallPrompt = null;
      } else {
        alert("📲 To Install as Native Desktop / Mobile Software:\\n\\n1. On Android Chrome: Tap Menu (3 dots) > 'Install app' or 'Add to Home screen'.\\n2. On Windows / Mac: Click the Install icon in the browser address bar.\\n\\nOffline POS & Instant Sync are fully enabled!");
        window.location.href = '/portal/?sector=${data.sectorKey}';
      }
    }

    function trackDownload(type) {
      console.log('Downloading ' + type + ' for ${data.sectorKey}');
    }

    // Live Pricing Sync (Synchronized with cloud-pos-saas.html, Super Admin & Cloud Backend)
    let liveSectorPricing = {
      pricingVersion: 2,
      retailMonthly: 4999, retailYearly: 49990, retailThreeYear: 139000,
      pharmacyMonthly: 5999, pharmacyYearly: 59990, pharmacyThreeYear: 169000,
      restaurantMonthly: 6999, restaurantYearly: 69990, restaurantThreeYear: 199000,
      clinicMonthly: 7999, clinicYearly: 79990, clinicThreeYear: 229000
    };

    function getSectorKeyPrefix(secCode) {
      if (secCode === 'RESTAURANT') return 'restaurant';
      if (secCode === 'PHARMACY') return 'pharmacy';
      if (secCode === 'CLINIC_HMS') return 'clinic';
      return 'retail';
    }

    function applyLivePricesToPage() {
      const prefix = getSectorKeyPrefix('${data.sectorKey}');
      const m = Number(liveSectorPricing[prefix + 'Monthly'] || 4999);
      const y = Number(liveSectorPricing[prefix + 'Yearly'] || m * 10);
      const y3 = Number(liveSectorPricing[prefix + 'ThreeYear'] || 139000);
      const eq = Math.floor(y / 12);
      const ySave = Math.max(0, m * 12 - y);
      const y3Save = Math.max(0, m * 36 - y3);

      const hm = document.getElementById('heroPriceMonthly');
      const hy = document.getElementById('heroPriceYearly');
      const h3 = document.getElementById('heroPrice3Yr');
      if (hm) hm.innerText = 'PKR ' + m.toLocaleString() + ' / mo';
      if (hy) hy.innerText = 'PKR ' + y.toLocaleString() + ' / yr';
      if (h3) h3.innerText = 'PKR ' + y3.toLocaleString() + ' locked';

      const cm = document.getElementById('cardPriceMonthly');
      const cy = document.getElementById('cardPriceYearly');
      const ca = document.getElementById('cardAnnualMeta');
      const c3 = document.getElementById('cardPrice3Yr');
      const c3m = document.getElementById('cardThreeYearMeta');
      if (cm) cm.innerText = m.toLocaleString();
      if (cy) cy.innerText = y.toLocaleString();
      if (ca) ca.innerHTML = 'Equivalent to PKR ' + eq.toLocaleString() + '/mo &bull; Save PKR ' + ySave.toLocaleString();
      if (c3) c3.innerText = y3.toLocaleString();
      if (c3m) c3m.innerHTML = 'Save PKR ' + y3Save.toLocaleString() + ' &bull; No Monthly Renewals';
    }

    async function syncSectorPagePricing() {
      try {
        const localRaw = localStorage.getItem('digitalsnova_global_pricing');
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Number(parsed.pricingVersion) !== 2) {
            if (Number(parsed.yearlyFee) === 76790) parsed.yearlyFee = 79990;
            if (Number(parsed.clinicYearly) === 76790) parsed.clinicYearly = 79990;
            if (Number(parsed.retailThreeYear) === 129000) parsed.retailThreeYear = 139000;
            if (Number(parsed.pharmacyThreeYear) === 159000) parsed.pharmacyThreeYear = 169000;
            if (Number(parsed.restaurantThreeYear) === 189000) parsed.restaurantThreeYear = 199000;
          }
          parsed.pricingVersion = 2;
          liveSectorPricing = { ...liveSectorPricing, ...parsed };
        }
      } catch(e) {}
      try {
        const res = await fetch('/api/sync.php?action=get_pricing_plans');
        if (res.ok) {
          const d = await res.json();
          if (d && d.plans) {
            liveSectorPricing = { ...liveSectorPricing, ...d.plans };
            localStorage.setItem('digitalsnova_global_pricing', JSON.stringify(liveSectorPricing));
          }
        }
      } catch(e) {}
      applyLivePricesToPage();
    }

    window.addEventListener('DOMContentLoaded', syncSectorPagePricing);
    window.addEventListener('storage', (e) => {
      if (e.key === 'digitalsnova_global_pricing') syncSectorPagePricing();
    });

    // Pricing Cycle Switcher
    let currentPricingCycle = 'MONTHLY';
    function switchPricingCycle(cycle) {
      currentPricingCycle = cycle || 'MONTHLY';
      document.querySelectorAll('.billing-toggle-option').forEach(b => b.classList.remove('active'));
      if (currentPricingCycle === 'MONTHLY') document.getElementById('btnOptMonthly')?.classList.add('active');
      else if (currentPricingCycle === 'YEARLY') document.getElementById('btnOptYearly')?.classList.add('active');
      else if (currentPricingCycle === '3_YEARS') document.getElementById('btnOpt3Years')?.classList.add('active');

      const mapCard = { MONTHLY: 'cardMonthly', YEARLY: 'cardYearly', '3_YEARS': 'card3Years' };
      ['cardMonthly', 'cardYearly', 'card3Years'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.outline = (id === mapCard[currentPricingCycle]) ? '2px solid #00e5ff' : 'none';
      });
    }

    // Trial / Plan Activation Modal
    function openTrialModal(industry = '${data.industryName}', cycle) {
      if (cycle) {
        currentPricingCycle = cycle;
      }
      const modal = document.getElementById('trialModal');
      if (modal) {
        modal.classList.add('open');
        modal.dataset.selectedBilling = currentPricingCycle || 'TRIAL_3_DAYS';
        document.getElementById('modalFormView').style.display = 'block';
        document.getElementById('modalSuccessView').style.display = 'none';
        const btn = document.getElementById('btnSubmitOnboarding');
        if (btn) { btn.disabled = false; btn.innerText = 'Activate Cloud Portal & Generate License →'; }
        const typeSelect = document.getElementById('obType');
        if (typeSelect && industry) typeSelect.value = industry;
        const badge = document.getElementById('modalPlanBadge');
        if (badge) {
          badge.innerText = currentPricingCycle === 'YEARLY'
            ? '1-YEAR ANNUAL PRO ACTIVATION (2 MONTHS FREE)'
            : currentPricingCycle === '3_YEARS'
            ? '3-YEAR ENTERPRISE LICENSE ACTIVATION'
            : currentPricingCycle === 'TRIAL_3_DAYS'
            ? '3-DAY FULL ENTERPRISE TRIAL ACTIVATION'
            : 'STANDARD MONTHLY PLAN + 3-DAY FREE TRIAL';
        }
      }
    }

    function closeTrialModal() {
      const modal = document.getElementById('trialModal');
      if (modal) modal.classList.remove('open');
    }

    // Close modals on backdrop click
    document.querySelectorAll('.saas-modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });

    // Handle Trial Onboarding Submit
    async function handleOnboardingSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitOnboarding');
      btn.disabled = true;
      btn.innerText = 'Provisioning Cloud Store...';

      const name = document.getElementById('obName').value.trim();
      const business = document.getElementById('obBusiness').value.trim();
      const phone = document.getElementById('obPhone').value.trim();
      const type = document.getElementById('obType').value;
      const email = document.getElementById('obEmail').value.trim();
      const password = document.getElementById('obPass').value;

      const sub = business.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || ('store' + Math.floor(Math.random() * 8999 + 1000));
      const key = 'DNOV-' + Math.floor(1000 + Math.random()*9000) + '-' + Math.floor(1000 + Math.random()*9000) + '-' + Math.floor(1000 + Math.random()*9000);

      let sectorCode = '${data.sectorKey}';
      const tLow = (type || '').toLowerCase();
      if (tLow.includes('restaurant') || tLow.includes('food') || tLow.includes('cafe')) sectorCode = 'RESTAURANT';
      else if (tLow.includes('pharmacy') || tLow.includes('medical')) sectorCode = 'PHARMACY';
      else if (tLow.includes('clinic') || tLow.includes('hospital')) sectorCode = 'CLINIC_HMS';
      else if (tLow.includes('retail') || tLow.includes('mart')) sectorCode = 'RETAIL_MART';

      const secKey = getSectorKeyPrefix(sectorCode);
      const secTitle = sectorCode === 'RESTAURANT' ? 'Restaurant & Cafe POS'
        : sectorCode === 'PHARMACY' ? 'Pharmacy & Medical POS'
        : sectorCode === 'CLINIC_HMS' ? 'Clinic & HMS Portal'
        : 'Retail Mart POS';

      const activeCycle = (currentPricingCycle || 'MONTHLY').toUpperCase();
      const cycleDays = activeCycle === 'TRIAL_3_DAYS' ? 3 : activeCycle === 'YEARLY' ? 365 : activeCycle === '3_YEARS' ? 1095 : 30;
      const feeNum = activeCycle === 'TRIAL_3_DAYS' ? 0
        : activeCycle === 'YEARLY' ? Number(liveSectorPricing[secKey + 'Yearly'] || 49990)
        : activeCycle === '3_YEARS' ? Number(liveSectorPricing[secKey + 'ThreeYear'] || 139000)
        : Number(liveSectorPricing[secKey + 'Monthly'] || 4999);
      const planName = secTitle + (activeCycle === 'YEARLY' ? ' (Annual)' : activeCycle === '3_YEARS' ? ' (3-Year Enterprise)' : activeCycle === 'TRIAL_3_DAYS' ? ' (3-Day Trial)' : ' (Monthly)');
      const expiryIso = new Date(Date.now() + cycleDays * 86400000).toISOString();
      const adminRole = sectorCode === 'CLINIC_HMS' ? 'CLINIC_ADMIN' : 'STORE_ADMIN';

      const newTenant = {
        id: 'tenant_' + sub,
        name: business,
        subdomain: sub,
        domain: sub + '.digitalsnova.com',
        businessType: type,
        business_type: type,
        vertical: sectorCode,
        sector: sectorCode,
        storeType: sectorCode,
        phone: phone,
        email: email,
        planType: activeCycle,
        planName: planName,
        cycleDays: cycleDays,
        subscriptionExpiry: expiryIso,
        monthlyFee: feeNum,
        monthly_fee: feeNum,
        licenseKey: key,
        adminName: name,
        adminUsername: 'admin.' + sub,
        adminPassword: password,
        adminPin: '1234',
        enabledModules: {
          pos: true,
          inventory: true,
          patientsLedger: sectorCode === 'CLINIC_HMS',
          tableManagement: sectorCode === 'RESTAURANT',
          expiryBatch: sectorCode === 'PHARMACY'
        },
        createdAt: new Date().toISOString(),
        lastPaymentDate: new Date().toISOString(),
        subscription: {
          state: 'ACTIVE',
          billingCycleDay: 1,
          graceDaysRemaining: 3,
          totalDays: cycleDays,
          plan: activeCycle,
          planName: planName,
          monthlyFee: feeNum,
          validUntil: expiryIso
        },
        adminUser: {
          name: name,
          username: 'admin.' + sub,
          password: password,
          email: email,
          phone: phone,
          role: adminRole
        }
      };

      try {
        const stored = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]').filter(t => t.subdomain !== sub && t.id !== newTenant.id);
        stored.push(newTenant);
        localStorage.setItem('digitalsnova_registered_tenants', JSON.stringify(stored));
        localStorage.setItem('digitalsnova_subdomain', sub);
        localStorage.setItem('digitalsnova_active_sector', sectorCode);
        localStorage.setItem('digitalsnova_auth_user', JSON.stringify({
          id: 'u_' + sub,
          tenantId: newTenant.id,
          name: name,
          tenantName: business,
          username: 'admin.' + sub,
          role: adminRole,
          subdomain: sub,
          vertical: sectorCode
        }));
      } catch(err) {}

      try {
        await Promise.race([
          fetch('/api/sync.php?action=register_tenant', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTenant)
          }).catch(() => fetch('./api/sync.php?action=register_tenant', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTenant)
          })),
          new Promise(r => setTimeout(r, 4000))
        ]);
      } catch(err) {}

      document.getElementById('modalFormView').style.display = 'none';
      document.getElementById('modalSuccessView').style.display = 'block';
      document.getElementById('resLicense').innerText = key;
      document.getElementById('resPortalUrl').innerText = 'https://digitalsnova.com/portal/?store=' + sub + '&sector=' + sectorCode;
      document.getElementById('btnGoToStore').href = '/portal/?store=' + encodeURIComponent(sub) + '&sector=' + encodeURIComponent(sectorCode);
    }
  </script>
</body>
</html>`;
}

// Generate all 4 pages
Object.keys(sectorsData).forEach(key => {
  const data = sectorsData[key];
  const html = generateSectorPageHtml(data);
  fs.writeFileSync(data.fileName, html, 'utf8');
  console.log(`✓ Successfully created ${data.fileName} (${html.length} bytes)`);
});

console.log('All 4 dedicated sector pages compiled cleanly!');
