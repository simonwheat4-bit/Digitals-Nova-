import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'database.json');

const defaultTreatmentCatalog = [
  {
    id: 'cat_1',
    tenantId: 'tenant_alshifa',
    name: 'Hair Transplant (FUE Sapphire Full Package)',
    category: 'Hair Restoration',
    defaultCost: 120000,
    defaultSessions: 5
  },
  {
    id: 'cat_2',
    tenantId: 'tenant_alshifa',
    name: 'PRP Hair Regrowth Therapy (6 Sessions)',
    category: 'Hair Restoration',
    defaultCost: 24000,
    defaultSessions: 6
  },
  {
    id: 'cat_3',
    tenantId: 'tenant_alshifa',
    name: 'HydraFacial + Carbon Laser Peel (5-Session Package)',
    category: 'Dermatology & Aesthetics',
    defaultCost: 10000,
    defaultSessions: 5
  },
  {
    id: 'cat_4',
    tenantId: 'tenant_alshifa',
    name: 'Full Body Diode Laser Hair Removal (6 Sessions)',
    category: 'Laser Aesthetics',
    defaultCost: 45000,
    defaultSessions: 6
  },
  {
    id: 'cat_5',
    tenantId: 'tenant_alshifa',
    name: 'Root Canal + Zirconia Crown (Tooth #16 & #17)',
    category: 'Dental Surgery',
    defaultCost: 25000,
    defaultSessions: 4
  },
  {
    id: 'cat_6',
    tenantId: 'tenant_alshifa',
    name: 'Orthodontic Metal / Ceramic Braces (12 Sessions)',
    category: 'Orthodontics',
    defaultCost: 65000,
    defaultSessions: 12
  },
  {
    id: 'cat_7',
    tenantId: 'tenant_alshifa',
    name: 'Full Mouth Dental Implants Rehab',
    category: 'Dental Implants',
    defaultCost: 80000,
    defaultSessions: 3
  },
  {
    id: 'cat_201',
    tenantId: 'tenant_citymed',
    name: 'Physiotherapy Knee Rehabilitation (6 Sessions)',
    category: 'Physiotherapy',
    defaultCost: 12000,
    defaultSessions: 6
  }
];

const initialData = {
  platformBrand: {
    name: 'Digital Snove Portal',
    logoUrl: '',
    tagline: 'Secure Multi-Tenant Clinical POS & Healthcare SaaS',
    address: 'Digital Snove SaaS Headquarters',
    phone: '+92-300-0000000'
  },
  passwordResetRequests: [],
  licenseKeys: [],
  tenants: [
    {
      id: 'tenant_alshifa',
      subdomain: 'alshifa',
      domain: 'alshifa.digitalsnova.com',
      name: 'Al-Shifa Dental & Derma Aesthetics',
      logoUrl: '',
      address: 'Plot 14-C, Main Boulevard, Gulberg III, Lahore',
      phone: '+92-300-8451122',
      receiptHeader: 'ISO 9001 Certified Dental & Skin Care Center',
      receiptFooter: 'Get Well Soon! No cash refund on medicines once sold. Keep receipt for follow-up sessions.',
      smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
      smsApiKey: 'sk_live_alshifa_992817',
      smsEnabled: true,
      adminPin: '1234',
      monthlyFee: 15000,
      billingCycleDay: 14,
      manualBlocked: false,
      createdAt: '2026-06-01T09:00:00Z',
      lastPaymentDate: '2026-10-07T10:00:00Z'
    },
    {
      id: 'tenant_citymed',
      subdomain: 'citymed',
      domain: 'citymed.digitalsnova.com',
      name: 'CityMed PolyClinic & Trauma Center',
      logoUrl: '',
      address: 'Block 4, Clifton, Near Teen Talwar, Karachi',
      phone: '+92-321-2299881',
      receiptHeader: '24/7 Emergency, Pharmacy & Diagnostics',
      receiptFooter: 'Thank you for trusting CityMed PolyClinic. Helpline: 021-35889900',
      smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
      smsApiKey: 'sk_live_citymed_771120',
      smsEnabled: true,
      adminPin: '1234',
      monthlyFee: 18500,
      billingCycleDay: 32,
      manualBlocked: false,
      createdAt: '2026-04-15T09:00:00Z',
      lastPaymentDate: '2026-09-19T10:00:00Z'
    },
    {
      id: 'tenant_lifecare',
      subdomain: 'lifecare',
      domain: 'lifecare.digitalsnova.com',
      name: 'LifeCare Eye & Laser Hospital',
      logoUrl: '',
      address: 'F-8 Markaz, Opposite Ayub Market, Islamabad',
      phone: '+92-333-5566778',
      receiptHeader: 'Advanced Lasik & Cataract Surgery Center',
      receiptFooter: 'Bring this card on your next eye checkup.',
      smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
      smsApiKey: 'sk_live_lifecare_33219',
      smsEnabled: true,
      adminPin: '9999',
      monthlyFee: 15000,
      billingCycleDay: 34,
      manualBlocked: false,
      createdAt: '2026-03-10T09:00:00Z',
      lastPaymentDate: '2026-09-15T10:00:00Z'
    }
  ],
  users: [
    { id: 'u_super', tenantId: 'GLOBAL', name: 'Ubaid Ur Rehman (Platform Owner)', username: 'superadmin', password: '123', role: 'SUPER_ADMIN', active: true },
    { id: 'u_alshifa_admin', tenantId: 'tenant_alshifa', name: 'Dr. Kamran Tariq (Clinic Owner)', username: 'admin', password: '123', role: 'CLINIC_ADMIN', active: true },
    { id: 'u_alshifa_staff1', tenantId: 'tenant_alshifa', name: 'Ayesha Siddiqui (Receptionist)', username: 'pos', password: '123', role: 'STAFF', active: true },
    { id: 'u_alshifa_staff2', tenantId: 'tenant_alshifa', name: 'Bilal Ahmed (Night Cashier)', username: 'bilal.pos', password: '123', role: 'STAFF', active: true },
    { id: 'u_citymed_admin', tenantId: 'tenant_citymed', name: 'Dr. Farhan Raza (Medical Director)', username: 'dr.farhan', password: '123', role: 'CLINIC_ADMIN', active: true },
    { id: 'u_citymed_staff1', tenantId: 'tenant_citymed', name: 'Zainab Bibi (Front Desk POS)', username: 'zainab.pos', password: '123', role: 'STAFF', active: true },
    { id: 'u_lifecare_admin', tenantId: 'tenant_lifecare', name: 'Dr. Saima Anwar (CEO)', username: 'dr.saima', password: '123', role: 'CLINIC_ADMIN', active: true },
    { id: 'u_lifecare_staff1', tenantId: 'tenant_lifecare', name: 'Usman Ghani (Cashier)', username: 'usman.pos', password: '123', role: 'STAFF', active: true }
  ],
  treatmentCatalog: defaultTreatmentCatalog,
  patients: [],
  treatments: [],
  inventory: [],
  sales: [],
  parkedSales: [],
  shifts: [],
  discountRequests: [],
  auditLogs: [],
  smsLogs: [],
  cronLogs: []
};

export function loadDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return structuredClone(initialData);
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    // Ensure treatmentCatalog exists in existing DB
    if (!parsed.treatmentCatalog || parsed.treatmentCatalog.length === 0) {
      parsed.treatmentCatalog = structuredClone(defaultTreatmentCatalog);
    }

    // Ensure all tenants have default enabledModules
    if (Array.isArray(parsed.tenants)) {
      parsed.tenants.forEach((t) => {
        if (!t.enabledModules) {
          t.enabledModules = {
            pos: true,
            inventory: true,
            patientsLedger: true
          };
        }
      });
    }

    // Ensure all users have passwords and active status for login
    if (Array.isArray(parsed.users)) {
      parsed.users.forEach((u) => {
        if (!u.password) u.password = '123';
        if (u.role === 'CLINIC_ADMIN' && u.tenantId === 'tenant_alshifa') {
          u.active = true;
        }
        if (u.username === 'ayesha.pos') {
          u.active = true;
        }
      });
    }

    if (!parsed.platformBrand) {
      parsed.platformBrand = {
        name: 'Digital Snove Portal',
        logoUrl: '',
        tagline: 'Secure Multi-Tenant Clinical POS & Healthcare SaaS',
        address: 'Digital Snove SaaS Headquarters',
        phone: '+92-300-0000000'
      };
    }

    if (!Array.isArray(parsed.passwordResetRequests)) {
      parsed.passwordResetRequests = [];
    }

    if (!Array.isArray(parsed.licenseKeys)) {
      parsed.licenseKeys = [];
    }

    if (!Array.isArray(parsed.parkedSales)) {
      parsed.parkedSales = [];
    }

    if (!Array.isArray(parsed.shifts)) {
      parsed.shifts = [];
    }

    return parsed;
  } catch (e) {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return structuredClone(initialData);
  }
}

export function saveDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function computeSubscriptionStatus(tenant) {
  const day = Number(tenant.billingCycleDay || 1);
  const planType = tenant.planType || 'MONTHLY'; // 'TRIAL_3_DAYS' | 'MONTHLY' | 'YEARLY' | '3_YEARS' | 'CUSTOM'

  // Calculate total cycle days based on plan type
  let totalDays = 30;
  if (tenant.cycleDays) {
    totalDays = Number(tenant.cycleDays);
  } else if (planType === 'TRIAL_3_DAYS') {
    totalDays = 3;
  } else if (planType === 'MONTHLY') {
    totalDays = 30;
  } else if (planType === 'YEARLY') {
    totalDays = 365;
  } else if (planType === '3_YEARS') {
    totalDays = 1095;
  }

  const isTrial = planType === 'TRIAL_3_DAYS';

  if (tenant.manualBlocked) {
    return {
      state: 'LOCKED',
      reason: 'MANUAL_BLOCK',
      planType,
      totalDays,
      billingCycleDay: day,
      daysRemainingInCycle: 0,
      graceDaysRemaining: 0,
      bannerMessage: 'Account Suspended by Platform Administrator — Please Contact Support or Clear Dues.'
    };
  }

  const graceDaysAllowed = 3;
  const lockDay = totalDays + graceDaysAllowed + 1; // e.g., 30 -> 34; 3 -> 7; 365 -> 369

  if (day >= lockDay) {
    return {
      state: 'LOCKED',
      reason: isTrial ? 'TRIAL_EXPIRED_LOCKED' : 'AUTO_LOCK_DAY_OVER',
      planType,
      totalDays,
      billingCycleDay: day,
      daysRemainingInCycle: 0,
      graceDaysRemaining: 0,
      bannerMessage: isTrial
        ? '3-Day Free Trial Expired — Please Subscribe to Restore Full Access'
        : 'Account Suspended - Please Pay to Restore Access'
    };
  }

  if (day > totalDays && day < lockDay) {
    const graceDaysRemaining = lockDay - day;
    return {
      state: 'GRACE_PERIOD',
      reason: 'EXPIRED_IN_GRACE',
      planType,
      totalDays,
      billingCycleDay: day,
      daysRemainingInCycle: 0,
      graceDaysRemaining,
      bannerMessage: isTrial
        ? `Your 3-Day Free Trial has ended! Please renew within ${graceDaysRemaining} ${graceDaysRemaining === 1 ? 'day' : 'days'} to avoid service lockout.`
        : `Your subscription has expired. Please renew within ${graceDaysRemaining} ${graceDaysRemaining === 1 ? 'day' : 'days'} to avoid service lockout.`
    };
  }

  return {
    state: isTrial ? 'TRIAL' : 'ACTIVE',
    reason: isTrial ? 'FREE_TRIAL_ACTIVE' : 'ACTIVE_CYCLE',
    planType,
    totalDays,
    billingCycleDay: day,
    daysRemainingInCycle: Math.max(0, totalDays - day),
    graceDaysRemaining: 3,
    bannerMessage: isTrial ? `3-Day Free Trial Active (Day ${day}/${totalDays})` : null
  };
}
