import React, { useState, useEffect } from 'react';
import {
  isClinicBusiness,
  isRestaurantBusiness,
  isPharmacyBusiness,
  isRetailMartBusiness
} from '../utils/businessTypes.js';
import {
  Package,
  Search,
  Filter,
  Edit2,
  Palette,
  Users,
  BarChart3,
  BellRing,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  Plus,
  Trash2,
  Calendar,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Sparkles,
  Send,
  Lock,
  Check,
  Copy,
  Zap,
  X,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Clock,
  Receipt,
  Wallet,
  Printer,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ClinicAdminPanel({
  tenant,
  users,
  treatments,
  treatmentCatalog = [],
  inventory,
  sales,
  discountRequests,
  passwordResetRequests = [],
  auditLogs,
  smsLogs,
  onOpenProfileModal,
  onUpdateSettings,
  onCreateStaff,
  onToggleStaff,
  onDeleteStaff,
  onAddCatalogTreatment,
  onDeleteCatalogTreatment,
  onRespondDiscountRequest,
  onResolvePasswordReset,
  onAdminRefundSale,
  onDeleteTreatment,
  onDeleteSale,
  onDeletePatient,
  licenseKeys = [],
  onActivateLicenseKey,
  onDeactivateLicenseKey,
  onCardCheckout,
  onPaySubscriptionNow,
  controlledSection,
  onSectionChange,
  // Commercial POS Shift & Export props
  activeShift = null,
  closedShifts = [],
  onOpenShift,
  onCloseShift,
  onExportCSV,
  currentUser = null,
  onDeleteTenant = null,
  onAddStock = null,
  onUpdateStock = null,
  onDeleteStock = null,
  onBulkAddProducts = null,
  onBulkAddTreatments = null
}) {
  const isClinic = isClinicBusiness(tenant);
  const isRestaurant = isRestaurantBusiness(tenant);
  const isPharmacy = isPharmacyBusiness(tenant);
  const isRetailMart = isRetailMartBusiness(tenant);
  const showPatientsModule = isClinic && (tenant?.enabledModules?.patientsLedger !== false);
  const [internalSection, setInternalSection] = useState('APPROVALS_AND_REPORTS');
  const rawSection = controlledSection || internalSection;
  const activeSection = (rawSection === 'WHITE_LABEL' || (!isClinic && rawSection === 'TREATMENT_CATALOG'))
    ? 'APPROVALS_AND_REPORTS'
    : rawSection;
  const setActiveSection = (sec) => {
    setInternalSection(sec);
    if (onSectionChange) onSectionChange(sec);
  };
  // 'APPROVALS_AND_REPORTS' | 'TREATMENT_CATALOG' | 'STAFF' | 'AUDIT_SMS' | 'SUBSCRIPTION'

  // Online Card Checkout & Auto-Key Modal State (Image 1 & 2)
  const [cardModalPlan, setCardModalPlan] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardName: '',
    cardNumber: '',
    cardExp: '',
    cardCvc: ''
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(null);
  const [cardError, setCardError] = useState('');
  const [copiedNewKey, setCopiedNewKey] = useState(false);

  // Drill-down Separate Detail View for KPI Cards + Date/Month Filter
  const [selectedKpiDetail, setSelectedKpiDetail] = useState(null); // null | 'DAILY_CLOSING' | 'NET_PROFIT' | 'RECOVERABLES' | 'INVENTORY_AUDIT'
  const [timeFilterMode, setTimeFilterMode] = useState('ALL'); // 'ALL' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM_DATE' | 'CUSTOM_MONTH'
  const [cashierFilter, setCashierFilter] = useState('ALL');
  const [selectedStaffAudit, setSelectedStaffAudit] = useState(null);
  const [showBulkProductModal, setShowBulkProductModal] = useState(false);
  const [showBulkTreatmentModal, setShowBulkTreatmentModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportSuccess, setBulkImportSuccess] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));
  const [customMonth, setCustomMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewingAdminZReport, setViewingAdminZReport] = useState(null);

  // Staff Access Pass & Direct WhatsApp/URL Share Modal (Point 4)
  const [staffPassModal, setStaffPassModal] = useState(null);
  const [staffCopied, setStaffCopied] = useState(false);

  // Dedicated Inventory Management State (Point 5)
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('ALL');
  const [inventoryLowStockOnly, setInventoryLowStockOnly] = useState(false);
  const [stockModalItem, setStockModalItem] = useState(null);
  const [savingStock, setSavingStock] = useState(false);

  // Financial Pricing & Revenue Visibility Privacy Mode (Hidden by default for standard views)
  const [hideFinancialMetrics, setHideFinancialMetrics] = useState(() => {
    return localStorage.getItem('digitalsnova_hide_financials') !== 'false';
  });

  const toggleFinancialPrivacy = () => {
    setHideFinancialMetrics((prev) => {
      const next = !prev;
      localStorage.setItem('digitalsnova_hide_financials', String(next));
      return next;
    });
  };

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

  const [staffForm, setStaffForm] = useState({
    name: '',
    username: '',
    password: '123',
    role: 'STAFF'
  });

  const [catalogForm, setCatalogForm] = useState({
    name: '',
    category: 'Dermatology & Laser',
    defaultCost: 15000,
    defaultSessions: 5
  });

  const [toast, setToast] = useState(null);
  const [staffResetInputs, setStaffResetInputs] = useState({});
  const pendingStaffResets = passwordResetRequests.filter((r) => r.status === 'PENDING');

  useEffect(() => {
    if (tenant) {
      setBrandingForm({
        name: tenant.name || '',
        logoUrl: tenant.logoUrl || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        receiptHeader: tenant.receiptHeader || '',
        receiptFooter: tenant.receiptFooter || '',
        smsApiUrl: tenant.smsApiUrl || '',
        smsApiKey: tenant.smsApiKey || '',
        smsEnabled: tenant.smsEnabled ?? true,
        adminPin: tenant.adminPin || '1234'
      });
    }
  }, [tenant]);

  // Date/Month Matcher Helper
  const matchesDateFilter = (isoDateString) => {
    if (!isoDateString || timeFilterMode === 'ALL') return true;
    const d = new Date(isoDateString);
    const yyyyMmDd = d.toISOString().slice(0, 10);
    const yyyyMm = d.toISOString().slice(0, 7);
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthStr = new Date().toISOString().slice(0, 7);

    if (timeFilterMode === 'TODAY') return yyyyMmDd === todayStr;
    if (timeFilterMode === 'THIS_MONTH') return yyyyMm === currentMonthStr;
    if (timeFilterMode === 'CUSTOM_DATE') return yyyyMmDd === customDate;
    if (timeFilterMode === 'CUSTOM_MONTH') return yyyyMm === customMonth;
    return true;
  };

  // Filtered Sales & Treatments according to selected Day / Month filter
  const completedSales = sales.filter(
    (s) => s.status === 'COMPLETED' && matchesDateFilter(s.createdAt)
  );
  const filteredTreatments = treatments.filter((t) => matchesDateFilter(t.createdAt));

  const dailySalesClosing = completedSales.reduce((sum, s) => sum + Number(s.amountPaidToday || 0), 0);
  const totalInvoicedRevenue = completedSales.reduce((sum, s) => sum + Number(s.netTotal || 0), 0);
  const totalCostOfGoods = completedSales.reduce((sum, s) => {
    const itemCost = (s.items || []).reduce(
      (c, i) => c + Number(i.costPrice || 0) * Number(i.qty || 1),
      0
    );
    return sum + itemCost;
  }, 0);
  const estimatedNetProfit = totalInvoicedRevenue - totalCostOfGoods;

  const activeRecoverableTreatments = filteredTreatments.filter((t) => t.status === 'IN_PROGRESS');
  const outstandingRecoverables = activeRecoverableTreatments.reduce(
    (sum, t) => sum + Number(t.remainingBalance || 0),
    0
  );

  const inventoryStockValue = inventory.reduce(
    (sum, i) => sum + Number(i.purchasePrice || 0) * Number(i.quantity || 0),
    0
  );
  const inventoryRetailValue = inventory.reduce(
    (sum, i) => sum + Number(i.sellingPrice || 0) * Number(i.quantity || 0),
    0
  );

  const pendingDiscounts = discountRequests.filter((d) => d.status === 'PENDING');

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Live Forgot Username / Password Recovery Requests Banner (From Login Screen) */}
      {false && pendingStaffResets.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-amber-500 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-navy">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-navy">
                Staff / Account Password & Username Recovery Requests ({pendingStaffResets.length})
              </h3>
              <p className="text-xs text-slate-500">
                Staff or users who clicked "Forgot Username / Password?" on the Login Screen
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingStaffResets.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-extrabold text-navy text-sm">
                    Requested by: "{req.identifier}"
                  </div>
                  <div className="text-slate-600 mt-0.5">{req.message}</div>
                  {req.matchedUsername && (
                    <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-bold text-navy">
                      <span>Username: @{req.matchedUsername}</span>
                      <span>•</span>
                      <span className="text-emerald-700">
                        Current Pass: {req.currentPassword || '123'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {req.matchedUserId && (
                    <input
                      type="text"
                      placeholder="New password (e.g. 123456)"
                      value={staffResetInputs[req.id] || ''}
                      onChange={(e) =>
                        setStaffResetInputs({ ...staffResetInputs, [req.id]: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-navy"
                    />
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (onResolvePasswordReset) {
                        await onResolvePasswordReset(req.id, {
                          newPassword: staffResetInputs[req.id] || undefined
                        });
                        setToast(`Resolved recovery request for "${req.identifier}"!`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-gold font-extrabold flex items-center gap-1 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {staffResetInputs[req.id] ? 'Update Pass & Resolve' : 'Mark Resolved'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live WebSocket Pending Discount Alert Banner */}
      {pendingDiscounts.length > 0 && (
        <div className="bg-amber-500 text-navy px-5 py-3.5 rounded-2xl shadow-lg border-2 border-navy flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-navy text-gold-bright">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">
                LIVE WEBSOCKET ALERT: {pendingDiscounts.length} Pending Discount Approval Request!
              </div>
              <div className="text-xs font-semibold">
                {pendingDiscounts[0].staffName} requested Rs. {pendingDiscounts[0].discountRequested} off on Rs.{' '}
                {pendingDiscounts[0].cartTotal} bill for {pendingDiscounts[0].patientName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRespondDiscountRequest(pendingDiscounts[0].id, 'APPROVED')}
              className="px-4 py-2 rounded-xl bg-navy text-gold-bright font-extrabold text-xs flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>1-Click Approve Rs. {pendingDiscounts[0].discountRequested}</span>
            </button>
            <button
              type="button"
              onClick={() => onRespondDiscountRequest(pendingDiscounts[0].id, 'REJECTED')}
              className="px-3.5 py-2 rounded-xl bg-alert text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation Box Cards (Admin Profile tab removed since it is in Top-Right Navbar; Active Box turns Green) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${
          isClinic && showPatientsModule ? 'lg:grid-cols-6' : 'lg:grid-cols-5'
        } gap-3`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveSection('APPROVALS_AND_REPORTS');
            setSelectedKpiDetail(null);
          }}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
            activeSection === 'APPROVALS_AND_REPORTS'
              ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
              : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeSection === 'APPROVALS_AND_REPORTS'
                ? 'bg-white/15 text-gold-bright'
                : 'bg-ice text-navy'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs truncate">Financial Reports & Ledgers</div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                activeSection === 'APPROVALS_AND_REPORTS' ? 'text-teal-light' : 'text-slate-500'
              }`}
            >
              Daily Closing, Profit & Approvals
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSection('INVENTORY');
            setSelectedKpiDetail(null);
          }}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
            activeSection === 'INVENTORY'
              ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
              : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeSection === 'INVENTORY'
                ? 'bg-white/15 text-gold-bright'
                : 'bg-ice text-teal'
            }`}
          >
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs truncate">Inventory & Stock Control</div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                activeSection === 'INVENTORY' ? 'text-teal-light' : 'text-slate-500'
              }`}
            >
              {inventory.length} In-Stock Items • Edit & Add
            </div>
          </div>
        </button>

        {isClinic && showPatientsModule && (
          <button
            type="button"
            onClick={() => setActiveSection('TREATMENT_CATALOG')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
              activeSection === 'TREATMENT_CATALOG'
                ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
                : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                activeSection === 'TREATMENT_CATALOG'
                  ? 'bg-white/15 text-gold-bright'
                  : 'bg-ice text-teal'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs truncate">Treatment Packages</div>
              <div
                className={`text-[10px] truncate mt-0.5 ${
                  activeSection === 'TREATMENT_CATALOG' ? 'text-teal-light' : 'text-slate-500'
                }`}
              >
                {treatmentCatalog.length} Active Packages in Dropdown
              </div>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveSection('STAFF')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
            activeSection === 'STAFF'
              ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
              : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeSection === 'STAFF' ? 'bg-white/15 text-gold-bright' : 'bg-ice text-navy'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs truncate">{isClinic ? 'Cashier / POS Staff' : 'Staff Accounts'}</div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                activeSection === 'STAFF' ? 'text-teal-light' : 'text-slate-500'
              }`}
            >
              {users.filter((u) => u.role === 'STAFF').length} {isClinic ? 'Receptionist' : 'Cashier / Staff'} Logins
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('AUDIT_SMS')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
            activeSection === 'AUDIT_SMS'
              ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
              : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeSection === 'AUDIT_SMS'
                ? 'bg-white/15 text-gold-bright'
                : 'bg-ice text-emerald-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs truncate">Audit & WhatsApp Logs</div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                activeSection === 'AUDIT_SMS' ? 'text-teal-light' : 'text-slate-500'
              }`}
            >
              {auditLogs.length} Security Logs Recorded
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SUBSCRIPTION')}
          className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
            activeSection === 'SUBSCRIPTION'
              ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
              : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              activeSection === 'SUBSCRIPTION'
                ? 'bg-white/15 text-gold-bright'
                : 'bg-ice text-navy'
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs truncate">Subscription Status</div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                activeSection === 'SUBSCRIPTION' ? 'text-teal-light' : 'text-slate-500'
              }`}
            >
              Day {tenant?.subscription?.billingCycleDay || 1}/30 • {tenant?.subscription?.state}
            </div>
          </div>
        </button>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex justify-between">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="underline">
            Close
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 1: FINANCIAL REPORTS, CLICKABLE KPI CARDS & DAY/MONTH VIEW  */}
      {/* =================================================================== */}
      {activeSection === 'APPROVALS_AND_REPORTS' && (
        <div className="space-y-5">
          {/* Commercial 1-Click CSV / Excel Export Bar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-extrabold text-navy">1-Click CSV / Excel Business Data Exports:</span>
                <span className="hidden sm:inline text-[10px] text-slate-400 font-medium ml-2">
                  Standard RFC4180 Format for Excel, Google Sheets, QuickBooks
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onExportCSV && onExportCSV('sales')}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download all sales transactions and receipts in CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export Sales CSV</span>
              </button>

              <button
                type="button"
                onClick={() => onExportCSV && onExportCSV('patients')}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download all registered patients and ledger balances in CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>{isClinic ? "Export Patient Dues CSV" : "Export Customer Dues CSV"}</span>
              </button>

              <button
                type="button"
                onClick={() => onExportCSV && onExportCSV('inventory')}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download complete stock inventory with purchase & selling valuation in CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span>Export Stock Valuation CSV</span>
              </button>
            </div>
          </div>

          {/* Date / Month Filter Bar */}
          <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-navy">
              <Calendar className="w-4 h-4 text-teal" />
              <span>Filter Reports & KPI Cards by Day / Month:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTimeFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold ${
                  timeFilterMode === 'ALL' ? 'bg-navy text-gold' : 'bg-ice/60 text-navy'
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setTimeFilterMode('TODAY')}
                className={`px-3 py-1.5 rounded-xl font-bold ${
                  timeFilterMode === 'TODAY' ? 'bg-navy text-gold' : 'bg-ice/60 text-navy'
                }`}
              >
                Today ({new Date().toISOString().slice(0, 10)})
              </button>
              <button
                type="button"
                onClick={() => setTimeFilterMode('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-xl font-bold ${
                  timeFilterMode === 'THIS_MONTH' ? 'bg-navy text-gold' : 'bg-ice/60 text-navy'
                }`}
              >
                This Month ({new Date().toISOString().slice(0, 7)})
              </button>

              <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-600">Specific Day:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setTimeFilterMode('CUSTOM_DATE');
                  }}
                  className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-600">Specific Month:</span>
                <input
                  type="month"
                  value={customMonth}
                  onChange={(e) => {
                    setCustomMonth(e.target.value);
                    setTimeFilterMode('CUSTOM_MONTH');
                  }}
                  className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-xs"
                />
              </div>

              {/* Sensitive Financial Pricing & Profit Privacy Toggle */}
              <button
                type="button"
                onClick={toggleFinancialPrivacy}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  hideFinancialMetrics
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-sm'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 shadow-sm'
                }`}
                title="Toggle privacy masking for sensitive daily cash closing and profit margin metrics"
              >
                {hideFinancialMetrics ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                    <span>Financial Metrics: Hidden (Click to Reveal)</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Financial Metrics: Visible (Click to Hide)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Interactive Clickable KPI Cards (Whichever card is clicked turns Solid Green/Teal - Image 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => {
                if (hideFinancialMetrics) {
                  toggleFinancialPrivacy();
                } else {
                  setSelectedKpiDetail('DAILY_CLOSING');
                }
              }}
              className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
                selectedKpiDetail === 'DAILY_CLOSING'
                  ? 'bg-teal text-white ring-4 ring-gold shadow-lg'
                  : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-navy hover:shadow-md'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
                  selectedKpiDetail === 'DAILY_CLOSING' ? 'text-gold-bright' : 'text-slate-500'
                }`}
              >
                <span>Daily Cash Closing (Collected)</span>
                {hideFinancialMetrics ? (
                  <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <ExternalLink
                    className={`w-4 h-4 shrink-0 ${
                      selectedKpiDetail === 'DAILY_CLOSING' ? 'text-gold-bright' : 'text-navy opacity-70'
                    }`}
                  />
                )}
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight my-1.5 ${
                  selectedKpiDetail === 'DAILY_CLOSING' ? 'text-white' : 'text-navy'
                }`}
              >
                {hideFinancialMetrics ? (
                  <span className="tracking-widest font-mono text-2xl text-slate-400">Rs. ••••••</span>
                ) : (
                  `Rs. ${dailySalesClosing.toLocaleString()}`
                )}
              </div>
              <div
                className={`text-xs font-semibold flex items-center justify-between pt-1 border-t ${
                  selectedKpiDetail === 'DAILY_CLOSING'
                    ? 'text-teal-light border-white/15'
                    : 'text-emerald-700 border-slate-100'
                }`}
              >
                <span>{completedSales.length} Completed Invoices</span>
                <span
                  className={`underline font-bold ${
                    selectedKpiDetail === 'DAILY_CLOSING' ? 'text-gold-bright' : 'text-navy'
                  }`}
                >
                  {hideFinancialMetrics ? '🔒 Click to Reveal →' : 'Click for Full Page →'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (hideFinancialMetrics) {
                  toggleFinancialPrivacy();
                } else {
                  setSelectedKpiDetail('NET_PROFIT');
                }
              }}
              className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
                selectedKpiDetail === 'NET_PROFIT'
                  ? 'bg-teal text-white ring-4 ring-gold shadow-lg'
                  : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-emerald-600 hover:shadow-md'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
                  selectedKpiDetail === 'NET_PROFIT' ? 'text-gold-bright' : 'text-slate-500'
                }`}
              >
                <span>Net Profit / Margin Estimate</span>
                {hideFinancialMetrics ? (
                  <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <ExternalLink
                    className={`w-4 h-4 shrink-0 ${
                      selectedKpiDetail === 'NET_PROFIT' ? 'text-gold-bright' : 'text-emerald-700 opacity-70'
                    }`}
                  />
                )}
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight my-1.5 ${
                  selectedKpiDetail === 'NET_PROFIT' ? 'text-white' : 'text-emerald-700'
                }`}
              >
                {hideFinancialMetrics ? (
                  <span className="tracking-widest font-mono text-2xl text-slate-400">Rs. ••••••</span>
                ) : (
                  `Rs. ${estimatedNetProfit.toLocaleString()}`
                )}
              </div>
              <div
                className={`text-xs font-semibold flex items-center justify-between pt-1 border-t ${
                  selectedKpiDetail === 'NET_PROFIT'
                    ? 'text-teal-light border-white/15'
                    : 'text-slate-500 border-slate-100'
                }`}
              >
                <span>{hideFinancialMetrics ? 'Protected Profit Margin' : `COGS: Rs. ${totalCostOfGoods.toLocaleString()}`}</span>
                <span
                  className={`underline font-bold ${
                    selectedKpiDetail === 'NET_PROFIT' ? 'text-gold-bright' : 'text-emerald-800'
                  }`}
                >
                  {hideFinancialMetrics ? '🔒 Click to Reveal →' : 'Click for Full Page →'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedKpiDetail('RECOVERABLES')}
              className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
                selectedKpiDetail === 'RECOVERABLES'
                  ? 'bg-teal text-white ring-4 ring-gold shadow-lg'
                  : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-teal hover:shadow-md'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
                  selectedKpiDetail === 'RECOVERABLES' ? 'text-gold-bright' : 'text-slate-500'
                }`}
              >
                <span>{isClinic ? "Outstanding Recoverables Ledger" : "Customer Credit / Khata Receivables"}</span>
                <ExternalLink
                  className={`w-4 h-4 shrink-0 ${
                    selectedKpiDetail === 'RECOVERABLES' ? 'text-gold-bright' : 'text-teal opacity-70'
                  }`}
                />
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight my-1.5 ${
                  selectedKpiDetail === 'RECOVERABLES' ? 'text-white' : 'text-teal'
                }`}
              >
                Rs. {outstandingRecoverables.toLocaleString()}
              </div>
              <div
                className={`text-xs font-semibold flex items-center justify-between pt-1 border-t ${
                  selectedKpiDetail === 'RECOVERABLES'
                    ? 'text-teal-light border-white/15'
                    : 'text-slate-500 border-slate-100'
                }`}
              >
                <span>{activeRecoverableTreatments.length} Active Plans</span>
                <span
                  className={`underline font-bold ${
                    selectedKpiDetail === 'RECOVERABLES' ? 'text-gold-bright' : 'text-teal'
                  }`}
                >
                  Click for Full Page →
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedKpiDetail('INVENTORY_AUDIT')}
              className={`text-left rounded-2xl p-5 transition flex flex-col justify-between min-h-[128px] cursor-pointer ${
                selectedKpiDetail === 'INVENTORY_AUDIT'
                  ? 'bg-teal text-white ring-4 ring-gold shadow-lg'
                  : 'bg-white text-navy shadow-sm border border-slate-200 border-l-4 border-l-gold hover:shadow-md'
              }`}
            >
              <div
                className={`flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider ${
                  selectedKpiDetail === 'INVENTORY_AUDIT' ? 'text-gold-bright' : 'text-slate-500'
                }`}
              >
                <span>{isClinic ? "Pharmacy Inventory Audit Value" : "Store Stock & Inventory Valuation"}</span>
                <ExternalLink
                  className={`w-4 h-4 shrink-0 ${
                    selectedKpiDetail === 'INVENTORY_AUDIT' ? 'text-gold-bright' : 'text-navy opacity-70'
                  }`}
                />
              </div>
              <div
                className={`text-3xl font-extrabold tracking-tight my-1.5 ${
                  selectedKpiDetail === 'INVENTORY_AUDIT' ? 'text-white' : 'text-navy'
                }`}
              >
                Rs. {inventoryStockValue.toLocaleString()}
              </div>
              <div
                className={`text-xs font-semibold flex items-center justify-between pt-1 border-t ${
                  selectedKpiDetail === 'INVENTORY_AUDIT'
                    ? 'text-teal-light border-white/15'
                    : 'text-alert border-slate-100'
                }`}
              >
                <span>
                  {inventory.filter((i) => Number(i.quantity) <= Number(i.minStockAlert || 10)).length} Low-Stock
                </span>
                <span
                  className={`underline font-bold ${
                    selectedKpiDetail === 'INVENTORY_AUDIT' ? 'text-gold-bright' : 'text-navy'
                  }`}
                >
                  Click for Full Page →
                </span>
              </div>
            </button>
          </div>

          {/* =============================================================== */}
          {/* DEDICATED SEPARATE PAGE VIEW WHEN A KPI CARD IS CLICKED         */}
          {/* =============================================================== */}
          {selectedKpiDetail === 'DAILY_CLOSING' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-navy space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-navy text-gold px-2 py-0.5 rounded font-bold">
                    DEDICATED REPORT PAGE • DAY / MONTH BREAKDOWN
                  </span>
                  <h3 className="font-extrabold text-lg text-navy mt-1">
                    Daily Sales Closing & Cash Collection Breakdown (Rs. {dailySalesClosing.toLocaleString()})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-ice px-3 py-1.5 rounded-xl border border-slate-300">
                    <Users className="w-4 h-4 text-teal" />
                    <span className="font-bold text-navy text-[11px]">Staff / Cashier:</span>
                    <select
                      value={cashierFilter}
                      onChange={(e) => setCashierFilter(e.target.value)}
                      className="bg-transparent font-bold text-navy text-xs outline-none cursor-pointer"
                    >
                      <option value="ALL">All Cashiers Combined</option>
                      {Array.from(new Set(completedSales.map((s) => s.cashierName).filter(Boolean))).map((cName) => (
                        <option key={cName} value={cName}>{cName}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedKpiDetail(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Overview</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] uppercase text-slate-500">
                      <th className="py-2.5 px-3">Date & Exact Time</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Patient / Walk-in Customer</th>
                      <th className="py-2.5 px-3">Items / Treatments Sold</th>
                      <th className="py-2.5 px-3">Cashier</th>
                      <th className="py-2.5 px-3">Net Total</th>
                      <th className="py-2.5 px-3">Cash Collected</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedSales
                    .filter((s) => cashierFilter === 'ALL' || s.cashierName === cashierFilter)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-ice/30">
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-teal">
                          {new Date(s.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-navy">{s.invoiceNumber}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-navy">{s.patientName}</div>
                          <div className="text-[10px] font-mono text-slate-500">{s.patientPhone}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {(s.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{s.cashierName}</td>
                        <td className="py-3 px-3 font-mono font-bold">
                          Rs. {Number(s.netTotal).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                          Rs. {Number(s.amountPaidToday).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Delete invoice ${s.invoiceNumber} (Rs. ${s.netTotal}) permanently?`
                                )
                              ) {
                                if (onDeleteSale) {
                                  await onDeleteSale(s.id);
                                  setToast(`Invoice ${s.invoiceNumber} deleted.`);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-alert hover:bg-red-50 transition cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedKpiDetail === 'NET_PROFIT' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-600 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">
                    DEDICATED PROFIT & LOSS PAGE • ITEM-WISE MARGIN
                  </span>
                  <h3 className="font-extrabold text-lg text-navy mt-1">
                    Profit / Loss & COGS Breakdown — Net Profit: Rs. {estimatedNetProfit.toLocaleString()}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedKpiDetail(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Overview</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] uppercase text-slate-500">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Invoice # & Customer</th>
                      <th className="py-2.5 px-3">Items Sold</th>
                      <th className="py-2.5 px-3">Sale Revenue</th>
                      <th className="py-2.5 px-3">Purchase Cost (COGS)</th>
                      <th className="py-2.5 px-3">Net Profit Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedSales.map((s) => {
                      const cogs = (s.items || []).reduce(
                        (c, i) => c + Number(i.costPrice || 0) * Number(i.qty || 1),
                        0
                      );
                      const profit = Number(s.netTotal || 0) - cogs;
                      return (
                        <tr key={s.id} className="hover:bg-emerald-50/30">
                          <td className="py-3 px-3 font-mono text-[11px]">
                            {new Date(s.createdAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-navy">{s.invoiceNumber}</div>
                            <div className="text-[11px] text-slate-600">{s.patientName}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold">
                            {(s.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-navy">
                            Rs. {Number(s.netTotal).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            Rs. {cogs.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                            + Rs. {profit.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedKpiDetail === 'RECOVERABLES' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-teal text-white px-2 py-0.5 rounded font-bold">
                    DEDICATED RECOVERABLES LEDGER PAGE • SESSION TIMELINE
                  </span>
                  <h3 className="font-extrabold text-lg text-navy mt-1">
                    Outstanding Patient Recoverables — Total Pending: Rs.{' '}
                    {outstandingRecoverables.toLocaleString()}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedKpiDetail(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Overview</span>
                </button>
              </div>

              <div className="space-y-3">
                {filteredTreatments.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-ice/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs bg-navy text-gold px-2 py-0.5 rounded font-bold">
                          {t.patientCode}
                        </span>
                        <span className="font-extrabold text-sm text-navy ml-2">{t.patientName}</span>
                        <span className="font-mono text-xs text-slate-600 ml-2">({t.patientPhone})</span>
                        <div className="font-bold text-xs text-teal mt-1">
                          {t.title} • Started:{' '}
                          {new Date(t.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span>Agreed: Rs. {t.totalCost.toLocaleString()}</span>
                        <span className="text-emerald-700 font-bold">
                          Paid: Rs. {t.paidAmount.toLocaleString()}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-teal text-white font-extrabold">
                          Remaining: Rs. {t.remainingBalance.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Permanently delete treatment ledger "${t.title}" for ${t.patientName}? All ${t.sessions.length} installment records will be deleted.`
                              )
                            ) {
                              if (onDeleteTreatment) {
                                await onDeleteTreatment(t.id);
                                setToast(`Treatment ledger "${t.title}" deleted.`);
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-alert hover:bg-red-50 border border-slate-200 transition cursor-pointer"
                          title="Delete Treatment Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1">
                      {t.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-wrap justify-between text-[11px] bg-white px-3 py-1.5 rounded border border-slate-200"
                        >
                          <span>
                            <strong>Session #{s.sessionNumber}</strong> •{' '}
                            <span className="font-mono text-teal font-bold">
                              {new Date(s.date).toLocaleString([], {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>{' '}
                            — {s.notes} ({s.invoiceNumber})
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            Paid: Rs. {s.amountPaid.toLocaleString()} | Bal After: Rs.{' '}
                            {s.balanceAfter.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedKpiDetail === 'INVENTORY_AUDIT' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gold space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-navy text-gold px-2 py-0.5 rounded font-bold">
                    DEDICATED INVENTORY VALUATION & STOCK AUDIT PAGE
                  </span>
                  <h3 className="font-extrabold text-lg text-navy mt-1">
                    Stock Audit — Purchase Cost Value: Rs. {inventoryStockValue.toLocaleString()} | Expected Retail Value: Rs.{' '}
                    {inventoryRetailValue.toLocaleString()}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkProductModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-gold-bright" />
                    <span>Bulk Import Products (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedKpiDetail(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Overview</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] uppercase text-slate-500">
                      <th className="py-2.5 px-3">Barcode</th>
                      <th className="py-2.5 px-3">Product / Medicine Name</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Stock Available</th>
                      <th className="py-2.5 px-3">Unit Cost / Sale</th>
                      <th className="py-2.5 px-3">Total Stock Cost</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((i) => (
                      <tr key={i.id} className="hover:bg-ice/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-navy">{i.barcode}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{i.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{i.supplier}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono font-extrabold text-[11px] ${
                              Number(i.quantity) <= Number(i.minStockAlert || 10)
                                ? 'bg-alert text-white'
                                : 'bg-teal text-white'
                            }`}
                          >
                            {i.quantity} units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          Rs. {i.purchasePrice} / <strong>Rs. {i.sellingPrice}</strong>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-navy">
                          Rs. {(Number(i.purchasePrice) * Number(i.quantity)).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{i.expiryDate}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setStockModalItem(i)}
                              className="px-2 py-0.5 rounded-md bg-teal/10 hover:bg-teal text-teal hover:text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Delete ${i.name}?`)) {
                                  if (onDeleteStock) await onDeleteStock(i.id);
                                  setToast(`Deleted ${i.name}`);
                                }
                              }}
                              className="p-1 rounded-md bg-red-50 hover:bg-alert text-alert hover:text-white cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Default Overview Grid when no specific KPI card is expanded */}
          {!selectedKpiDetail && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Real-Time Discount Approval Queue */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-navy flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-gold" />
                      <span>Real-Time Discount Approval Dashboard</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      1-Click Remote WebSocket Approval + PIN History
                    </p>
                  </div>
                  <span className="font-mono text-xs bg-navy text-gold px-2.5 py-1 rounded-lg font-bold">
                    PIN: {tenant?.adminPin}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                  {discountRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        req.status === 'PENDING'
                          ? 'bg-amber-50 border-amber-400'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-navy">
                          {req.patientName} — Discount Rs. {Number(req.discountRequested).toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            req.status === 'PENDING'
                              ? 'bg-amber-500 text-navy'
                              : req.status === 'APPROVED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-alert text-white'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Staff: <strong>{req.staffName}</strong> • Cart: Rs. {req.cartTotal} • Reason: {req.reason}
                      </div>
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => onRespondDiscountRequest(req.id, 'APPROVED')}
                            className="flex-1 py-1.5 rounded-lg bg-navy text-gold font-bold text-xs"
                          >
                            Approve Remotely (1-Click)
                          </button>
                          <button
                            type="button"
                            onClick={() => onRespondDiscountRequest(req.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-alert text-white font-bold text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Method: {req.approvalMethod} • By: {req.approvedBy} • Receipt: {req.invoiceNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Outstanding Recoverables Ledger + Admin Refund Control */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-navy">
                      Outstanding Recoverables Ledger (Patient Installment Dues)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Includes start date, last session date, total cost, and remaining balance
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500">
                        <th className="py-2 px-2">Patient</th>
                        <th className="py-2 px-2">Treatment & Dates</th>
                        <th className="py-2 px-2">Total Cost</th>
                        <th className="py-2 px-2">Paid</th>
                        <th className="py-2 px-2">Recoverable Balance</th>
                        <th className="py-2 px-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTreatments.map((t) => {
                        const lastSes = t.sessions?.[t.sessions.length - 1];
                        return (
                          <tr key={t.id}>
                            <td className="py-2.5 px-2">
                              <div className="font-bold text-navy">{t.patientName}</div>
                              <div className="font-mono text-[10px] text-slate-500">
                                {t.patientPhone} • {t.patientCode}
                              </div>
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="font-bold text-slate-800">{t.title}</div>
                              <div className="text-[10px] font-mono text-teal">
                                Started: {new Date(t.createdAt).toLocaleDateString()}
                                {lastSes
                                  ? ` • Last Session (#${lastSes.sessionNumber}): ${new Date(
                                      lastSes.date
                                    ).toLocaleDateString()}`
                                  : ''}
                              </div>
                            </td>
                            <td className="py-2.5 px-2 font-mono">Rs. {t.totalCost.toLocaleString()}</td>
                            <td className="py-2.5 px-2 font-mono text-emerald-700 font-bold">
                              Rs. {t.paidAmount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-2">
                              <span
                                className={`px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs ${
                                  t.remainingBalance > 0
                                    ? 'bg-teal text-white'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                Rs. {t.remainingBalance.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Delete treatment plan "${t.title}" for ${t.patientName} permanently? Remaining balance Rs. ${t.remainingBalance.toLocaleString()} will be cleared.`
                                    )
                                  ) {
                                    if (onDeleteTreatment) {
                                      await onDeleteTreatment(t.id);
                                      setToast(`Treatment ledger "${t.title}" deleted.`);
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-alert hover:bg-red-50 transition cursor-pointer"
                                title="Delete Treatment Ledger Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Admin-Only Invoice Refund / Cancellation Control */}
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-extrabold text-xs text-navy mb-2">
                    Recent Invoices (Admin Authorized Refund / Cancellation & Deletion)
                  </h4>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {sales.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between bg-ice/30 px-3 py-2 rounded-xl text-xs gap-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-navy">{s.invoiceNumber}</span> •{' '}
                          <span className="font-bold">{s.patientName}</span> •{' '}
                          <span className="text-slate-600">
                            {(s.items || []).map((i) => `${i.name} x${i.qty}`).join(', ')}
                          </span>{' '}
                          • <span className="font-mono font-bold text-navy">Rs. {s.netTotal}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {s.status === 'REFUNDED' ? (
                            <span className="px-2 py-0.5 rounded bg-alert text-white text-[10px] font-bold">
                              REFUNDED
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                await onAdminRefundSale(s.id);
                                setToast(`Invoice ${s.invoiceNumber} refunded by Admin & stock restored.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-alert hover:bg-alert-dark text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Admin Refund</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Permanently delete invoice record ${s.invoiceNumber} (Rs. ${s.netTotal}) for ${s.patientName}?`
                                )
                              ) {
                                if (onDeleteSale) {
                                  await onDeleteSale(s.id);
                                  setToast(`Invoice ${s.invoiceNumber} permanently deleted.`);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-alert hover:bg-red-50 transition cursor-pointer"
                            title="Delete Invoice Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Register Shifts, Daily Drawer Closings & Z-Reports History */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-navy flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal" />
                  <span>Register Shifts & Cash Drawer Closings (Z-Reports History)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track cashier opening floats, gross/net cash collected, expected cash vs physical counted cash, and audit shortages.
                </p>
              </div>

              {activeShift ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Active Shift #{activeShift.code} ({activeShift.cashierName})</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
                  No Register Shift Currently Active
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Shift Code</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Cashier</th>
                    <th className="py-2.5 px-3">Opened At</th>
                    <th className="py-2.5 px-3">Closed At</th>
                    <th className="py-2.5 px-3">Opening Float</th>
                    <th className="py-2.5 px-3">Net Cash</th>
                    <th className="py-2.5 px-3">Expected Cash</th>
                    <th className="py-2.5 px-3">Actual Counted</th>
                    <th className="py-2.5 px-3">Discrepancy</th>
                    <th className="py-2.5 px-3 text-right">Z-Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Active Shift row if present */}
                  {activeShift && (
                    <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 font-semibold">
                      <td className="py-3 px-3 font-mono font-bold text-navy">#{activeShift.code}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] animate-pulse">
                          IN-PROGRESS
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{activeShift.cashierName}</td>
                      <td className="py-3 px-3 text-slate-600">{new Date(activeShift.openedAt).toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-700 font-bold">Active Right Now</td>
                      <td className="py-3 px-3 font-mono">Rs. {Number(activeShift.openingFloat || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">—</td>
                      <td className="py-3 px-3 font-mono text-slate-400">—</td>
                      <td className="py-3 px-3 font-mono text-slate-400">—</td>
                      <td className="py-3 px-3 text-slate-400">—</td>
                      <td className="py-3 px-3 text-right text-slate-400 text-[11px]">Open in POS</td>
                    </tr>
                  )}

                  {closedShifts.length === 0 && !activeShift ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                        No shift closing records found. Cash drawer shifts will appear here once cashier closes their register.
                      </td>
                    </tr>
                  ) : (
                    closedShifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-ice/30 transition">
                        <td className="py-3 px-3 font-mono font-bold text-navy">#{shift.code}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px]">
                            CLOSED
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{shift.cashierName}</td>
                        <td className="py-3 px-3 text-slate-600">{new Date(shift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-3 px-3 text-slate-600">{new Date(shift.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-3 px-3 font-mono">Rs. {Number(shift.openingFloat || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-teal">Rs. {Number(shift.netCashCollected || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-navy">Rs. {Number(shift.expectedCashInDrawer || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-800">Rs. {Number(shift.actualCashCounted || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold">
                          {shift.difference === 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                              TALLIED (0)
                            </span>
                          ) : shift.difference < 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-alert text-[10px]">
                              SHORT -Rs. {Math.abs(shift.difference).toLocaleString()}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px]">
                              OVER +Rs. {Number(shift.difference).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingAdminZReport(shift)}
                            className="px-2.5 py-1 rounded-lg bg-navy hover:bg-navy-light text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                          >
                            Z-Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION: DEDICATED INVENTORY & STOCK MANAGEMENT WORKSPACE           */}
      {/* =================================================================== */}
      {activeSection === 'INVENTORY' && (
        <div className="space-y-5">
          {/* Top Bar with Title, Summary, and Action Buttons */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal/10 text-teal border border-teal/20">
                  {isClinic
                    ? 'Clinic Pharmaceuticals'
                    : isRestaurant
                    ? 'Restaurant Menu & Kitchen'
                    : isPharmacy
                    ? 'Pharmacy Formulary & Expiry'
                    : 'Mart Inventory & Barcodes'}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {inventory.length} Total SKUs
                </span>
              </div>
              <h2 className="text-xl font-black text-navy tracking-tight">
                {isClinic
                  ? '🏥 Clinic Medicines & Pharmacy Stock'
                  : isRestaurant
                  ? '🍽️ Food Menu, Recipes & Kitchen Ingredients'
                  : isPharmacy
                  ? '💊 Pharmacy Stock & Medicine Expiry (Batch Tracking)'
                  : '🛒 Mart Products & Barcode Inventory'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Live catalog of active products, stock balances, cost & selling prices. Click "Edit" on any item to update prices or stock.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStockModalItem({
                  name: '',
                  barcode: String(Math.floor(100000000 + Math.random() * 900000000)),
                  category: isClinic ? 'Medicines' : isRestaurant ? 'Main Course' : isPharmacy ? 'Tablets' : 'General',
                  quantity: 10,
                  minStockAlert: 5,
                  purchasePrice: 100,
                  sellingPrice: 150,
                  unit: isRestaurant ? 'Portion' : 'Pcs',
                  supplier: tenant?.name || 'Local Store',
                  expiryDate: isRestaurant ? '' : '2027-12-31'
                })}
                className="px-4 py-2.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-gold-bright" />
                <span>
                  + Add {isRestaurant ? 'Menu Dish / Item' : isPharmacy ? 'Medicine / Drug' : isClinic ? 'Medicine / Service' : 'New Product'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkProductModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Upload multiple products at once via CSV or Excel format"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal" />
                <span>Bulk Import (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => onExportCSV && onExportCSV('inventory')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Download complete stock inventory spreadsheet"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Key Inventory Metrics KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Products / SKUs</div>
              <div className="text-2xl font-black text-navy mt-1">{inventory.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active items in catalog</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Units in Stock</div>
              <div className="text-2xl font-black text-teal mt-1">
                {inventory.reduce((acc, i) => acc + Number(i.quantity || 0), 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Combined available units</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Low Stock Alerts</div>
              <div className={`text-2xl font-black mt-1 ${inventory.filter((i) => Number(i.quantity) <= Number(i.minStockAlert || 10)).length > 0 ? 'text-alert' : 'text-emerald-600'}`}>
                {inventory.filter((i) => Number(i.quantity) <= Number(i.minStockAlert || 10)).length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">&le; 10 units remaining</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Inventory Valuation</div>
              <div className="text-lg font-black text-navy mt-1">
                Rs. {inventoryStockValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Retail Worth: <strong className="text-teal">Rs. {inventoryRetailValue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Search, Filter & Quick Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, barcode, supplier, or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-teal"
                />
                {inventorySearch && (
                  <button
                    type="button"
                    onClick={() => setInventorySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy bg-white focus:outline-teal cursor-pointer"
                >
                  <option value="ALL">All Categories ({inventory.length})</option>
                  {Array.from(new Set(inventory.map((i) => i.category || 'General').filter(Boolean))).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Low Stock Toggle */}
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50 shrink-0">
                <input
                  type="checkbox"
                  checked={inventoryLowStockOnly}
                  onChange={(e) => setInventoryLowStockOnly(e.target.checked)}
                  className="rounded text-teal focus:ring-teal"
                />
                <span>Low Stock Only ({inventory.filter((i) => Number(i.quantity) <= Number(i.minStockAlert || 10)).length})</span>
              </label>
            </div>
          </div>

          {/* Main Inventory Items Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50/80 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider">
                    <th className="py-3 px-4">Barcode / SKU</th>
                    <th className="py-3 px-4">Product / Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock Level & Adjust</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                    <th className="py-3 px-4 text-right">Profit Margin</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory
                    .filter((i) => {
                      if (inventoryCategory !== 'ALL' && (i.category || 'General') !== inventoryCategory) return false;
                      if (inventoryLowStockOnly && Number(i.quantity || 0) > Number(i.minStockAlert || 10)) return false;
                      if (inventorySearch.trim()) {
                        const q = inventorySearch.toLowerCase().trim();
                        const n = (i.name || '').toLowerCase();
                        const b = (i.barcode || '').toLowerCase();
                        const s = (i.supplier || '').toLowerCase();
                        const c = (i.category || '').toLowerCase();
                        return n.includes(q) || b.includes(q) || s.includes(q) || c.includes(q);
                      }
                      return true;
                    })
                    .map((item) => {
                      const qty = Number(item.quantity || 0);
                      const minAlert = Number(item.minStockAlert || 10);
                      const cost = Number(item.purchasePrice || 0);
                      const retail = Number(item.sellingPrice || 0);
                      const margin = retail > 0 ? (((retail - cost) / retail) * 100).toFixed(0) : '0';
                      const isLow = qty <= minAlert && qty > 0;
                      const isOut = qty <= 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-navy whitespace-nowrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.barcode || 'NO-BARCODE'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                            {item.supplier && <div className="text-[10px] text-slate-400">Supplier: {item.supplier}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {item.category || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onUpdateStock) {
                                    const newQ = Math.max(0, qty - 1);
                                    await onUpdateStock(item.id, { ...item, quantity: newQ });
                                    setToast(`Stock updated: ${item.name} (${newQ} units)`);
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center transition cursor-pointer"
                                title="Quick Deduct 1 unit"
                              >
                                -
                              </button>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-mono font-extrabold text-[11px] min-w-[65px] text-center ${
                                  isOut
                                    ? 'bg-red-100 text-alert border border-red-200'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {qty} {item.unit || 'units'}
                              </span>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onUpdateStock) {
                                    const newQ = qty + 1;
                                    await onUpdateStock(item.id, { ...item, quantity: newQ });
                                    setToast(`Stock updated: ${item.name} (${newQ} units)`);
                                  }
                                }}
                                className="w-6 h-6 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal font-black text-xs flex items-center justify-center transition cursor-pointer"
                                title="Quick Add 1 unit"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-600 whitespace-nowrap">
                            Rs. {cost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-navy whitespace-nowrap">
                            Rs. {retail.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[11px] whitespace-nowrap">
                            <span className={Number(margin) >= 20 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                              {margin}%
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {item.expiryDate || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setStockModalItem(item)}
                                className="px-2.5 py-1 rounded-lg bg-teal/10 hover:bg-teal text-teal hover:text-white font-extrabold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                title="Edit product details, prices and quantity"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete "${item.name}" from inventory?`)) {
                                    if (onDeleteStock) await onDeleteStock(item.id);
                                    setToast(`Deleted "${item.name}"`);
                                  }
                                }}
                                className="p-1 rounded-lg bg-red-50 hover:bg-alert text-alert hover:text-white transition cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {inventory.length === 0 && (
                <div className="p-12 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-navy text-sm">No Inventory Items Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your product catalog is empty. Click "+ Add New Product" or import via CSV to start tracking stock.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStockModalItem({
                      name: '',
                      barcode: String(Math.floor(100000000 + Math.random() * 900000000)),
                      category: 'General',
                      quantity: 20,
                      minStockAlert: 5,
                      purchasePrice: 100,
                      sellingPrice: 150,
                      unit: 'Pcs',
                      supplier: tenant?.name || 'Local Store',
                      expiryDate: '2027-12-31'
                    })}
                    className="px-4 py-2 rounded-xl bg-teal text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 2: BACKEND TREATMENT PACKAGES CATALOG (FOR DROPDOWN)        */}
      {/* =================================================================== */}
      {isClinic && showPatientsModule && activeSection === 'TREATMENT_CATALOG' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="font-extrabold text-sm text-navy">
                  Add Treatment to Clinic Catalog
                </h3>
                <p className="text-xs text-slate-500">
                  Treatments appear in Receptionist POS Ledger dropdown
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkTreatmentModal(true)}
                className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-gold-bright" />
                <span>Bulk Import Treatments</span>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onAddCatalogTreatment(catalogForm);
                setCatalogForm({
                  name: '',
                  category: 'Dermatology & Laser',
                  defaultCost: 15000,
                  defaultSessions: 5
                });
                setToast('New treatment package added to clinic dropdown catalog!');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Treatment / Package Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pico Laser Pigmentation Package (4 Sessions)"
                  value={catalogForm.name}
                  onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Restoration / Dental / Aesthetics"
                  value={catalogForm.category}
                  onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-navy mb-1">Default Package Cost (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={catalogForm.defaultCost}
                    onChange={(e) => setCatalogForm({ ...catalogForm, defaultCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Sessions</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={catalogForm.defaultSessions}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, defaultSessions: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-navy text-gold font-extrabold text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Save Treatment to Dropdown Catalog</span>
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm text-navy mb-3">
              Active Treatment Packages Catalog ({treatmentCatalog.length})
            </h3>
            <div className="space-y-2">
              {treatmentCatalog.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-ice/30"
                >
                  <div>
                    <div className="font-extrabold text-navy">{c.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.category} • Default Cost:{' '}
                      <strong className="font-mono text-teal">
                        Rs. {Number(c.defaultCost).toLocaleString()}
                      </strong>{' '}
                      ({c.defaultSessions} Sessions)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCatalogTreatment(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-alert hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 4: STAFF MANAGEMENT WITH LOGIN USERNAME & PASSWORD          */}
      {/* =================================================================== */}
      {activeSection === 'STAFF' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm text-navy mb-1">Create Receptionist / Cashier Login</h3>
            <p className="text-xs text-slate-500 mb-4">
              Receptionists logging in with these credentials will ONLY see the POS Panel.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = { ...staffForm };
                  await onCreateStaff(payload);
                  setStaffForm({ name: '', username: '', password: '123', role: 'STAFF' });
                  setToast(`Staff Account @${payload.username} created & saved successfully!`);
                  setStaffPassModal(payload);
                } catch (err) {
                  setToast(`Error: ${err.message}`);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Full Name & Shift</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hina Riaz (Morning POS Cashier)"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Login Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hina.pos"
                  value={staffForm.username}
                  onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Login Password</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-navy text-gold font-extrabold text-xs"
              >
                + Create {isClinic ? 'POS Receptionist Login' : 'POS Cashier / Staff Login'}
              </button>
            </form>
          </div>

          <div className="md:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm text-navy mb-3">
              Registered {isClinic ? 'Clinic' : 'Store'} Staff Accounts
            </h3>
            <div className="space-y-2">
              {users
                .filter((u) => u.role !== 'SUPER_ADMIN')
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy">{u.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        Username: <strong>{u.username}</strong> • Pass: <strong>{u.password || '123'}</strong> • Role:{' '}
                        <strong>{u.role === 'CLINIC_ADMIN' ? 'ADMIN' : u.role}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.role === 'CLINIC_ADMIN' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-navy text-gold font-extrabold text-[11px]">
                          {isClinic ? 'Clinic Owner / Admin' : 'Store Admin'} (Protected)
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedStaffAudit(u)}
                            className="px-2.5 py-1.5 rounded-xl bg-ice hover:bg-slate-200 text-navy border border-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                            title="View this staff member's sales, cash collected, and performance for today"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-teal" />
                            <span>Today's Work Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setStaffPassModal({
                              name: u.name,
                              username: u.username,
                              password: u.password || '123',
                              role: u.role
                            })}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                            title="Share login URL and credentials with staff"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Share Login</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleStaff(u.id, !u.active)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition ${
                              u.active !== false
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            }`}
                          >
                            {u.active !== false
                              ? 'Active (Click to Suspend)'
                              : 'Suspended (Click to Activate)'}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Delete staff account "${u.name}" (@${u.username}) permanently?`
                                )
                              ) {
                                await onDeleteStaff(u.id);
                                setToast(`Deleted staff account @${u.username}`);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-alert hover:text-white text-alert border border-red-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Delete Staff Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 5: FULL ANTI-FRAUD AUDIT LOG & SMS/WHATSAPP LOGS            */}
      {/* =================================================================== */}
      {activeSection === 'AUDIT_SMS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm text-navy mb-1">
              Full Security & Discount Audit Log
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Logs Staff ID, Timestamp, Discount Requested, Approving Admin, and Exact Receipt ID
            </p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-ice/30 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-navy">
                    <span>{log.action}</span>
                    <span className="font-mono text-[10px] bg-navy text-gold px-2 py-0.5 rounded">
                      Receipt: {log.receiptId}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1">{log.details}</p>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 flex flex-wrap gap-3">
                    <span>Staff: {log.staffName} ({log.staffId})</span>
                    <span>Approver: {log.approvingAdmin}</span>
                    <span>Time: {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-extrabold text-sm text-teal mb-1">
              Automated SMS & WhatsApp Dispatch Log
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Triggered automatically upon POS invoice & session payment generation
            </p>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {smsLogs.map((sms) => (
                <div key={sms.id} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <div className="flex justify-between font-bold text-emerald-950">
                    <span>To: {sms.patientName} ({sms.recipientPhone})</span>
                    <span className="text-[10px] font-mono bg-emerald-600 text-white px-2 py-0.5 rounded">
                      {sms.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 mt-1.5 text-slate-800">
                    "{sms.message}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 6: SUBSCRIPTION STATUS, ACTIVATION KEY & PRICING PLANS (IMG 1) */}
      {/* =================================================================== */}
      {activeSection === 'SUBSCRIPTION' && (
        <div className="space-y-6 max-w-4xl">
          {/* Main Subscription Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-navy">
                    {isClinic ? 'Clinical SaaS Subscription Status' : 'Cloud POS SaaS Subscription Status'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                      tenant?.planType === 'TRIAL_3_DAYS'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : tenant?.planType === 'YEARLY'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : tenant?.planType === '3_YEARS'
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        : tenant?.planType === 'CUSTOM'
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : 'bg-teal/15 text-teal border border-teal/30'
                    }`}
                  >
                    {tenant?.planType === 'TRIAL_3_DAYS'
                      ? '3-Day Free Trial'
                      : tenant?.planType === 'YEARLY'
                      ? '1-Year Package (365 Days)'
                      : tenant?.planType === '3_YEARS'
                      ? '3-Year Multi-Year (1095 Days)'
                      : tenant?.planType === 'CUSTOM'
                      ? `Custom (${tenant?.cycleDays || 30} Days)`
                      : 'Monthly Package (30 Days)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isClinic ? 'Clinic: ' : 'Store / Business: '}<strong className="text-navy">{tenant?.name}</strong> • Subdomain:{' '}
                  <span className="font-mono text-teal font-bold">{tenant?.domain}</span>
                </p>
              </div>

              <span
                className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs shadow-sm ${
                  tenant?.subscription?.state === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : tenant?.subscription?.state === 'GRACE_PERIOD'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-red-100 text-alert border border-red-300'
                }`}
              >
                ● {tenant?.subscription?.state} (Day {tenant?.subscription?.billingCycleDay}/
                {tenant?.subscription?.totalDays || 30})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-ice/40 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Current Cycle Day</div>
                <div className="text-2xl font-extrabold text-navy font-mono mt-1">
                  Day {tenant?.subscription?.billingCycleDay}{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    / {tenant?.subscription?.totalDays || 30}
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-ice/40 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Active Days Remaining</div>
                <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                  {tenant?.subscription?.daysRemainingInCycle} Days
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-ice/40 border border-slate-200">
                <div className="text-[10px] font-bold uppercase text-slate-500">Subscription Package Fee</div>
                <div className="text-2xl font-extrabold text-teal font-mono mt-1">
                  Rs. {Number(tenant?.monthlyFee || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {tenant?.activeLicenseKey ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-emerald-950 font-extrabold flex items-center gap-2">
                      <span>Active License Key:</span>
                      <span className="font-mono bg-white px-2.5 py-0.5 rounded border border-emerald-300 font-black text-sm tracking-wide text-emerald-900">
                        {tenant.activeLicenseKey}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      Verified & Active • Full Multi-Staff Access Enabled
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black tracking-wide">
                    VERIFIED & ACTIVE
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Are you sure you want to INACTIVATE / REVOKE active license key "${tenant.activeLicenseKey}"?\n\nYour portal will become unlicensed/locked until a new key or card is activated.`
                        )
                      ) {
                        try {
                          await onDeactivateLicenseKey();
                          setToast('License key successfully inactivated. Portal is now locked.');
                        } catch (err) {
                          setToast(err.message || 'Could not inactivate key.');
                        }
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-red-50 hover:bg-alert hover:text-white border border-red-300 text-alert text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Inactivate or unbind this license key from your clinic"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Inactivate / Revoke Key</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Automated Subscription Active. Choose a package below to extend or upgrade your plan anytime.</span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Plans & Packages Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-base text-navy flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal" />
                  <span>Digital Snove Subscription Packages & Pricing</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Select a plan and contact Digital Snove on WhatsApp or Bank Transfer to generate your Activation Key.
                </p>
              </div>

              <a
                href={`https://wa.me/923131094557?text=${encodeURIComponent(
                  `Hello Digital Snove Support, I want to renew/subscribe to a package for my clinic "${tenant?.name}" (${tenant?.domain}). Please send banking details and Activation Key.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Key on WhatsApp</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Plan 1 */}
              <div
                className={`p-4 rounded-xl border text-center flex flex-col justify-between space-y-3 transition cursor-pointer hover:shadow-md ${
                  tenant?.planType === 'TRIAL_3_DAYS'
                    ? 'border-2 border-purple-600 bg-purple-50/50 ring-2 ring-purple-300'
                    : 'border-slate-200 bg-white hover:border-purple-400'
                }`}
                onClick={() => {
                  setCardModalPlan({
                    id: 'TRIAL_3_DAYS',
                    title: '3-Day Free Trial',
                    price: 0,
                    days: 3,
                    badge: 'Instant Trial Access'
                  });
                  setCardError('');
                  setCardSuccess(null);
                }}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    Free Trial
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-0.5">3-Day Free Trial</div>
                  <div className="text-2xl font-black text-purple-700 my-1 font-mono">Rs. 0</div>
                  <div className="text-[11px] text-slate-600">3 Days Full Access</div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 space-y-0.5 text-left">
                  <div>✓ POS + Stock + Patients</div>
                  <div>✓ Thermal Receipt Printing</div>
                  <div>✓ Card Required for Activation</div>
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-[11px] shadow transition cursor-pointer"
                >
                  🎁 Start Free Trial (Card)
                </button>
              </div>

              {/* Plan 2 */}
              <div
                className={`p-4 rounded-xl border text-center flex flex-col justify-between space-y-3 transition cursor-pointer hover:shadow-md ${
                  tenant?.planType === 'MONTHLY' || !tenant?.planType
                    ? 'border-2 border-teal bg-teal/5 ring-2 ring-teal/30'
                    : 'border-slate-200 bg-white hover:border-teal'
                }`}
                onClick={() => {
                  setCardModalPlan({
                    id: 'MONTHLY',
                    title: 'Monthly Subscription',
                    price: 7999,
                    days: 30,
                    badge: '30 Days Full Access'
                  });
                  setCardError('');
                  setCardSuccess(null);
                }}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
                    Standard Monthly
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-0.5">Monthly Plan</div>
                  <div className="text-2xl font-black text-teal my-1 font-mono">Rs. 7,999</div>
                  <div className="text-[11px] text-slate-600">Per Month (30 Days • HMS & Store)</div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 space-y-0.5 text-left">
                  <div>✓ 30 Days Full Access</div>
                  <div>✓ Multi-Staff POS Accounts</div>
                  <div>✓ Instant Key Generation</div>
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] shadow transition cursor-pointer"
                >
                  💳 Subscribe with Card
                </button>
              </div>

              {/* Plan 3 */}
              <div
                className={`p-4 rounded-xl border text-center flex flex-col justify-between space-y-3 transition cursor-pointer hover:shadow-md ${
                  tenant?.planType === 'YEARLY'
                    ? 'border-2 border-navy bg-navy/5 ring-2 ring-gold'
                    : 'border-slate-200 bg-white hover:border-navy'
                }`}
                onClick={() => {
                  setCardModalPlan({
                    id: 'YEARLY',
                    title: '1-Year Full License',
                    price: 76790,
                    days: 365,
                    badge: '365 Days Uninterrupted • Save Rs. 19,198'
                  });
                  setCardError('');
                  setCardSuccess(null);
                }}
              >
                <div className="relative">
                  <span className="px-2 py-0.5 rounded-full bg-gold text-navy text-[9px] font-black uppercase tracking-wider">
                    Save Rs. 19,198 (20% Off)
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-1">1-Year Package</div>
                  <div className="text-2xl font-black text-navy my-1 font-mono">Rs. 76,790</div>
                  <div className="text-[11px] text-slate-600">365 Days Full License (Billed Yearly)</div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 space-y-0.5 text-left">
                  <div>✓ 365 Days Uninterrupted</div>
                  <div>✓ Priority Support & Updates</div>
                  <div>✓ Instant Key Generation</div>
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-[11px] shadow transition cursor-pointer"
                >
                  🏆 Subscribe with Card
                </button>
              </div>

              {/* Plan 4 */}
              <div
                className={`p-4 rounded-xl border text-center flex flex-col justify-between space-y-3 transition cursor-pointer hover:shadow-md ${
                  tenant?.planType === '3_YEARS'
                    ? 'border-2 border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-300'
                    : 'border-slate-200 bg-white hover:border-indigo-400'
                }`}
                onClick={() => {
                  setCardModalPlan({
                    id: '3_YEARS',
                    title: '3-Year Multi-Year Package',
                    price: 229000,
                    days: 1095,
                    badge: '3 Years Continuous • Best Value'
                  });
                  setCardError('');
                  setCardSuccess(null);
                }}
              >
                <div className="relative">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">
                    Mega Value 3 Yrs
                  </span>
                  <div className="text-lg font-extrabold text-navy mt-1">3-Year Plan</div>
                  <div className="text-2xl font-black text-indigo-700 my-1 font-mono">Rs. 229,000</div>
                  <div className="text-[11px] text-slate-600">1095 Days (3 Years Unlocked)</div>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 space-y-0.5 text-left">
                  <div>✓ 3 Years Continuous</div>
                  <div>✓ Zero Price Hikes</div>
                  <div>✓ Instant Key Generation</div>
                </div>
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-[11px] shadow transition cursor-pointer"
                >
                  💎 Subscribe with Card
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Want to reset directly or test online payment?
              </span>
              <button
                type="button"
                onClick={async () => {
                  await onPaySubscriptionNow(tenant.id, 'CLINIC_ADMIN_PORTAL_RENEWAL');
                  setToast('Subscription renewed! Cycle reset to Day 1.');
                }}
                className="px-4 py-2 rounded-xl bg-ice hover:bg-slate-200 text-navy font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Direct 1-Click Renew to Day 1</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Permanent Facility Account & Subdomain Deletion */}
          <div className="bg-red-50/80 border-2 border-red-300 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600 text-white font-extrabold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-red-950">
                  Danger Zone: Permanent Facility Account & Subdomain Deletion
                </h3>
                <p className="text-xs text-red-800">
                  Permanently delete <strong>{tenant?.name}</strong> ({tenant?.domain}), all staff logins, patient session ledgers, stock catalog, and transaction history.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-red-200">
              <span className="text-[11px] text-red-700 font-medium">
                This action is irreversible. All cloud database records will be erased immediately.
              </span>
              <button
                type="button"
                onClick={async () => {
                  const facilityName = tenant?.name || 'facility';
                  const typed = window.prompt(
                    `CAUTION: You are about to permanently delete "${facilityName}" and its subdomain.\n\nAll invoices, patients, and credentials will be deleted.\n\nType DELETE to confirm:`
                  );
                  if (typed === 'DELETE') {
                    if (window.confirm(`FINAL CONFIRMATION: Are you 100% sure you want to delete ${facilityName}? This action is irreversible.`)) {
                      if (onDeleteTenant) {
                        await onDeleteTenant(tenant.id);
                      }
                    }
                  } else if (typed !== null) {
                    alert('Deletion cancelled: Confirmation word did not match "DELETE".');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Facility Account & Subdomain</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ONLINE CARD CHECKOUT & AUTO-KEY GENERATION MODAL (Image 1 & 2)      */}
      {/* =================================================================== */}
      {cardModalPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-gold shadow-2xl overflow-hidden my-6">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold text-navy font-extrabold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Digital Snove Card Subscription Checkout</h3>
                  <p className="text-[11px] text-gold-bright">
                    {cardModalPlan.title} • {cardModalPlan.days} Days • Rs. {cardModalPlan.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCardModalPlan(null);
                  setCardSuccess(null);
                  setCardError('');
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {cardError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-alert text-xs font-bold text-center">
                  {cardError}
                </div>
              )}

              {cardSuccess ? (
                /* Celebration Success View with Auto-Generated Key */
                <div className="space-y-4 text-center py-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-navy">Payment Authorized & Verified!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your Digital Snove Activation Key has been automatically generated and applied to your portal:
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-400 space-y-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
                      Auto-Generated Certified License Key
                    </div>
                    <div className="font-mono font-black text-lg text-purple-950 tracking-wider bg-white p-2.5 rounded-xl border border-purple-300 shadow-sm flex items-center justify-between">
                      <span>{cardSuccess.key?.keyCode}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (cardSuccess.key?.keyCode) {
                            navigator.clipboard?.writeText(cardSuccess.key.keyCode);
                            setCopiedNewKey(true);
                            setTimeout(() => setCopiedNewKey(false), 3000);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-purple-800"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedNewKey ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1 mt-1">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Applied to {tenant?.name} for {cardModalPlan.days} Days (Day 1 Active)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCardModalPlan(null);
                      setCardSuccess(null);
                    }}
                    className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-gold-bright font-extrabold text-xs shadow-lg transition cursor-pointer"
                  >
                    ✓ Done & Return to Portal
                  </button>
                </div>
              ) : (
                /* Card Input Form */
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCardLoading(true);
                    setCardError('');
                    try {
                      const res = await onCardCheckout({
                        planType: cardModalPlan.id,
                        cardNumber: cardForm.cardNumber,
                        cardExp: cardForm.cardExp,
                        cardCvc: cardForm.cardCvc,
                        cardName: cardForm.cardName || tenant?.name
                      });
                      if (res?.success) {
                        setCardSuccess(res);
                        setToast(res.message);
                      }
                    } catch (err) {
                      setCardError(err.message || 'Payment authorization failed');
                    } finally {
                      setCardLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Visual Credit Card Preview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-navy via-navy-light to-blue-950 text-white shadow-xl relative overflow-hidden space-y-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-xs tracking-wider text-gold-bright">
                        {tenant?.name || 'CLINIC PORTAL'}
                      </div>
                      <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                        {cardModalPlan.id === 'TRIAL_3_DAYS' ? 'FREE TRIAL' : 'SECURE CHECKOUT'}
                      </span>
                    </div>

                    <div className="font-mono text-base tracking-widest font-black py-1">
                      {cardForm.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/80 uppercase">
                      <div>
                        <span className="block opacity-60 text-[9px]">Cardholder</span>
                        <span className="font-bold text-white tracking-wide">
                          {cardForm.cardName || 'DOCTOR / OWNER'}
                        </span>
                      </div>
                      <div>
                        <span className="block opacity-60 text-[9px]">Expires</span>
                        <span className="font-bold text-white font-mono">{cardForm.cardExp || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Demo Fill Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setCardForm({
                          cardName: tenant?.name || 'Dr. Tariq Mahmood',
                          cardNumber: '4242 4242 4242 4242',
                          cardExp: '12/28',
                          cardCvc: '888'
                        })
                      }
                      className="text-[10px] font-bold text-teal hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-gold" />
                      <span>Auto-Fill Test Visa Card</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">Name on Card</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Tariq Mahmood"
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-navy mb-1">Card Number (Debit / Credit)</label>
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardForm.cardNumber}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 16)
                          .replace(/(.{4})/g, '$1 ')
                          .trim();
                        setCardForm({ ...cardForm, cardNumber: val });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy text-sm tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-navy mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardForm.cardExp}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (val.length >= 3) {
                            val = `${val.slice(0, 2)}/${val.slice(2)}`;
                          }
                          setCardForm({ ...cardForm, cardExp: val });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-navy mb-1">CVC / Security Code</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardForm.cardCvc}
                        onChange={(e) =>
                          setCardForm({
                            ...cardForm,
                            cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cardLoading}
                    className="w-full py-3.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ring-2 ring-gold/40"
                  >
                    <Sparkles className="w-4 h-4 text-gold-bright" />
                    <span>
                      {cardLoading
                        ? 'Authorizing Card & Generating Key...'
                        : cardModalPlan.price === 0
                        ? 'Verify Card & Start 3-Day Free Trial (Rs. 0)'
                        : `Authorize Card & Activate (Rs. ${cardModalPlan.price.toLocaleString()})`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Z-Report Full Details & Print Modal */}
      {viewingAdminZReport && (
        <div className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Official Register Shift Z-Report</h3>
                  <p className="text-[10px] text-slate-300">Shift #{viewingAdminZReport.code} • {viewingAdminZReport.cashierName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingAdminZReport(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-extrabold text-sm text-navy uppercase">{tenant?.name || 'Clinic POS'}</h4>
                <p className="text-[10px] text-slate-500">EXECUTIVE AUDIT CASH DRAWER RECONCILIATION</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Closed: {new Date(viewingAdminZReport.closedAt || Date.now()).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Invoices Billed:</span>
                  <span className="font-bold text-navy">{viewingAdminZReport.salesCount || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Gross Sales Value:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingAdminZReport.grossSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Discounts Given:</span>
                  <span className="font-bold text-alert">Rs. {Number(viewingAdminZReport.totalDiscounts || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Net Sales Volume:</span>
                  <span className="font-bold text-teal">Rs. {Number(viewingAdminZReport.netSales || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-[11px] text-navy uppercase pb-1 border-b border-slate-200">
                  Payment Channels Distribution
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cash Invoices:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingAdminZReport.paymentBreakdown?.CASH || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Card Invoices:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingAdminZReport.paymentBreakdown?.CARD || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bank Transfer / Online:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingAdminZReport.paymentBreakdown?.BANK_TRANSFER || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border-2 border-navy/20 bg-ice/40 space-y-2">
                <div className="font-extrabold text-[11px] text-navy uppercase pb-1 border-b border-navy/10">
                  Drawer Float & Cash Audit Discrepancy
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Opening Float:</span>
                  <span className="font-bold">Rs. {Number(viewingAdminZReport.openingFloat || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Net Cash Collected:</span>
                  <span className="font-bold">Rs. {Number(viewingAdminZReport.netCashCollected || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-navy pt-1 border-t border-slate-200">
                  <span>Expected Drawer Cash:</span>
                  <span>Rs. {Number(viewingAdminZReport.expectedCashInDrawer || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-teal">
                  <span>Counted Actual Cash:</span>
                  <span>Rs. {Number(viewingAdminZReport.actualCashCounted || 0).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between font-extrabold p-2 rounded-xl text-xs ${
                  viewingAdminZReport.difference === 0
                    ? 'bg-emerald-100 text-emerald-900'
                    : viewingAdminZReport.difference < 0
                    ? 'bg-red-100 text-alert'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  <span>Audit Result:</span>
                  <span>
                    {viewingAdminZReport.difference === 0
                      ? 'EXACT MATCH (Rs. 0)'
                      : viewingAdminZReport.difference < 0
                      ? `SHORTAGE: -Rs. ${Math.abs(viewingAdminZReport.difference).toLocaleString()}`
                      : `OVERAGE: +Rs. ${Number(viewingAdminZReport.difference).toLocaleString()}`}
                  </span>
                </div>
              </div>

              {viewingAdminZReport.notes && (
                <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-700">
                  <span className="font-bold">Closing Notes:</span> {viewingAdminZReport.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-gold-bright" />
                <span>Print Z-Report</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingAdminZReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-navy font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF POS ACCESS PASS & LOGIN SHARE MODAL (Point 4) */}
      {staffPassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => {
                setStaffPassModal(null);
                setStaffCopied(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Staff POS Credentials & Access Pass</h3>
                <p className="text-xs text-slate-400">Share this direct link with your cashier/receptionist to login directly</p>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Business / Store:</span>
                <span className="text-gold font-bold font-sans">{tenant?.name || 'Store'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Staff Member:</span>
                <span className="text-white font-bold">{staffPassModal.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Login Username:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {staffPassModal.username}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Password:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  {staffPassModal.password || '123'}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 font-sans block text-[11px]">Direct Portal Login Link:</span>
                <div className="text-[11px] text-blue-400 break-all bg-slate-900 p-2 rounded border border-blue-900/60 select-all">
                  {`https://digitalsnova.com/portal/?store=${encodeURIComponent(tenant?.subdomain || 'store')}`}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const originUrl = typeof window !== 'undefined' && window.location.origin.includes('localhost')
                    ? `${window.location.origin}/portal/?store=${encodeURIComponent(tenant?.subdomain || 'store')}`
                    : `https://digitalsnova.com/portal/?store=${encodeURIComponent(tenant?.subdomain || 'store')}`;
                  const shareText = `🏢 *${tenant?.name || 'DigitalsNova Store'}* - POS Login Pass\n\n👤 *Staff*: ${staffPassModal.name}\n🔗 *Login URL*: ${originUrl}\n🔑 *Username*: ${staffPassModal.username}\n🔒 *Password*: ${staffPassModal.password || '123'}\n\nOpen link and sign in to start your POS billing counter.`;
                  navigator.clipboard.writeText(shareText);
                  setStaffCopied(true);
                  setTimeout(() => setStaffCopied(false), 2500);
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                {staffCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{staffCopied ? 'Credentials Copied!' : 'Copy Login Details'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🏢 *${tenant?.name || 'DigitalsNova Store'}* - POS Login Pass\n\n👤 *Staff*: ${staffPassModal.name}\n🔗 *Login URL*: ${typeof window !== 'undefined' && window.location.origin.includes('localhost')
                      ? `${window.location.origin}/portal/?store=${encodeURIComponent(tenant?.subdomain || 'store')}`
                      : `https://digitalsnova.com/portal/?store=${encodeURIComponent(tenant?.subdomain || 'store')}`}\n🔑 *Username*: ${staffPassModal.username}\n🔒 *Password*: ${staffPassModal.password || '123'}\n\nOpen link and sign in to start your POS counter.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Send on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STOCK ITEM MODAL (Point 5) */}
      {stockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-navy shadow-2xl relative space-y-4 border border-slate-200">
            <button
              type="button"
              onClick={() => setStockModalItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-navy p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-navy">
                  {stockModalItem.id
                    ? 'Edit ' + (isRestaurant ? 'Menu Dish' : isPharmacy ? 'Medicine' : isClinic ? 'Medicine' : 'Product')
                    : 'Add New ' + (isRestaurant ? 'Menu Dish / Food Item' : isPharmacy ? 'Medicine to Formulary' : isClinic ? 'Medicine to Pharmacy' : 'Product to Inventory')}
                </h3>
                <p className="text-xs text-slate-500">
                  {isClinic
                    ? 'Enter pharmaceutical medicine details'
                    : isRestaurant
                    ? 'Enter recipe/dish name, category, food cost and selling price'
                    : isPharmacy
                    ? 'Enter pharmaceutical formulation, batch number, cost and selling price'
                    : 'Enter retail product details, barcode, cost and sell price'}
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingStock(true);
                try {
                  if (stockModalItem.id) {
                    if (onUpdateStock) await onUpdateStock(stockModalItem.id, stockModalItem);
                    setToast(`Updated "${stockModalItem.name}" successfully!`);
                  } else {
                    if (onAddStock) await onAddStock(stockModalItem);
                    setToast(`Added "${stockModalItem.name}" to inventory!`);
                  }
                  setStockModalItem(null);
                } catch (err) {
                  alert(err.message || 'Error saving item');
                } finally {
                  setSavingStock(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isRestaurant
                    ? 'Dish / Food Item Name *'
                    : isPharmacy
                    ? 'Medicine / Formula Name *'
                    : isClinic
                    ? 'Medicine / Service Name *'
                    : 'Product / Item Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRestaurant
                      ? 'e.g. Chicken Biryani / Zinger Burger'
                      : isPharmacy
                      ? 'e.g. Augmentin 625mg (GlaxoSmithKline)'
                      : isClinic
                      ? 'e.g. Panadol 500mg (200 Tabs)'
                      : 'e.g. Super Basmati Rice 5kg'
                  }
                  value={stockModalItem.name || ''}
                  onChange={(e) => setStockModalItem({ ...stockModalItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Barcode / SKU *</label>
                    <button
                      type="button"
                      onClick={() => setStockModalItem({
                        ...stockModalItem,
                        barcode: String(Math.floor(100000000 + Math.random() * 900000000))
                      })}
                      className="text-[10px] text-teal hover:underline font-bold"
                    >
                      ⚡ Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 896400101"
                    value={stockModalItem.barcode || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder={
                      isRestaurant
                        ? 'e.g. Main Course, Fast Food, Drinks'
                        : isPharmacy
                        ? 'e.g. Antibiotics, Syrups, Tablets'
                        : isClinic
                        ? 'e.g. Medicines, Pain Relief'
                        : 'e.g. Grocery, Beverages'
                    }
                    value={stockModalItem.category || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost / Purchase Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1500"
                    value={stockModalItem.purchasePrice || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Selling Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1850"
                    value={stockModalItem.sellingPrice || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 50"
                    value={stockModalItem.quantity || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Alert Limit</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={stockModalItem.minStockAlert || '10'}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, minStockAlert: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Pcs / Pack / Kg"
                    value={stockModalItem.unit || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRestaurant ? 'Kitchen Supplier / Vendor' : isPharmacy ? 'Pharma Distributor / Manufacturer' : isClinic ? 'Pharmaceutical Supplier' : 'Supplier / Brand'}
                  </label>
                  <input
                    type="text"
                    placeholder={isRestaurant ? "e.g. Local Meat Vendor / Metro" : isPharmacy ? "e.g. GSK / Abbott / Pfizer" : "e.g. Unilever / Nestle"}
                    value={stockModalItem.supplier || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-navy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isPharmacy ? 'Batch Expiry Date *' : isRestaurant ? 'Best Before (Optional)' : 'Expiry Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={stockModalItem.expiryDate || ''}
                    onChange={(e) => setStockModalItem({ ...stockModalItem, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-navy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStock}
                  className="px-5 py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4 text-gold" />
                  <span>{savingStock ? 'Saving...' : (stockModalItem.id ? 'Save Changes' : '+ Add to Stock')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* BULK PRODUCT IMPORT MODAL (ADMIN) */}
      {showBulkProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-teal shadow-2xl overflow-hidden text-xs">
            <div className="bg-navy text-white px-5 py-4 flex items-center justify-between border-b border-navy-light">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Bulk Product & Inventory Import</h3>
                  <p className="text-[10px] text-slate-300">Upload CSV, paste spreadsheet data, or load 1-click starter catalogs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowBulkProductModal(false); setBulkImportSuccess(''); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {bulkImportSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{bulkImportSuccess}</span>
                </div>
              )}

              {/* 1-Click Catalog Starter Packs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-navy text-[11px] uppercase tracking-wider">⚡ 1-Click Quick Starter Catalogs</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const retailItems = [
                        { barcode: '896400101', name: 'Super Basmati Rice 5kg', category: 'Grocery', supplier: 'Al-Karam', quantity: 50, purchasePrice: 1650, sellingPrice: 1950, unit: 'Pack', expiryDate: '2028-12-31' },
                        { barcode: '896400102', name: 'Dalda Cooking Oil 5L', category: 'Grocery', supplier: 'Dalda Foods', quantity: 30, purchasePrice: 2450, sellingPrice: 2750, unit: 'Bottle', expiryDate: '2027-10-15' },
                        { barcode: '896400103', name: 'Olpers Milk 1000ml', category: 'Dairy', supplier: 'Engro', quantity: 80, purchasePrice: 280, sellingPrice: 310, unit: 'Pack', expiryDate: '2026-06-30' },
                        { barcode: '896400104', name: 'Tapal Danedar Tea 450g', category: 'Beverages', supplier: 'Tapal Tea', quantity: 40, purchasePrice: 620, sellingPrice: 690, unit: 'Pack', expiryDate: '2027-05-20' },
                        { barcode: '896400105', name: 'Lipton Yellow Label 200g', category: 'Beverages', supplier: 'Unilever', quantity: 25, purchasePrice: 380, sellingPrice: 430, unit: 'Pack', expiryDate: '2027-04-10' },
                        { barcode: '896400106', name: 'Nestle Pure Life 1.5L', category: 'Beverages', supplier: 'Nestle', quantity: 100, purchasePrice: 85, sellingPrice: 110, unit: 'Bottle', expiryDate: '2027-12-31' },
                        { barcode: '896400107', name: 'Ariel Washing Powder 1kg', category: 'Household', supplier: 'P&G', quantity: 30, purchasePrice: 510, sellingPrice: 580, unit: 'Pack', expiryDate: '2028-01-01' },
                        { barcode: '896400108', name: 'Lux Beauty Soap 140g', category: 'Personal Care', supplier: 'Unilever', quantity: 60, purchasePrice: 140, sellingPrice: 170, unit: 'Bar', expiryDate: '2028-06-01' },
                        { barcode: '896400109', name: 'National White Sugar 1kg', category: 'Grocery', supplier: 'National', quantity: 90, purchasePrice: 140, sellingPrice: 160, unit: 'Pkt', expiryDate: '2028-12-31' },
                        { barcode: '896400110', name: 'Chakki Wheat Atta 10kg', category: 'Grocery', supplier: 'Sunridge', quantity: 25, purchasePrice: 1350, sellingPrice: 1500, unit: 'Bag', expiryDate: '2027-12-31' },
                        { barcode: '896400111', name: 'Shan Biryani Masala 50g', category: 'Spices', supplier: 'Shan Foods', quantity: 50, purchasePrice: 110, sellingPrice: 130, unit: 'Box', expiryDate: '2027-08-15' },
                        { barcode: '896400112', name: 'Colgate Total 140g', category: 'Personal Care', supplier: 'Colgate', quantity: 40, purchasePrice: 280, sellingPrice: 330, unit: 'Tube', expiryDate: '2027-11-20' },
                        { barcode: '896400113', name: 'Head & Shoulders 360ml', category: 'Personal Care', supplier: 'P&G', quantity: 20, purchasePrice: 650, sellingPrice: 750, unit: 'Bottle', expiryDate: '2027-09-10' },
                        { barcode: '896400114', name: 'Coca Cola 1.5L', category: 'Beverages', supplier: 'Coke', quantity: 60, purchasePrice: 160, sellingPrice: 190, unit: 'Bottle', expiryDate: '2026-11-30' },
                        { barcode: '896400115', name: 'Sprite 1.5L Bottle', category: 'Beverages', supplier: 'Coke', quantity: 50, purchasePrice: 160, sellingPrice: 190, unit: 'Bottle', expiryDate: '2026-11-30' }
                      ];
                      if (onBulkAddProducts) onBulkAddProducts(retailItems);
                      setBulkImportSuccess(`Imported ${retailItems.length} Retail Mart / General Store Products!`);
                    }}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span>🛒 Load General Mart Pack (15 Items)</span>
                    <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded font-extrabold">Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const pharmaItems = [
                        { barcode: '896500101', name: 'Panadol 500mg (200 Tabs)', category: 'Analgesics', supplier: 'GSK', quantity: 100, purchasePrice: 420, sellingPrice: 500, unit: 'Box', expiryDate: '2027-12-31' },
                        { barcode: '896500102', name: 'Brufen 400mg (30 Tabs)', category: 'NSAID', supplier: 'Abbott', quantity: 60, purchasePrice: 210, sellingPrice: 260, unit: 'Box', expiryDate: '2027-08-31' },
                        { barcode: '896500103', name: 'Augmentin 625mg (14 Tabs)', category: 'Antibiotics', supplier: 'GSK', quantity: 40, purchasePrice: 320, sellingPrice: 390, unit: 'Box', expiryDate: '2026-10-31' },
                        { barcode: '896500104', name: 'Risek 20mg Omeprazole', category: 'Gastro', supplier: 'Getz Pharma', quantity: 80, purchasePrice: 340, sellingPrice: 410, unit: 'Box', expiryDate: '2027-05-31' },
                        { barcode: '896500105', name: 'Softin 10mg Loratadine', category: 'Antihistamine', supplier: 'Searle', quantity: 50, purchasePrice: 180, sellingPrice: 220, unit: 'Box', expiryDate: '2028-03-31' },
                        { barcode: '896500106', name: 'Flagyl 400mg Metronidazole', category: 'Antibiotics', supplier: 'Sanofi', quantity: 70, purchasePrice: 190, sellingPrice: 235, unit: 'Box', expiryDate: '2027-11-30' },
                        { barcode: '896500107', name: 'Disprin 300mg Soluble', category: 'Analgesics', supplier: 'Reckitt', quantity: 120, purchasePrice: 90, sellingPrice: 120, unit: 'Strip', expiryDate: '2028-09-30' },
                        { barcode: '896500108', name: 'Surbex-Z High Potency Zinc', category: 'Vitamins', supplier: 'Abbott', quantity: 45, purchasePrice: 380, sellingPrice: 450, unit: 'Bottle', expiryDate: '2027-04-30' },
                        { barcode: '896500109', name: 'Polyfax Skin Ointment 20g', category: 'Dermatology', supplier: 'GSK', quantity: 50, purchasePrice: 95, sellingPrice: 125, unit: 'Tube', expiryDate: '2027-07-31' },
                        { barcode: '896500110', name: 'Hydryllin Cough Syrup 120ml', category: 'Respiratory', supplier: 'Searle', quantity: 35, purchasePrice: 110, sellingPrice: 140, unit: 'Bottle', expiryDate: '2026-12-31' }
                      ];
                      if (onBulkAddProducts) onBulkAddProducts(pharmaItems);
                      setBulkImportSuccess(`Imported ${pharmaItems.length} Essential Pharmacy Medicines!`);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <span>💊 Load Pharmacy Pack (10 Medicines)</span>
                    <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-extrabold">Instant</span>
                  </button>
                </div>
              </div>

              {/* CSV Upload & Manual Paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-navy text-[11px] uppercase tracking-wider">
                    Or Paste CSV Data (Barcode, Name, Category, Supplier, Qty, PurchasePrice, SellingPrice, Unit, Expiry)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleCsv = `Barcode,Name,Category,Supplier,Quantity,PurchasePrice,SellingPrice,Unit,ExpiryDate
89611001,Al-Karam Sugar 1kg,Grocery,Al-Karam,100,140,160,Pack,2028-12-31
89611002,Tapal Tea 450g,Beverages,Tapal,50,620,690,Pack,2027-06-30
89611003,Panadol Extra 500mg,Pharmacy,GSK,80,220,260,Box,2027-12-31`;
                      setBulkCsvText(sampleCsv);
                    }}
                    className="text-[10px] text-teal hover:underline font-bold cursor-pointer"
                  >
                    Load Sample CSV
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder="Barcode,Name,Category,Supplier,Quantity,PurchasePrice,SellingPrice,Unit,ExpiryDate\n896001,Product A,General,Supplier X,50,100,130,Pcs,2027-12-31"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed"
                />

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-[11px] cursor-pointer flex items-center gap-1.5 border border-slate-300 transition">
                    <Download className="w-3.5 h-3.5 text-teal" />
                    <span>Upload CSV File</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBulkCsvText(event.target.result);
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!bulkCsvText.trim()) return;
                      const lines = bulkCsvText.trim().split(/\r?\n/);
                      const parsed = [];
                      const startIndex = lines[0].toLowerCase().includes('barcode') || lines[0].toLowerCase().includes('name') ? 1 : 0;
                      for (let i = startIndex; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
                        if (cols.length >= 2) {
                          parsed.push({
                            barcode: cols[0] || `BC-${Date.now()}-${i}`,
                            name: cols[1],
                            category: cols[2] || 'General',
                            supplier: cols[3] || 'General Supplier',
                            quantity: Number(cols[4]) || 10,
                            purchasePrice: Number(cols[5]) || 0,
                            sellingPrice: Number(cols[6]) || 0,
                            unit: cols[7] || 'Pcs',
                            expiryDate: cols[8] || '2028-12-31'
                          });
                        }
                      }
                      if (parsed.length > 0) {
                        if (onBulkAddProducts) onBulkAddProducts(parsed);
                        setBulkImportSuccess(`Successfully imported ${parsed.length} products from CSV!`);
                        setBulkCsvText('');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] shadow transition cursor-pointer"
                  >
                    Process & Import CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => { setShowBulkProductModal(false); setBulkImportSuccess(''); }}
                className="px-4 py-1.5 rounded-xl bg-navy text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK CLINIC TREATMENT IMPORT MODAL */}
      {showBulkTreatmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-teal shadow-2xl overflow-hidden text-xs">
            <div className="bg-navy text-white px-5 py-4 flex items-center justify-between border-b border-navy-light">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Bulk Clinic Treatment Catalog Import</h3>
                  <p className="text-[10px] text-slate-300">Add medical packages, laser sessions, dental procedures in bulk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowBulkTreatmentModal(false); setBulkImportSuccess(''); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {bulkImportSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{bulkImportSuccess}</span>
                </div>
              )}

              {/* 1-Click Clinic Speciality Packs */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-navy text-[11px] uppercase tracking-wider">⚡ 1-Click Clinic Starter Packages</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dermaPacks = [
                        { name: 'Hydrafacial Glow Therapy', category: 'Aesthetic & Skin', defaultCost: 8000, defaultSessions: 1 },
                        { name: 'Carbon Laser Peel Treatment (3 Sessions)', category: 'Laser & Derma', defaultCost: 18000, defaultSessions: 3 },
                        { name: 'PRP Hair Restoration Package (4 Sessions)', category: 'Hair & Derma', defaultCost: 28000, defaultSessions: 4 },
                        { name: 'Full Face Laser Hair Removal (6 Sessions)', category: 'Laser Treatment', defaultCost: 35000, defaultSessions: 6 },
                        { name: 'Microneedling Collagen Boost', category: 'Skin Rejuvenation', defaultCost: 12000, defaultSessions: 2 }
                      ];
                      if (onBulkAddTreatments) onBulkAddTreatments(dermaPacks);
                      setBulkImportSuccess(`Imported ${dermaPacks.length} Aesthetic / Derma Packages!`);
                    }}
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-left transition flex flex-col justify-between cursor-pointer"
                  >
                    <span>✨ Derma & Laser Pack (5)</span>
                    <span className="text-[9px] text-purple-700 mt-1">Hydrafacial, PRP, Laser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const dentalPacks = [
                        { name: 'Root Canal Treatment (Single Tooth)', category: 'Endodontics', defaultCost: 15000, defaultSessions: 2 },
                        { name: 'Teeth Scaling & Deep Polishing', category: 'Preventive Dental', defaultCost: 5000, defaultSessions: 1 },
                        { name: 'Zirconia Ceramic Crown', category: 'Prosthodontics', defaultCost: 20000, defaultSessions: 2 },
                        { name: 'Laser Teeth Whitening Session', category: 'Cosmetic Dentistry', defaultCost: 18000, defaultSessions: 1 },
                        { name: 'Surgical Wisdom Tooth Extraction', category: 'Oral Surgery', defaultCost: 12000, defaultSessions: 1 }
                      ];
                      if (onBulkAddTreatments) onBulkAddTreatments(dentalPacks);
                      setBulkImportSuccess(`Imported ${dentalPacks.length} Dental Clinic Packages!`);
                    }}
                    className="p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 font-bold text-left transition flex flex-col justify-between cursor-pointer"
                  >
                    <span>🦷 Dental Clinic Pack (5)</span>
                    <span className="text-[9px] text-cyan-700 mt-1">RCT, Scaling, Crown, Whitening</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const physioPacks = [
                        { name: 'Physiotherapy Assessment & Plan', category: 'Rehabilitation', defaultCost: 3000, defaultSessions: 1 },
                        { name: 'Spinal Decompression & Adjustment', category: 'Spine Care', defaultCost: 5000, defaultSessions: 1 },
                        { name: 'Dry Needling & Muscle Release (3 Sessions)', category: 'Pain Relief', defaultCost: 9000, defaultSessions: 3 },
                        { name: 'Rehab Ultrasound & Laser (5 Sessions)', category: 'Physical Therapy', defaultCost: 15000, defaultSessions: 5 }
                      ];
                      if (onBulkAddTreatments) onBulkAddTreatments(physioPacks);
                      setBulkImportSuccess(`Imported ${physioPacks.length} Physiotherapy Packages!`);
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-left transition flex flex-col justify-between cursor-pointer"
                  >
                    <span>🏃 Physio & Rehab Pack (4)</span>
                    <span className="text-[9px] text-amber-700 mt-1">Spinal, Dry Needling, Laser</span>
                  </button>
                </div>
              </div>

              {/* CSV Upload & Manual Paste */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-navy text-[11px] uppercase tracking-wider">
                    Or Paste CSV (Treatment Name, Category, Default Cost, Default Sessions)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleCsv = `Treatment Name,Category,Cost,Sessions
Pico Glow Laser Treatment,Laser & Skin,12000,3
Teeth Whitening Full Set,Dental,15000,1
PRP Vampire Facial,Aesthetic,20000,2`;
                      setBulkCsvText(sampleCsv);
                    }}
                    className="text-[10px] text-teal hover:underline font-bold cursor-pointer"
                  >
                    Load Sample CSV
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder="Treatment Name,Category,Cost,Sessions\nPico Glow Laser,Laser,15000,3"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] leading-relaxed"
                />

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-[11px] cursor-pointer flex items-center gap-1.5 border border-slate-300 transition">
                    <Download className="w-3.5 h-3.5 text-teal" />
                    <span>Upload CSV File</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBulkCsvText(event.target.result);
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!bulkCsvText.trim()) return;
                      const lines = bulkCsvText.trim().split(/\r?\n/);
                      const parsed = [];
                      const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('cost') ? 1 : 0;
                      for (let i = startIndex; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;
                        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
                        if (cols.length >= 2) {
                          parsed.push({
                            name: cols[0],
                            category: cols[1] || 'General Clinic',
                            defaultCost: Number(cols[2]) || 5000,
                            defaultSessions: Number(cols[3]) || 1
                          });
                        }
                      }
                      if (parsed.length > 0) {
                        if (onBulkAddTreatments) onBulkAddTreatments(parsed);
                        setBulkImportSuccess(`Successfully imported ${parsed.length} treatments into clinic catalog!`);
                        setBulkCsvText('');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] shadow transition cursor-pointer"
                  >
                    Process & Import CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => { setShowBulkTreatmentModal(false); setBulkImportSuccess(''); }}
                className="px-4 py-1.5 rounded-xl bg-navy text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL STAFF AUDIT & DAILY REPORT MODAL */}
      {selectedStaffAudit && (() => {
        const staffSales = completedSales.filter((s) => s.cashierName === selectedStaffAudit.name || s.cashierId === selectedStaffAudit.id);
        const staffTotalSales = staffSales.reduce((sum, s) => sum + Number(s.netTotal || 0), 0);
        const staffCashCollected = staffSales.reduce((sum, s) => sum + Number(s.amountPaidToday || 0), 0);
        const staffCashInvoices = staffSales.filter((s) => (s.paymentMethod || 'CASH') === 'CASH').reduce((sum, s) => sum + Number(s.amountPaidToday || 0), 0);
        const staffCardInvoices = staffSales.filter((s) => (s.paymentMethod || 'CASH') === 'CARD').reduce((sum, s) => sum + Number(s.amountPaidToday || 0), 0);
        const staffOnlineInvoices = staffSales.filter((s) => (s.paymentMethod || 'CASH') === 'BANK_TRANSFER').reduce((sum, s) => sum + Number(s.amountPaidToday || 0), 0);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-navy shadow-2xl overflow-hidden text-xs">
              <div className="bg-navy text-white px-5 py-4 flex items-center justify-between border-b border-navy-light">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gold-bright" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      Daily Work & Sales Report: {selectedStaffAudit.name}
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Login: @{selectedStaffAudit.username} • Role: {selectedStaffAudit.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStaffAudit(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* 3 Metric Cards for This Staff Member */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-ice rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Invoices Created</span>
                    <div className="text-xl font-extrabold text-navy mt-0.5">{staffSales.length}</div>
                    <span className="text-[10px] text-slate-500">bills processed today</span>
                  </div>

                  <div className="p-3 bg-teal/10 rounded-xl border border-teal/30">
                    <span className="text-[10px] font-bold text-teal uppercase">Total Net Billed</span>
                    <div className="text-xl font-extrabold text-teal mt-0.5">Rs. {staffTotalSales.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">gross invoice value</span>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Cash Collected</span>
                    <div className="text-xl font-extrabold text-emerald-800 mt-0.5">Rs. {staffCashCollected.toLocaleString()}</div>
                    <span className="text-[10px] text-slate-500">received in hand</span>
                  </div>
                </div>

                {/* Payment distribution */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-around text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Cash in Drawer</span>
                    <div className="font-extrabold text-navy font-mono">Rs. {staffCashInvoices.toLocaleString()}</div>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Card Machine</span>
                    <div className="font-extrabold text-navy font-mono">Rs. {staffCardInvoices.toLocaleString()}</div>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Online / Bank</span>
                    <div className="font-extrabold text-navy font-mono">Rs. {staffOnlineInvoices.toLocaleString()}</div>
                  </div>
                </div>

                {/* Itemized Sales Log */}
                <div>
                  <h4 className="font-bold text-navy text-[11px] uppercase tracking-wider mb-2">
                    Itemized Sales Log by {selectedStaffAudit.name} ({staffSales.length} Invoices)
                  </h4>
                  {staffSales.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No invoices billed by this cashier yet today.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      {staffSales.map((sale) => (
                        <div key={sale.id} className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-navy">{sale.invoiceNumber}</span>
                              <span className="text-slate-600 font-bold">{sale.patientName}</span>
                              <span className="text-[10px] font-mono text-slate-400">({sale.patientPhone})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {(sale.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-extrabold text-navy">Rs. {Number(sale.netTotal).toLocaleString()}</div>
                            <div className="text-[10px] text-emerald-700 font-bold">
                              Paid: Rs. {Number(sale.amountPaidToday).toLocaleString()} ({sale.paymentMethod || 'CASH'})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-gold-bright" />
                  <span>Print Staff Day Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaffAudit(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-navy font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
