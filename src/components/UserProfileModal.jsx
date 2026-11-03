import React, { useState } from 'react';
import {
  User,
  KeyRound,
  ShieldCheck,
  X,
  Lock,
  Palette,
  Crown,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

export default function UserProfileModal({
  user,
  tenant,
  platformBrand,
  onClose,
  onSaveProfile,
  onSaveClinicBranding,
  onSavePlatformBrand,
  onDeleteTenant
}) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isClinicAdmin = user.role === 'CLINIC_ADMIN';
  const isAdminOrSuper = isSuperAdmin || isClinicAdmin;

  // 1. User Login Credentials State
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2A. SaaS Platform Brand State (ONLY for SUPER_ADMIN -> Controls Top-Left Navbar & Login Page)
  const [platformForm, setPlatformForm] = useState({
    name: platformBrand?.name || 'Digital Snove Portal',
    logoUrl: platformBrand?.logoUrl || '',
    tagline: platformBrand?.tagline || 'Secure Multi-Tenant Clinical POS & Healthcare SaaS',
    address: platformBrand?.address || 'Digital Snove SaaS Headquarters',
    phone: platformBrand?.phone || '+92-300-0000000'
  });

  // 2B. Client Clinic Customization, Receipt Branding & 4-Digit PIN State (For CLINIC_ADMIN & SUPER_ADMIN -> Controls Top-Right Client Profile Badge & Receipts)
  const [brandingForm, setBrandingForm] = useState({
    name: tenant?.name || '',
    logoUrl: tenant?.logoUrl || '',
    address: tenant?.address || '',
    phone: tenant?.phone || '',
    receiptHeader: tenant?.receiptHeader || '',
    receiptFooter: tenant?.receiptFooter || '',
    smsApiUrl: tenant?.smsApiUrl || '',
    smsApiKey: tenant?.smsApiKey || '',
    smsEnabled: tenant?.smsEnabled ?? true,
    adminPin: tenant?.adminPin || '1234'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper: Convert uploaded image file (PNG/JPG/SVG/WEBP) to Base64 Data URL
  const handleImageFileUpload = (file, targetType) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        if (targetType === 'PLATFORM') {
          setPlatformForm((prev) => ({ ...prev, logoUrl: dataUrl }));
        } else {
          setBrandingForm((prev) => ({ ...prev, logoUrl: dataUrl }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      // Save user profile credentials
      await onSaveProfile({
        userId: user.id,
        name: isAdminOrSuper ? name : undefined,
        username: isAdminOrSuper ? username : undefined,
        newPassword: newPassword || undefined
      });

      // If SaaS Super Admin -> ONLY Save Main SaaS Platform Brand (Never touch client clinic settings)
      if (isSuperAdmin && onSavePlatformBrand) {
        await onSavePlatformBrand(platformForm);
      }

      // If Clinic Admin -> ONLY Save Client's Own Clinic Profile, Logo, Receipt Branding & 4-Digit PIN
      if (isClinicAdmin && onSaveClinicBranding) {
        await onSaveClinicBranding(brandingForm);
      }

      setSuccess(
        isSuperAdmin
          ? 'SaaS Platform Logo/Name (Top-Left Header & Login Screen) and Profile Settings saved!'
          : isClinicAdmin
          ? 'Client Admin Profile, Uploaded Clinic Logo & Receipt Settings saved!'
          : 'Staff password updated successfully!'
      );
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile & settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl w-full border-2 border-navy shadow-2xl overflow-hidden my-6 ${
          isAdminOrSuper ? 'max-w-4xl' : 'max-w-md'
        }`}
      >
        {/* Top Modal Header */}
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold text-navy font-bold">
              {isSuperAdmin ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isSuperAdmin
                  ? 'SaaS Super Admin Profile, Top-Left Platform Logo Upload & Branding'
                  : isClinicAdmin
                  ? 'Client Admin Profile, Clinic Logo Upload, Receipt Branding & PIN'
                  : 'Staff Profile (Change Password Only)'}
              </h3>
              <p className="text-[11px] text-ice/80">
                Logged in as: <strong>@{user.username}</strong> ({user.role})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-alert font-bold">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
              {success}
            </div>
          )}

          {!isAdminOrSuper && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Staff Security Restriction:</strong> Receptionist/Staff can only change their own Password. Name & Username are locked by Clinic Admin.
              </span>
            </div>
          )}

          {/* PART 1: ACCOUNT LOGIN CREDENTIALS */}
          <div className="p-4 rounded-2xl bg-ice/40 border border-navy/15 space-y-3">
            <div className="font-extrabold text-navy text-xs uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal" />
              <span>
                {isAdminOrSuper
                  ? '1. Your Login Credentials (Full Name, Username & Password)'
                  : 'Staff Login Credentials'}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${isAdminOrSuper ? 'md:grid-cols-3' : ''} gap-3`}>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  disabled={!isAdminOrSuper}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-bold ${
                    isAdminOrSuper
                      ? 'border-slate-300 bg-white text-navy focus:border-navy'
                      : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Login Username</label>
                <input
                  type="text"
                  value={username}
                  disabled={!isAdminOrSuper}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-bold ${
                    isAdminOrSuper
                      ? 'border-slate-300 bg-white text-navy focus:border-navy'
                      : 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-navy mb-1">
                  {isAdminOrSuper ? 'New Password (optional)' : 'Enter New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isAdminOrSuper}
                    placeholder={isAdminOrSuper ? 'Leave blank to keep current' : 'Enter new password...'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border-2 border-navy/30 bg-white focus:border-navy font-bold text-navy outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-navy"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PART 2A: SAAS SUPER ADMIN ONLY -> MAIN PLATFORM BRANDING & TOP-LEFT LOGO UPLOAD */}
          {isSuperAdmin && (
            <div className="p-5 rounded-2xl bg-navy/5 border-2 border-gold space-y-4">
              <div className="border-b border-navy/15 pb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-navy flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gold" />
                    <span>
                      2. Main SaaS Platform Logo & Name (Shown on Top-Left Header & Login Screen)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Upload your main SaaS Product Logo image from your computer or paste an image link. Only SaaS Super Admin can change this.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-navy text-gold font-bold text-[11px]">
                  Top-Left Header & Login Brand
                </span>
              </div>

              {/* SaaS Platform Logo Image Upload + Live Preview Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {platformForm.logoUrl ? (
                    <img
                      src={platformForm.logoUrl}
                      alt="SaaS Platform Logo"
                      className="h-14 w-auto max-w-[140px] rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 object-contain shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gold text-navy font-extrabold text-lg flex items-center justify-center shadow">
                      {(platformForm.name || 'DS').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-extrabold text-navy text-xs">
                      Main SaaS Portal Logo (Top-Left Navbar & Login Page)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Upload PNG, JPG, SVG or WEBP directly from your computer, or paste a URL below.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image from Computer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e.target.files?.[0], 'PLATFORM')}
                    />
                  </label>
                  {platformForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setPlatformForm({ ...platformForm, logoUrl: '' })}
                      className="p-2 rounded-xl bg-red-50 hover:bg-alert hover:text-white text-alert border border-red-200 transition"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Main SaaS Product / Portal Name (Top-Left & Login)
                  </label>
                  <input
                    type="text"
                    required
                    value={platformForm.name}
                    onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">
                    Or Paste SaaS Logo Image Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/saas-logo.png or Upload above"
                    value={platformForm.logoUrl}
                    onChange={(e) => setPlatformForm({ ...platformForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Top-Left & Login Screen Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={platformForm.tagline}
                    onChange={(e) => setPlatformForm({ ...platformForm, tagline: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PART 2B: CLIENT ADMIN ONLY -> CLIENT CLINIC PROFILE, TOP-RIGHT LOGO IMAGE UPLOAD, RECEIPT BRANDING & 4-DIGIT PIN */}
          {isClinicAdmin && tenant && (
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-4">
              <div className="border-b border-slate-200 pb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-navy flex items-center gap-2">
                    <Palette className="w-4 h-4 text-teal" />
                    <span>
                      2. Your Clinic Profile, Logo Upload (Top-Right Profile Box & Receipt) & 4-Digit PIN
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload your Clinic Logo image from your computer or paste a link. It appears in the Top-Right Profile Box and on Thermal Receipts.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-navy text-gold font-bold text-xs">
                  Active PIN: {brandingForm.adminPin}
                </span>
              </div>

              {/* Client Clinic Logo Image Upload + Live Preview Box */}
              <div className="p-4 rounded-xl bg-ice/30 border border-navy/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {brandingForm.logoUrl ? (
                    <img
                      src={brandingForm.logoUrl}
                      alt={brandingForm.name}
                      className="h-14 w-auto max-w-[140px] rounded-xl bg-white border border-slate-200 px-3 py-1.5 object-contain shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-teal text-white font-extrabold text-lg flex items-center justify-center shadow">
                      {(brandingForm.name || 'CL').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-extrabold text-navy text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-teal" />
                      <span>Client Clinic Logo (Top-Right Profile Box & 58mm/80mm Receipt)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Choose an image file from your device (PNG, JPG, WEBP, SVG) or paste a URL below.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-2 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Clinic Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e.target.files?.[0], 'CLINIC')}
                    />
                  </label>
                  {brandingForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setBrandingForm({ ...brandingForm, logoUrl: '' })}
                      className="p-2 rounded-xl bg-red-50 hover:bg-alert hover:text-white text-alert border border-red-200 transition"
                      title="Remove Clinic Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Clinic / Store Name (Top-Right Profile & Receipt)
                  </label>
                  <input
                    type="text"
                    required
                    value={brandingForm.name}
                    onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">
                    Or Paste Clinic Logo Image Link (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png or Upload above"
                    value={brandingForm.logoUrl}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Clinic Address (Printed on Receipt)
                  </label>
                  <input
                    type="text"
                    required
                    value={brandingForm.address}
                    onChange={(e) => setBrandingForm({ ...brandingForm, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Phone / Helpline
                  </label>
                  <input
                    type="text"
                    required
                    value={brandingForm.phone}
                    onChange={(e) => setBrandingForm({ ...brandingForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thermal Receipt Header Tagline
                  </label>
                  <input
                    type="text"
                    value={brandingForm.receiptHeader}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, receiptHeader: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy mb-1">
                    4-Digit Management Discount PIN (Strict POS Security)
                  </label>
                  <input
                    type="text"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    value={brandingForm.adminPin}
                    onChange={(e) => setBrandingForm({ ...brandingForm, adminPin: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-navy bg-ice/30 font-extrabold text-base tracking-widest text-navy"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Thermal Receipt Custom Footer Text
                  </label>
                  <input
                    type="text"
                    value={brandingForm.receiptFooter}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, receiptFooter: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-teal mb-1">
                    SMS / WhatsApp Gateway Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={brandingForm.smsApiUrl}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, smsApiUrl: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-teal mb-1">
                    SMS / WhatsApp API Secret Key
                  </label>
                  <input
                    type="text"
                    value={brandingForm.smsApiKey}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, smsApiKey: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2 pt-1">
                  <input
                    id="profileSmsEnabled"
                    type="checkbox"
                    checked={brandingForm.smsEnabled}
                    onChange={(e) =>
                      setBrandingForm({ ...brandingForm, smsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-navy"
                  />
                  <label htmlFor="profileSmsEnabled" className="font-bold text-slate-800">
                    Automatically trigger SMS / WhatsApp receipt notification upon POS invoice generation
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone: Delete Tenant Account (For Clinic / Store Owner) */}
          {isClinicAdmin && onDeleteTenant && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-xs text-red-900 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Delete Facility & Tenant Account</span>
                </div>
                <div className="text-[11px] text-red-700 mt-0.5">
                  Permanently delete <strong>{tenant?.name}</strong>, subdomain, and all stored data.
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const typed = window.prompt(
                    `To permanently delete facility "${tenant?.name}", please type DELETE below:`
                  );
                  if (typed === 'DELETE') {
                    if (window.confirm(`FINAL CONFIRMATION: Are you sure you want to permanently delete ${tenant?.name}?`)) {
                      onClose();
                      await onDeleteTenant(tenant.id);
                    }
                  } else if (typed !== null) {
                    alert('Deletion cancelled: Confirmation word did not match "DELETE".');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition cursor-pointer"
              >
                Delete Account Permanently
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving All Changes...'
                  : isSuperAdmin
                  ? 'Save SaaS Platform Logo/Name & Profile Settings'
                  : isClinicAdmin
                  ? 'Save Admin Profile, Clinic Logo & Receipt Settings'
                  : 'Save New Password'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
