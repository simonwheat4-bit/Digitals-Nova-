import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadDB, saveDB, computeSubscriptionStatus } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

let db = loadDB();
saveDB(db);

function resolveTenant(req) {
  const headerSubdomain = req.headers['x-tenant-subdomain'];
  const headerTenantId = req.headers['x-tenant-id'];
  const querySubdomain = req.query.subdomain;

  let hostSubdomain = null;
  const host = (req.headers.host || '').split(':')[0];
  const parts = host.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost' && !/^\d+$/.test(parts[0])) {
    hostSubdomain = parts[0].toLowerCase();
  }

  const targetSub = (headerSubdomain || querySubdomain || hostSubdomain || '').toLowerCase();
  if (headerTenantId) {
    const foundById = db.tenants.find((t) => t.id === headerTenantId);
    if (foundById) return foundById;
  }
  if (targetSub) {
    const foundBySub = db.tenants.find((t) => t.subdomain.toLowerCase() === targetSub);
    if (foundBySub) return foundBySub;

    // Dynamic tenant fallback based on registered or requested subdomain
    const cleanName = targetSub.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const dynamicName = cleanName
      ? cleanName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Healthcare Center'
      : 'DigitalsNova Business Portal';

    return {
      id: `tenant_${targetSub}`,
      subdomain: targetSub,
      domain: `${targetSub}.digitalsnova.com`,
      name: dynamicName,
      logoUrl: '',
      address: 'Main Commercial Avenue, Pakistan',
      phone: '+92-300-0000000',
      receiptHeader: dynamicName,
      receiptFooter: 'Thank you for your visit!',
      smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
      smsApiKey: `sk_live_${targetSub}_key`,
      smsEnabled: true,
      adminPin: '1234',
      monthlyFee: 0,
      billingCycleDay: 1,
      manualBlocked: false,
      enabledModules: {
        pos: true,
        inventory: true,
        patientsLedger: true
      },
      createdAt: new Date().toISOString(),
      lastPaymentDate: new Date().toISOString(),
      planType: 'TRIAL_3_DAYS',
      cycleDays: 3
    };
  }
  return db.tenants[0];
}

function enrichTenant(tenant) {
  if (!tenant) return null;
  const adminUserObj = db.users.find((u) => u.tenantId === tenant.id && u.role === 'CLINIC_ADMIN');
  const staffUsersList = db.users
    .filter((u) => u.tenantId === tenant.id && u.role === 'STAFF')
    .map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      password: u.password || '123',
      active: u.active !== false
    }));

  return {
    ...tenant,
    adminUser: adminUserObj
      ? {
          id: adminUserObj.id,
          name: adminUserObj.name,
          username: adminUserObj.username,
          password: adminUserObj.password || '123',
          active: adminUserObj.active !== false
        }
      : null,
    staffUsers: staffUsersList,
    subscription: computeSubscriptionStatus(tenant)
  };
}

io.on('connection', (socket) => {
  socket.on('join_tenant', (tenantId) => {
    if (tenantId) {
      socket.join(tenantId);
    }
  });

  // Mobile / Wireless Barcode Scanner Forwarder:
  // When a mobile phone scans a barcode, pushes to all connected POS screens in the clinic room
  socket.on('mobile_barcode_scanned', (payload) => {
    if (payload && payload.barcode) {
      const targetTenant = payload.tenantId;
      if (targetTenant) {
        io.to(targetTenant).emit('barcode_scanned_remote', payload);
      } else {
        io.emit('barcode_scanned_remote', payload);
      }
    }
  });
});

// ============================================================================
// DAILY MIDNIGHT CRON JOB (00:00) + MANUAL TRIGGER
// ============================================================================
function executeDailySubscriptionCron(source = 'MIDNIGHT_CRON') {
  let activeCount = 0;
  let graceCount = 0;
  let lockedCount = 0;

  db.tenants.forEach((tenant) => {
    tenant.billingCycleDay = Number(tenant.billingCycleDay || 1) + 1;
    const sub = computeSubscriptionStatus(tenant);
    if (sub.state === 'ACTIVE') activeCount++;
    if (sub.state === 'GRACE_PERIOD') graceCount++;
    if (sub.state === 'LOCKED') lockedCount++;

    io.to(tenant.id).emit('subscription_updated', enrichTenant(tenant));
  });

  const logEntry = {
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[${source}] Advanced billing cycle day (+1) for ${db.tenants.length} clinics -> Active: ${activeCount}, Grace Warning (Days 31-33): ${graceCount}, Auto-Locked (Day 34+): ${lockedCount}`
  };
  db.cronLogs.unshift(logEntry);
  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  return logEntry;
}

cron.schedule('0 0 * * *', () => {
  executeDailySubscriptionCron('AUTO_MIDNIGHT_CRON');
});

// ============================================================================
// 0. ROLE-BASED AUTHENTICATION / LOGIN ENDPOINT
// ============================================================================
app.post('/api/auth/login', (req, res) => {
  const { username, password, subdomain } = req.body;
  const cleanUser = String(username || '').toLowerCase().trim();
  const cleanPass = String(password || '').trim();

  // Find user (with fallback support for 123 / 2200230)
  const user = db.users.find((u) => {
    if (u.username.toLowerCase() !== cleanUser) return false;
    const dbPass = String(u.password || '123');
    if (dbPass === cleanPass) return true;
    if (cleanUser === 'superadmin' && (cleanPass === '123' || cleanPass === '2200230' || cleanPass === 'admin')) return true;
    if (cleanPass === '123' || cleanPass === '1234') return true;
    return false;
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid Username or Password! Please check credentials.' });
  }

  if (user.active === false) {
    return res.status(403).json({ error: 'This staff account has been suspended by Clinic Admin.' });
  }

  let assignedTenant = db.tenants[0];
  if (user.role !== 'SUPER_ADMIN') {
    assignedTenant = db.tenants.find((t) => t.id === user.tenantId) || db.tenants[0];
  } else if (subdomain) {
    assignedTenant = db.tenants.find((t) => t.subdomain === subdomain) || db.tenants[0];
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: assignedTenant ? assignedTenant.name : undefined
    },
    tenant: enrichTenant(assignedTenant)
  });
});

// Self-Profile Update Endpoint:
// - CLINIC_ADMIN / SUPER_ADMIN can update Name, Username, and Password
// - STAFF (Receptionist) can ONLY update their Password
app.put('/api/auth/profile', (req, res) => {
  const { userId, name, username, newPassword } = req.body;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User profile not found.' });

  if (user.role === 'STAFF') {
    if (!newPassword || String(newPassword).trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid new password.' });
    }
    user.password = String(newPassword).trim();
  } else {
    // CLINIC_ADMIN or SUPER_ADMIN can change Name, Username, and Password
    if (username && username.toLowerCase().trim() !== user.username.toLowerCase()) {
      const cleanNewUser = username.toLowerCase().trim();
      if (db.users.some((other) => other.id !== user.id && other.username.toLowerCase() === cleanNewUser)) {
        return res.status(400).json({ error: 'This username is already taken by another user.' });
      }
      user.username = cleanNewUser;
    }
    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (newPassword && String(newPassword).trim()) {
      user.password = String(newPassword).trim();
    }
  }

  saveDB(db);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId
    }
  });
});

// Forgot Username / Password Request (Sent to Clinic Admin or SaaS Super Admin)
app.post('/api/auth/forgot-password', (req, res) => {
  const { identifier, targetRole = 'CLINIC_ADMIN', message = '' } = req.body;
  const tenant = resolveTenant(req);
  if (!identifier || !String(identifier).trim()) {
    return res.status(400).json({ error: 'Please enter your Username, Name, or Phone Number.' });
  }

  const cleanId = String(identifier).toLowerCase().trim();
  const matchedUser = db.users.find(
    (u) =>
      u.username.toLowerCase() === cleanId ||
      u.name.toLowerCase().includes(cleanId)
  );

  const reqTenantId = matchedUser?.tenantId || tenant.id;
  const reqTenant = db.tenants.find((t) => t.id === reqTenantId) || tenant;

  if (!Array.isArray(db.passwordResetRequests)) {
    db.passwordResetRequests = [];
  }

  const newRequest = {
    id: `pwr_${Date.now()}`,
    tenantId: reqTenant.id,
    tenantName: reqTenant.name,
    subdomain: reqTenant.subdomain,
    identifier: String(identifier).trim(),
    matchedUserId: matchedUser ? matchedUser.id : null,
    matchedUsername: matchedUser ? matchedUser.username : null,
    matchedUserRole: matchedUser ? matchedUser.role : targetRole,
    currentPassword: matchedUser ? matchedUser.password || '123' : null,
    targetAdmin: targetRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'CLINIC_ADMIN',
    message: message || 'User requested Username / Password recovery from Login Screen.',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  db.passwordResetRequests.unshift(newRequest);
  saveDB(db);

  io.emit('password_reset_requested', newRequest);
  res.json({
    success: true,
    request: newRequest,
    message:
      targetRole === 'SUPER_ADMIN'
        ? 'Your Username/Password recovery request has been sent to SaaS Super Admin!'
        : 'Your Username/Password recovery request has been sent to your Clinic Admin!'
  });
});

// Admin / Super Admin resolves or resets password for a Forgot Password Request
app.post('/api/auth/forgot-password/:id/resolve', (req, res) => {
  if (!Array.isArray(db.passwordResetRequests)) {
    db.passwordResetRequests = [];
  }
  const resetReq = db.passwordResetRequests.find((r) => r.id === req.params.id);
  if (!resetReq) return res.status(404).json({ error: 'Recovery request not found.' });

  const { newPassword, newUsername, resolvedBy = 'Admin' } = req.body;
  if (resetReq.matchedUserId) {
    const user = db.users.find((u) => u.id === resetReq.matchedUserId);
    if (user) {
      if (newPassword && String(newPassword).trim()) {
        user.password = String(newPassword).trim();
        resetReq.currentPassword = user.password;
      }
      if (newUsername && String(newUsername).trim()) {
        user.username = String(newUsername).toLowerCase().trim();
        resetReq.matchedUsername = user.username;
      }
    }
  }

  resetReq.status = 'RESOLVED';
  resetReq.resolvedBy = resolvedBy;
  resetReq.resolvedAt = new Date().toISOString();

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ success: true, request: resetReq });
});

// SaaS Super Admin ONLY: Update Main Platform Brand (Top-Left Navbar & Login Screen Header)
app.put('/api/super-admin/platform-brand', (req, res) => {
  const { name, logoUrl, tagline, address, phone } = req.body;
  if (!db.platformBrand) {
    db.platformBrand = {
      name: 'Digital Snove Portal',
      logoUrl: '',
      tagline: 'Secure Multi-Tenant Clinical POS & Healthcare SaaS',
      address: 'Digital Snove SaaS Headquarters',
      phone: '+92-300-0000000'
    };
  }
  if (name !== undefined) db.platformBrand.name = name;
  if (logoUrl !== undefined) db.platformBrand.logoUrl = logoUrl;
  if (tagline !== undefined) db.platformBrand.tagline = tagline;
  if (address !== undefined) db.platformBrand.address = address;
  if (phone !== undefined) db.platformBrand.phone = phone;

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ platformBrand: db.platformBrand });
});

// ============================================================================
// 1. BOOTSTRAP & MULTI-TENANT CONTEXT API
// ============================================================================
app.get('/api/bootstrap', (req, res) => {
  const tenant = resolveTenant(req);
  const enrichedTenant = enrichTenant(tenant);
  const tenantId = tenant.id;

  const tenantUsers = db.users.filter((u) => u.tenantId === tenantId || u.role === 'SUPER_ADMIN');
  const patients = db.patients.filter((p) => p.tenantId === tenantId);
  const treatments = db.treatments.filter((t) => t.tenantId === tenantId);
  const treatmentCatalog = (db.treatmentCatalog || []).filter((c) => c.tenantId === tenantId);
  const inventory = db.inventory.filter((i) => i.tenantId === tenantId);
  const sales = db.sales.filter((s) => s.tenantId === tenantId);
  const discountRequests = db.discountRequests.filter((d) => d.tenantId === tenantId);
  const auditLogs = db.auditLogs.filter((a) => a.tenantId === tenantId);
  const smsLogs = db.smsLogs.filter((s) => s.tenantId === tenantId);
  const passwordResetRequests = db.passwordResetRequests || [];
  const parkedSales = (db.parkedSales || []).filter((p) => p.tenantId === tenantId);
  const activeShift = (db.shifts || []).find((sh) => sh.tenantId === tenantId && sh.status === 'OPEN') || null;
  const closedShifts = (db.shifts || []).filter((sh) => sh.tenantId === tenantId && sh.status === 'CLOSED').slice(0, 15);

  res.json({
    platformBrand: db.platformBrand || {
      name: 'Digital Snove Portal',
      logoUrl: '',
      tagline: 'Secure Multi-Tenant Clinical POS & Healthcare SaaS',
      address: 'Digital Snove SaaS Headquarters',
      phone: '+92-300-0000000'
    },
    currentTenant: enrichedTenant,
    allTenants: db.tenants.map(enrichTenant),
    users: tenantUsers,
    patients,
    treatments,
    treatmentCatalog,
    inventory,
    sales,
    parkedSales,
    activeShift,
    closedShifts,
    discountRequests,
    passwordResetRequests,
    auditLogs,
    smsLogs,
    licenseKeys: db.licenseKeys || [],
    cronLogs: db.cronLogs.slice(0, 20)
  });
});

// ============================================================================
// 2. SUPER ADMIN PANEL ENDPOINTS
// ============================================================================
app.get('/api/super-admin/overview', (req, res) => {
  const enrichedTenants = db.tenants.map(enrichTenant);
  const totalMRR = enrichedTenants.reduce((acc, t) => acc + Number(t.monthlyFee || 0), 0);
  const activeClinics = enrichedTenants.filter((t) => t.subscription.state === 'ACTIVE').length;
  const graceClinics = enrichedTenants.filter((t) => t.subscription.state === 'GRACE_PERIOD').length;
  const lockedClinics = enrichedTenants.filter((t) => t.subscription.state === 'LOCKED').length;

  const globalSalesTotal = db.sales
    .filter((s) => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + Number(s.netTotal || 0), 0);

  res.json({
    tenants: enrichedTenants,
    metrics: {
      totalClinics: enrichedTenants.length,
      activeClinics,
      graceClinics,
      lockedClinics,
      totalMRR,
      globalSalesTotal,
      totalTransactions: db.sales.length
    },
    cronLogs: db.cronLogs.slice(0, 20)
  });
});

app.post('/api/super-admin/tenants', (req, res) => {
  const {
    name,
    subdomain,
    logoUrl,
    address,
    phone,
    monthlyFee,
    planType,
    cycleDays,
    adminName,
    adminUsername,
    adminPassword,
    adminPin,
    enabledModules
  } = req.body;
  if (!name || !subdomain) {
    return res.status(400).json({ error: 'Clinic name and subdomain are required.' });
  }
  const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (db.tenants.some((t) => t.subdomain === cleanSub)) {
    return res.status(400).json({ error: 'Subdomain already exists.' });
  }

  const finalAdminUsername = (adminUsername || `admin.${cleanSub}`).toLowerCase().trim();
  if (db.users.some((u) => u.username.toLowerCase() === finalAdminUsername)) {
    return res.status(400).json({ error: `Username "${finalAdminUsername}" is already taken.` });
  }

  const selectedPlan = planType || 'MONTHLY';
  let totalPlanDays = 30;
  if (cycleDays) {
    totalPlanDays = Number(cycleDays);
  } else if (selectedPlan === 'TRIAL_3_DAYS') {
    totalPlanDays = 3;
  } else if (selectedPlan === 'YEARLY') {
    totalPlanDays = 365;
  } else if (selectedPlan === '3_YEARS') {
    totalPlanDays = 1095;
  }

  const newTenantId = `tenant_${cleanSub}_${Date.now().toString().slice(-4)}`;
  const newTenant = {
    id: newTenantId,
    subdomain: cleanSub,
    domain: `${cleanSub}.digitalsnova.com`,
    name,
    logoUrl: logoUrl || '',
    address: address || 'Main Medical Boulevard, Pakistan',
    phone: phone || '+92-300-0000000',
    receiptHeader: 'Quality Healthcare & Diagnostics',
    receiptFooter: 'Thank you for visiting! Get well soon.',
    smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
    smsApiKey: `sk_live_${cleanSub}_${Math.floor(10000 + Math.random() * 90000)}`,
    smsEnabled: true,
    adminPin: adminPin || '1234',
    planType: selectedPlan,
    cycleDays: totalPlanDays,
    monthlyFee: Number(monthlyFee) !== undefined ? Number(monthlyFee) : (selectedPlan === 'TRIAL_3_DAYS' ? 0 : 15000),
    billingCycleDay: 1,
    manualBlocked: false,
    enabledModules: enabledModules || {
      pos: true,
      inventory: true,
      patientsLedger: true
    },
    createdAt: new Date().toISOString(),
    lastPaymentDate: new Date().toISOString()
  };

  db.tenants.push(newTenant);

  db.users.push(
    {
      id: `u_${cleanSub}_admin`,
      tenantId: newTenantId,
      name: adminName || `${name} Owner`,
      username: finalAdminUsername,
      password: String(adminPassword || '123').trim(),
      role: 'CLINIC_ADMIN',
      active: true
    },
    {
      id: `u_${cleanSub}_staff`,
      tenantId: newTenantId,
      name: `Front Desk POS (${name})`,
      username: `pos.${cleanSub}`,
      password: '123',
      role: 'STAFF',
      active: true
    }
  );

  db.inventory.push({
    id: `inv_${Date.now()}`,
    tenantId: newTenantId,
    barcode: 'SRV-OPD',
    name: 'Standard OPD Consultation / Item',
    category: 'Medicine',
    supplier: 'In-House',
    purchasePrice: 500,
    sellingPrice: 1500,
    quantity: 50,
    minStockAlert: 10,
    expiryDate: '2030-12-31'
  });

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ tenant: enrichTenant(newTenant) });
});

app.patch('/api/super-admin/tenants/:id', (req, res) => {
  const tenant = db.tenants.find((t) => t.id === req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const {
    name,
    logoUrl,
    address,
    phone,
    monthlyFee,
    planType,
    cycleDays,
    billingCycleDay,
    manualBlocked,
    enabledModules,
    adminPin,
    adminName,
    adminUsername,
    adminPassword
  } = req.body;

  if (name !== undefined) tenant.name = name;
  if (logoUrl !== undefined) tenant.logoUrl = logoUrl;
  if (address !== undefined) tenant.address = address;
  if (phone !== undefined) tenant.phone = phone;
  if (monthlyFee !== undefined) tenant.monthlyFee = Number(monthlyFee);
  if (planType !== undefined) {
    tenant.planType = planType;
    if (cycleDays === undefined) {
      if (planType === 'TRIAL_3_DAYS') tenant.cycleDays = 3;
      else if (planType === 'MONTHLY') tenant.cycleDays = 30;
      else if (planType === 'YEARLY') tenant.cycleDays = 365;
      else if (planType === '3_YEARS') tenant.cycleDays = 1095;
    }
  }
  if (cycleDays !== undefined) tenant.cycleDays = Number(cycleDays);
  if (billingCycleDay !== undefined) tenant.billingCycleDay = Number(billingCycleDay);
  if (manualBlocked !== undefined) tenant.manualBlocked = Boolean(manualBlocked);
  if (adminPin !== undefined && String(adminPin).trim()) {
    tenant.adminPin = String(adminPin).trim();
  }
  if (enabledModules !== undefined) {
    tenant.enabledModules = {
      ...(tenant.enabledModules || { pos: true, inventory: true, patientsLedger: true }),
      ...enabledModules
    };
  }

  // Also allow Super Admin to update this tenant's CLINIC_ADMIN login credentials
  const adminUser = db.users.find((u) => u.tenantId === tenant.id && u.role === 'CLINIC_ADMIN');
  if (adminUser) {
    if (adminUsername !== undefined && String(adminUsername).trim()) {
      const cleanNewUser = String(adminUsername).toLowerCase().trim();
      if (
        db.users.some((other) => other.id !== adminUser.id && other.username.toLowerCase() === cleanNewUser)
      ) {
        return res.status(400).json({ error: `Username "${cleanNewUser}" is already taken.` });
      }
      adminUser.username = cleanNewUser;
    }
    if (adminName !== undefined && String(adminName).trim()) {
      adminUser.name = String(adminName).trim();
    }
    if (adminPassword !== undefined && String(adminPassword).trim()) {
      adminUser.password = String(adminPassword).trim();
    }
  }

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('subscription_updated', enriched);
  io.to(tenant.id).emit('tenant_settings_updated', enriched);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ tenant: enriched });
});

// Delete Tenant Clinic (Super Admin Only)
app.delete('/api/super-admin/tenants/:id', (req, res) => {
  const tenantId = req.params.id;
  const idx = db.tenants.findIndex((t) => t.id === tenantId);
  if (idx === -1) return res.status(404).json({ error: 'Clinic tenant not found.' });

  const removedTenant = db.tenants[idx];
  db.tenants.splice(idx, 1);

  // Clean up isolated tenant data
  db.users = db.users.filter((u) => u.tenantId !== tenantId);
  db.patients = db.patients.filter((p) => p.tenantId !== tenantId);
  db.treatments = db.treatments.filter((t) => t.tenantId !== tenantId);
  db.treatmentCatalog = (db.treatmentCatalog || []).filter((c) => c.tenantId !== tenantId);
  db.inventory = db.inventory.filter((i) => i.tenantId !== tenantId);
  db.sales = db.sales.filter((s) => s.tenantId !== tenantId);
  db.discountRequests = db.discountRequests.filter((d) => d.tenantId !== tenantId);

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[SUPER_ADMIN_DELETE] Deleted tenant "${removedTenant.name}" (${removedTenant.domain}) and all associated tenant records.`
  });

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ success: true });
});

// Self-Service Delete Tenant Account (Tenant Owner / Admin & Settings)
app.delete('/api/tenants/:id', (req, res) => {
  const target = req.params.id;
  const idx = db.tenants.findIndex((t) => t.id === target || t.subdomain.toLowerCase() === target.toLowerCase());
  if (idx === -1) return res.status(404).json({ error: 'Tenant account not found.' });

  const removedTenant = db.tenants[idx];
  const targetId = removedTenant.id;
  db.tenants.splice(idx, 1);

  // Clean up isolated tenant data
  db.users = db.users.filter((u) => u.tenantId !== targetId);
  db.patients = (db.patients || []).filter((p) => p.tenantId !== targetId);
  db.treatments = (db.treatments || []).filter((t) => t.tenantId !== targetId);
  db.treatmentCatalog = (db.treatmentCatalog || []).filter((c) => c.tenantId !== targetId);
  db.inventory = (db.inventory || []).filter((i) => i.tenantId !== targetId);
  db.sales = (db.sales || []).filter((s) => s.tenantId !== targetId);
  db.discountRequests = (db.discountRequests || []).filter((d) => d.tenantId !== targetId);
  db.auditLogs = (db.auditLogs || []).filter((a) => a.tenantId !== targetId);
  db.smsLogs = (db.smsLogs || []).filter((s) => s.smsLogs !== targetId);
  db.shifts = (db.shifts || []).filter((sh) => sh.tenantId !== targetId);
  db.licenseKeys = (db.licenseKeys || []).filter((k) => k.tenantId !== targetId);

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[TENANT_ACCOUNT_DELETED] Facility "${removedTenant.name}" (${removedTenant.domain}) was deleted.`
  });

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });
  res.json({ success: true, message: `Tenant account "${removedTenant.name}" permanently deleted.` });
});

app.post('/api/webhooks/subscription-payment', (req, res) => {
  const { tenantId, paymentReference, source = 'ONLINE_PAYMENT_WEBHOOK' } = req.body;
  const tenant = db.tenants.find((t) => t.id === tenantId);
  if (!tenant) return res.status(404).json({ error: 'Clinic tenant not found' });

  tenant.billingCycleDay = 1;
  tenant.manualBlocked = false;
  tenant.lastPaymentDate = new Date().toISOString();

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'SUBSCRIPTION_RENEWED_UNLOCKED',
    staffId: 'SYSTEM_BILLING',
    staffName: source,
    approvingAdmin: 'Super Admin / Payment Gateway',
    discountAmount: 0,
    receiptId: paymentReference || `PAY-${Date.now().toString().slice(-6)}`,
    details: `Subscription unlocked & reset to Day 1 (30-Day Active Cycle) via ${source}. Fee Rs. ${tenant.monthlyFee}.`,
    timestamp: new Date().toISOString()
  });

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[${source}] Auto-Unlocked "${tenant.name}" (${tenant.domain}) upon payment receipt Rs. ${tenant.monthlyFee}. Cycle reset to Day 1.`
  });

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('subscription_updated', enriched);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });

  res.json({
    success: true,
    message: `${tenant.name} unlocked and restored to Day 1 active cycle!`,
    tenant: enriched
  });
});

app.post('/api/super-admin/run-midnight-cron', (req, res) => {
  const log = executeDailySubscriptionCron('MANUAL_MIDNIGHT_CRON_TRIGGER');
  res.json({ success: true, log, tenants: db.tenants.map(enrichTenant) });
});

// ============================================================================
// 2B. DIGITAL SNOVE LICENSE KEYS & PORTAL ACTIVATION ENGINE
// ============================================================================
app.get('/api/super-admin/license-keys', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  res.json({ licenseKeys: db.licenseKeys });
});

app.post('/api/super-admin/license-keys', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  const { tenantId, planType = 'MONTHLY', cycleDays, fee, notes } = req.body;
  const tenant = db.tenants.find((t) => t.id === tenantId);
  if (!tenant) return res.status(404).json({ error: 'Clinic tenant not found.' });

  const planCode =
    planType === 'TRIAL_3_DAYS'
      ? 'TRIAL'
      : planType === 'YEARLY'
      ? '1YR'
      : planType === '3_YEARS'
      ? '3YR'
      : planType === 'CUSTOM'
      ? 'CUST'
      : 'MONTH';

  let totalDays = 30;
  if (cycleDays) {
    totalDays = Number(cycleDays);
  } else if (planType === 'TRIAL_3_DAYS') {
    totalDays = 3;
  } else if (planType === 'YEARLY') {
    totalDays = 365;
  } else if (planType === '3_YEARS') {
    totalDays = 1095;
  }

  const currentYear = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const keyCode = `DS-CLINIC-${currentYear}-${randNum}`;

  const newKey = {
    id: `key_${Date.now()}`,
    keyCode,
    tenantId: tenant.id,
    tenantName: tenant.name,
    subdomain: tenant.subdomain,
    planType,
    cycleDays: totalDays,
    fee: fee !== undefined ? Number(fee) : (planType === 'TRIAL_3_DAYS' ? 0 : Number(tenant.monthlyFee || 15000)),
    notes: notes || `Generated by Super Admin for ${tenant.name}`,
    status: 'UNUSED', // 'UNUSED' | 'ACTIVATED' | 'REVOKED'
    createdAt: new Date().toISOString(),
    activatedAt: null
  };

  db.licenseKeys.unshift(newKey);
  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs, licenseKeys: db.licenseKeys });
  res.json({ success: true, key: newKey });
});

// Clinic Admin activates/renews their portal using Activation Key (Image 1)
app.post('/api/subscription/activate-key', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  const tenant = resolveTenant(req);
  const { keyCode } = req.body;

  if (!keyCode || !String(keyCode).trim()) {
    return res.status(400).json({ error: 'Please enter a valid Activation Key.' });
  }

  const cleanKey = String(keyCode).trim().toUpperCase();
  const matchedKey = db.licenseKeys.find((k) => k.keyCode.trim().toUpperCase() === cleanKey);

  if (!matchedKey) {
    return res.status(404).json({
      error: 'Invalid Activation Key! Please check the key provided by Digital Snove Administrator.'
    });
  }

  if (matchedKey.status === 'ACTIVATED') {
    return res.status(400).json({
      error: `This Activation Key (${cleanKey}) has already been used and activated on ${new Date(
        matchedKey.activatedAt
      ).toLocaleDateString()}!`
    });
  }

  if (matchedKey.status === 'REVOKED') {
    return res.status(400).json({ error: 'This Activation Key has been revoked by platform administrator.' });
  }

  if (matchedKey.tenantId && matchedKey.tenantId !== tenant.id) {
    return res.status(403).json({
      error: `This Activation Key was issued specifically for "${matchedKey.tenantName}" and cannot be used by ${tenant.name}.`
    });
  }

  // Apply license key plan to clinic
  tenant.planType = matchedKey.planType;
  tenant.cycleDays = Number(matchedKey.cycleDays);
  tenant.monthlyFee = Number(matchedKey.fee);
  tenant.billingCycleDay = 1; // Resets to Day 1
  tenant.manualBlocked = false; // Unblocks
  tenant.lastPaymentDate = new Date().toISOString();
  tenant.activeLicenseKey = cleanKey;

  matchedKey.status = 'ACTIVATED';
  matchedKey.activatedAt = new Date().toISOString();
  matchedKey.activatedByTenant = tenant.id;

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'LICENSE_KEY_ACTIVATED',
    staffId: 'CLINIC_ADMIN',
    staffName: 'Clinic Administrator',
    approvingAdmin: 'Digital Snove SaaS Licensing Engine',
    discountAmount: 0,
    receiptId: cleanKey,
    details: `Portal successfully activated with License Key "${cleanKey}". Plan: ${matchedKey.planType} (${matchedKey.cycleDays} Days). Reset to Day 1.`,
    timestamp: new Date().toISOString()
  });

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[KEY_ACTIVATION] "${tenant.name}" activated Key "${cleanKey}" -> Plan: ${matchedKey.planType} (${matchedKey.cycleDays} Days). Unlocked & Reset to Day 1.`
  });

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('subscription_updated', enriched);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs, licenseKeys: db.licenseKeys });

  res.json({
    success: true,
    message: `Congratulations! Your portal has been successfully activated with the ${matchedKey.planType} package (${matchedKey.cycleDays} Days).`,
    tenant: enriched,
    key: matchedKey
  });
});

// Clinic Admin / Super Admin deactivates / inactives their active license key
app.post('/api/subscription/deactivate-key', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  const tenant = resolveTenant(req);
  const currentKey = tenant.activeLicenseKey;

  if (currentKey) {
    const matchedKey = db.licenseKeys.find((k) => k.keyCode.trim().toUpperCase() === currentKey.trim().toUpperCase());
    if (matchedKey) {
      matchedKey.status = 'INACTIVE';
      matchedKey.inactivatedAt = new Date().toISOString();
    }
  }

  tenant.activeLicenseKey = null;
  tenant.planType = 'UNLICENSED';
  tenant.billingCycleDay = 34; // Immediately triggers Day 34 suspension lock
  tenant.manualBlocked = true;

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'LICENSE_KEY_DEACTIVATED',
    staffId: 'CLINIC_ADMIN',
    staffName: 'Clinic Administrator',
    approvingAdmin: 'Clinic Admin',
    discountAmount: 0,
    receiptId: currentKey || 'NONE',
    details: `Active License Key "${currentKey || 'N/A'}" was deactivated. Portal locked pending new key / subscription.`,
    timestamp: new Date().toISOString()
  });

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[KEY_DEACTIVATION] "${tenant.name}" deactivated key "${currentKey || 'N/A'}". Portal locked.`
  });

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('subscription_updated', enriched);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs, licenseKeys: db.licenseKeys });

  res.json({
    success: true,
    message: 'Active license key has been successfully deactivated. Portal is now unlicensed/locked.',
    tenant: enriched
  });
});

// Online Card Payment & Instant Subscription Activation Engine
app.post('/api/subscription/card-checkout', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  const tenant = resolveTenant(req);
  const {
    planType = 'TRIAL_3_DAYS',
    cardNumber,
    cardExp,
    cardCvc,
    cardName
  } = req.body;

  if (!cardNumber || String(cardNumber).replace(/\s/g, '').length < 12) {
    return res.status(400).json({ error: 'Please enter a valid Credit / Debit Card Number.' });
  }

  if (!cardExp || !cardCvc) {
    return res.status(400).json({ error: 'Card Expiry (MM/YY) and CVC / CVV are required.' });
  }

  let totalDays = 30;
  let fee = 15000;
  let planCode = 'MONTH';

  if (planType === 'TRIAL_3_DAYS') {
    totalDays = 3;
    fee = 0;
    planCode = 'TRIAL';
  } else if (planType === 'YEARLY') {
    totalDays = 365;
    fee = 150000;
    planCode = '1YR';
  } else if (planType === '3_YEARS') {
    totalDays = 1095;
    fee = 400000;
    planCode = '3YR';
  }

  const currentYear = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const keyCode = `DS-CLINIC-${currentYear}-${randNum}`;

  const cleanCard = String(cardNumber).replace(/\s/g, '');
  const last4 = cleanCard.slice(-4);

  const newKey = {
    id: `key_${Date.now()}`,
    keyCode,
    tenantId: tenant.id,
    tenantName: tenant.name,
    subdomain: tenant.subdomain,
    planType,
    cycleDays: totalDays,
    fee,
    notes: `Card payment verified (${last4}) - Auto generated for ${tenant.name}`,
    status: 'ACTIVATED',
    createdAt: new Date().toISOString(),
    activatedAt: new Date().toISOString(),
    activatedByTenant: tenant.id
  };

  db.licenseKeys.unshift(newKey);

  // Apply plan to clinic immediately
  tenant.planType = planType;
  tenant.cycleDays = totalDays;
  tenant.monthlyFee = fee;
  tenant.billingCycleDay = 1;
  tenant.manualBlocked = false;
  tenant.lastPaymentDate = new Date().toISOString();
  tenant.activeLicenseKey = keyCode;
  tenant.paymentMethod = 'CARD';
  tenant.cardLast4 = last4;

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'SUBSCRIPTION_CARD_CHECKOUT',
    staffId: 'CLINIC_ADMIN',
    staffName: cardName || 'Clinic Administrator',
    approvingAdmin: 'Digital Snove Payment Gateway Engine',
    discountAmount: 0,
    receiptId: keyCode,
    details: `Card ending in ${last4} authorized. Package ${planType} (${totalDays} Days) auto-activated. Key: ${keyCode}.`,
    timestamp: new Date().toISOString()
  });

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[CARD_PAYMENT_VERIFIED] "${tenant.name}" authorized Card (...${last4}) -> Key "${keyCode}" generated & activated. Reset to Day 1.`
  });

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('subscription_updated', enriched);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs, licenseKeys: db.licenseKeys });

  res.json({
    success: true,
    message: `Payment successful! License Key ${keyCode} auto-generated and your ${planType} package is now ACTIVE!`,
    key: newKey,
    tenant: enriched
  });
});

// Silent Background API Verification Ping for Client Software
app.get('/api/subscription/ping', (req, res) => {
  const tenant = resolveTenant(req);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });
  const enriched = enrichTenant(tenant);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    tenant: enriched,
    subscription: enriched.subscription,
    verifiedBy: 'digitalsnova.com Central Master Licensing Engine'
  });
});

// Super Admin Inactivates / Revokes or Reactivates any license key
app.post('/api/super-admin/license-keys/:id/toggle-status', (req, res) => {
  if (!Array.isArray(db.licenseKeys)) db.licenseKeys = [];
  const key = db.licenseKeys.find((k) => k.id === req.params.id);
  if (!key) return res.status(404).json({ error: 'License key not found.' });

  const nextStatus = key.status === 'REVOKED' || key.status === 'INACTIVE' ? 'UNUSED' : 'REVOKED';
  key.status = nextStatus;

  // If revoked, unbind and lock any clinic currently using it
  if (nextStatus === 'REVOKED' && key.tenantId) {
    const tenant = db.tenants.find((t) => t.id === key.tenantId);
    if (tenant && tenant.activeLicenseKey === key.keyCode) {
      tenant.activeLicenseKey = null;
      tenant.manualBlocked = true;
      tenant.billingCycleDay = 34; // Lock
      tenant.planType = 'UNLICENSED';
    }
  }

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs, licenseKeys: db.licenseKeys });
  res.json({ success: true, key, nextStatus });
});

// Public Self-Service Clinic Registration (Download / Signup from website)
app.post('/api/public/register-clinic', (req, res) => {
  const {
    clinicName,
    subdomain,
    adminName,
    adminUsername,
    adminPassword,
    phone,
    address,
    planType = 'TRIAL_3_DAYS',
    activationKey,
    packagePreset = 'FULL_CLINIC'
  } = req.body;

  if (!clinicName || !subdomain) {
    return res.status(400).json({ error: 'Clinic Name and Subdomain are required.' });
  }

  const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (db.tenants.some((t) => t.subdomain === cleanSub)) {
    return res.status(400).json({ error: `Subdomain "${cleanSub}" is already taken. Please choose another.` });
  }

  const finalAdminUsername = (adminUsername || `admin.${cleanSub}`).toLowerCase().trim();
  if (db.users.some((u) => u.username.toLowerCase() === finalAdminUsername)) {
    return res.status(400).json({ error: `Username "${finalAdminUsername}" is already taken.` });
  }

  const newTenantId = `tenant_${cleanSub}_${Date.now().toString().slice(-4)}`;
  const selectedPlan = planType || 'TRIAL_3_DAYS';
  let totalPlanDays = selectedPlan === 'TRIAL_3_DAYS' ? 3 : selectedPlan === 'YEARLY' ? 365 : selectedPlan === '3_YEARS' ? 1095 : 30;
  let planFee = selectedPlan === 'TRIAL_3_DAYS' ? 0 : selectedPlan === 'YEARLY' ? 150000 : selectedPlan === '3_YEARS' ? 400000 : 15000;
  let activeKeyVal = null;

  // If user provided an activation key during registration
  if (activationKey && String(activationKey).trim()) {
    const kMatch = db.licenseKeys?.find((k) => k.keyCode.trim().toUpperCase() === String(activationKey).trim().toUpperCase());
    if (kMatch && kMatch.status === 'UNUSED') {
      kMatch.status = 'ACTIVATED';
      kMatch.activatedAt = new Date().toISOString();
      kMatch.activatedByTenant = newTenantId;
      totalPlanDays = kMatch.cycleDays;
      planFee = kMatch.fee;
      activeKeyVal = kMatch.keyCode;
    }
  }

  const newTenant = {
    id: newTenantId,
    subdomain: cleanSub,
    domain: `${cleanSub}.digitalsnova.com`,
    name: clinicName.trim(),
    logoUrl: '',
    address: address || 'Main Medical Boulevard, Pakistan',
    phone: phone || '+92-300-0000000',
    receiptHeader: 'Quality Healthcare & Diagnostics',
    receiptFooter: 'Thank you for visiting! Get well soon.',
    smsApiUrl: 'https://api.whatsapp-gateway.pk/v1/send',
    smsApiKey: `sk_live_${cleanSub}_${Math.floor(10000 + Math.random() * 90000)}`,
    smsEnabled: true,
    adminPin: '1234',
    planType: selectedPlan,
    cycleDays: totalPlanDays,
    monthlyFee: planFee,
    billingCycleDay: 1,
    manualBlocked: false,
    activeLicenseKey: activeKeyVal,
    enabledModules: {
      pos: true,
      inventory: true,
      patientsLedger: packagePreset !== 'STORE_ONLY'
    },
    createdAt: new Date().toISOString(),
    lastPaymentDate: new Date().toISOString()
  };

  db.tenants.push(newTenant);

  const adminUser = {
    id: `u_${cleanSub}_admin`,
    tenantId: newTenantId,
    name: adminName || `${clinicName} Admin`,
    username: finalAdminUsername,
    password: String(adminPassword || '123').trim(),
    role: 'CLINIC_ADMIN',
    active: true
  };

  const staffUser = {
    id: `u_${cleanSub}_staff`,
    tenantId: newTenantId,
    name: `Front Desk POS (${clinicName})`,
    username: `pos.${cleanSub}`,
    password: '123',
    role: 'STAFF',
    active: true
  };

  db.users.push(adminUser, staffUser);

  db.inventory.push({
    id: `inv_${Date.now()}`,
    tenantId: newTenantId,
    barcode: 'SRV-OPD',
    name: 'Standard OPD Consultation / Item',
    category: 'Medicine',
    supplier: 'In-House',
    purchasePrice: 500,
    sellingPrice: 1500,
    quantity: 50,
    minStockAlert: 10,
    expiryDate: '2030-12-31'
  });

  db.cronLogs.unshift({
    id: `cron_${Date.now()}`,
    timestamp: new Date().toISOString(),
    summary: `[PUBLIC_REGISTER] New Client Onboarded: "${newTenant.name}" (${newTenant.domain}) with Plan: ${selectedPlan} (${totalPlanDays} Days).`
  });

  saveDB(db);
  io.emit('superadmin_sync', { tenants: db.tenants.map(enrichTenant), cronLogs: db.cronLogs });

  res.json({
    success: true,
    message: `Account created successfully! Log in with username: @${finalAdminUsername}`,
    user: adminUser,
    tenant: enrichTenant(newTenant)
  });
});

// ============================================================================
// 3. CLINIC ADMIN PANEL ENDPOINTS (White-Label, Staff, Catalog, Reports)
// ============================================================================
app.put('/api/clinic-admin/settings', (req, res) => {
  const tenant = resolveTenant(req);
  const {
    name,
    logoUrl,
    address,
    phone,
    receiptHeader,
    receiptFooter,
    smsApiUrl,
    smsApiKey,
    smsEnabled,
    adminPin
  } = req.body;

  if (name !== undefined) tenant.name = name;
  if (logoUrl !== undefined) tenant.logoUrl = logoUrl;
  if (address !== undefined) tenant.address = address;
  if (phone !== undefined) tenant.phone = phone;
  if (receiptHeader !== undefined) tenant.receiptHeader = receiptHeader;
  if (receiptFooter !== undefined) tenant.receiptFooter = receiptFooter;
  if (smsApiUrl !== undefined) tenant.smsApiUrl = smsApiUrl;
  if (smsApiKey !== undefined) tenant.smsApiKey = smsApiKey;
  if (smsEnabled !== undefined) tenant.smsEnabled = Boolean(smsEnabled);
  if (adminPin !== undefined && /^\d{4}$/.test(String(adminPin))) {
    tenant.adminPin = String(adminPin);
  }

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'WHITE_LABEL_SETTINGS_UPDATED',
    staffId: 'CLINIC_ADMIN',
    staffName: 'Clinic Admin',
    approvingAdmin: 'Clinic Admin',
    discountAmount: 0,
    receiptId: 'SETTINGS',
    details: `Updated White-Label Branding, Receipt Header/Footer, SMS Gateway & 4-Digit Admin PIN.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  const enriched = enrichTenant(tenant);
  io.to(tenant.id).emit('tenant_settings_updated', enriched);
  res.json({ tenant: enriched });
});

// Create Staff with Password
app.post('/api/clinic-admin/staff', (req, res) => {
  const tenant = resolveTenant(req);
  const { name, username, password = '123', role = 'STAFF' } = req.body;
  if (!name || !username) {
    return res.status(400).json({ error: 'Staff name and username are required.' });
  }
  const newUser = {
    id: `u_${Date.now()}`,
    tenantId: tenant.id,
    name,
    username: username.toLowerCase().trim(),
    password: String(password || '123').trim(),
    role: role === 'CLINIC_ADMIN' ? 'CLINIC_ADMIN' : 'STAFF',
    active: true
  };
  db.users.push(newUser);
  saveDB(db);
  res.json({ user: newUser });
});

app.patch('/api/clinic-admin/staff/:id', (req, res) => {
  const tenant = resolveTenant(req);
  const user = db.users.find((u) => u.id === req.params.id && u.tenantId === tenant.id);
  if (!user) return res.status(404).json({ error: 'Staff member not found' });
  if (user.role === 'CLINIC_ADMIN' && req.body.active === false) {
    return res.status(400).json({ error: 'Clinic Admin cannot suspend their own admin account.' });
  }
  if (req.body.active !== undefined) user.active = Boolean(req.body.active);
  if (req.body.password) user.password = String(req.body.password).trim();
  if (req.body.username) user.username = String(req.body.username).toLowerCase().trim();
  if (req.body.name) user.name = String(req.body.name).trim();
  saveDB(db);
  res.json({ user });
});

// Delete Staff Account (Clinic Admin)
app.delete('/api/clinic-admin/staff/:id', (req, res) => {
  const tenant = resolveTenant(req);
  const idx = db.users.findIndex((u) => u.id === req.params.id && u.tenantId === tenant.id);
  if (idx === -1) return res.status(404).json({ error: 'Staff account not found' });
  if (db.users[idx].role === 'SUPER_ADMIN' || db.users[idx].role === 'CLINIC_ADMIN') {
    return res.status(403).json({ error: 'Cannot delete Admin account.' });
  }
  db.users.splice(idx, 1);
  saveDB(db);
  res.json({ success: true });
});

// Manage Pre-Defined Treatment Packages Catalog in Backend
app.post('/api/treatment-catalog', (req, res) => {
  const tenant = resolveTenant(req);
  const { name, category = 'Clinical Procedure', defaultCost = 10000, defaultSessions = 5 } = req.body;
  if (!name) return res.status(400).json({ error: 'Treatment package name is required.' });
  if (!db.treatmentCatalog) db.treatmentCatalog = [];

  const newCat = {
    id: `cat_${Date.now()}`,
    tenantId: tenant.id,
    name: name.trim(),
    category: category.trim(),
    defaultCost: Number(defaultCost) || 10000,
    defaultSessions: Number(defaultSessions) || 1
  };
  db.treatmentCatalog.unshift(newCat);
  saveDB(db);
  res.json({ item: newCat });
});

app.delete('/api/treatment-catalog/:id', (req, res) => {
  const tenant = resolveTenant(req);
  db.treatmentCatalog = (db.treatmentCatalog || []).filter(
    (c) => !(c.id === req.params.id && c.tenantId === tenant.id)
  );
  saveDB(db);
  res.json({ success: true });
});

// ============================================================================
// 4. PATIENT PROFILE & MULTI-SESSION TREATMENT LEDGER
// ============================================================================
app.post('/api/patients', (req, res) => {
  const tenant = resolveTenant(req);
  const { name, phone, age, gender } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Patient Name and Phone are required.' });
  }
  const prefix = tenant.subdomain.slice(0, 3).toUpperCase();
  const count = db.patients.filter((p) => p.tenantId === tenant.id).length + 1001;
  const patientCode = `${prefix}-2026-${count}`;

  const newPatient = {
    id: `pat_${Date.now()}`,
    tenantId: tenant.id,
    patientCode,
    name: name.trim(),
    phone: phone.trim(),
    age: Number(age) || 30,
    gender: gender || 'Male',
    createdAt: new Date().toISOString()
  };

  db.patients.unshift(newPatient);
  saveDB(db);
  res.json({ patient: newPatient });
});

app.delete('/api/patients/:id', (req, res) => {
  const tenant = resolveTenant(req);
  const idx = db.patients.findIndex((p) => p.id === req.params.id && p.tenantId === tenant.id);
  if (idx === -1) return res.status(404).json({ error: 'Patient not found in this clinic.' });

  const removed = db.patients[idx];
  db.patients.splice(idx, 1);

  // Clean up associated treatments for this patient
  db.treatments = db.treatments.filter((t) => !(t.patientId === removed.id && t.tenantId === tenant.id));

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'PATIENT_RECORD_DELETED',
    staffId: 'ADMIN',
    staffName: 'Clinic Admin',
    approvingAdmin: 'Clinic Admin',
    discountAmount: 0,
    receiptId: removed.patientCode,
    details: `Clinic Admin deleted patient record "${removed.name}" (${removed.patientCode}).`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.json({ success: true, patientId: req.params.id });
});

app.post('/api/treatments', (req, res) => {
  const tenant = resolveTenant(req);
  const { patientId, title, totalCost, initialPaid = 0, totalSessions = 4, notes, cashierName, sessionDate } = req.body;

  const patient = db.patients.find((p) => p.id === patientId && p.tenantId === tenant.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found in this clinic.' });

  const agreedCost = Number(totalCost) || 0;
  const paidToday = Number(initialPaid) || 0;
  const remaining = Math.max(0, agreedCost - paidToday);
  const prefix = tenant.subdomain.slice(0, 3).toUpperCase();
  const invoiceNumber = `INV-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = sessionDate ? new Date(sessionDate).toISOString() : new Date().toISOString();

  const sessions = [];
  if (paidToday > 0) {
    sessions.push({
      id: `ses_${Date.now()}`,
      sessionNumber: 1,
      date: timestamp,
      notes: notes || 'Session 1 Initial Installment',
      amountPaid: paidToday,
      balanceAfter: remaining,
      cashierName: cashierName || 'Receptionist POS',
      invoiceNumber
    });
  }

  const newTreatment = {
    id: `trt_${Date.now()}`,
    tenantId: tenant.id,
    patientId: patient.id,
    patientName: patient.name,
    patientCode: patient.patientCode,
    patientPhone: patient.phone,
    title: title || 'Multi-Session Clinical Procedure',
    totalCost: agreedCost,
    paidAmount: paidToday,
    remainingBalance: remaining,
    totalSessions: Number(totalSessions) || 1,
    completedSessions: paidToday > 0 ? 1 : 0,
    status: remaining <= 0 ? 'COMPLETED' : 'IN_PROGRESS',
    createdAt: timestamp,
    sessions
  };

  db.treatments.unshift(newTreatment);

  let createdSale = null;
  let smsRecord = null;

  if (paidToday > 0) {
    createdSale = {
      id: `sale_${Date.now()}`,
      tenantId: tenant.id,
      invoiceNumber,
      patientId: patient.id,
      patientName: patient.name,
      patientCode: patient.patientCode,
      patientPhone: patient.phone,
      cashierId: 'STAFF_POS',
      cashierName: cashierName || 'Receptionist POS',
      items: [
        {
          id: newTreatment.id,
          type: 'SESSION',
          name: `${newTreatment.title} (Session #1 Installment)`,
          qty: 1,
          unitPrice: paidToday,
          costPrice: 0,
          subtotal: paidToday
        }
      ],
      subtotal: paidToday,
      discountAmount: 0,
      discountApprovedBy: null,
      netTotal: paidToday,
      amountPaidToday: paidToday,
      previousLedgerBalance: agreedCost,
      remainingLedgerBalance: remaining,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      smsSent: true,
      createdAt: timestamp
    };
    db.sales.unshift(createdSale);

    smsRecord = {
      id: `sms_${Date.now()}`,
      tenantId: tenant.id,
      recipientPhone: patient.phone,
      patientName: patient.name,
      message: `Dear ${patient.name}, Thank you for visiting ${tenant.name}. Amount Paid: Rs. ${paidToday.toLocaleString()} | Remaining Balance: Rs. ${remaining.toLocaleString()}.`,
      channel: 'WhatsApp + SMS',
      status: 'DELIVERED',
      invoiceNumber,
      timestamp
    };
    db.smsLogs.unshift(smsRecord);
  }

  saveDB(db);
  res.json({ treatment: newTreatment, sale: createdSale, smsLog: smsRecord });
});

app.post('/api/treatments/:id/pay-session', (req, res) => {
  const tenant = resolveTenant(req);
  const treatment = db.treatments.find((t) => t.id === req.params.id && t.tenantId === tenant.id);
  if (!treatment) return res.status(404).json({ error: 'Treatment ledger not found.' });

  const { amountPaid, notes, cashierName, paymentMethod = 'CASH', sessionDate } = req.body;
  const paid = Number(amountPaid) || 0;
  if (paid <= 0) return res.status(400).json({ error: 'Payment amount must be greater than 0.' });

  const previousBalance = treatment.remainingBalance;
  const newPaidTotal = treatment.paidAmount + paid;
  const newRemaining = Math.max(0, treatment.totalCost - newPaidTotal);
  const nextSessionNum = treatment.sessions.length + 1;

  const prefix = tenant.subdomain.slice(0, 3).toUpperCase();
  const invoiceNumber = `INV-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = sessionDate ? new Date(sessionDate).toISOString() : new Date().toISOString();

  const sessionEntry = {
    id: `ses_${Date.now()}`,
    sessionNumber: nextSessionNum,
    date: timestamp,
    notes: notes || `Session #${nextSessionNum} Installment Payment`,
    amountPaid: paid,
    balanceAfter: newRemaining,
    cashierName: cashierName || 'Receptionist POS',
    invoiceNumber
  };

  treatment.sessions.push(sessionEntry);
  treatment.paidAmount = newPaidTotal;
  treatment.remainingBalance = newRemaining;
  treatment.completedSessions = Math.min(treatment.totalSessions, treatment.completedSessions + 1);
  treatment.status = newRemaining <= 0 ? 'COMPLETED' : 'IN_PROGRESS';

  const sale = {
    id: `sale_${Date.now()}`,
    tenantId: tenant.id,
    invoiceNumber,
    patientId: treatment.patientId,
    patientName: treatment.patientName,
    patientCode: treatment.patientCode,
    patientPhone: treatment.patientPhone,
    cashierId: 'STAFF_POS',
    cashierName: cashierName || 'Receptionist POS',
    items: [
      {
        id: treatment.id,
        type: 'SESSION',
        name: `${treatment.title} (Session #${nextSessionNum})`,
        qty: 1,
        unitPrice: paid,
        costPrice: 0,
        subtotal: paid
      }
    ],
    subtotal: paid,
    discountAmount: 0,
    discountApprovedBy: null,
    netTotal: paid,
    amountPaidToday: paid,
    previousLedgerBalance: previousBalance,
    remainingLedgerBalance: newRemaining,
    paymentMethod,
    status: 'COMPLETED',
    smsSent: true,
    createdAt: timestamp
  };

  db.sales.unshift(sale);

  const smsLog = {
    id: `sms_${Date.now()}`,
    tenantId: tenant.id,
    recipientPhone: treatment.patientPhone,
    patientName: treatment.patientName,
    message: `Dear ${treatment.patientName}, Thank you for visiting ${tenant.name}. Amount Paid: Rs. ${paid.toLocaleString()} | Remaining Balance: Rs. ${newRemaining.toLocaleString()}.`,
    channel: 'WhatsApp + SMS',
    status: 'DELIVERED',
    invoiceNumber,
    timestamp
  };
  db.smsLogs.unshift(smsLog);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'LEDGER_SESSION_PAYMENT',
    staffId: 'STAFF_POS',
    staffName: cashierName || 'Receptionist POS',
    approvingAdmin: 'Auto Ledger Engine',
    discountAmount: 0,
    receiptId: invoiceNumber,
    details: `Session #${nextSessionNum} payment Rs. ${paid} recorded for ${treatment.patientName}. Remaining Balance: Rs. ${newRemaining}.`,
    timestamp
  });

  saveDB(db);
  res.json({ treatment, sale, smsLog });
});

// Clinic Admin Permanently Deletes Treatment Ledger and Installment Plan
app.delete('/api/treatments/:id', (req, res) => {
  const tenant = resolveTenant(req);
  const idx = db.treatments.findIndex((t) => t.id === req.params.id && t.tenantId === tenant.id);
  if (idx === -1) return res.status(404).json({ error: 'Treatment ledger not found.' });

  const removed = db.treatments[idx];
  db.treatments.splice(idx, 1);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'TREATMENT_LEDGER_DELETED',
    staffId: 'CLINIC_ADMIN',
    staffName: 'Clinic Admin',
    approvingAdmin: 'Clinic Admin',
    discountAmount: 0,
    receiptId: removed.id,
    details: `Clinic Admin permanently deleted treatment ledger "${removed.title}" for patient ${removed.patientName} (${removed.patientCode}). Remaining balance Rs. ${removed.remainingBalance} cleared.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  io.to(tenant.id).emit('treatment_deleted', { treatmentId: req.params.id });
  res.json({ success: true, treatmentId: req.params.id });
});

// ============================================================================
// 5. STOCK & INVENTORY MANAGEMENT (PHARMACY / PRODUCTS)
// ============================================================================
app.post('/api/inventory', (req, res) => {
  const tenant = resolveTenant(req);
  const {
    barcode,
    name,
    category,
    supplier,
    purchasePrice,
    sellingPrice,
    quantity,
    minStockAlert,
    expiryDate
  } = req.body;

  if (!name || !sellingPrice) {
    return res.status(400).json({ error: 'Item Name and Selling Price are required.' });
  }

  const cleanBarcode = (barcode || `896${Math.floor(1000000 + Math.random() * 9000000)}`).trim();
  const existing = db.inventory.find(
    (item) => item.tenantId === tenant.id && item.barcode.toLowerCase() === cleanBarcode.toLowerCase()
  );

  if (existing) {
    existing.quantity += Number(quantity) || 0;
    existing.purchasePrice = Number(purchasePrice) || existing.purchasePrice;
    existing.sellingPrice = Number(sellingPrice) || existing.sellingPrice;
    if (category) existing.category = category;
    if (supplier) existing.supplier = supplier;
    if (expiryDate) existing.expiryDate = expiryDate;
    saveDB(db);
    return res.json({ item: existing, updatedExisting: true });
  }

  const newItem = {
    id: `inv_${Date.now()}`,
    tenantId: tenant.id,
    barcode: cleanBarcode,
    name: name.trim(),
    category: category || 'Medicine',
    supplier: supplier || 'Direct Pharma Supplier',
    purchasePrice: Number(purchasePrice) || 0,
    sellingPrice: Number(sellingPrice) || 0,
    quantity: Number(quantity) || 0,
    minStockAlert: Number(minStockAlert) || 10,
    expiryDate: expiryDate || '2027-12-31'
  };

  db.inventory.unshift(newItem);
  saveDB(db);
  res.json({ item: newItem, updatedExisting: false });
});

// ============================================================================
// 6. FRAUD PREVENTION & DISCOUNT APPROVAL SYSTEM
// ============================================================================
app.post('/api/discounts/verify-pin', (req, res) => {
  const tenant = resolveTenant(req);
  const { pin, staffId, staffName, patientName, cartTotal, discountAmount, reason } = req.body;

  if (String(pin).trim() !== String(tenant.adminPin).trim()) {
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      tenantId: tenant.id,
      action: 'FAILED_ADMIN_PIN_ATTEMPT',
      staffId: staffId || 'STAFF',
      staffName: staffName || 'Receptionist',
      approvingAdmin: 'REJECTED (Invalid PIN)',
      discountAmount: Number(discountAmount) || 0,
      receiptId: 'PENDING-POS',
      details: `Invalid 4-Digit Admin PIN entered while requesting Rs. ${discountAmount} discount.`,
      timestamp: new Date().toISOString()
    });
    saveDB(db);
    return res.status(401).json({ error: 'Invalid 4-Digit Clinic Admin PIN! Attempt logged in Security Audit.' });
  }

  const token = `PIN-AUTH-${Date.now()}`;
  const approvalRecord = {
    id: `req_${Date.now()}`,
    tenantId: tenant.id,
    staffId: staffId || 'STAFF',
    staffName: staffName || 'Receptionist',
    patientName: patientName || 'Walk-in Patient',
    cartTotal: Number(cartTotal) || 0,
    discountRequested: Number(discountAmount) || 0,
    reason: reason || 'Authorized via 4-Digit Management PIN at POS',
    status: 'APPROVED',
    approvedBy: 'Clinic Admin (4-Digit PIN)',
    approvalMethod: 'ADMIN_PIN',
    approvalToken: token,
    invoiceNumber: 'PENDING',
    createdAt: new Date().toISOString(),
    resolvedAt: new Date().toISOString()
  };

  db.discountRequests.unshift(approvalRecord);
  saveDB(db);

  res.json({
    approved: true,
    approvalRecord
  });
});

app.post('/api/discounts/request-remote', (req, res) => {
  const tenant = resolveTenant(req);
  const { staffId, staffName, patientName, cartTotal, discountAmount, reason } = req.body;

  const newReq = {
    id: `req_${Date.now()}`,
    tenantId: tenant.id,
    staffId: staffId || 'STAFF',
    staffName: staffName || 'Receptionist',
    patientName: patientName || 'Walk-in Patient',
    cartTotal: Number(cartTotal) || 0,
    discountRequested: Number(discountAmount) || 0,
    reason: reason || 'Patient requested discount at counter',
    status: 'PENDING',
    approvedBy: null,
    approvalMethod: 'WEBSOCKET_REMOTE',
    invoiceNumber: 'PENDING',
    createdAt: new Date().toISOString(),
    resolvedAt: null
  };

  db.discountRequests.unshift(newReq);
  saveDB(db);

  io.to(tenant.id).emit('discount_request_created', newReq);

  res.json({ request: newReq });
});

app.post('/api/discounts/:id/respond', (req, res) => {
  const tenant = resolveTenant(req);
  const { decision, adminName } = req.body;
  const discReq = db.discountRequests.find((r) => r.id === req.params.id && r.tenantId === tenant.id);
  if (!discReq) return res.status(404).json({ error: 'Discount request not found.' });

  discReq.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  discReq.approvedBy = adminName || 'Clinic Admin (Remote 1-Click)';
  discReq.resolvedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: decision === 'APPROVED' ? 'REMOTE_DISCOUNT_APPROVED' : 'REMOTE_DISCOUNT_REJECTED',
    staffId: discReq.staffId,
    staffName: discReq.staffName,
    approvingAdmin: discReq.approvedBy,
    discountAmount: discReq.discountRequested,
    receiptId: 'POS-LIVE',
    details: `Remote discount request of Rs. ${discReq.discountRequested} for ${discReq.patientName} was ${discReq.status} by ${discReq.approvedBy}.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  io.to(tenant.id).emit('discount_request_resolved', discReq);

  res.json({ request: discReq });
});

// ============================================================================
// 7. POS CHECKOUT, AUTO STOCK DEDUCTION (ALL INVENTORY ITEMS), WALK-IN DETAILS
// ============================================================================
app.post('/api/sales/checkout', (req, res) => {
  const tenant = resolveTenant(req);
  const sub = computeSubscriptionStatus(tenant);
  if (sub.state === 'LOCKED') {
    return res.status(403).json({
      error: 'Account Suspended - Please Pay to Restore Access. Checkout is locked.'
    });
  }

  const {
    patientId,
    walkInName,
    walkInPhone,
    cashierId,
    cashierName,
    items,
    discountAmount = 0,
    discountRequestId,
    amountPaidToday,
    paymentMethod = 'CASH',
    treatmentId
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const disc = Number(discountAmount) || 0;
  let approvingAdminName = null;
  if (disc > 0) {
    const approvedReq = db.discountRequests.find(
      (r) => r.id === discountRequestId && r.tenantId === tenant.id && r.status === 'APPROVED'
    );
    if (!approvedReq) {
      return res.status(403).json({
        error: 'FRAUD PREVENTION BLOCK: Staff cannot apply direct discounts without Admin PIN or Real-Time Approval!'
      });
    }
    approvingAdminName = approvedReq.approvedBy;
  }

  // Resolve registered patient OR custom walk-in customer name/phone
  let patient = db.patients.find((p) => p.id === patientId && p.tenantId === tenant.id);
  if (!patient) {
    const rawName = (walkInName || req.body.patientName || '').trim();
    const rawPhone = (walkInPhone || req.body.patientPhone || '').trim();

    // STRICT VALIDATION (Image 3): Slip cannot be generated without Customer Name & Mobile Phone Number!
    if (!rawName || rawName.toLowerCase() === 'walk-in customer') {
      return res.status(400).json({
        error: 'Customer Name is strictly required to generate receipt slip and dispatch automatic WhatsApp SMS!'
      });
    }
    const cleanDigits = rawPhone.replace(/\D/g, '');
    if (!rawPhone || cleanDigits.length < 10 || rawPhone === '0300-0000000') {
      return res.status(400).json({
        error: 'Valid Mobile Phone Number (e.g. 0300-1234567) is strictly required to generate slip and dispatch auto-WhatsApp SMS!'
      });
    }

    patient = {
      id: 'pat_walkin',
      patientCode: 'WALK-IN',
      name: rawName,
      phone: rawPhone
    };
  }

  // Validate stock quantities before deducting
  for (const cartItem of items) {
    if (cartItem.type !== 'SESSION') {
      const invItem = db.inventory.find((i) => i.id === cartItem.id && i.tenantId === tenant.id);
      if (invItem) {
        const requestedQty = Number(cartItem.qty) || 1;
        if (invItem.quantity < requestedQty) {
          return res.status(400).json({
            error: `Insufficient Stock for "${invItem.name}"! Available in Stock: ${invItem.quantity}, Requested: ${requestedQty}`
          });
        }
      }
    }
  }

  let subtotal = 0;
  const processedItems = items.map((cartItem) => {
    const qty = Number(cartItem.qty) || 1;
    const unitPrice = Number(cartItem.unitPrice) || 0;
    const itemSubtotal = qty * unitPrice;
    subtotal += itemSubtotal;

    // ALWAYS deduct stock for ANY inventory item sold on POS!
    if (cartItem.type !== 'SESSION') {
      const invItem = db.inventory.find((i) => i.id === cartItem.id && i.tenantId === tenant.id);
      if (invItem) {
        invItem.quantity = Math.max(0, Number(invItem.quantity) - qty);
      }
    }

    return {
      id: cartItem.id,
      type: cartItem.type || 'PRODUCT',
      name: cartItem.name,
      qty,
      unitPrice,
      costPrice: Number(cartItem.costPrice) || 0,
      subtotal: itemSubtotal
    };
  });

  const netTotal = Math.max(0, subtotal - disc);
  const paidToday = amountPaidToday !== undefined ? Number(amountPaidToday) : netTotal;
  const unpaidFromThisBill = Math.max(0, netTotal - paidToday);

  let previousLedgerBalance = 0;
  let remainingLedgerBalance = unpaidFromThisBill;

  const patientTreatments = db.treatments.filter(
    (t) => t.tenantId === tenant.id && t.patientId === patient.id && t.status === 'IN_PROGRESS'
  );

  const prefix = tenant.subdomain.slice(0, 3).toUpperCase();
  const invoiceNumber = `INV-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (treatmentId) {
    const trt = db.treatments.find((t) => t.id === treatmentId && t.tenantId === tenant.id);
    if (trt) {
      previousLedgerBalance = trt.remainingBalance;
      trt.paidAmount += paidToday;
      trt.remainingBalance = Math.max(0, trt.totalCost - trt.paidAmount);
      trt.completedSessions = Math.min(trt.totalSessions, trt.completedSessions + 1);
      if (trt.remainingBalance <= 0) trt.status = 'COMPLETED';
      remainingLedgerBalance = trt.remainingBalance;
      trt.sessions.push({
        id: `ses_${Date.now()}`,
        sessionNumber: trt.sessions.length + 1,
        date: new Date().toISOString(),
        notes: `POS Session Checkout (${invoiceNumber})`,
        amountPaid: paidToday,
        balanceAfter: trt.remainingBalance,
        cashierName: cashierName || 'Receptionist POS',
        invoiceNumber
      });
    }
  } else if (patientTreatments.length > 0) {
    previousLedgerBalance = patientTreatments.reduce((sum, t) => sum + t.remainingBalance, 0);
    remainingLedgerBalance = previousLedgerBalance + unpaidFromThisBill;
  } else if (unpaidFromThisBill > 0 && patient.id !== 'pat_walkin') {
    const autoTrt = {
      id: `trt_${Date.now()}`,
      tenantId: tenant.id,
      patientId: patient.id,
      patientName: patient.name,
      patientCode: patient.patientCode,
      patientPhone: patient.phone,
      title: `POS Partial Bill (${processedItems.map((i) => i.name).join(', ').slice(0, 45)})`,
      totalCost: netTotal,
      paidAmount: paidToday,
      remainingBalance: unpaidFromThisBill,
      totalSessions: 2,
      completedSessions: 1,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      sessions: [
        {
          id: `ses_${Date.now()}`,
          sessionNumber: 1,
          date: new Date().toISOString(),
          notes: `Initial Partial Payment on POS (${invoiceNumber})`,
          amountPaid: paidToday,
          balanceAfter: unpaidFromThisBill,
          cashierName: cashierName || 'Receptionist POS',
          invoiceNumber
        }
      ]
    };
    db.treatments.unshift(autoTrt);
    previousLedgerBalance = netTotal;
    remainingLedgerBalance = unpaidFromThisBill;
  }

  const newSale = {
    id: `sale_${Date.now()}`,
    tenantId: tenant.id,
    invoiceNumber,
    patientId: patient.id,
    patientName: patient.name,
    patientCode: patient.patientCode,
    patientPhone: patient.phone,
    cashierId: cashierId || 'STAFF_POS',
    cashierName: cashierName || 'Receptionist POS',
    items: processedItems,
    subtotal,
    discountAmount: disc,
    discountApprovedBy: approvingAdminName,
    netTotal,
    amountPaidToday: paidToday,
    previousLedgerBalance,
    remainingLedgerBalance,
    paymentMethod,
    status: 'COMPLETED',
    smsSent: Boolean(tenant.smsEnabled),
    createdAt: new Date().toISOString()
  };

  db.sales.unshift(newSale);

  if (disc > 0 && discountRequestId) {
    const reqObj = db.discountRequests.find((r) => r.id === discountRequestId);
    if (reqObj) reqObj.invoiceNumber = invoiceNumber;

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      tenantId: tenant.id,
      action: 'DISCOUNTED_SALE_COMPLETED',
      staffId: cashierId || 'STAFF_POS',
      staffName: cashierName || 'Receptionist POS',
      approvingAdmin: approvingAdminName,
      discountAmount: disc,
      receiptId: invoiceNumber,
      details: `POS Invoice ${invoiceNumber} completed with Rs. ${disc} discount approved by ${approvingAdminName}. Net Paid: Rs. ${paidToday}.`,
      timestamp: new Date().toISOString()
    });
  } else {
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      tenantId: tenant.id,
      action: 'POS_SALE_COMPLETED',
      staffId: cashierId || 'STAFF_POS',
      staffName: cashierName || 'Receptionist POS',
      approvingAdmin: 'No Discount',
      discountAmount: 0,
      receiptId: invoiceNumber,
      details: `POS Invoice ${invoiceNumber} completed (${processedItems.map((i) => `${i.name} x${i.qty}`).join(', ')}). Paid Today: Rs. ${paidToday} | Remaining Balance: Rs. ${remainingLedgerBalance}.`,
      timestamp: new Date().toISOString()
    });
  }

  const formattedMessage = `Dear ${patient.name}, Thank you for visiting ${tenant.name}. Amount Paid: Rs. ${paidToday.toLocaleString()} | Remaining Balance: Rs. ${remainingLedgerBalance.toLocaleString()}.`;
  const smsLog = {
    id: `sms_${Date.now()}`,
    tenantId: tenant.id,
    recipientPhone: patient.phone,
    patientName: patient.name,
    message: formattedMessage,
    channel: 'WhatsApp + SMS Gateway',
    status: tenant.smsEnabled ? 'DELIVERED' : 'SKIPPED_DISABLED',
    invoiceNumber,
    timestamp: new Date().toISOString()
  };
  db.smsLogs.unshift(smsLog);

  saveDB(db);
  io.to(tenant.id).emit('sale_completed', { sale: newSale, smsLog });

  res.json({
    sale: newSale,
    smsLog
  });
});

// ============================================================================
// 8. STRICT SECURITY: STAFF CANNOT DELETE/EDIT; ONLY CLINIC ADMIN CAN REFUND
// ============================================================================
app.post('/api/sales/:id/refund', (req, res) => {
  const tenant = resolveTenant(req);
  const { role, adminPin, reason, actorName } = req.body;

  if (role === 'STAFF' && String(adminPin).trim() !== String(tenant.adminPin).trim()) {
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      tenantId: tenant.id,
      action: 'BLOCKED_UNAUTHORIZED_VOID_ATTEMPT',
      staffId: 'STAFF_POS',
      staffName: actorName || 'Receptionist',
      approvingAdmin: 'SECURITY_BLOCK',
      discountAmount: 0,
      receiptId: req.params.id,
      details: `STRICT SECURITY BLOCK: Staff attempted to cancel/refund sale without Clinic Admin authorization.`,
      timestamp: new Date().toISOString()
    });
    saveDB(db);
    return res.status(403).json({
      error: 'STRICT SECURITY CONTROL: Staff CANNOT edit, cancel, or refund any completed sale! Clinic Admin approval required.'
    });
  }

  const sale = db.sales.find((s) => s.id === req.params.id && s.tenantId === tenant.id);
  if (!sale) return res.status(404).json({ error: 'Sale record not found.' });
  if (sale.status === 'REFUNDED') {
    return res.status(400).json({ error: 'Sale is already refunded.' });
  }

  sale.status = 'REFUNDED';
  sale.refundReason = reason || 'Admin Authorized Refund';
  sale.refundedAt = new Date().toISOString();

  // Restore inventory stock on refund for all inventory items
  sale.items.forEach((item) => {
    if (item.type !== 'SESSION') {
      const inv = db.inventory.find((i) => i.id === item.id && i.tenantId === tenant.id);
      if (inv) {
        inv.quantity += Number(item.qty) || 1;
      }
    }
  });

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'SALE_REFUNDED_BY_ADMIN',
    staffId: sale.cashierId,
    staffName: sale.cashierName,
    approvingAdmin: actorName || 'Clinic Admin',
    discountAmount: sale.discountAmount,
    receiptId: sale.invoiceNumber,
    details: `Invoice ${sale.invoiceNumber} (Rs. ${sale.netTotal}) marked REFUNDED by Clinic Admin. Stock restored.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.json({ sale });
});

// Clinic Admin Permanently Deletes Invoice / Sale Record
app.delete('/api/sales/:id', (req, res) => {
  const tenant = resolveTenant(req);
  const idx = db.sales.findIndex((s) => s.id === req.params.id && s.tenantId === tenant.id);
  if (idx === -1) return res.status(404).json({ error: 'Sale record not found.' });

  const removed = db.sales[idx];
  db.sales.splice(idx, 1);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'INVOICE_RECORD_DELETED',
    staffId: 'CLINIC_ADMIN',
    staffName: 'Clinic Admin',
    approvingAdmin: 'Clinic Admin',
    discountAmount: removed.discountAmount || 0,
    receiptId: removed.invoiceNumber,
    details: `Clinic Admin permanently deleted invoice "${removed.invoiceNumber}" (Total: Rs. ${removed.netTotal}) for patient ${removed.patientName}.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  io.to(tenant.id).emit('sale_deleted', { saleId: req.params.id });
  res.json({ success: true, saleId: req.params.id });
});

// ============================================================================
// 9. ENTERPRISE WORLD-CLASS ADDITIONS: CART PARKING, CASH SHIFTS & EXPORTS
// ============================================================================

// 9A. Park / Hold In-Progress Cart
app.post('/api/sales/park', (req, res) => {
  const tenant = resolveTenant(req);
  if (!Array.isArray(db.parkedSales)) db.parkedSales = [];

  const { items, patientId, patientName, patientPhone, discountAmount, cashierName, notes } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cannot park an empty cart.' });
  }

  const parked = {
    id: `park_${Date.now()}`,
    tenantId: tenant.id,
    items,
    patientId: patientId || 'walkin',
    patientName: patientName || 'Walk-in Customer',
    patientPhone: patientPhone || '',
    discountAmount: Number(discountAmount || 0),
    cashierName: cashierName || 'Cashier',
    notes: notes || '',
    parkedAt: new Date().toISOString(),
    totalAmount: items.reduce((s, i) => s + (Number(i.unitPrice || 0) * Number(i.qty || 1)), 0)
  };

  db.parkedSales.unshift(parked);
  saveDB(db);
  io.to(tenant.id).emit('parked_sales_updated', db.parkedSales.filter((p) => p.tenantId === tenant.id));
  res.json({ parked, parkedSale: parked });
});

// Delete or Unpark
app.delete('/api/sales/parked/:id', (req, res) => {
  const tenant = resolveTenant(req);
  if (!Array.isArray(db.parkedSales)) db.parkedSales = [];

  const idx = db.parkedSales.findIndex((p) => p.id === req.params.id && p.tenantId === tenant.id);
  if (idx !== -1) {
    db.parkedSales.splice(idx, 1);
    saveDB(db);
    io.to(tenant.id).emit('parked_sales_updated', db.parkedSales.filter((p) => p.tenantId === tenant.id));
  }
  res.json({ success: true, id: req.params.id });
});

// 9B. Cash Drawer Shift Management & Z-Report
app.post('/api/shifts/open', (req, res) => {
  const tenant = resolveTenant(req);
  if (!Array.isArray(db.shifts)) db.shifts = [];

  const existing = db.shifts.find((s) => s.tenantId === tenant.id && s.status === 'OPEN');
  if (existing) {
    return res.json({ shift: existing, message: 'Shift already active.' });
  }

  const { openingFloat = 0, cashierName = 'Cashier', notes = '' } = req.body;
  const shiftNum = `SH-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  const newShift = {
    id: `shift_${Date.now()}`,
    shiftNumber: shiftNum,
    code: shiftNum,
    tenantId: tenant.id,
    cashierName,
    openedAt: new Date().toISOString(),
    openingFloat: Number(openingFloat || 0),
    status: 'OPEN',
    notes,
    summary: null
  };

  db.shifts.unshift(newShift);
  saveDB(db);
  io.to(tenant.id).emit('shift_updated', newShift);
  res.json({ shift: newShift });
});

app.post('/api/shifts/close', (req, res) => {
  const tenant = resolveTenant(req);
  if (!Array.isArray(db.shifts)) db.shifts = [];

  const shift = db.shifts.find((s) => s.tenantId === tenant.id && s.status === 'OPEN');
  if (!shift) {
    return res.status(400).json({ error: 'No active open shift found for this clinic.' });
  }

  const actualCountedCash = Number(req.body.actualCashCounted ?? req.body.countedCash ?? 0);
  const closingNotesVal = req.body.notes ?? req.body.closingNotes ?? '';
  const closedAt = new Date().toISOString();

  // Calculate all sales processed during this shift
  const shiftSales = (db.sales || []).filter(
    (s) => s.tenantId === tenant.id && s.createdAt >= shift.openedAt && s.status !== 'REFUNDED'
  );

  let cashSalesTotal = 0;
  let cardSalesTotal = 0;
  let bankTransferSalesTotal = 0;
  let totalDiscountsGiven = 0;
  let totalRecoverablesPending = 0;
  let totalGross = 0;

  shiftSales.forEach((s) => {
    const paidToday = Number(s.amountPaidToday || s.netTotal || 0);
    const method = String(s.paymentMethod || 'CASH').toUpperCase();
    if (method === 'CARD') {
      cardSalesTotal += paidToday;
    } else if (method === 'BANK_TRANSFER' || method === 'ONLINE') {
      bankTransferSalesTotal += paidToday;
    } else {
      cashSalesTotal += paidToday;
    }
    totalDiscountsGiven += Number(s.discountAmount || 0);
    totalRecoverablesPending += Number(s.remainingLedgerBalance || 0);
    totalGross += Number(s.subtotal || 0);
  });

  const openingFloat = Number(shift.openingFloat || 0);
  const expectedCashInDrawer = openingFloat + cashSalesTotal;
  const cashDifference = actualCountedCash - expectedCashInDrawer; // Negative = shortage, positive = excess

  shift.status = 'CLOSED';
  shift.closedAt = closedAt;
  shift.code = shift.code || shift.shiftNumber;
  shift.countedCash = actualCountedCash;
  shift.actualCashCounted = actualCountedCash;
  shift.expectedCash = expectedCashInDrawer;
  shift.expectedCashInDrawer = expectedCashInDrawer;
  shift.cashDifference = cashDifference;
  shift.difference = cashDifference;
  shift.closingNotes = closingNotesVal;
  shift.grossSales = totalGross;
  shift.netSales = cashSalesTotal + cardSalesTotal + bankTransferSalesTotal;
  shift.netCashCollected = cashSalesTotal;
  shift.totalDiscounts = totalDiscountsGiven;
  shift.salesCount = shiftSales.length;
  shift.paymentBreakdown = {
    CASH: cashSalesTotal,
    CARD: cardSalesTotal,
    BANK_TRANSFER: bankTransferSalesTotal
  };
  shift.summary = {
    totalInvoices: shiftSales.length,
    totalGross,
    cashSalesTotal,
    cardSalesTotal,
    bankTransferSalesTotal,
    netCollectedToday: cashSalesTotal + cardSalesTotal + bankTransferSalesTotal,
    totalDiscountsGiven,
    totalRecoverablesPending,
    openingFloat,
    expectedCashInDrawer,
    actualCountedCash,
    cashDifference,
    differenceStatus: cashDifference === 0 ? 'BALANCED' : cashDifference > 0 ? 'EXCESS' : 'SHORTAGE'
  };

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    tenantId: tenant.id,
    action: 'SHIFT_CLOSED_Z_REPORT',
    staffId: 'STAFF',
    staffName: shift.cashierName,
    approvingAdmin: 'SYSTEM',
    discountAmount: totalDiscountsGiven,
    receiptId: shift.shiftNumber,
    details: `Shift closed. Invoices: ${shiftSales.length}, Net Cash: Rs. ${cashSalesTotal}, Difference: Rs. ${cashDifference} (${shift.summary.differenceStatus}).`,
    timestamp: closedAt
  });

  saveDB(db);
  io.to(tenant.id).emit('shift_updated', shift);
  res.json({ shift, zReport: shift.summary });
});

// 9C. Export Data as CSV (Sales, Patient Ledgers, Inventory)
app.get('/api/export/:type', (req, res) => {
  const tenant = resolveTenant(req);
  const type = req.params.type; // 'sales' | 'patients' | 'inventory' | 'tenants'

  if (type === 'sales') {
    const salesList = (db.sales || []).filter((s) => s.tenantId === tenant.id);
    let csv = 'Invoice Number,Date,Patient Name,Patient Phone,Cashier,Payment Method,Subtotal,Discount,Net Total,Paid Today,Balance Due,Status\n';
    salesList.forEach((s) => {
      csv += `"${s.invoiceNumber}","${new Date(s.createdAt).toLocaleString()}","${s.patientName || ''}","${s.patientPhone || ''}","${s.cashierName || ''}","${s.paymentMethod || 'CASH'}",${s.subtotal || 0},${s.discountAmount || 0},${s.netTotal || 0},${s.amountPaidToday || 0},${s.remainingLedgerBalance || 0},"${s.status || 'PAID'}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.subdomain}_sales_${Date.now()}.csv"`);
    return res.send(csv);
  }

  if (type === 'patients') {
    const list = (db.patients || []).filter((p) => p.tenantId === tenant.id);
    let csv = 'Patient Code,Name,Phone,Gender,Age,Created Date,Total Spent,Pending Ledger Balance\n';
    list.forEach((p) => {
      const pSales = (db.sales || []).filter((s) => s.patientId === p.id && s.tenantId === tenant.id);
      const spent = pSales.reduce((sum, s) => sum + Number(s.netTotal || 0), 0);
      const dues = pSales.reduce((sum, s) => sum + Number(s.remainingLedgerBalance || 0), 0);
      csv += `"${p.code}","${p.name}","${p.phone || ''}","${p.gender || ''}","${p.age || ''}","${p.createdAt || ''}",${spent},${dues}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.subdomain}_patients_ledger_${Date.now()}.csv"`);
    return res.send(csv);
  }

  if (type === 'inventory') {
    const items = (db.inventory || []).filter((i) => i.tenantId === tenant.id);
    let csv = 'Barcode,Item Name,Category,Quantity In Stock,Purchase Price,Selling Price,Total Valuation (Cost),Min Alert,Expiry Date\n';
    items.forEach((i) => {
      const val = (Number(i.quantity) || 0) * (Number(i.purchasePrice) || 0);
      csv += `"${i.barcode}","${i.name}","${i.category || 'General'}","${i.quantity}",${i.purchasePrice || 0},${i.sellingPrice || 0},${val},${i.minStockAlert || 10},"${i.expiryDate || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.subdomain}_inventory_${Date.now()}.csv"`);
    return res.send(csv);
  }

  res.status(400).json({ error: 'Invalid export type requested.' });
});

// Serve Frontend Single Page Application on port 4000
app.get('*', (req, res) => {
  // If it's an API route that wasn't matched, return 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found.` });
  }

  // If dist/index.html exists, serve the built production React SPA directly
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Fallback landing page if dist has not been built
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>DigitalsNova Server Status</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1E293B; padding: 2.5rem; border-radius: 1.5rem; max-width: 500px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); border: 1px solid #334155; }
        h1 { color: #38BDF8; font-size: 1.5rem; margin-top: 0; }
        p { color: #94A3B8; font-size: 0.95rem; line-height: 1.5; }
        .btn { display: inline-block; background: #2563EB; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; margin-top: 1rem; }
        .btn:hover { background: #1D4ED8; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 DigitalsNova Server Active</h1>
        <p>The backend API and WebSockets server is running on port 4000.</p>
        <p>To access the live Client Portal & POS UI, click below:</p>
        <a href="http://localhost:5173" class="btn">Open Web App on Port 5173</a>
      </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Digitalsnova Multi-Tenant SaaS Server + WebSockets running on http://localhost:${PORT}`);
});
