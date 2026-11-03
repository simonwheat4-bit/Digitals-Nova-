import React, { useState } from 'react';
import { isClinicBusiness, isRestaurantBusiness, isPharmacyBusiness, isRetailMartBusiness, getSectorLabel } from '../utils/businessTypes.js';
import {
  LayoutDashboard,
  Crown,
  Shield,
  Stethoscope,
  ShoppingCart,
  Layers,
  Barcode,
  Receipt,
  BarChart3,
  Package,
  KeyRound,
  Palette,
  CreditCard,
  BellRing,
  Globe,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Lock,
  MessageSquare
} from 'lucide-react';

export default function HostingerSidebar({
  collapsed,
  onToggleCollapse,
  activeRole,
  onSelectRole,
  canViewClinicAdmin,
  canViewSuperAdmin,
  currentTenant,
  loggedInUser,
  platformBrand,
  clinicSection,
  onSelectClinicSection,
  posSubTab,
  onSelectPosSubTab,
  pendingDiscountsCount = 0,
  pendingResetCount = 0,
  onGoToDashboard
}) {
  const [clinicMenuOpen, setClinicMenuOpen] = useState(true);
  const [posMenuOpen, setPosMenuOpen] = useState(true);
  const [superMenuOpen, setSuperMenuOpen] = useState(true);

  const isSuperAdminView = activeRole === 'SUPER_ADMIN';
  const isClinic = isClinicBusiness(currentTenant);
  const isRestaurant = isRestaurantBusiness(currentTenant);
  const isPharmacy = isPharmacyBusiness(currentTenant);
  const isRetail = isRetailMartBusiness(currentTenant);
  const subState = currentTenant?.subscription?.state || 'ACTIVE';
  const cycleDay = currentTenant?.billingCycleDay || 1;
  const totalDays = currentTenant?.cycleDays || 30;
  const enabledMods = currentTenant?.enabledModules || {
    pos: true,
    inventory: true,
    patientsLedger: true
  };

  const handleBrandClick = () => {
    if (onGoToDashboard) {
      onGoToDashboard();
    } else if (isSuperAdminView) {
      onSelectRole('SUPER_ADMIN');
    } else if (activeRole === 'CLINIC_ADMIN') {
      onSelectClinicSection('APPROVALS_AND_REPORTS');
    } else {
      onSelectPosSubTab('POS');
    }
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 ease-in-out select-none z-40 shrink-0 shadow-2xl`}
    >
      {/* 1. TOP BRAND & CLINIC IDENTITY */}
      <div className="flex flex-col border-b border-slate-800/70 p-3.5">
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <button
              type="button"
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group hover:opacity-95 transition"
              title="Click to open Main Dashboard"
            >
              {platformBrand?.logoUrl ? (
                <img
                  src={platformBrand.logoUrl}
                  alt={platformBrand.name}
                  className="h-9 w-auto max-w-[90px] rounded-lg bg-white px-2 py-0.5 object-contain shadow-sm shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0">
                  {(platformBrand?.name || 'DS').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-white tracking-tight truncate group-hover:text-blue-400 transition">
                  {platformBrand?.name || 'DigitalsNova'}
                </div>
                <div className="text-[10px] text-blue-400 font-mono truncate">
                  {isSuperAdminView ? 'cloud.digitalsnova.com' : (currentTenant?.domain || 'portal.digitalsnova.com')}
                </div>
              </div>
            </button>
          )}

          {collapsed && (
            <button
              type="button"
              onClick={handleBrandClick}
              className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md cursor-pointer hover:opacity-90"
              title="Click to open Main Dashboard"
            >
              {(platformBrand?.name || 'DS').slice(0, 2).toUpperCase()}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0 hidden md:flex items-center justify-center"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar (Frees up screen)'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Chip:
            - When on SUPER_ADMIN: Shows strictly SaaS Master Cloud Status (NEVER any client name!)
            - When on CLINIC_ADMIN / STAFF: Shows Client's clinic name & subscription cycle */}
        {!collapsed && (
          isSuperAdminView ? (
            <div className="mt-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold text-amber-300 truncate text-[11px]">
                  SaaS Master Central
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-amber-500/20 text-amber-300 shrink-0">
                Global Root
              </span>
            </div>
          ) : (
            <div className="mt-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    subState === 'ACTIVE'
                      ? 'bg-emerald-400 animate-pulse'
                      : subState === 'GRACE_PERIOD'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-bold text-white truncate text-[10px]">
                    {currentTenant?.name || loggedInUser?.tenantName || loggedInUser?.clinicName || 'My Facility'}
                  </div>
                  <div className="text-[9px] font-semibold text-blue-400 truncate">
                    {getSectorLabel(currentTenant)}
                  </div>
                </div>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold shrink-0 ${
                  subState === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : subState === 'GRACE_PERIOD'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                Day {cycleDay}/{totalDays}
              </span>
            </div>
          )
        )}
      </div>

      {/* 2. NAVIGATION LIST (Hostinger hPanel Accordion Style) */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs font-semibold">
        {/* SECTION: ROLES & PANELS SWITCHER */}
        <div>
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
              Primary Workspace
            </div>
          )}

          <div className="space-y-1">
            {/* POS Role */}
            <button
              type="button"
              onClick={() => onSelectRole('STAFF')}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                activeRole === 'STAFF'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
              title="3. Cashier / POS Counter"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="font-bold text-xs truncate">3. Cashier / POS</span>}
              </div>
              {!collapsed && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeRole === 'STAFF' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  Billing
                </span>
              )}
            </button>

            {/* Admin Role */}
            {canViewClinicAdmin && (
              <button
                type="button"
                onClick={() => onSelectRole('CLINIC_ADMIN')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  activeRole === 'CLINIC_ADMIN'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
                title="2. Store Admin Portal"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Shield className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="font-bold text-xs truncate">2. Admin</span>}
                </div>
                {!collapsed && (pendingDiscountsCount + pendingResetCount > 0) && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[9px]">
                    {pendingDiscountsCount + pendingResetCount}
                  </span>
                )}
              </button>
            )}

            {/* Super Admin Role */}
            {canViewSuperAdmin && (
              <button
                type="button"
                onClick={() => onSelectRole('SUPER_ADMIN')}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                  activeRole === 'SUPER_ADMIN'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
                title="1. SaaS Platform Super Admin"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  {!collapsed && <span className="font-bold text-xs truncate">1. Super Admin</span>}
                </div>
                {!collapsed && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    activeRole === 'SUPER_ADMIN' ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
                  }`}>
                    SaaS
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* SECTION: MODULES ACCORDION WHEN ON CLINIC ADMIN */}
        {activeRole === 'CLINIC_ADMIN' && (
          <div className="space-y-1 pt-1 border-t border-slate-800/70">
            {!collapsed && (
              <div
                onClick={() => setClinicMenuOpen((p) => !p)}
                className="px-2 py-1 flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-slate-500 cursor-pointer hover:text-slate-300"
              >
                <span>{isClinic ? 'Clinic Management' : (isRestaurant ? 'Restaurant Management' : (isPharmacy ? 'Pharmacy Management' : 'Store Management'))}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    clinicMenuOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            )}

            {(clinicMenuOpen || collapsed) && (
              <div className="space-y-0.5">
                {[
                  { id: 'APPROVALS_AND_REPORTS', label: 'Financial Reports & Closing', icon: BarChart3 },
                  { id: 'INVENTORY', label: isClinic ? 'Pharmacy & Medicine Stock' : (isRestaurant ? 'Food Menu & Recipe Stocks' : (isPharmacy ? 'Pharmacy Stock & Expiry' : 'Inventory & Stock Management')), icon: Package },
                  ...(isClinic && enabledMods.patientsLedger !== false
                    ? [{ id: 'TREATMENT_CATALOG', label: 'Treatment Catalog & Dues', icon: Layers }]
                    : []),
                  { id: 'STAFF', label: isClinic ? 'Staff Accounts & 4-Digit PIN' : (isRestaurant ? 'Waiters & Cashier Accounts' : 'Staff / Cashier Accounts'), icon: KeyRound },
                  { id: 'SUBSCRIPTION', label: 'Subscription & License Key', icon: CreditCard },
                  { id: 'AUDIT_SMS', label: 'Audit Logs & History', icon: BellRing }
                ].map((item) => {
                  const Icon = item.icon;
                  const isCurrent = clinicSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectClinicSection(item.id)}
                      className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-500'
                          : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />
                      {!collapsed && <span className="text-[11px] truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION: MODULES ACCORDION WHEN ON POS */}
        {activeRole === 'STAFF' && (
          <div className="space-y-1 pt-1 border-t border-slate-800/70">
            {!collapsed && (
              <div
                onClick={() => setPosMenuOpen((p) => !p)}
                className="px-2 py-1 flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-slate-500 cursor-pointer hover:text-slate-300"
              >
                <span>POS Counter Sub-Tabs</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    posMenuOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            )}

            {(posMenuOpen || collapsed) && (
              <div className="space-y-0.5">
                {[
                  ...(enabledMods.pos !== false
                    ? [{ id: 'POS', label: isRestaurant ? '1. Dine-In Tables & POS' : '1. Fast POS Billing & Cart', icon: ShoppingCart }]
                    : []),
                  ...(isClinic && enabledMods.patientsLedger !== false
                    ? [{ id: 'PATIENTS_LEDGER', label: '2. Patient Sessions & Ledger', icon: Layers }]
                    : []),
                  ...(enabledMods.inventory !== false
                    ? [{ id: 'STOCK_ENTRY', label: isRestaurant ? '3. Menu Items & Ingredients' : (isPharmacy ? '3. Medicines & Formulations' : '3. Stock Entry & Barcodes'), icon: Barcode }]
                    : []),
                  { id: 'RECENT_SALES', label: isRestaurant ? '4. Completed Orders & Bills' : '4. Completed Invoices', icon: Receipt }
                ].map((item) => {
                  const Icon = item.icon;
                  const isCurrent = posSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectPosSubTab(item.id)}
                      className={`w-full p-2 rounded-xl flex items-center gap-2.5 transition text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-500'
                          : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />
                      {!collapsed && <span className="text-[11px] truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION: SUPER ADMIN ACCORDION */}
        {activeRole === 'SUPER_ADMIN' && canViewSuperAdmin && (
          <div className="space-y-1 pt-1 border-t border-slate-800/70">
            {!collapsed && (
              <div
                onClick={() => setSuperMenuOpen((p) => !p)}
                className="px-2 py-1 flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase text-slate-500 cursor-pointer hover:text-slate-300"
              >
                <span>SaaS Administration</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    superMenuOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </div>
            )}

            {(superMenuOpen || collapsed) && (
              <div className="space-y-0.5 text-[11px]">
                <div className="p-2 text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {!collapsed && <span>Global MRR & Clinics</span>}
                </div>
                <div className="p-2 text-slate-400 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {!collapsed && <span>Multi-Tenant Subdomains</span>}
                </div>
                <div className="p-2 text-slate-400 flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {!collapsed && <span>Central License Engine</span>}
                </div>
                <div className="p-2 text-slate-400 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {!collapsed && <span>Live Cron Jobs & Logs</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. SIDEBAR FOOTER & SYSTEM HEALTH */}
      <div className="p-3 border-t border-slate-800/70 bg-[#090D15] space-y-2 text-xs">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>System Architecture</span>
              </span>
              <span className="font-mono text-emerald-400">PWA 2.0</span>
            </div>

            <a
              href="https://wa.me/923131094557"
              target="_blank"
              rel="noreferrer"
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-[11px] font-semibold transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Direct Tech Desk</span>
            </a>
          </>
        ) : (
          <a
            href="https://wa.me/923131094557"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center mx-auto transition"
            title="WhatsApp Support"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        )}
      </div>
    </aside>
  );
}
