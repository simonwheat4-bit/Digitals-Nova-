import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Bell,
  BellRing,
  Moon,
  Sun,
  User,
  UserCog,
  LogOut,
  CreditCard,
  Shield,
  Crown,
  Stethoscope,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  Check,
  Smartphone,
  Sparkles,
  AlertTriangle,
  Laptop
} from 'lucide-react';

export default function HostingerHeader({
  sidebarCollapsed,
  onToggleSidebar,
  activeRole,
  onSelectRole,
  canViewClinicAdmin,
  canViewSuperAdmin,
  currentTenant,
  allTenants = [],
  activeSubdomain,
  onSwitchSubdomain,
  platformBrand,
  loggedInUser,
  isOnline,
  offlineQueueCount = 0,
  onSyncOffline,
  pendingDiscountsCount = 0,
  pendingClinicResetCount = 0,
  pendingSuperResetCount = 0,
  liveSocketToast,
  onDismissToast,
  theme,
  themePreference = 'light',
  onSetTheme,
  onToggleTheme,
  onOpenProfileModal,
  onOpenBilling,
  onOpenMobileScannerModal,
  onLogout,
  currentSectionTitle
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalNotifications =
    pendingDiscountsCount +
    (canViewSuperAdmin ? pendingSuperResetCount : pendingClinicResetCount) +
    (currentTenant?.subscription?.state === 'GRACE_PERIOD' ? 1 : 0);

  const subState = currentTenant?.subscription?.state || 'ACTIVE';
  const cycleDay = currentTenant?.billingCycleDay || 1;

  // Breadcrumb description
  const roleNameMap = {
    STAFF: 'Receptionist POS Counter',
    CLINIC_ADMIN: 'Clinic Admin Portal',
    SUPER_ADMIN: 'SaaS Platform Super Admin'
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors duration-200 px-3 sm:px-6">
      <div className="h-full max-w-[1700px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT SECTION: Toggle Sidebar + Clean Title / Breadcrumbs (NO Brand Name repetition, NO name truncation) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shrink-0"
            title="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Clean View Title - Role Scoped */}
          {activeRole === 'SUPER_ADMIN' ? (
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                SaaS Master Control Panel
              </div>
            </div>
          ) : activeRole === 'CLINIC_ADMIN' ? (
            <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm font-medium">
              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px]">
                {currentTenant?.name || loggedInUser?.tenantName || loggedInUser?.clinicName || 'Store'}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate">
                {currentSectionTitle || 'Financial Reports & Closing'}
              </span>
            </div>
          ) : (
            <div className="min-w-0 flex items-center gap-2 text-xs sm:text-sm font-medium">
              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[320px]">
                {currentTenant?.name || loggedInUser?.tenantName || loggedInUser?.clinicName || 'Store'}
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate">
                POS Counter • {currentSectionTitle || 'Fast Billing'}
              </span>
            </div>
          )}
        </div>

        {/* CENTER SECTION: Status Badges & Quick Role Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Super Admin Tenant Quick Switcher Dropdown (Cleanly labeled, does NOT replace main portal identity) */}
          {canViewSuperAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Preview Store / Client:</span>
              <select
                value={activeSubdomain}
                onChange={(e) => onSwitchSubdomain(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold outline-none cursor-pointer max-w-[140px] truncate"
                title="Super Admin Tenant Switcher"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.subdomain} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* PWA Network Status Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
            }`}
            title={isOnline ? 'Online - All changes synced live' : 'Offline - Queued in local PWA storage'}
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span className="hidden md:inline font-mono text-[10px]">
              {isOnline ? 'PWA Online' : 'PWA Offline'}
            </span>
          </div>

          {/* Offline Sync Button */}
          {offlineQueueCount > 0 && isOnline && (
            <button
              type="button"
              onClick={onSyncOffline}
              className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition"
              title="Sync offline transactions with server"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync ({offlineQueueCount})</span>
            </button>
          )}

          {/* Subscription Status Chip (for Clinic Admin / Staff) */}
          {activeRole !== 'SUPER_ADMIN' && (
            <span
              className={`hidden lg:inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold border ${
                subState === 'ACTIVE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : subState === 'GRACE_PERIOD'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
              }`}
            >
              Day {cycleDay}/30 • {subState}
            </span>
          )}

          {/* Quick Role Badges (Desktop) */}
          <div className="hidden xl:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onSelectRole('STAFF')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeRole === 'STAFF'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>POS</span>
            </button>

            {canViewClinicAdmin && (
              <button
                type="button"
                onClick={() => onSelectRole('CLINIC_ADMIN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
                  activeRole === 'CLINIC_ADMIN'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
                {pendingDiscountsCount + pendingClinicResetCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            )}

            {canViewSuperAdmin && (
              <button
                type="button"
                onClick={() => onSelectRole('SUPER_ADMIN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeRole === 'SUPER_ADMIN'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Super Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Notifications, Theme Switcher & Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Notifications Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer relative"
              title="Notification Center"
            >
              {totalNotifications > 0 ? (
                <BellRing className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-slate-800 dark:text-slate-200">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span>Notification Center</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold">
                    {totalNotifications} New
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto px-2 py-2 space-y-1.5 text-xs">
                  {/* Live WebSocket Toast Banner inside Notification Drawer */}
                  {liveSocketToast && (
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-blue-900 dark:text-blue-200">Live Real-time Alert</div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          {liveSocketToast}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onDismissToast}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Pending Discount Approval Alerts */}
                  {pendingDiscountsCount > 0 && (
                    <div
                      onClick={() => {
                        onSelectRole('CLINIC_ADMIN');
                        setNotificationsOpen(false);
                      }}
                      className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-amber-900 dark:text-amber-200">
                          {pendingDiscountsCount} Pending Discount Request{pendingDiscountsCount > 1 ? 's' : ''}
                        </div>
                        <div className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                          POS counter requested discount approval. Click to open review queue.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Reset Requests Alert */}
                  {(canViewSuperAdmin ? pendingSuperResetCount : pendingClinicResetCount) > 0 && (
                    <div
                      onClick={() => {
                        if (canViewSuperAdmin) onSelectRole('SUPER_ADMIN');
                        else onSelectRole('CLINIC_ADMIN');
                        setNotificationsOpen(false);
                      }}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 cursor-pointer hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition"
                    >
                      <UserCog className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-rose-900 dark:text-rose-200">
                          Account Recovery Request
                        </div>
                        <div className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                          Staff or clinic owner requested credential reset assistance.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grace Period Notification */}
                  {currentTenant?.subscription?.state === 'GRACE_PERIOD' && (
                    <div
                      onClick={() => {
                        onOpenBilling && onOpenBilling();
                        setNotificationsOpen(false);
                      }}
                      className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-start gap-2.5 cursor-pointer hover:bg-purple-100/60 transition"
                    >
                      <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-purple-900 dark:text-purple-200">
                          Subscription Grace Period
                        </div>
                        <div className="text-purple-700 dark:text-purple-300 text-[11px] mt-0.5">
                          Day {cycleDay}/30. Please renew subscription to avoid portal lockout.
                        </div>
                      </div>
                    </div>
                  )}

                  {totalNotifications === 0 && !liveSocketToast && (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                      <Check className="w-6 h-6 mx-auto mb-1 text-emerald-500 opacity-60" />
                      All caught up! No unread notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive User Profile Dropdown Avatar (Top-Right) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer select-none"
              title="Account & Profile Settings"
            >
              {/* Profile Avatar */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow shrink-0 overflow-hidden">
                {canViewSuperAdmin ? (
                  platformBrand?.logoUrl ? (
                    <img
                      src={platformBrand.logoUrl}
                      alt="Brand"
                      className="w-full h-full object-contain bg-white p-0.5"
                    />
                  ) : (
                    (platformBrand?.name || 'DS').slice(0, 2).toUpperCase()
                  )
                ) : currentTenant?.logoUrl ? (
                  <img
                    src={currentTenant.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain bg-white p-0.5"
                  />
                ) : (
                  (loggedInUser?.name || 'US').slice(0, 2).toUpperCase()
                )}
              </div>

              {/* User Name & Role (Hidden on mobile) */}
              <div className="hidden md:block text-left leading-tight">
                <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {loggedInUser?.name || 'User'}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[120px]">
                  {loggedInUser?.role === 'CLINIC_ADMIN' ? 'Admin' : (loggedInUser?.role || activeRole)}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
            </button>

            {/* Profile Dropdown Modal */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-slate-800 dark:text-slate-200">
                {/* Header Info */}
                <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {loggedInUser?.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    @{loggedInUser?.username} • {loggedInUser?.role === 'CLINIC_ADMIN' ? 'Admin' : loggedInUser?.role}
                  </div>
                  <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-lg">
                    {canViewSuperAdmin ? platformBrand?.name : currentTenant?.name}
                  </div>
                </div>

                {/* Dropdown Action Links */}
                <div className="p-2 space-y-1 text-xs">
                  {/* Account / Branding Settings Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                  >
                    <UserCog className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-bold">Account & Branding Settings</span>
                  </button>

                  {/* Subscription & Billing (Clinic Admin) */}
                  {canViewClinicAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenBilling) {
                          onOpenBilling();
                        } else {
                          onSelectRole('CLINIC_ADMIN');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold">Subscription & Billing</span>
                      </div>
                      <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        Day {cycleDay}
                      </span>
                    </button>
                  )}

                  {/* Wireless Mobile Barcode Scanner Pairing */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenMobileScannerModal && onOpenMobileScannerModal();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
                  >
                    <Smartphone className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="font-bold">Pair Wireless Barcode Scanner</span>
                  </button>

                  {/* Quick Switch to Super Admin for Platform Owner (Ubaid) */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      const pass = window.prompt('Platform Owner (Ubaid) PIN / Password:');
                      if (pass && (pass === '2200230' || pass.toLowerCase() === 'ubaid' || pass === 'admin123' || pass === '123')) {
                        const superUser = {
                          id: 'u_super',
                          tenantId: 'GLOBAL',
                          name: 'Ubaid Ur Rehman (Platform Owner)',
                          username: 'superadmin',
                          role: 'SUPER_ADMIN',
                          tenantName: 'Digital Snove SaaS Headquarters',
                          clinicName: 'Digital Snove SaaS Headquarters',
                          subdomain: 'hq'
                        };
                        localStorage.setItem('digitalsnova_auth_user', JSON.stringify(superUser));
                        localStorage.setItem('digitalsnova_owner_access', 'ubaid');
                        window.location.href = '/super-admin';
                      } else if (pass) {
                        alert('Invalid Owner PIN.');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer font-bold text-left"
                  >
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Switch to Super Admin Panel</span>
                  </button>

                  {/* Theme Switcher within Dropdown: Light / Dark / System */}
                  <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 my-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Theme Mode
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 capitalize">
                        {themePreference}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl">
                      <button
                        type="button"
                        onClick={() => onSetTheme && onSetTheme('light')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themePreference === 'light'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Light Theme"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTheme && onSetTheme('dark')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themePreference === 'dark'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Dark Theme"
                      >
                        <Moon className="w-3.5 h-3.5 text-blue-300" />
                        <span>Dark</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetTheme && onSetTheme('system')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          themePreference === 'system'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="System Default Theme"
                      >
                        <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Auto</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-2 px-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer font-bold text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log Out of Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
