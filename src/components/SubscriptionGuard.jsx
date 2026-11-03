import React, { useState } from 'react';
import { Lock, AlertTriangle, CreditCard, ShieldAlert, CheckCircle2, ArrowRightLeft } from 'lucide-react';

export function SubscriptionGraceBanner({ tenant, onPayNow }) {
  const [paying, setPaying] = useState(false);
  if (!tenant || !tenant.subscription || tenant.subscription.state !== 'GRACE_PERIOD') {
    return null;
  }

  const { graceDaysRemaining, billingCycleDay } = tenant.subscription;

  const handleQuickRenew = async () => {
    setPaying(true);
    try {
      await onPayNow(tenant.id, 'GRACE_BANNER_ONLINE_RENEWAL');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-red-600 dark:bg-red-700 text-white px-4 py-2.5 shadow-md border-b border-red-700 dark:border-red-800 flex flex-wrap items-center justify-between gap-3 z-40">
      <div className="flex items-center gap-2.5">
        <span className="p-1.5 rounded-lg bg-white/20 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-300" />
        </span>
        <div className="text-xs sm:text-sm font-bold tracking-wide">
          Subscription Expired. Renew within{' '}
          <span className="underline decoration-2 text-amber-300 font-extrabold">
            {graceDaysRemaining} {graceDaysRemaining === 1 ? 'day' : 'days'}
          </span>{' '}
          to avoid system lockout.
          <span className="ml-2 font-mono text-[11px] bg-black/25 px-2 py-0.5 rounded">
            Billing Day {billingCycleDay}/33 (3-Day Grace Period)
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleQuickRenew}
        disabled={paying}
        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0"
      >
        <CreditCard className="w-4 h-4" />
        <span>{paying ? 'Processing Renewal...' : `Pay Rs. ${Number(tenant.monthlyFee).toLocaleString()} & Renew Now`}</span>
      </button>
    </div>
  );
}

export function SubscriptionLockModal({
  tenant,
  activeRole,
  allTenants,
  onSwitchTenant,
  onSwitchRole,
  onPayAndUnlock
}) {
  const [processing, setProcessing] = useState(false);

  if (!tenant || !tenant.subscription || tenant.subscription.state !== 'LOCKED') {
    return null;
  }

  // Super Admin can still access the platform panel to manage/unlock clinics
  if (activeRole === 'SUPER_ADMIN') {
    return null;
  }

  const handlePayRestore = async () => {
    setProcessing(true);
    try {
      await onPayAndUnlock(tenant.id, 'LOCK_MODAL_INSTANT_PAYMENT_WEBHOOK');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border-4 border-alert shadow-2xl overflow-hidden my-auto">
        <div className="bg-alert text-white p-6 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-9 h-9 text-gold-bright" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-black/30 text-gold-bright font-mono text-xs font-bold mb-2">
            DAY {tenant.subscription.billingCycleDay} • AUTO-LOCK ENFORCED
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Account Suspended - Contact DigitalsNova to Renew Access
          </h2>
          <p className="text-xs text-red-100 mt-1">
            Tenant Domain: <span className="font-mono font-bold underline">{tenant.domain}</span> ({tenant.name})
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sm text-alert">
              <ShieldAlert className="w-4 h-4" />
              <span>30-Day Active Cycle + 3-Day Grace Period Expired</span>
            </div>
            <p className="leading-relaxed">
              Your 30-day billing cycle and 3-day grace window (Days 31–33) have elapsed on <strong>Day {tenant.subscription.billingCycleDay}</strong>. POS billing, inventory checkout, and patient ledger modifications are temporarily locked until the monthly subscription is renewed.
            </p>
          </div>

          <div className="bg-ice/60 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Monthly SaaS Subscription Fee</div>
              <div className="text-xl font-extrabold text-navy">
                Rs. {Number(tenant.monthlyFee || 15000).toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 30 Days</span>
              </div>
            </div>
            <div className="text-right text-xs text-teal font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instant Auto-Unlock Webhook</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayRestore}
            disabled={processing}
            className="w-full py-4 px-6 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl transition cursor-pointer"
          >
            <CreditCard className="w-5 h-5 text-gold" />
            <span>
              {processing
                ? 'Verifying Online Payment & Restoring Clinic...'
                : `Pay Rs. ${Number(tenant.monthlyFee || 15000).toLocaleString()} Online Now (Instant Auto-Unlock)`}
            </span>
          </button>

          {/* Helpful Demo Controls so the user can also switch tenant or view as Super Admin */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ArrowRightLeft className="w-3.5 h-3.5 text-navy" />
              <span>Switch Clinic Subdomain or Super Admin:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {allTenants
                ?.filter((t) => t.id !== tenant.id)
                .map((other) => (
                  <button
                    key={other.id}
                    type="button"
                    onClick={() => onSwitchTenant(other.subdomain)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy font-semibold"
                  >
                    {other.subdomain}.digitalsnova.com
                  </button>
                ))}
              <button
                type="button"
                onClick={() => onSwitchRole('SUPER_ADMIN')}
                className="px-2.5 py-1 rounded-lg bg-gold/25 hover:bg-gold/40 text-navy font-bold"
              >
                Open Super Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
