import React, { useState } from 'react';
import {
  Shield,
  Stethoscope,
  Crown,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  Send,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Sparkles,
  Globe,
  Phone,
  Mail,
  Check,
  Zap
} from 'lucide-react';

export default function LoginModal({
  platformBrand,
  currentTenant,
  users,
  onLogin,
  onRegisterClinic,
  onRequestPasswordReset,
  isAdminRoute = false
}) {
  const isSuperAdminMode = Boolean(
    isAdminRoute ||
    (typeof window !== 'undefined' && (
      window.location.pathname.includes('super-admin') ||
      window.location.pathname.includes('/admin') ||
      window.location.search.includes('view=super-admin') ||
      window.location.search.includes('view=admin') ||
      window.location.search.includes('route=super-admin') ||
      window.location.search.includes('owner=ubaid') ||
      window.location.search.includes('admin=ubaid') ||
      window.location.hash.includes('super-admin') ||
      window.location.hash.includes('admin') ||
      localStorage.getItem('digitalsnova_owner_access') === 'ubaid'
    ))
  );

  const [authView, setAuthView] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'FORGOT'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  // New Clinic Self-Registration Form State
  const [registerForm, setRegisterForm] = useState({
    clinicName: '',
    subdomain: '',
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    phone: '',
    email: '',
    address: '',
    planType: 'TRIAL_3_DAYS', // 'TRIAL_3_DAYS' | 'MONTHLY' | 'YEARLY' | '3_YEARS'
    activationKey: '',
    businessType: 'Retail Mart / General Store'
  });
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Automated Email Verification Code Password Reset State
  const [forgotStep, setForgotStep] = useState('EMAIL'); // 'EMAIL' | 'VERIFY'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotFoundAccount, setForgotFoundAccount] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [sendingRecovery, setSendingRecovery] = useState(false);

  // Platform Owner Mode: Restrict Super Admin access to Ubaid only / Dedicated Admin Route
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(isSuperAdminMode);
  const [secretClickCount, setSecretClickCount] = useState(0);

  // Keyboard shortcut: Ctrl + Shift + U to toggle Platform Owner Mode (Ubaid)
  React.useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        setIsOwnerUnlocked((prev) => {
          const next = !prev;
          if (next) {
            localStorage.setItem('digitalsnova_owner_access', 'ubaid');
            alert('👑 Welcome Ubaid! Platform Owner Mode Activated. Super Admin access unlocked.');
          } else {
            localStorage.removeItem('digitalsnova_owner_access');
            alert('🔒 Platform Owner Mode Deactivated. Super Admin access hidden.');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSecretLogoClick = () => {
    const next = secretClickCount + 1;
    setSecretClickCount(next);
    if (next >= 3) {
      setSecretClickCount(0);
      const pass = window.prompt('Platform Owner Authentication (Ubaid):');
      if (pass && (pass.toLowerCase() === 'ubaid' || pass === '2200230')) {
        localStorage.setItem('digitalsnova_owner_access', 'ubaid');
        setIsOwnerUnlocked(true);
        alert('👑 Platform Owner Mode Unlocked for Ubaid!');
      }
    }
  };

  const brandName = platformBrand?.name || 'Digital Snove Portal';
  const brandLogo = platformBrand?.logoUrl || '';
  const brandTagline =
    platformBrand?.tagline || 'Secure Multi-Tenant Clinical POS & Healthcare SaaS';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        setError('Server se rabta nahi ho pa raha (Connection Failed). Page ko refresh karein.');
      } else {
        setError(err.message || 'Invalid Username or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClinicNameChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setRegisterForm((prev) => ({
      ...prev,
      clinicName: val,
      subdomain: slug,
      adminUsername: `admin.${slug || 'clinic'}`
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    try {
      if (!onRegisterClinic) {
        throw new Error('Clinic registration service unavailable');
      }
      if (!registerForm.clinicName.trim()) {
        throw new Error('Please enter your Clinic Name');
      }
      if (!registerForm.subdomain.trim()) {
        throw new Error('Please enter a valid subdomain');
      }
      if (!registerForm.phone || !registerForm.phone.trim()) {
        throw new Error('Please enter your Contact Phone Number');
      }
      if (!registerForm.email || !registerForm.email.trim()) {
        throw new Error('Please enter your Work / Gmail Address');
      }
      if (!registerForm.adminPassword.trim()) {
        throw new Error('Please enter an admin password');
      }

      // Strict Duplicate Registration Security Check (Ignoring Deleted Tenants)
      let existingTenants = [];
      let deletedTenantIds = [];
      try {
        existingTenants = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]');
        deletedTenantIds = JSON.parse(localStorage.getItem('digitalsnova_deleted_tenant_ids') || '[]');
      } catch { existingTenants = []; }

      // Filter out deleted tenants so deleted stores can re-register freely
      existingTenants = existingTenants.filter(t => !deletedTenantIds.includes(t.id) && !deletedTenantIds.includes((t.subdomain || '').toLowerCase()));
      localStorage.setItem('digitalsnova_registered_tenants', JSON.stringify(existingTenants));

      const cleanPhone = registerForm.phone.replace(/[^0-9]/g, '');
      const cleanEmail = registerForm.email.trim().toLowerCase();
      const cleanSlug = registerForm.subdomain.trim().toLowerCase();
      const isDup = existingTenants.some(t => {
        const tP = (t.phone || '').replace(/[^0-9]/g, '');
        const tE = (t.email || t.adminUser?.email || '').trim().toLowerCase();
        const tS = (t.subdomain || '').toLowerCase();
        return (cleanPhone && tP && cleanPhone === tP) || (cleanEmail && tE && cleanEmail === tE) || (cleanSlug && tS && cleanSlug === tS);
      });
      if (isDup) {
        throw new Error('An account with this email/phone already exists.');
      }

      const res = await onRegisterClinic(registerForm);
      setRegisterSuccess(
        res?.message || `Clinic "${registerForm.clinicName}" successfully registered! Launching your client portal...`
      );

      // Auto-login into newly registered clinic portal immediately
      const autoUser = res?.user?.username || registerForm.adminUsername || `admin.${registerForm.subdomain}`;
      const autoPass = registerForm.adminPassword;
      setTimeout(async () => {
        try {
          await onLogin(autoUser, autoPass);
        } catch {
          setAuthView('LOGIN');
          setUsername(autoUser);
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const maskEmail = (em) => {
    if (!em || !em.includes('@')) return em;
    const [name, domain] = em.split('@');
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 3))}${name.slice(-1)}@${domain}`;
  };

  const handleSendForgotCode = (e) => {
    e.preventDefault();
    setError('');
    setEmailNotice('');
    setRecoverySuccess('');
    const input = forgotEmail.trim().toLowerCase();
    if (!input) {
      setError('Please enter your registered Gmail or Username');
      return;
    }

    let regTenants = [];
    try {
      regTenants = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]');
    } catch { regTenants = []; }

    let customStaff = [];
    try {
      customStaff = JSON.parse(localStorage.getItem('digitalsnova_custom_staff') || '[]');
    } catch { customStaff = []; }

    let matched = null;
    let targetType = '';
    let targetEmail = '';

    const tMatch = regTenants.find(t => 
      (t.email && t.email.toLowerCase() === input) ||
      (t.adminUser && t.adminUser.username && t.adminUser.username.toLowerCase() === input) ||
      (t.subdomain && t.subdomain.toLowerCase() === input) ||
      (t.phone && t.phone.replace(/[^0-9]/g, '') === input.replace(/[^0-9]/g, ''))
    );
    if (tMatch) {
      matched = tMatch;
      targetType = 'TENANT';
      targetEmail = tMatch.email || tMatch.adminUser?.email || `${tMatch.subdomain}@gmail.com`;
    }

    if (!matched) {
      const sMatch = customStaff.find(s => 
        (s.username && s.username.toLowerCase() === input) ||
        (s.name && s.name.toLowerCase() === input)
      );
      if (sMatch) {
        matched = sMatch;
        targetType = 'STAFF';
        targetEmail = sMatch.email || `${sMatch.username}@clinic.com`;
      }
    }

    if (!matched && (input === 'superadmin' || input.includes('ubaid'))) {
      matched = { id: 'superadmin', username: 'superadmin', email: 'ubaidurrehman2200230@gmail.com' };
      targetType = 'SUPER_ADMIN';
      targetEmail = 'ubaidurrehman2200230@gmail.com';
    }

    if (!matched) {
      setError('No registered account found with this email, username, or phone.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setForgotFoundAccount({ ...matched, targetType, targetEmail });
    setForgotStep('VERIFY');
    setEmailNotice(`Verification Code Sent! A 6-digit code has been delivered to ${maskEmail(targetEmail)}. Code: ${code}`);
  };

  const handleVerifyAndResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (!enteredCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (enteredCode.trim() !== verificationCode) {
      setError('Invalid verification code. Please check the code and try again.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 3) {
      setError('Please choose a password with at least 3 characters.');
      return;
    }

    if (forgotFoundAccount.targetType === 'TENANT') {
      let regTenants = [];
      try {
        regTenants = JSON.parse(localStorage.getItem('digitalsnova_registered_tenants') || '[]');
      } catch { regTenants = []; }
      const idx = regTenants.findIndex(t => t.id === forgotFoundAccount.id || t.subdomain === forgotFoundAccount.subdomain);
      if (idx >= 0) {
        if (!regTenants[idx].adminUser) regTenants[idx].adminUser = {};
        regTenants[idx].adminUser.password = resetNewPassword;
        regTenants[idx].adminPassword = resetNewPassword;
        localStorage.setItem('digitalsnova_registered_tenants', JSON.stringify(regTenants));
      }
    } else if (forgotFoundAccount.targetType === 'STAFF') {
      let customStaff = [];
      try {
        customStaff = JSON.parse(localStorage.getItem('digitalsnova_custom_staff') || '[]');
      } catch { customStaff = []; }
      const idx = customStaff.findIndex(s => s.id === forgotFoundAccount.id);
      if (idx >= 0) {
        customStaff[idx].password = resetNewPassword;
        localStorage.setItem('digitalsnova_custom_staff', JSON.stringify(customStaff));
      }
    }

    setRecoverySuccess(`Password reset successfully for "${forgotFoundAccount.name || forgotFoundAccount.username}"! You can now sign in.`);
    setUsername(forgotFoundAccount.adminUser?.username || forgotFoundAccount.username || '');
    setPassword(resetNewPassword);
    setForgotStep('EMAIL');
    setForgotEmail('');
    setVerificationCode('');
    setEnteredCode('');
    setResetNewPassword('');
    setEmailNotice('');
    setAuthView('LOGIN');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040818]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl ${
          authView === 'REGISTER' ? 'max-w-lg' : 'max-w-md'
        } w-full shadow-2xl border-2 sm:border-4 border-gold my-auto max-h-[min(90vh,680px)] flex flex-col overflow-hidden transition-all duration-200`}
      >
        {/* Top SaaS Product Owner Header (Controlled ONLY by SaaS Super Admin) */}
        <div 
          onClick={handleSecretLogoClick}
          className={`${
            isSuperAdminMode
              ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 border-b border-amber-500/30'
              : 'bg-navy-dark border-b border-white/10'
          } text-white px-6 py-4 text-center cursor-pointer select-none`}
          title="DigitalsNova Portal"
        >
          {isSuperAdminMode ? (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xl flex items-center justify-center mx-auto mb-2 shadow-lg ring-2 ring-amber-400/50">
              <Crown className="w-7 h-7 text-slate-950 fill-current" />
            </div>
          ) : brandLogo && !logoImgError ? (
            <img
              src={brandLogo}
              alt={brandName}
              onError={() => setLogoImgError(true)}
              className="h-12 mx-auto mb-2 object-contain bg-white px-3 py-1 rounded-xl shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gold text-navy font-extrabold text-xl flex items-center justify-center mx-auto mb-2 shadow-md">
              {brandName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>{isSuperAdminMode ? 'DigitalsNova SaaS Master HQ' : brandName}</span>
            {isSuperAdminMode && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-mono border border-amber-400/30">MASTER</span>
            )}
          </h1>
          <p className="text-[11px] text-gold-bright mt-0.5 font-semibold">
            {isSuperAdminMode ? '👑 Platform Owner Control Panel (Ubaid)' : brandTagline}
          </p>
        </div>

        {/* View Switcher Bar (Turn Green / Active on click) */}
        {authView !== 'FORGOT' && (
          isSuperAdminMode ? (
            <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs font-extrabold flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Super Admin Access Mode</span>
              </div>
              <a
                href="/portal"
                onClick={() => {
                  localStorage.removeItem('digitalsnova_owner_access');
                }}
                className="text-[11px] text-slate-600 hover:text-navy font-bold underline"
              >
                Store / Clinic Login &rarr;
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => {
                  setAuthView('LOGIN');
                  setError('');
                }}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  authView === 'LOGIN'
                    ? 'bg-navy text-gold-bright shadow'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>1. Sign In to Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView('REGISTER');
                  setError('');
                }}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  authView === 'REGISTER'
                    ? 'bg-teal text-white shadow ring-2 ring-gold'
                    : 'text-teal hover:text-teal-dark font-bold'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-bright" />
                <span>2. Register Clinic (3-Day Trial)</span>
              </button>
            </div>
          )
        )}

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-alert text-xs font-bold text-center">
              {error}
            </div>
          )}

          {registerSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-start gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{registerSuccess}</span>
            </div>
          )}

          {recoverySuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{recoverySuccess}</span>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW 1: REGULAR LOGIN SCREEN                                        */}
          {/* =================================================================== */}
          {authView === 'LOGIN' && (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1.5">
                    {isSuperAdminMode ? 'Master Super Admin Username' : 'Username'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isSuperAdminMode ? 'ubaid or superadmin' : 'Enter your username'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-sm text-navy"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-extrabold text-navy uppercase tracking-wider">
                      {isSuperAdminMode ? 'Master Password' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('FORGOT');
                        setError('');
                        setRecoverySuccess('');
                      }}
                      className="text-[11px] font-bold text-teal hover:text-navy underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Forgot Username / Password?</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSuperAdminMode ? 'Enter master password' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-sm text-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 transition cursor-pointer"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-navy" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl ${
                    isSuperAdminMode
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black'
                      : 'bg-navy hover:bg-navy-light text-gold-bright font-extrabold'
                  } text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer`}
                >
                  {isSuperAdminMode ? (
                    <Crown className="w-4 h-4 text-slate-950 fill-current" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    {loading
                      ? 'Signing In...'
                      : isSuperAdminMode
                      ? 'Sign In to Super Admin Panel'
                      : 'Sign In to Portal'}
                  </span>
                </button>

                {/* Footer Links Scoped to Mode */}
                {isSuperAdminMode ? (
                  <div className="pt-3 text-center border-t border-slate-200 text-xs text-slate-500 flex flex-col items-center gap-1.5">
                    <a
                      href="/portal"
                      onClick={() => {
                        localStorage.removeItem('digitalsnova_owner_access');
                      }}
                      className="font-extrabold text-teal hover:text-navy underline cursor-pointer"
                    >
                      &larr; Switch to Regular Store / Clinic Login
                    </a>
                  </div>
                ) : (
                  <div className="pt-3 text-center border-t border-slate-200 text-xs text-slate-500 flex flex-col items-center gap-1.5">
                    <div>
                      Don't have an active store account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('REGISTER');
                          setError('');
                        }}
                        className="font-extrabold text-teal hover:text-navy underline cursor-pointer"
                      >
                        Register New Account
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('REGISTER');
                        setError('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/10 hover:bg-teal/20 text-teal font-extrabold text-[11px] transition cursor-pointer border border-teal/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold-bright" />
                      <span>Start 3-Day Free Trial &rarr;</span>
                    </button>
                    <div className="pt-1">
                      <a
                        href="/super-admin"
                        className="text-[11px] font-bold text-slate-400 hover:text-amber-600 flex items-center justify-center gap-1 transition"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Platform Owner? Super Admin Login &rarr;</span>
                      </a>
                    </div>
                  </div>
                )}
              </form>

              {/* Platform Owner Shortcut: Only visible if Ubaid has unlocked Owner Mode on regular login */}
              {!isSuperAdminMode && isOwnerUnlocked && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/80 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span className="font-extrabold">Platform Owner Mode (Ubaid)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('superadmin');
                        setPassword('2200230');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 font-bold transition text-[11px] cursor-pointer"
                    >
                      Fill Master Login
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* =================================================================== */}
          {/* VIEW 2: PUBLIC CLINIC REGISTRATION / FREE TRIAL (Self-Service)      */}
          {/* =================================================================== */}
          {authView === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="bg-teal/10 border border-teal/30 p-3 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-navy text-xs">
                    Get Instant Access to Digital Snove Clinic Portal
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Start with a <strong>3-Day Free Trial</strong> or activate immediately with a Digital Snove License Key.
                  </div>
                </div>
              </div>

              {/* Clinic Name & Auto-Subdomain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Clinic / Hospital Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={registerForm.clinicName}
                      onChange={(e) => handleClinicNameChange(e.target.value)}
                      placeholder="e.g. Al-Shifa Dental Clinic"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Store Subdomain (Auto-Generated) *
                  </label>
                  <div className="relative flex items-center">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      readOnly
                      value={registerForm.subdomain}
                      placeholder="storename"
                      className="w-full pl-9 pr-28 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none font-bold text-navy text-xs font-mono select-none"
                    />
                    <span className="absolute right-2 text-[10px] text-teal font-mono font-bold pointer-events-none">
                      .digitalsnova.com
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Strictly matches your store name for verified multi-tenant routing.
                  </p>
                </div>
              </div>

              {/* Business Industry Vertical Sector */}
              <div>
                <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                  Business Industry Vertical *
                </label>
                <div className="relative">
                  <select
                    value={registerForm.businessType || 'Retail Mart / General Store'}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, businessType: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs bg-white cursor-pointer"
                  >
                    <option value="Retail Mart / General Store">🛒 Retail Mart &amp; General Store</option>
                    <option value="Clinic / Hospital">🏥 Clinic &amp; Hospital (HMS)</option>
                    <option value="Pharmacy & Medical Store">💊 Pharmacy &amp; Medical Store</option>
                    <option value="Restaurants, Cafes & Food Outlets">🍽️ Restaurants, Cafes &amp; Food Outlets</option>
                  </select>
                </div>
              </div>

              {/* Doctor / Owner Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Doctor / Owner Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={registerForm.adminName}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, adminName: e.target.value }))
                      }
                      placeholder="e.g. Dr. Tariq Mahmood"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="0300-1234567"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                  Work / Gmail Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={registerForm.email || ''}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="doctor@hospital.com / clinic@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                  />
                </div>
              </div>

              {/* Admin Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Admin Username *
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={registerForm.adminUsername}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          adminUsername: e.target.value.toLowerCase().trim()
                        }))
                      }
                      placeholder="admin.yourclinic"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-navy uppercase tracking-wider mb-1">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegisterPass ? 'text' : 'password'}
                      required
                      value={registerForm.adminPassword}
                      onChange={(e) =>
                        setRegisterForm((prev) => ({ ...prev, adminPassword: e.target.value }))
                      }
                      placeholder="Set strong password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPass((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                    >
                      {showRegisterPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Choose Pricing Plan */}
              <div>
                <label className="block font-extrabold text-navy uppercase tracking-wider mb-2">
                  Select Subscription Plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'TRIAL_3_DAYS',
                      title: '3-Day Trial',
                      price: 'Free',
                      badge: 'Instant',
                      color: 'border-emerald-400'
                    },
                    {
                      id: 'MONTHLY',
                      title: 'Monthly',
                      price: 'Rs. 7,999/mo',
                      badge: '30 Days',
                      color: 'border-teal'
                    },
                    {
                      id: 'YEARLY',
                      title: '1 Year',
                      price: 'Rs. 76,790/yr',
                      badge: 'Save 20%',
                      color: 'border-gold'
                    },
                    {
                      id: '3_YEARS',
                      title: '3 Years',
                      price: 'Rs. 229,000',
                      badge: 'Best Value',
                      color: 'border-indigo-400'
                    }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRegisterForm((prev) => ({ ...prev, planType: p.id }))}
                      className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        registerForm.planType === p.id
                          ? 'bg-navy text-white border-gold shadow-md ring-2 ring-gold/50'
                          : 'bg-white text-navy border-slate-200 hover:border-navy'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[11px]">{p.title}</span>
                        {registerForm.planType === p.id && (
                          <Check className="w-3.5 h-3.5 text-gold-bright" />
                        )}
                      </div>
                      <div
                        className={`text-xs font-bold mt-1 ${
                          registerForm.planType === p.id ? 'text-gold-bright' : 'text-teal'
                        }`}
                      >
                        {p.price}
                      </div>
                      <span className="text-[9px] opacity-75 mt-0.5">{p.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Activation Key Field */}
              <div className="bg-ice/50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                <label className="block font-bold text-navy text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal" />
                    <span>Have a Digital Snove Activation Key? (Optional)</span>
                  </span>
                  <span className="text-slate-400 font-normal text-[10px]">Instant Unlock</span>
                </label>
                <input
                  type="text"
                  value={registerForm.activationKey}
                  onChange={(e) =>
                    setRegisterForm((prev) => ({
                      ...prev,
                      activationKey: e.target.value.toUpperCase().trim()
                    }))
                  }
                  placeholder="Paste Key e.g. DS-MYCLINIC-MONTH-A3F1-1234"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal outline-none font-mono font-bold text-xs bg-white uppercase"
                />
                <p className="text-[10px] text-slate-500">
                  If provided by SaaS Super Admin, entering it here will automatically activate your full subscription immediately.
                </p>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ring-2 ring-gold/40"
              >
                <Sparkles className="w-4 h-4 text-gold-bright" />
                <span>
                  {registerLoading ? 'Creating Clinic Account...' : 'Create Clinic Account & Open Portal'}
                </span>
              </button>
            </form>
          )}

          {/* =================================================================== */}
          {/* VIEW 3: AUTOMATED EMAIL VERIFICATION CODE PASSWORD RESET            */}
          {/* =================================================================== */}
          {authView === 'FORGOT' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="font-extrabold text-sm text-navy">
                    {forgotStep === 'EMAIL' ? 'Forgot Password? Send Code' : 'Verify Code & Set New Password'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {forgotStep === 'EMAIL'
                      ? 'Enter your registered Gmail or Username to receive an automated verification code.'
                      : 'Enter the 6-digit verification code sent to your registered email.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('LOGIN');
                    setForgotStep('EMAIL');
                    setError('');
                    setEmailNotice('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              {emailNotice && (
                <div className="p-3.5 rounded-xl bg-teal/10 border-2 border-teal/40 text-teal-dark text-xs font-bold flex items-start gap-2 animate-pulse">
                  <Mail className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-navy">Automated Notification:</div>
                    <div className="mt-0.5">{emailNotice}</div>
                  </div>
                </div>
              )}

              {forgotStep === 'EMAIL' ? (
                <form onSubmit={handleSendForgotCode} className="space-y-4">
                  <div>
                    <label className="block font-bold text-navy mb-1.5">
                      Registered Gmail Address / Username / Phone *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. yourstore@gmail.com, admin.yourclinic, or 0300..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      An automated 6-digit security code will be sent to this email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Automated Verification Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                  <div>
                    <label className="block font-bold text-navy mb-1">
                      Enter 6-Digit Verification Code *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-teal focus:border-navy outline-none font-mono font-black text-center text-base tracking-widest text-navy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">
                      Set New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetPass ? 'text' : 'password'}
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Enter your new secure password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy outline-none font-bold text-navy text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                      >
                        {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('EMAIL');
                        setError('');
                      }}
                      className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Resend Code
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-navy hover:bg-navy-light text-gold-bright font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify Code & Reset Password</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
