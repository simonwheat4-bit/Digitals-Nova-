import React, { useState } from 'react';
import {
  PlusCircle,
  Unlock,
  Lock,
  Clock,
  Bell,
  Globe,
  Webhook,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Store,
  Stethoscope,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  Users,
  HelpCircle,
  CheckCircle2,
  Upload,
  Crown,
  CreditCard,
  Calendar,
  Sparkles,
  Layers,
  Tag,
  Check
} from 'lucide-react';

export default function SuperAdminPanel({
  platformBrand,
  allTenants = [],
  currentTenant,
  cronLogs = [],
  licenseKeys = [],
  passwordResetRequests = [],
  onOpenProfileModal,
  onSavePlatformBrand,
  onSelectTenant,
  onCreateTenant,
  onUpdateTenant,
  onDeleteTenant,
  onResolvePasswordReset,
  onGenerateLicenseKey,
  onToggleLicenseKeyStatus,
  onDeleteLicenseKey,
  onUnlockWebhook,
  onTriggerMidnightCron,
  resetTrigger
}) {
  // Clickable KPI Separate Page State
  const [selectedSaaSKpi, setSelectedSaaSKpi] = useState(null); // null | 'MRR' | 'ACTIVE' | 'GRACE' | 'LOCKED'

  // When resetTrigger updates (e.g. user clicked on DigitalsNova logo), return to main dashboard
  React.useEffect(() => {
    if (resetTrigger) {
      setSelectedSaaSKpi(null);
    }
  }, [resetTrigger]);

  // Key Generator Modal / Quick State
  const [keyGenTenant, setKeyGenTenant] = useState(null);
  const [keyGenPlan, setKeyGenPlan] = useState('MONTHLY');
  const [keyGenFee, setKeyGenFee] = useState(7999);
  const [keyGenDays, setKeyGenDays] = useState(30);
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  // Clickable Client Details & Login Credentials Modal State
  const [inspectedTenantId, setInspectedTenantId] = useState(null);
  const [editClientForm, setEditClientForm] = useState(null);
  const [savingClient, setSavingClient] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(true);

  // Password Reset Input State per Request
  const [resetInputs, setResetInputs] = useState({});

  const [newClinic, setNewClinic] = useState({
    name: '',
    subdomain: '',
    address: '',
    phone: '',
    planType: 'MONTHLY', // 'TRIAL_3_DAYS' | 'MONTHLY' | 'YEARLY' | '3_YEARS' | 'CUSTOM'
    cycleDays: 30,
    monthlyFee: 7999,
    adminName: '',
    adminUsername: '',
    adminPassword: '123',
    adminPin: '1234',
    packagePreset: 'FULL_CLINIC', // 'FULL_CLINIC' | 'STORE_ONLY'
    enabledModules: {
      pos: true,
      inventory: true,
      patientsLedger: true
    }
  });
  const [feedback, setFeedback] = useState(null);

  // Dedicated Global SaaS Pricing Management Widget State
  const [globalPricing, setGlobalPricing] = useState(() => {
    try {
      const saved = localStorage.getItem('digitalsnova_global_pricing');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      monthlyFee: 7999,
      yearlyFee: 76790,
      threeYearFee: 229000,
      trialDays: 3,
      currency: 'Rs.'
    };
  });
  const [pricingSavedNotice, setPricingSavedNotice] = useState(false);

  const handleSaveGlobalPricing = (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('digitalsnova_global_pricing', JSON.stringify(globalPricing));
      setPricingSavedNotice(true);
      setFeedback('Global SaaS Subscription Pricing tiers updated and synced successfully!');
      setTimeout(() => setPricingSavedNotice(false), 3500);
    } catch (err) {
      setFeedback('Error saving pricing: ' + err.message);
    }
  };

  // Cloud tenants polled dynamically from server so any new registration appears in real-time
  const [cloudTenants, setCloudTenants] = useState([]);

  // Real-Time Super Admin Notification Feed State
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('digitalsnova_superadmin_notifications') || '[]');
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const handleStorage = async () => {
      try {
        const clearedAt = parseInt(localStorage.getItem('digitalsnova_notifications_cleared_at') || '0', 10);
        let notifs = JSON.parse(localStorage.getItem('digitalsnova_superadmin_notifications') || '[]');
        notifs = notifs.filter(n => new Date(n.timestamp || 0).getTime() > clearedAt);

        try {
          const syncRes = await fetch('/api/sync.php?action=get_all');
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData) {
              const cloudNotifs = Array.isArray(syncData.notifications) ? syncData.notifications : [];
              const notifMap = new Map();

              // 1. Load direct notifications (only if newer than clearedAt)
              [...cloudNotifs, ...notifs].forEach(n => {
                if (n && n.id && !notifMap.has(n.id)) {
                  const t = new Date(n.timestamp || 0).getTime();
                  if (t > clearedAt) {
                    notifMap.set(n.id, n);
                  }
                }
              });

              // 2. Update cloudTenants state so registered stores immediately show in KPIs & Subdomain table
              if (Array.isArray(syncData.tenants) && syncData.tenants.length > 0) {
                setCloudTenants(syncData.tenants);
                let cachedReg = [];
                try {
                  cachedReg = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]');
                } catch {}
                syncData.tenants.forEach(ct => {
                  if (!cachedReg.some(cr => cr.id === ct.id || (cr.subdomain || '').toLowerCase() === (ct.subdomain || '').toLowerCase())) {
                    cachedReg.push(ct);
                  }
                });
                localStorage.setItem('digitalsnova_registered_tenants', JSON.stringify(cachedReg));

                // Synthesize notifications for all cloud tenants
                syncData.tenants.forEach(t => {
                  const sub = (t.subdomain || '').toLowerCase();
                  const alreadyPresent = Array.from(notifMap.values()).some(n => (n.subdomain || '').toLowerCase() === sub);
                  if (!alreadyPresent && t.name) {
                    const synthId = 'notif_tenant_' + (sub || t.id);
                    notifMap.set(synthId, {
                      id: synthId,
                      timestamp: t.createdAt || new Date().toISOString(),
                      type: 'NEW_REGISTRATION',
                      title: '🎉 New Store Registered (Cloud Sync)',
                      tenantName: t.name,
                      subdomain: sub,
                      ownerName: t.adminName || t.adminUser?.name || 'Store Owner',
                      phone: t.phone || '',
                      email: t.email || t.adminUser?.email || '',
                      planType: t.planType || 'TRIAL_3_DAYS',
                      planName: t.planName || (t.planType === 'YEARLY' ? '1-Year Annual Package' : (t.planType === 'MONTHLY' ? 'Standard Monthly Plan' : '3-Day Enterprise Trial')),
                      businessType: t.businessType || t.business_type || 'Retail Mart',
                      adminUsername: t.adminUsername || t.adminUser?.username || ('admin.' + sub),
                      adminPassword: t.adminPassword || t.adminUser?.password || '123456',
                      portalUrl: 'https://digitalsnova.com/portal/?store=' + sub,
                      message: `Store "${t.name}" (${sub}.digitalsnova.com) registered on ${t.planName || '3-Day Enterprise Trial'}! Admin: @${t.adminUsername || t.adminUser?.username || ('admin.' + sub)}`,
                      unread: false
                    });
                  }
                });
              }

              notifs = Array.from(notifMap.values()).sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              localStorage.setItem('digitalsnova_superadmin_notifications', JSON.stringify(notifs.slice(0, 50)));
            }
          }
        } catch (e) {}
        setNotifications(notifs);
      } catch {}
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 4000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Safe Fallback Arrays - Combined from props and live server poll
  const tenantMap = new Map();
  (Array.isArray(allTenants) ? allTenants : []).forEach(t => { if (t && (t.id || t.subdomain)) tenantMap.set(t.id || t.subdomain, t); });
  cloudTenants.forEach(t => { if (t && (t.id || t.subdomain)) tenantMap.set(t.id || t.subdomain, t); });
  try {
    const localReg = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]');
    if (Array.isArray(localReg)) {
      localReg.forEach(t => { if (t && (t.id || t.subdomain) && !tenantMap.has(t.id || t.subdomain)) tenantMap.set(t.id || t.subdomain, t); });
    }
  } catch {}
  const safeTenants = Array.from(tenantMap.values());
  const safeCronLogs = Array.isArray(cronLogs) ? cronLogs : [];
  const safeLicenseKeys = Array.isArray(licenseKeys) ? licenseKeys : [];
  const safePasswordRequests = Array.isArray(passwordResetRequests) ? passwordResetRequests : [];

  const totalMRR = safeTenants.reduce((sum, t) => sum + Number(t?.monthlyFee || 0), 0);
  const activeTenants = safeTenants.filter((t) => t?.subscription?.state === 'ACTIVE');
  const graceTenants = safeTenants.filter((t) => t?.subscription?.state === 'GRACE_PERIOD');
  const lockedTenants = safeTenants.filter((t) => t?.subscription?.state === 'LOCKED');

  const pendingPasswordRequests = safePasswordRequests.filter((r) => r?.status === 'PENDING');
  const inspectedTenant = safeTenants.find((t) => t?.id === inspectedTenantId) || null;

  const monthlyTenantsCount = safeTenants.filter((t) => (t.planType || 'MONTHLY') === 'MONTHLY').length;
  const yearlyTenantsCount = safeTenants.filter((t) => t.planType === 'YEARLY').length;
  const threeYearTenantsCount = safeTenants.filter((t) => t.planType === '3_YEARS').length;
  const trialTenantsCount = safeTenants.filter((t) => t.planType === 'TRIAL_3_DAYS').length;

  const openClientDetailsModal = (tenantObj) => {
    setInspectedTenantId(tenantObj.id);
    const pType = tenantObj.planType || 'MONTHLY';
    let cDays = 30;
    if (tenantObj.cycleDays) {
      cDays = Number(tenantObj.cycleDays);
    } else if (pType === 'TRIAL_3_DAYS') {
      cDays = 3;
    } else if (pType === 'YEARLY') {
      cDays = 365;
    } else if (pType === '3_YEARS') {
      cDays = 1095;
    }

    setEditClientForm({
      name: tenantObj.name || '',
      logoUrl: tenantObj.logoUrl || '',
      address: tenantObj.address || '',
      phone: tenantObj.phone || '',
      planType: pType,
      cycleDays: cDays,
      monthlyFee: tenantObj.monthlyFee !== undefined ? tenantObj.monthlyFee : 7999,
      adminPin: tenantObj.adminPin || '1234',
      adminName: tenantObj.adminUser?.name || `${tenantObj.name} Admin`,
      adminUsername: tenantObj.adminUser?.username || `admin.${tenantObj.subdomain}`,
      adminPassword: tenantObj.adminUser?.password || '123',
      packagePreset:
        tenantObj.enabledModules?.pos && tenantObj.enabledModules?.patientsLedger
          ? 'FULL_CLINIC'
          : !tenantObj.enabledModules?.patientsLedger
          ? 'STORE_ONLY'
          : 'OPD_ONLY',
      enabledModules: tenantObj.enabledModules || { pos: true, inventory: true, patientsLedger: true }
    });
  };

  // Direct Image Upload helper for SaaS Platform Logo or Client Logo
  const handleQuickSaaSLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string' && onSavePlatformBrand) {
        await onSavePlatformBrand({
          ...(platformBrand || {}),
          logoUrl: dataUrl
        });
        setFeedback('Main SaaS Platform Logo (Top-Left Header & Login Screen) uploaded & updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClientModalLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        setEditClientForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePresetChange = (preset) => {
    if (preset === 'STORE_ONLY') {
      setNewClinic((prev) => ({
        ...prev,
        packagePreset: 'STORE_ONLY',
        enabledModules: { pos: true, inventory: true, patientsLedger: false }
      }));
    } else if (preset === 'OPD_ONLY') {
      setNewClinic((prev) => ({
        ...prev,
        packagePreset: 'OPD_ONLY',
        enabledModules: { pos: false, inventory: false, patientsLedger: true }
      }));
    } else {
      setNewClinic((prev) => ({
        ...prev,
        packagePreset: 'FULL_CLINIC',
        enabledModules: { pos: true, inventory: true, patientsLedger: true }
      }));
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* 4 Clickable Global SaaS KPI Cards (Whichever card is clicked turns Solid Vibrant Color - Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSelectedSaaSKpi('MRR')}
          className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
            selectedSaaSKpi === 'MRR'
              ? 'bg-navy text-white ring-4 ring-gold shadow-xl'
              : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-navy hover:shadow-md'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
              selectedSaaSKpi === 'MRR' ? 'text-gold-bright' : 'text-slate-500'
            }`}
          >
            <span>Global Monthly Revenue (MRR)</span>
            <ExternalLink
              className={`w-4 h-4 shrink-0 ${
                selectedSaaSKpi === 'MRR' ? 'text-gold-bright' : 'text-navy opacity-70'
              }`}
            />
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight my-1.5 ${
              selectedSaaSKpi === 'MRR' ? 'text-white' : 'text-navy'
            }`}
          >
            Rs. {totalMRR.toLocaleString()}
          </div>
          <div
            className={`text-xs flex items-center justify-between pt-1 border-t ${
              selectedSaaSKpi === 'MRR'
                ? 'text-ice/90 border-white/15'
                : 'text-slate-500 border-slate-100'
            }`}
          >
            <span>Across {safeTenants.length} Registered Stores</span>
            <span
              className={`underline font-bold ${
                selectedSaaSKpi === 'MRR' ? 'text-gold-bright' : 'text-navy'
              }`}
            >
              Open Page →
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSaaSKpi('ACTIVE')}
          className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
            selectedSaaSKpi === 'ACTIVE'
              ? 'bg-emerald-700 text-white ring-4 ring-gold shadow-xl'
              : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-emerald-600 hover:shadow-md'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
              selectedSaaSKpi === 'ACTIVE' ? 'text-gold-bright' : 'text-slate-500'
            }`}
          >
            <span>Active Businesses / Stores</span>
            <ExternalLink
              className={`w-4 h-4 shrink-0 ${
                selectedSaaSKpi === 'ACTIVE' ? 'text-gold-bright' : 'text-emerald-700'
              }`}
            />
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight my-1.5 ${
              selectedSaaSKpi === 'ACTIVE' ? 'text-white' : 'text-emerald-700'
            }`}
          >
            {activeTenants.length} {activeTenants.length === 1 ? 'Store' : 'Stores'}
          </div>
          <div
            className={`text-xs flex items-center justify-between pt-1 border-t ${
              selectedSaaSKpi === 'ACTIVE'
                ? 'text-emerald-100 border-white/15'
                : 'text-slate-500 border-slate-100'
            }`}
          >
            <span>Full POS & Ledger Access</span>
            <span
              className={`underline font-bold ${
                selectedSaaSKpi === 'ACTIVE' ? 'text-gold-bright' : 'text-emerald-800'
              }`}
            >
              Open Page →
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSaaSKpi('GRACE')}
          className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
            selectedSaaSKpi === 'GRACE'
              ? 'bg-amber-600 text-white ring-4 ring-gold shadow-xl'
              : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-amber-500 hover:shadow-md'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
              selectedSaaSKpi === 'GRACE' ? 'text-gold-bright' : 'text-slate-500'
            }`}
          >
            <span>3-Day Grace Period</span>
            <ExternalLink
              className={`w-4 h-4 shrink-0 ${
                selectedSaaSKpi === 'GRACE' ? 'text-gold-bright' : 'text-amber-600'
              }`}
            />
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight my-1.5 ${
              selectedSaaSKpi === 'GRACE' ? 'text-white' : 'text-amber-600'
            }`}
          >
            {graceTenants.length} {graceTenants.length === 1 ? 'Store' : 'Stores'}
          </div>
          <div
            className={`text-xs flex items-center justify-between pt-1 border-t ${
              selectedSaaSKpi === 'GRACE'
                ? 'text-amber-100 border-white/15'
                : 'text-amber-800 border-slate-100'
            }`}
          >
            <span>Top Warning Banner Active</span>
            <span
              className={`underline font-bold ${
                selectedSaaSKpi === 'GRACE' ? 'text-gold-bright' : 'text-amber-900'
              }`}
            >
              Open Page →
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSaaSKpi('LOCKED')}
          className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
            selectedSaaSKpi === 'LOCKED'
              ? 'bg-alert text-white ring-4 ring-gold shadow-xl'
              : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-alert hover:shadow-md'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
              selectedSaaSKpi === 'LOCKED' ? 'text-gold-bright' : 'text-slate-500'
            }`}
          >
            <span>Auto-Locked / Suspended</span>
            <ExternalLink
              className={`w-4 h-4 shrink-0 ${
                selectedSaaSKpi === 'LOCKED' ? 'text-gold-bright' : 'text-alert'
              }`}
            />
          </div>
          <div
            className={`text-3xl font-extrabold tracking-tight my-1.5 ${
              selectedSaaSKpi === 'LOCKED' ? 'text-white' : 'text-alert'
            }`}
          >
            {lockedTenants.length} {lockedTenants.length === 1 ? 'Store' : 'Stores'}
          </div>
          <div
            className={`text-xs flex items-center justify-between pt-1 border-t ${
              selectedSaaSKpi === 'LOCKED'
                ? 'text-red-100 border-white/15'
                : 'text-alert border-slate-100'
            }`}
          >
            <span>Full Lockout Enforced</span>
            <span
              className={`underline font-bold ${
                selectedSaaSKpi === 'LOCKED' ? 'text-gold-bright' : 'text-alert-dark'
              }`}
            >
              Open Page →
            </span>
          </div>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-Time Super Admin Master Notification & Registration Feed */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-navy">
                  Real-Time Store Registrations & Login Notification Feed
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE FEED
                </span>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-alert text-white">
                    {notifications.filter(n => n.unread).length} NEW
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Live stream of newly registered stores, 3-day trial provisions, and tenant first live logins.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const updated = notifications.map(n => ({ ...n, unread: false }));
                    setNotifications(updated);
                    localStorage.setItem('digitalsnova_superadmin_notifications', JSON.stringify(updated));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Mark All Read
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const now = Date.now();
                    localStorage.setItem('digitalsnova_notifications_cleared_at', String(now));
                    setNotifications([]);
                    localStorage.removeItem('digitalsnova_superadmin_notifications');
                    try {
                      await fetch('/api/sync.php?action=clear_notifications', { method: 'POST' });
                    } catch {}
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-alert font-bold text-xs transition cursor-pointer"
                >
                  Clear Feed
                </button>
              </>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center font-medium">
            ● Real-time alerts will appear here whenever a store or tenant registers or logs in for the first time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {notifications.slice(0, 12).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  n.unread
                    ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span className="uppercase text-amber-700 font-extrabold">{n.type?.replace('_', ' ') || 'ALERT'}</span>
                    <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-extrabold text-xs text-navy">{n.title || n.storeName}</div>
                  <div className="text-[11px] text-slate-600 mt-1">{n.message}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-300">
                      📦 Plan: {n.planName || (n.planType === 'YEARLY' ? '1-Year Annual Package' : (n.planType === 'MONTHLY' ? 'Standard Monthly Plan' : '3-Day Enterprise Trial'))}
                    </span>
                    {(n.businessType || n.business_type) && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        🏢 {n.businessType || n.business_type}
                      </span>
                    )}
                  </div>
                  {(n.adminUsername || n.adminUser) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-navy font-bold">Admin: <strong className="text-teal">@{n.adminUsername || n.adminUser}</strong></span>
                      {n.adminPassword && <span className="text-emerald-700 font-bold">Pass: <strong className="text-emerald-600">{n.adminPassword}</strong></span>}
                      {n.phone && <span className="text-slate-600 font-sans">📞 {n.phone}</span>}
                    </div>
                  )}
                </div>
                {n.subdomain && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] gap-2">
                    <a
                      href={`/portal/?store=${encodeURIComponent(n.subdomain)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-teal font-bold hover:underline truncate"
                      title={`Open live store URL: /portal/?store=${n.subdomain}`}
                    >
                      digitalsnova.com/portal/?store={n.subdomain} ↗
                    </a>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectTenant && onSelectTenant(n.subdomain)}
                        className="px-2 py-0.5 rounded-lg bg-teal text-white font-extrabold text-[10px] hover:bg-teal-dark flex items-center gap-1 cursor-pointer shadow-sm transition"
                        title={`Directly open and manage ${n.subdomain}'s store portal`}
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Access Portal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const targetT = safeTenants.find(t => t.subdomain === n.subdomain);
                          if (targetT) openClientDetailsModal(targetT);
                        }}
                        className="text-navy font-black hover:underline inline-flex items-center gap-1 text-[10px]"
                      >
                        Inspect <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SEPARATE DETAIL PAGES WHEN ANY OF THE 4 TOP SAAS BOXES IS CLICKED   */}
      {/* =================================================================== */}
      {selectedSaaSKpi && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-navy space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase bg-navy text-gold px-2.5 py-1 rounded-md font-extrabold tracking-wider">
                SEPARATE SAAS ANALYTICS PAGE • {selectedSaaSKpi}
              </span>
              <h3 className="font-extrabold text-lg text-navy mt-1.5">
                {selectedSaaSKpi === 'MRR' &&
                  `Global Monthly Recurring Revenue Breakdown — Rs. ${totalMRR.toLocaleString()} / Month`}
                {selectedSaaSKpi === 'ACTIVE' &&
                  `Active Cycle Stores (Days 1–30) — ${activeTenants.length} Stores`}
                {selectedSaaSKpi === 'GRACE' &&
                  `3-Day Grace Period Stores (Days 31–33) — ${graceTenants.length} Stores`}
                {selectedSaaSKpi === 'LOCKED' &&
                  `Auto-Locked / Suspended Stores (Day 34+ or Manual Block) — ${lockedTenants.length} Stores`}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSaaSKpi(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Super Admin Dashboard</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50/80">
                  <th className="py-3 px-3.5">Business Name & Subdomain</th>
                  <th className="py-3 px-3.5">Admin Username & Password</th>
                  <th className="py-3 px-3.5">Contact & Address</th>
                  <th className="py-3 px-3.5">Assigned Modules</th>
                  <th className="py-3 px-3.5">Billing Cycle</th>
                  <th className="py-3 px-3.5">Monthly Fee</th>
                  <th className="py-3 px-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedSaaSKpi === 'MRR'
                  ? allTenants
                  : selectedSaaSKpi === 'ACTIVE'
                  ? activeTenants
                  : selectedSaaSKpi === 'GRACE'
                  ? graceTenants
                  : lockedTenants
                ).map((t) => {
                  const mods = t.enabledModules || { pos: true, inventory: true, patientsLedger: true };
                  return (
                    <tr key={t.id} className="hover:bg-ice/30 transition">
                      <td className="py-3.5 px-3.5">
                        <button
                          type="button"
                          onClick={() => openClientDetailsModal(t)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-extrabold text-navy text-sm group-hover:text-teal flex items-center gap-1.5">
                            <span className="underline decoration-navy/30">{t.name}</span>
                            <Eye className="w-3.5 h-3.5 text-teal shrink-0" />
                          </div>
                          <div className="text-[11px] text-teal font-semibold mt-0.5">{t.domain}</div>
                        </button>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="inline-flex flex-col gap-0.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                          <div className="text-navy font-bold">
                            User: <span className="text-teal">@{t.adminUser?.username || `admin.${t.subdomain}`}</span>
                          </div>
                          <div className="text-emerald-700 font-bold">
                            Pass: {t.adminUser?.password || '123'} • PIN: {t.adminPin || '1234'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-800">{t.phone}</div>
                        <div className="text-[11px] text-slate-500">{t.address}</div>
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        {mods.patientsLedger === false ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px]">
                            Store / Pharmacy Only
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-teal/15 text-teal font-bold text-[11px]">
                            Full Clinic + Patients + Store
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                            t.subscription?.state === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.subscription?.state === 'GRACE_PERIOD'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-alert'
                          }`}
                        >
                          Day {t.billingCycleDay} • {t.subscription?.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 font-extrabold text-navy text-sm whitespace-nowrap">
                        Rs. {Number(t.monthlyFee).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openClientDetailsModal(t)}
                            className="px-3 py-1.5 rounded-xl bg-ice hover:bg-navy hover:text-gold text-navy font-bold text-[11px] transition"
                          >
                            Details & Login
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await onUnlockWebhook(t.id, 'SUPER_ADMIN_1_CLICK_UNLOCK');
                              setFeedback(`${t.name} unlocked & restored to Day 1!`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-navy hover:bg-navy-light text-gold font-bold text-[11px] transition"
                          >
                            1-Click Unlock
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectTenant(t.subdomain)}
                            className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-bold text-[11px] transition"
                          >
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registered Multi-Tenant Clinics Table & Feature / Module Control */}
      {!selectedSaaSKpi && (
        <>
          {/* =================================================================== */}
          {/* DEDICATED GLOBAL SAAS PRICING & SUBSCRIPTION TIERS MANAGEMENT WIDGET */}
          {/* =================================================================== */}
          <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden text-slate-200">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white tracking-tight">
                      Global SaaS Subscription Tiers & Pricing Management
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      LIVE PRICING ENGINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure live package pricing applied across portal registration, client self-service, and activation license key generators.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveGlobalPricing}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg ${
                  pricingSavedNotice
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{pricingSavedNotice ? '✓ Pricing Synced & Saved!' : 'Save & Apply Global Pricing'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* TIER 1: MONTHLY */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      MONTH-TO-MONTH
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {monthlyTenantsCount} Stores Active
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Standard Monthly Plan</h4>
                  <p className="text-[11px] text-slate-400 mb-3">30-Day automated recurring billing cycle</p>
                  <div className="space-y-1.5 mb-3 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Isolated Subdomain Workspace</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Full POS & Cashier Counter</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Thermal Slip & WhatsApp Slip</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Monthly Package Fee (Rs.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={globalPricing.monthlyFee}
                      onChange={(e) => setGlobalPricing({ ...globalPricing, monthlyFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-extrabold text-sm outline-none font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">/ Month</span>
                  </div>
                </div>
              </div>

              {/* TIER 2: 1-YEAR (SAVE 20%) */}
              <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      POPULAR • SAVE 20%
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {yearlyTenantsCount} Stores Active
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">1-Year Annual Package</h4>
                  <p className="text-[11px] text-slate-400 mb-3">365-Day continuous multi-tenant license</p>
                  <div className="space-y-1.5 mb-3 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Includes all Monthly features</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Free Cloud Database Backups</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Save ~Rs. 19,198 vs monthly</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Annual Package Fee (Rs.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={globalPricing.yearlyFee}
                      onChange={(e) => setGlobalPricing({ ...globalPricing, yearlyFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-cyan-500/50 focus:border-cyan-300 rounded-lg px-3 py-2 text-cyan-300 font-extrabold text-sm outline-none font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">/ Year</span>
                  </div>
                </div>
              </div>

              {/* TIER 3: 3-YEAR (BEST VALUE) */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ENTERPRISE • BEST VALUE
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {threeYearTenantsCount} Stores Active
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">3-Year Long Term License</h4>
                  <p className="text-[11px] text-slate-400 mb-3">1095-Day multi-year locked license rate</p>
                  <div className="space-y-1.5 mb-3 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Full Healthcare & OPD Suite</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Dedicated SLA & WhatsApp Support</div>
                    <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Maximum Long-Term Savings</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">3-Year Package Fee (Rs.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={globalPricing.threeYearFee}
                      onChange={(e) => setGlobalPricing({ ...globalPricing, threeYearFee: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-extrabold text-sm outline-none font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">/ 3 Yrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal" />
                  <span>Multi-Tenant Stores, Module Access & Subscription Lifecycle Control</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Click on any Store Name or <strong>"Details & Login"</strong> button to view or change that client's Admin Username, Password, PIN, and full account details.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const res = await onTriggerMidnightCron();
                  if (res?.log) {
                    setFeedback(res.log.summary);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-gold-bright font-extrabold text-xs flex items-center gap-2 shadow transition"
              >
                <Clock className="w-4 h-4" />
                <span>Run Daily Midnight Cron Job (+1 Billing Day All Clinics)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50/80">
                    <th className="py-3 px-3.5">Business, Subdomain & Login Credentials (Click for Details)</th>
                    <th className="py-3 px-3.5">Client Package / Assigned Modules</th>
                    <th className="py-3 px-3.5">Cycle Day & Status</th>
                    <th className="py-3 px-3.5">Simulate Billing Day</th>
                    <th className="py-3 px-3.5">Details / Unlock / Block / Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeTenants.map((t) => {
                    const state = t.subscription?.state;
                    const isSelected = currentTenant?.id === t.id;
                    const mods = t.enabledModules || {
                      pos: true,
                      inventory: true,
                      patientsLedger: true
                    };
                    const isStoreOnly = mods.patientsLedger === false;
                    const adminUserStr = t.adminUser?.username || `admin.${t.subdomain}`;
                    const adminPassStr = t.adminUser?.password || '123';

                    return (
                      <tr
                        key={t.id}
                        className={`${isSelected ? 'bg-ice/50' : 'hover:bg-ice/20'} transition`}
                      >
                        <td className="py-3.5 px-3.5">
                          <button
                            type="button"
                            onClick={() => openClientDetailsModal(t)}
                            className="text-left group cursor-pointer"
                            title="Click to open full Client Details, Admin Username & Password"
                          >
                            <div className="font-extrabold text-navy text-sm flex items-center gap-1.5 group-hover:text-teal transition">
                              <span className="underline decoration-navy/40">{t.name}</span>
                              <Eye className="w-3.5 h-3.5 text-teal shrink-0" />
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded bg-navy text-gold text-[10px] font-bold no-underline">
                                  ACTIVE VIEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-teal font-semibold mt-0.5">
                              {t.domain} • Rs. {Number(t.monthlyFee).toLocaleString()}/mo
                            </div>
                            {/* Direct Admin Login Credentials Badge */}
                            <div className="mt-1.5 inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-lg bg-navy/5 border border-navy/15 text-[11px]">
                              <span className="font-bold text-navy">
                                User: <strong className="text-teal">@{adminUserStr}</strong>
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-bold text-navy">
                                Pass: <strong className="text-emerald-700">{adminPassStr}</strong>
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="font-bold text-navy">
                                PIN: <strong>{t.adminPin || '1234'}</strong>
                              </span>
                            </div>
                          </button>
                        </td>

                        {/* Client Package / Assigned Modules Switcher */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, {
                                    enabledModules: {
                                      pos: true,
                                      inventory: true,
                                      patientsLedger: true
                                    }
                                  });
                                  setFeedback(
                                    `${t.name} switched to FULL CLINIC MODE (POS + Store + Patient Ledger)`
                                  );
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 border transition ${
                                  !isStoreOnly
                                    ? 'bg-teal text-white border-teal'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Full Clinic + Patients</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, {
                                    enabledModules: {
                                      pos: true,
                                      inventory: true,
                                      patientsLedger: false
                                    }
                                  });
                                  setFeedback(
                                    `${t.name} switched to STORE / PHARMACY ONLY MODE (Patient system hidden!)`
                                  );
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 border transition ${
                                  isStoreOnly
                                    ? 'bg-navy text-gold border-navy'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                <Store className="w-3.5 h-3.5" />
                                <span>Store / Stock Only</span>
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {isStoreOnly
                                ? 'Only POS Billing & Stock/Inventory visible'
                                : 'All Modules: POS + Stock + Patient Ledger'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                t.planType === 'TRIAL_3_DAYS'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : t.planType === 'YEARLY'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : t.planType === '3_YEARS'
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                  : t.planType === 'CUSTOM'
                                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : 'bg-teal/15 text-teal border border-teal/30'
                              }`}
                            >
                              {t.planType === 'TRIAL_3_DAYS'
                                ? '3-Day Free Trial'
                                : t.planType === 'YEARLY'
                                ? '1-Year Plan (365d)'
                                : t.planType === '3_YEARS'
                                ? '3-Year Plan (1095d)'
                                : t.planType === 'CUSTOM'
                                ? `Custom (${t.cycleDays || 30}d)`
                                : 'Monthly (30d)'}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                                state === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : state === 'GRACE_PERIOD'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-red-100 text-alert'
                              }`}
                            >
                              {state} • Day {t.billingCycleDay}/{t.subscription?.totalDays || 30}
                            </span>

                            {/* Direct Quick Plan Switcher (Image 2 Custom Changing) */}
                            <select
                              value={t.planType || 'MONTHLY'}
                              onChange={async (e) => {
                                const newP = e.target.value;
                                let days = 30;
                                let fee = Number(t.monthlyFee || 15000);
                                if (newP === 'TRIAL_3_DAYS') {
                                  days = 3;
                                  fee = 0;
                                } else if (newP === 'YEARLY') {
                                  days = 365;
                                  fee = 150000;
                                } else if (newP === '3_YEARS') {
                                  days = 1095;
                                  fee = 400000;
                                }
                                await onUpdateTenant(t.id, {
                                  planType: newP,
                                  cycleDays: days,
                                  monthlyFee: fee
                                });
                                setFeedback(
                                  `${t.name} plan updated to ${newP} (${days} Days • Rs. ${fee.toLocaleString()})!`
                                );
                              }}
                              className="mt-1 bg-white border border-slate-300 hover:border-navy font-bold text-[10px] px-1.5 py-0.5 rounded outline-none cursor-pointer text-navy"
                              title="Quick Change Plan Duration"
                            >
                              <option value="TRIAL_3_DAYS">Plan: 3-Day Free Trial (3d)</option>
                              <option value="MONTHLY">Plan: Monthly (30d)</option>
                              <option value="YEARLY">Plan: 1-Year (365d)</option>
                              <option value="3_YEARS">Plan: 3-Year (1095d)</option>
                              <option value="CUSTOM">Plan: Custom Duration</option>
                            </select>
                          </div>
                          {t.subscription?.bannerMessage && (
                            <div className="text-[10px] text-alert font-semibold mt-1 max-w-[200px] whitespace-normal">
                              {t.subscription.bannerMessage}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, { billingCycleDay: 1, manualBlocked: false });
                                  setFeedback(`${t.name} reset to Day 1 (Full Active Cycle)`);
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-extrabold text-[10px]"
                                title="Reset to Day 1"
                              >
                                Day 1
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, { billingCycleDay: 14, manualBlocked: false });
                                  setFeedback(`${t.name} set to Day 14 (Mid-Cycle)`);
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]"
                              >
                                Day 14
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, { billingCycleDay: 32, manualBlocked: false });
                                  setFeedback(`${t.name} set to Day 32 (Grace Period)`);
                                }}
                                className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]"
                              >
                                Day 32
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await onUpdateTenant(t.id, { billingCycleDay: 34, manualBlocked: false });
                                  setFeedback(`${t.name} set to Day 34 (Auto-Lock)`);
                                }}
                                className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-alert border border-red-300 font-bold text-[10px]"
                              >
                                Day 34
                              </button>
                            </div>

                            {/* Direct Custom Day Editor Input (Image 2 Custom Changing) */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">Set Day:</span>
                              <input
                                type="number"
                                min="1"
                                max="2000"
                                defaultValue={t.billingCycleDay}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const d = Number(e.target.value);
                                    if (d > 0) {
                                      await onUpdateTenant(t.id, { billingCycleDay: d });
                                      setFeedback(`${t.name} cycle day set to Day ${d}`);
                                    }
                                  }
                                }}
                                className="w-12 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-xs font-bold text-navy bg-white outline-none focus:border-navy"
                                title="Type Day number and press Set or Enter"
                              />
                              <button
                                type="button"
                                onClick={async (e) => {
                                  const inp = e.currentTarget.previousSibling;
                                  const d = Number(inp?.value);
                                  if (d > 0) {
                                    await onUpdateTenant(t.id, { billingCycleDay: d });
                                    setFeedback(`${t.name} cycle day set to Day ${d}`);
                                  }
                                }}
                                className="px-2 py-0.5 rounded bg-navy text-gold text-[10px] font-bold cursor-pointer"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {/* 1-Click Key Generator for this Clinic */}
                            <button
                              type="button"
                              onClick={() => {
                                setKeyGenTenant(t);
                                setKeyGenPlan(t.planType || 'MONTHLY');
                                setKeyGenDays(t.cycleDays || 30);
                                setKeyGenFee(t.monthlyFee !== undefined ? t.monthlyFee : 15000);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-[11px] flex items-center gap-1 transition cursor-pointer"
                              title="Generate Activation License Key for this Clinic"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                              <span>Gen Key</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openClientDetailsModal(t)}
                              className="px-2.5 py-1.5 rounded-xl bg-gold/25 hover:bg-gold text-navy border border-gold font-extrabold text-[11px] flex items-center gap-1"
                              title="View & Edit Client Admin Username, Password & Details"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Details & Login</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await onUnlockWebhook(t.id, 'SUPER_ADMIN_1_CLICK_UNLOCK');
                                setFeedback(`${t.name} unlocked & restored to Day 1!`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-navy hover:bg-navy-light text-gold font-bold text-[11px] flex items-center gap-1"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Unlock</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateTenant(t.id, { manualBlocked: !t.manualBlocked })
                              }
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 ${
                                t.manualBlocked
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-alert/10 text-alert border border-alert/30'
                              }`}
                            >
                              <Lock className="w-3 h-3" />
                              <span>{t.manualBlocked ? 'Unblock' : 'Block'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onSelectTenant(t.subdomain)}
                              className="px-2.5 py-1.5 rounded-xl bg-teal text-white font-bold text-[11px]"
                            >
                              Open
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `⚠️ PERMANENT TENANT DELETION CONFIRMATION\n\nAre you sure you want to permanently delete "\${t.name}" (\${t.domain})?\n\nThis will remove all associated database records, cash registers, patient files, and staff logins. This action cannot be undone.`
                                  )
                                ) {
                                  await onDeleteTenant(t.id);
                                  setFeedback(`✓ Successfully deleted clinic "\${t.name}" from SaaS platform.`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 font-extrabold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-sm"
                              title="Permanently Delete Tenant Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================================================================= */}
          {/* DIGITAL SNOVE LICENSE & ACTIVATION KEY CENTER (SaaS Admin Portal)  */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-purple-300 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-700" />
                  <span>Digital Snove License & Activation Key Generator</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Generate Activation Keys for clients upon subscription payment. Clients paste this key in their portal (Subscription tab) to unlock or renew.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (safeTenants.length > 0) {
                    setKeyGenTenant(safeTenants[0]);
                    setKeyGenPlan('MONTHLY');
                    setKeyGenDays(30);
                    setKeyGenFee(safeTenants[0].monthlyFee || 15000);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-gold-bright" />
                <span>+ Generate New License Key</span>
              </button>
            </div>

            {/* List of Generated License Keys */}
            {safeLicenseKeys.length === 0 ? (
              <div className="p-6 rounded-xl bg-ice/30 border border-slate-200 text-center text-xs text-slate-500">
                No License Keys generated yet. Click <strong>"Gen Key"</strong> on any clinic row above or click <strong>"+ Generate New License Key"</strong>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] uppercase text-slate-500 bg-slate-50">
                      <th className="py-2.5 px-3">License Key Code</th>
                      <th className="py-2.5 px-3">Clinic / Tenant</th>
                      <th className="py-2.5 px-3">Package & Duration</th>
                      <th className="py-2.5 px-3">Fee (Rs.)</th>
                      <th className="py-2.5 px-3">Key Status</th>
                      <th className="py-2.5 px-3">Generated Date</th>
                      <th className="py-2.5 px-3 text-right">Copy & Send</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeLicenseKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-purple-50/30">
                        <td className="py-3 px-3 font-mono font-black text-sm text-purple-900 tracking-wider">
                          {k.keyCode}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-navy">{k.tenantName}</div>
                          <div className="text-[10px] font-mono text-teal">{k.subdomain}.digitalsnova.com</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              k.planType === 'TRIAL_3_DAYS'
                                ? 'bg-purple-100 text-purple-900'
                                : k.planType === 'YEARLY'
                                ? 'bg-blue-100 text-blue-900'
                                : k.planType === '3_YEARS'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-teal/15 text-teal'
                            }`}
                          >
                            {k.planType} ({k.cycleDays} Days)
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-navy">
                          Rs. {Number(k.fee).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              k.status === 'ACTIVATED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : k.status === 'REVOKED' || k.status === 'INACTIVE'
                                ? 'bg-red-100 text-alert border border-red-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {k.status === 'ACTIVATED'
                              ? '✓ ACTIVATED'
                              : k.status === 'REVOKED' || k.status === 'INACTIVE'
                              ? '✕ INACTIVE / REVOKED'
                              : 'READY TO SEND'}
                          </span>
                          {k.activatedAt && (
                            <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {new Date(k.activatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(k.keyCode);
                                setCopiedKeyId(k.id);
                                setFeedback(`Copied License Key "${k.keyCode}" to clipboard!`);
                                setTimeout(() => setCopiedKeyId(null), 3000);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] shadow transition cursor-pointer"
                            >
                              {copiedKeyId === k.id ? '✓ Copied!' : 'Copy Key'}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    k.status === 'REVOKED' || k.status === 'INACTIVE'
                                      ? `Re-activate license key "${k.keyCode}"?`
                                      : `Inactivate / Revoke license key "${k.keyCode}"? If a clinic is using it, their portal will be locked.`
                                  )
                                ) {
                                  await onToggleLicenseKeyStatus(k.id);
                                  setFeedback(
                                    `Key "${k.keyCode}" status updated to ${
                                      k.status === 'REVOKED' || k.status === 'INACTIVE' ? 'READY' : 'REVOKED'
                                    }`
                                  );
                                }
                              }}
                              className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                                k.status === 'REVOKED' || k.status === 'INACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-red-50 text-alert border-red-300 hover:bg-alert hover:text-white'
                              }`}
                              title={
                                k.status === 'REVOKED' || k.status === 'INACTIVE'
                                  ? 'Restore / Re-activate Key'
                                  : 'Inactivate / Revoke Key'
                              }
                            >
                              {k.status === 'REVOKED' || k.status === 'INACTIVE' ? 'Restore' : 'Revoke'}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Permanently delete license key "${k.keyCode}"? This cannot be undone.`
                                  )
                                ) {
                                  if (onDeleteLicenseKey) {
                                    await onDeleteLicenseKey(k.id);
                                    setFeedback(`License key "${k.keyCode}" deleted successfully.`);
                                  }
                                }
                              }}
                              className="px-2 py-1 rounded-xl text-[10px] font-bold border border-red-300 bg-red-50 text-alert hover:bg-alert hover:text-white transition cursor-pointer flex items-center gap-1"
                              title="Delete Key Permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Grid: Onboard New Tenant Clinic + Cron Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-sm text-navy mb-1 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal" />
                <span>Provision New Multi-Tenant Client & Set Initial Admin Login</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Set the client's subdomain, choose what modules they get (Full Clinic vs Store Only), and assign their initial Admin Username & Password.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await onCreateTenant(newClinic);
                    if (res?.tenant) {
                      setFeedback(
                        `Provisioned "${res.tenant.name}" (${res.tenant.domain}) with Admin Login: @${
                          newClinic.adminUsername || `admin.${res.tenant.subdomain}`
                        }`
                      );
                      setNewClinic({
                        name: '',
                        subdomain: '',
                        address: '',
                        phone: '',
                        planType: 'MONTHLY',
                        cycleDays: 30,
                        monthlyFee: 15000,
                        adminName: '',
                        adminUsername: '',
                        adminPassword: '123',
                        adminPin: '1234',
                        packagePreset: 'FULL_CLINIC',
                        enabledModules: { pos: true, inventory: true, patientsLedger: true }
                      });
                    }
                  } catch (err) {
                    setFeedback(`Error: ${err.message}`);
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Clinic / Pharmacy / Store Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PrimeCare Aesthetics or MedPlus Store"
                      value={newClinic.name}
                      onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">Wildcard Subdomain</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="primecare"
                        value={newClinic.subdomain}
                        onChange={(e) => {
                          const sub = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setNewClinic({
                            ...newClinic,
                            subdomain: sub,
                            adminUsername: newClinic.adminUsername || (sub ? `admin.${sub}` : '')
                          });
                        }}
                        className="flex-1 px-3 py-2 rounded-l-xl border border-slate-300 font-bold text-navy"
                      />
                      <span className="px-2.5 py-2 bg-navy text-gold rounded-r-xl font-bold text-[11px]">
                        .digitalsnova.com
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Package Type Selector: Full Clinic vs Store Only vs OPD Only */}
                <div className="p-3 rounded-xl bg-ice/50 border border-navy/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-navy uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal" />
                      <span>Granular Licensed Modules Package</span>
                    </label>
                    <span className="font-mono text-[10px] bg-teal text-white px-2 py-0.5 rounded font-bold">
                      {newClinic.packagePreset === 'STORE_ONLY'
                        ? 'Store / Pharmacy Only'
                        : newClinic.packagePreset === 'OPD_ONLY'
                        ? 'OPD & Patient Ledger Only'
                        : 'Full Clinic & HMS'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePresetChange('FULL_CLINIC')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        newClinic.packagePreset === 'FULL_CLINIC'
                          ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-gold shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs">Full Clinic & HMS</div>
                        <div className="text-[10px] opacity-80">
                          POS + Stock + Patient Sessions
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('STORE_ONLY')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        newClinic.packagePreset === 'STORE_ONLY'
                          ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-gold shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs">Store / Pharmacy Only</div>
                        <div className="text-[10px] opacity-80">
                          POS & Stock (Hides OPD Ledgers)
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('OPD_ONLY')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        newClinic.packagePreset === 'OPD_ONLY'
                          ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4 text-teal shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs">OPD & Ledger Only</div>
                        <div className="text-[10px] opacity-80">
                          Patient History (Hides Pharmacy)
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Initial Client Admin Username & Password Setup */}
                <div className="p-3 rounded-xl bg-teal/10 border border-teal/30 space-y-2.5">
                  <div className="font-extrabold text-teal flex items-center gap-1.5 text-[11px] uppercase">
                    <UserCheck className="w-4 h-4" />
                    <span>Client Admin Login Credentials (Client can later change in Profile)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admin Owner Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Ali"
                        value={newClinic.adminName}
                        onChange={(e) => setNewClinic({ ...newClinic, adminName: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-navy mb-1">Admin Username</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ali.admin"
                        value={newClinic.adminUsername}
                        onChange={(e) =>
                          setNewClinic({ ...newClinic, adminUsername: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-navy/40 bg-white font-bold text-navy"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-navy mb-1">Admin Password</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 123456"
                        value={newClinic.adminPassword}
                        onChange={(e) =>
                          setNewClinic({ ...newClinic, adminPassword: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-navy/40 bg-white font-bold text-navy"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscription Plan & Free Trial Selector (3-Day Free Trial, Monthly, 1 Year, 3 Years, Custom) */}
                <div className="p-3 rounded-xl bg-ice/50 border border-navy/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-navy uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Subscription Plan & Cycle Duration (Free Trial / Yearly / 3 Years)</span>
                    </label>
                    <span className="font-mono text-[10px] bg-navy text-gold px-2 py-0.5 rounded font-bold">
                      {newClinic.planType === 'TRIAL_3_DAYS'
                        ? '3-Day Free Trial'
                        : newClinic.planType === 'YEARLY'
                        ? '1-Year Plan (365 Days)'
                        : newClinic.planType === '3_YEARS'
                        ? '3-Year Plan (1095 Days)'
                        : newClinic.planType === 'CUSTOM'
                        ? `Custom (${newClinic.cycleDays} Days)`
                        : 'Monthly (30 Days)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setNewClinic({
                          ...newClinic,
                          planType: 'TRIAL_3_DAYS',
                          cycleDays: 3,
                          monthlyFee: 0
                        })
                      }
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        newClinic.planType === 'TRIAL_3_DAYS'
                          ? 'bg-navy text-gold border-navy shadow font-extrabold'
                          : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px]">3-Day Free Trial</div>
                      <div className="text-[9px] opacity-80">3 Days • Rs. 0</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNewClinic({
                          ...newClinic,
                          planType: 'MONTHLY',
                          cycleDays: 30,
                          monthlyFee: 7999
                        })
                      }
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        newClinic.planType === 'MONTHLY'
                          ? 'bg-navy text-gold border-navy shadow font-extrabold'
                          : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px]">Monthly Plan</div>
                      <div className="text-[9px] opacity-80">30 Days • Rs. 7,999</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNewClinic({
                          ...newClinic,
                          planType: 'YEARLY',
                          cycleDays: 365,
                          monthlyFee: 76790
                        })
                      }
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        newClinic.planType === 'YEARLY'
                          ? 'bg-navy text-gold border-navy shadow font-extrabold'
                          : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px]">1-Year Plan</div>
                      <div className="text-[9px] opacity-80">365 Days • Rs. 76,790</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNewClinic({
                          ...newClinic,
                          planType: '3_YEARS',
                          cycleDays: 1095,
                          monthlyFee: 229000
                        })
                      }
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        newClinic.planType === '3_YEARS'
                          ? 'bg-navy text-gold border-navy shadow font-extrabold'
                          : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[11px]">3-Year Plan</div>
                      <div className="text-[9px] opacity-80">1095 Days • Rs. 229,000</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {newClinic.planType === 'YEARLY'
                        ? '1-Year Package Fee (Rs.)'
                        : newClinic.planType === '3_YEARS'
                        ? '3-Year Package Fee (Rs.)'
                        : newClinic.planType === 'TRIAL_3_DAYS'
                        ? 'Trial Fee (Rs. 0)'
                        : 'Monthly Package Fee (Rs.)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={newClinic.monthlyFee}
                      onChange={(e) =>
                        setNewClinic({ ...newClinic, monthlyFee: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cycle Duration (Days)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newClinic.cycleDays}
                      onChange={(e) =>
                        setNewClinic({
                          ...newClinic,
                          cycleDays: Number(e.target.value),
                          planType: 'CUSTOM'
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Initial 4-Digit Admin PIN</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newClinic.adminPin}
                      onChange={(e) => setNewClinic({ ...newClinic, adminPin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs shadow transition cursor-pointer"
                >
                  + Launch Isolated Client Tenant & Create Admin Login
                </button>
              </form>
            </div>

            {/* Midnight Cron & Webhook Logs */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-sm text-navy mb-1 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-gold" />
                <span>Automated Midnight Cron Job & Payment Webhook Event Stream</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Tracks daily 00:00 subscription cycle increments, grace period warnings, auto-locks, and payment webhooks.
              </p>

              <div className="space-y-2 max-h-[390px] overflow-y-auto">
                {safeCronLogs.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-ice/30 border border-slate-200 text-xs"
                  >
                    <div className="text-[10px] text-slate-500 font-bold">
                      {new Date(c.timestamp).toLocaleString()}
                    </div>
                    <div className="text-navy font-semibold mt-0.5">{c.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* CLIENT FULL DETAILS & LOGIN CREDENTIALS MODAL                       */}
      {/* =================================================================== */}
      {inspectedTenant && editClientForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-navy shadow-2xl overflow-hidden my-6">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold text-navy font-extrabold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    {inspectedTenant.name} — Client Details & Login Credentials
                  </h3>
                  <p className="text-[11px] text-gold-bright">
                    Subdomain: {inspectedTenant.domain} • Status: {inspectedTenant.subscription?.state} (Day{' '}
                    {inspectedTenant.billingCycleDay})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectedTenantId(null);
                  setEditClientForm(null);
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingClient(true);
                try {
                  await onUpdateTenant(inspectedTenant.id, editClientForm);
                  setFeedback(
                    `Updated Details & Login Credentials for "${editClientForm.name}" (Admin: @${editClientForm.adminUsername} | Pass: ${editClientForm.adminPassword})`
                  );
                  setInspectedTenantId(null);
                  setEditClientForm(null);
                } catch (err) {
                  setFeedback(`Error: ${err.message}`);
                } finally {
                  setSavingClient(false);
                }
              }}
              className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto"
            >
              {/* Highlighted Client Admin Username & Password Box */}
              <div className="p-4 rounded-2xl bg-teal/10 border-2 border-teal/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal uppercase text-[11px] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Clinic Admin Login Credentials (View or Change Username & Password)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-navy text-gold font-bold text-[10px]">
                    Role: CLINIC_ADMIN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Owner Name</label>
                    <input
                      type="text"
                      required
                      value={editClientForm.adminName}
                      onChange={(e) =>
                        setEditClientForm({ ...editClientForm, adminName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">Admin Login Username</label>
                    <input
                      type="text"
                      required
                      value={editClientForm.adminUsername}
                      onChange={(e) =>
                        setEditClientForm({ ...editClientForm, adminUsername: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-navy bg-white font-extrabold text-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">Admin Login Password</label>
                    <div className="relative">
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        required
                        value={editClientForm.adminPassword}
                        onChange={(e) =>
                          setEditClientForm({ ...editClientForm, adminPassword: e.target.value })
                        }
                        className="w-full pl-3 pr-9 py-2 rounded-xl border-2 border-emerald-600 bg-white font-extrabold text-emerald-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword((p) => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-navy"
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Details, Logo Upload & 4-Digit Management PIN */}
              <div className="p-3.5 rounded-xl bg-ice/30 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {editClientForm.logoUrl ? (
                    <img
                      src={editClientForm.logoUrl}
                      alt={editClientForm.name}
                      className="h-12 w-auto max-w-[120px] rounded-xl bg-white border border-slate-200 px-2.5 py-1 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-teal text-white font-extrabold text-sm flex items-center justify-center">
                      {(editClientForm.name || 'CL').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-navy">Client Clinic Logo (Top-Right Profile & Receipt)</div>
                    <div className="text-[11px] text-slate-500">Upload image from computer or paste link below</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Client Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleClientModalLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                  {editClientForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditClientForm({ ...editClientForm, logoUrl: '' })}
                      className="p-2 rounded-xl bg-red-50 text-alert border border-red-200"
                      title="Remove Client Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinic / Store Name</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.name}
                    onChange={(e) => setEditClientForm({ ...editClientForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.phone}
                    onChange={(e) => setEditClientForm({ ...editClientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinic Address</label>
                  <input
                    type="text"
                    required
                    value={editClientForm.address}
                    onChange={(e) =>
                      setEditClientForm({ ...editClientForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Or Client Logo URL Link</label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={editClientForm.logoUrl || ''}
                    onChange={(e) =>
                      setEditClientForm({ ...editClientForm, logoUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editClientForm.planType === 'YEARLY'
                      ? '1-Year Package Fee (Rs.)'
                      : editClientForm.planType === '3_YEARS'
                      ? '3-Year Package Fee (Rs.)'
                      : editClientForm.planType === 'TRIAL_3_DAYS'
                      ? 'Trial Fee (Rs. 0)'
                      : 'Subscription Fee (Rs.)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editClientForm.monthlyFee}
                    onChange={(e) =>
                      setEditClientForm({ ...editClientForm, monthlyFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cycle Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editClientForm.cycleDays || 30}
                    onChange={(e) =>
                      setEditClientForm({
                        ...editClientForm,
                        cycleDays: Number(e.target.value),
                        planType: 'CUSTOM'
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">4-Digit POS Discount PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={editClientForm.adminPin}
                    onChange={(e) =>
                      setEditClientForm({ ...editClientForm, adminPin: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border-2 border-navy bg-ice/30 font-extrabold text-navy tracking-widest"
                  />
                </div>
              </div>

              {/* Subscription Plan Switcher in Modal */}
              <div className="p-3.5 rounded-2xl bg-ice/40 border border-navy/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-navy uppercase text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>Change Subscription Plan (3 Days Trial, Monthly, 1 Year, 3 Years, Custom)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-navy text-gold font-bold text-[10px]">
                    Current Plan: {editClientForm.planType || 'MONTHLY'} ({editClientForm.cycleDays || 30} Days)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        planType: 'TRIAL_3_DAYS',
                        cycleDays: 3,
                        monthlyFee: 0
                      })
                    }
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      editClientForm.planType === 'TRIAL_3_DAYS'
                        ? 'bg-navy text-gold border-navy shadow font-extrabold'
                        : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">3-Day Free Trial</div>
                    <div className="text-[9px] opacity-80">3 Days • Rs. 0</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        planType: 'MONTHLY',
                        cycleDays: 30,
                        monthlyFee: 7999
                      })
                    }
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      editClientForm.planType === 'MONTHLY'
                        ? 'bg-navy text-gold border-navy shadow font-extrabold'
                        : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">Monthly Plan</div>
                    <div className="text-[9px] opacity-80">30 Days • Rs. 7,999</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        planType: 'YEARLY',
                        cycleDays: 365,
                        monthlyFee: 76790
                      })
                    }
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      editClientForm.planType === 'YEARLY'
                        ? 'bg-navy text-gold border-navy shadow font-extrabold'
                        : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">1-Year Plan</div>
                    <div className="text-[9px] opacity-80">365 Days • Rs. 76,790</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        planType: '3_YEARS',
                        cycleDays: 1095,
                        monthlyFee: 229000
                      })
                    }
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      editClientForm.planType === '3_YEARS'
                        ? 'bg-navy text-gold border-navy shadow font-extrabold'
                        : 'bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px]">3-Year Plan</div>
                    <div className="text-[9px] opacity-80">1095 Days • Rs. 229,000</div>
                  </button>
                </div>
              </div>

              {/* Granular Licensed Module Package Selector in Edit Modal */}
              <div className="p-3.5 rounded-2xl bg-ice/40 border border-navy/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-navy uppercase text-[11px] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-teal" />
                    <span>Granular Licensed Modules Package</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal text-white font-bold text-[10px]">
                    {editClientForm.packagePreset === 'STORE_ONLY'
                      ? 'Store / Pharmacy Only'
                      : editClientForm.packagePreset === 'OPD_ONLY'
                      ? 'OPD & Patient Ledger Only'
                      : 'Full Clinic & HMS'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        packagePreset: 'FULL_CLINIC',
                        enabledModules: { pos: true, inventory: true, patientsLedger: true }
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      editClientForm.packagePreset === 'FULL_CLINIC'
                        ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-gold shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">Full Clinic & HMS</div>
                      <div className="text-[10px] opacity-80">POS + Stock + Patients</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        packagePreset: 'STORE_ONLY',
                        enabledModules: { pos: true, inventory: true, patientsLedger: false }
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      editClientForm.packagePreset === 'STORE_ONLY'
                        ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-gold shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">Store / Pharmacy Only</div>
                      <div className="text-[10px] opacity-80">Only POS & Stock</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditClientForm({
                        ...editClientForm,
                        packagePreset: 'OPD_ONLY',
                        enabledModules: { pos: false, inventory: false, patientsLedger: true }
                      })
                    }
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      editClientForm.packagePreset === 'OPD_ONLY'
                        ? 'bg-navy text-white border-navy shadow ring-2 ring-gold/50'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-teal shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">OPD & Ledger Only</div>
                      <div className="text-[10px] opacity-80">Patient History & Ledger</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Staff / Receptionist POS Logins under this Clinic */}
              <div className="p-4 rounded-2xl bg-ice/40 border border-slate-200 space-y-2">
                <div className="font-extrabold text-navy text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal" />
                  <span>
                    Receptionist / Staff POS Logins for {inspectedTenant.name} (
                    {(inspectedTenant.staffUsers || []).length})
                  </span>
                </div>
                {(inspectedTenant.staffUsers || []).length === 0 ? (
                  <div className="text-slate-500 text-[11px]">No staff accounts created yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(inspectedTenant.staffUsers || []).map((st) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-navy">{st.name}</div>
                          <div className="text-[11px] text-teal font-bold">
                            User: @{st.username} | Pass: {st.password || '123'}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            st.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-alert'
                          }`}
                        >
                          {st.active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInspectedTenantId(null);
                    setEditClientForm(null);
                    onSelectTenant(inspectedTenant.subdomain);
                  }}
                  className="px-4 py-3 rounded-xl bg-teal text-white font-extrabold text-xs"
                >
                  Open Cloud POS Portal →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={savingClient}
                    className="px-5 py-3 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs flex items-center gap-1.5 shadow"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{savingClient ? 'Saving...' : 'Save Client Credentials & Details'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectedTenantId(null);
                      setEditClientForm(null);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* KEY GENERATOR MODAL FOR SUPER ADMIN                                 */}
      {/* =================================================================== */}
      {keyGenTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-purple-500 shadow-2xl overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gold text-navy font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Generate License / Activation Key</h3>
                  <p className="text-xs text-purple-200">
                    Clinic: <strong className="text-white">{keyGenTenant.name}</strong> ({keyGenTenant.subdomain})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKeyGenTenant(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await onGenerateLicenseKey({
                    tenantId: keyGenTenant.id,
                    planType: keyGenPlan,
                    cycleDays: keyGenDays,
                    fee: keyGenFee,
                    notes: `Issued by Super Admin for ${keyGenTenant.name}`
                  });
                  if (res?.key) {
                    navigator.clipboard?.writeText(res.key.keyCode);
                    setFeedback(
                      `Generated Key "${res.key.keyCode}" for ${keyGenTenant.name} and copied to clipboard!`
                    );
                    setKeyGenTenant(null);
                  }
                } catch (err) {
                  setFeedback(`Error: ${err.message}`);
                }
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-navy mb-1">Target Clinic</label>
                <select
                  value={keyGenTenant.id}
                  onChange={(e) => {
                    const sel = safeTenants.find((t) => t.id === e.target.value);
                    if (sel) {
                      setKeyGenTenant(sel);
                      setKeyGenFee(sel.monthlyFee || 15000);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy bg-white"
                >
                  {safeTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain}.digitalsnova.com)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy mb-1.5">
                  Select License Package & Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyGenPlan('TRIAL_3_DAYS');
                      setKeyGenDays(3);
                      setKeyGenFee(0);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      keyGenPlan === 'TRIAL_3_DAYS'
                        ? 'bg-purple-900 text-white border-purple-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">3-Day Free Trial</div>
                    <div className="text-[10px] opacity-80">3 Days • Rs. 0</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setKeyGenPlan('MONTHLY');
                      setKeyGenDays(30);
                      setKeyGenFee(7999);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      keyGenPlan === 'MONTHLY'
                        ? 'bg-purple-900 text-white border-purple-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">Monthly Plan</div>
                    <div className="text-[10px] opacity-80">30 Days • Rs. 7,999</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setKeyGenPlan('YEARLY');
                      setKeyGenDays(365);
                      setKeyGenFee(76790);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      keyGenPlan === 'YEARLY'
                        ? 'bg-purple-900 text-white border-purple-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">1-Year Package</div>
                    <div className="text-[10px] opacity-80">365 Days • Rs. 76,790</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setKeyGenPlan('3_YEARS');
                      setKeyGenDays(1095);
                      setKeyGenFee(229000);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      keyGenPlan === '3_YEARS'
                        ? 'bg-purple-900 text-white border-purple-900 shadow'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs">3-Year Plan</div>
                    <div className="text-[10px] opacity-80">1095 Days • Rs. 229,000</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Fee (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={keyGenFee}
                    onChange={(e) => setKeyGenFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cycle Days Duration</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={keyGenDays}
                    onChange={(e) => setKeyGenDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px]">
                Upon generating, this key can be copied and sent to the client via WhatsApp. When the client enters it into their portal, their system will instantly activate!
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setKeyGenTenant(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-4 h-4 text-gold-bright" />
                  <span>Generate Key & Copy to Clipboard</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
