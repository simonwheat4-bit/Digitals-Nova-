import React, { useState, useEffect, useRef } from 'react';
import { isClinicBusiness, isRestaurantBusiness, isPharmacyBusiness, isRetailMartBusiness, getBusinessSector } from '../utils/businessTypes.js';
import {
  Barcode,
  Search,
  UserPlus,
  ShoppingCart,
  Printer,
  Trash2,
  ShieldAlert,
  KeyRound,
  BellRing,
  CheckCircle2,
  Layers,
  Plus,
  Minus,
  Lock,
  Receipt,
  CalendarClock,
  Wallet,
  Eye,
  X,
  Phone,
  User,
  Calendar,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Smartphone,
  Radio,
  Check,
  AlertCircle,
  PauseCircle,
  Play,
  Clock,
  RotateCcw,
  DollarSign,
  Tag,
  FileSpreadsheet
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceptionistPOSPanel({
  tenant,
  currentUser,
  patients,
  treatments,
  treatmentCatalog = [],
  inventory,
  sales,
  discountRequests,
  onCreatePatient,
  onCreateTreatment,
  onPayTreatmentSession,
  onAddStock,
  onVerifyPinDiscount,
  onRequestRemoteDiscount,
  onCheckoutSale,
  onAttemptStaffRefund,
  onOpenReceiptModal,
  remoteScannedBarcode,
  controlledSubTab,
  onSubTabChange,
  // Commercial POS Features
  parkedSales = [],
  activeShift = null,
  onParkCart,
  onUnparkCart,
  onOpenShift,
  onCloseShift,
  onBulkAddProducts
}) {
  const sector = getBusinessSector(tenant);
  const isRestaurant = isRestaurantBusiness(tenant);
  const isPharmacy = isPharmacyBusiness(tenant);
  const isClinic = isClinicBusiness(tenant);
  const isRetailMart = isRetailMartBusiness(tenant);
  const showPatientsModule = isClinic && (tenant?.enabledModules?.patientsLedger !== false);

  // Restaurant Dine-In Table & KOT State
  const [selectedTable, setSelectedTable] = useState('T1');
  const [showKotModal, setShowKotModal] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState('Waiter Ali');
  const [kotKitchenNote, setKotKitchenNote] = useState('');
  const [kotSuccessAlert, setKotSuccessAlert] = useState('');
  const showPosModule = tenant?.enabledModules?.pos !== false;
  const showInventoryModule = tenant?.enabledModules?.inventory !== false;

  const defaultTab = showPosModule ? 'POS' : (showPatientsModule ? 'PATIENTS_LEDGER' : 'RECENT_SALES');
  const [internalSubTab, setInternalSubTab] = useState(defaultTab);
  const rawSubTab = controlledSubTab || internalSubTab;
  const subTab = (!showPosModule && rawSubTab === 'POS') ? defaultTab : rawSubTab;
  const setSubTab = (tab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };
  // 'POS' | 'PATIENTS_LEDGER' | 'STOCK_ENTRY' | 'RECENT_SALES'

  // POS Cart & Patient State
  const [selectedPatientId, setSelectedPatientId] = useState('pat_walkin');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Walk-in Customer Name & Phone Input (when Walk-in is selected)
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInValidationFailed, setWalkInValidationFailed] = useState(false);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Mobile / Wireless & Cable Barcode Scanner State
  const [showDeviceScannerModal, setShowDeviceScannerModal] = useState(false);
  const [mobileSimulateCode, setMobileSimulateCode] = useState('');

  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [linkedTreatmentId, setLinkedTreatmentId] = useState('');

  // Commercial POS Category Chips, Parked Bills & Cash Shifts
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showParkedModal, setShowParkedModal] = useState(false);
  const [parkingInProgress, setParkingInProgress] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showBulkProductModal, setShowBulkProductModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportSuccess, setBulkImportSuccess] = useState('');
  const [openingFloatInput, setOpeningFloatInput] = useState('0');
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCashCountedInput, setActualCashCountedInput] = useState('');
  const [shiftClosingNotes, setShiftClosingNotes] = useState('');
  const [viewingZReport, setViewingZReport] = useState(null);

  // Discount & Fraud Prevention State
  const [discountInput, setDiscountInput] = useState(0);
  const [approvedDiscountRecord, setApprovedDiscountRecord] = useState(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountReason, setDiscountReason] = useState('Loyalty Patient Discount Request');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingRemoteReqId, setPendingRemoteReqId] = useState(null);

  // New Patient Modal (F4 Shortcut)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male'
  });

  // Ledger Tab Patient Search & Treatment Package Autocomplete
  const [ledgerPatientSearch, setLedgerPatientSearch] = useState('');
  const [showLedgerPatientList, setShowLedgerPatientList] = useState(false);
  const [ledgerFilterQuery, setLedgerFilterQuery] = useState('');

  const [newTreatmentForm, setNewTreatmentForm] = useState({
    patientId: patients[0]?.id || '',
    title: treatmentCatalog[0]?.name || '',
    totalCost: treatmentCatalog[0]?.defaultCost || 10000,
    initialPaid: 2000,
    totalSessions: treatmentCatalog[0]?.defaultSessions || 5,
    notes: 'Session 1 Initial Procedure & Consultation',
    sessionDate: new Date().toISOString().slice(0, 16)
  });

  const [sessionPayModal, setSessionPayModal] = useState(null);
  const [sessionPayAmount, setSessionPayAmount] = useState('');
  const [sessionPayNotes, setSessionPayNotes] = useState('');
  const [sessionPayDate, setSessionPayDate] = useState(new Date().toISOString().slice(0, 16));

  // Customer / Patient Detail Modal (when clicking an invoice or patient)
  const [inspectedCustomerModal, setInspectedCustomerModal] = useState(null);

  // Stock Entry State
  const [stockForm, setStockForm] = useState({
    barcode: '',
    name: '',
    category: isRestaurant ? 'Fast Food & Burgers' : isPharmacy ? 'Tablets & Capsules' : isClinic ? 'Medical Consultation' : 'General Groceries',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minStockAlert: 10,
    expiryDate: isRestaurant ? '' : '2027-12-31',
    imageUrl: ''
  });

  const [statusBanner, setStatusBanner] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoFocusScanner, setAutoFocusScanner] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const barcodeRef = useRef(null);

  // Web Audio API POS Supermarket Scanner Sound Synthesizer (Instant, Zero Latency, Offline)
  const playScannerBeep = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        // High-pitched crisp supermarket laser scanner beep (1850Hz, 85ms)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1850, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.085);
      } else {
        // Warning error double buzz (160Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (patients.length > 0 && !newTreatmentForm.patientId) {
      setNewTreatmentForm((prev) => ({ ...prev, patientId: patients[0].id }));
    }
  }, [patients]);

  // Listen for Real-Time WebSocket Remote Approval resolution
  useEffect(() => {
    if (!pendingRemoteReqId) return;
    const matched = discountRequests.find((r) => r.id === pendingRemoteReqId);
    if (matched && matched.status === 'APPROVED') {
      setApprovedDiscountRecord(matched);
      setDiscountInput(matched.discountRequested);
      setPendingRemoteReqId(null);
      setShowDiscountModal(false);
      setStatusBanner({
        type: 'success',
        text: `Real-Time WebSocket Approval Received! Rs. ${matched.discountRequested} discount approved by ${matched.approvedBy}.`
      });
    } else if (matched && matched.status === 'REJECTED') {
      setPendingRemoteReqId(null);
      setDiscountInput(0);
      setApprovedDiscountRecord(null);
      setPinError(`Remote Request Rejected by ${matched.approvedBy}`);
    }
  }, [discountRequests, pendingRemoteReqId]);

  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const activeDiscount = approvedDiscountRecord ? Number(approvedDiscountRecord.discountRequested) : 0;
  const netTotal = Math.max(0, subtotal - activeDiscount);

  useEffect(() => {
    setAmountPaidInput(String(netTotal));
  }, [netTotal]);

  const registeredPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedPatient = registeredPatient || {
    id: 'pat_walkin',
    patientCode: 'WALK-IN',
    name: walkInName.trim() || 'Walk-in Customer',
    phone: walkInPhone.trim() || '0300-0000000'
  };

  // Auto-lookup registered patient by mobile phone when in Walk-in mode
  const cleanWalkInDigits = walkInPhone.replace(/\D/g, '');
  const autoMatchedPatient =
    selectedPatientId === 'pat_walkin' && cleanWalkInDigits.length >= 7
      ? patients.find((p) => {
          const pDigits = (p.phone || '').replace(/\D/g, '');
          return pDigits.length >= 7 && (pDigits.includes(cleanWalkInDigits) || cleanWalkInDigits.includes(pDigits));
        })
      : null;

  // Searchable Patients Filter (by Name, Phone, or MR Code)
  const matchingPatientsForPOS = patients.filter((p) => {
    const q = patientSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.patientCode.toLowerCase().includes(q)
    );
  });

  const matchingPatientsForLedger = patients.filter((p) => {
    const q = ledgerPatientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.patientCode.toLowerCase().includes(q)
    );
  });

  const patientActiveTreatments = treatments.filter(
    (t) => t.patientId === selectedPatientId && t.status === 'IN_PROGRESS'
  );
  const patientExistingBalance = patientActiveTreatments.reduce(
    (sum, t) => sum + Number(t.remainingBalance || 0),
    0
  );

  // Add item to POS cart with strict live stock check
  const addToCart = (invItem) => {
    const availableStock = Number(invItem.quantity || 0);
    if (availableStock <= 0) {
      setStatusBanner({
        type: 'error',
        text: `Out of Stock! "${invItem.name}" has 0 units in inventory.`
      });
      return;
    }

    setCart((prev) => {
      const exists = prev.find((i) => i.id === invItem.id);
      if (exists) {
        if (exists.qty + 1 > availableStock) {
          setStatusBanner({
            type: 'error',
            text: `Cannot add more "${invItem.name}" — Only ${availableStock} in stock!`
          });
          return prev;
        }
        return prev.map((i) => (i.id === invItem.id ? { ...i, qty: i.qty + 1, maxStock: availableStock, subtotal: (i.qty + 1) * Number(i.unitPrice || 0) } : i));
      }
      return [
        ...prev,
        {
          id: invItem.id,
          type: invItem.category === 'Clinical Service' ? 'SERVICE' : 'PRODUCT',
          barcode: invItem.barcode,
          name: invItem.name,
          unitPrice: Number(invItem.sellingPrice),
          costPrice: Number(invItem.purchasePrice || 0),
          qty: 1,
          maxStock: availableStock,
          subtotal: Number(invItem.sellingPrice || 0)
        }
      ];
    });
  };

  const addSessionToCart = (trt) => {
    const suggestedInstallment = Math.min(
      trt.remainingBalance,
      Math.ceil(trt.totalCost / Math.max(1, trt.totalSessions))
    );
    setLinkedTreatmentId(trt.id);
    const sessionPrice = suggestedInstallment || trt.remainingBalance;
    setCart((prev) => [
      ...prev.filter((i) => i.id !== trt.id),
      {
        id: trt.id,
        type: 'SESSION',
        barcode: 'LEDGER-SESSION',
        name: `${trt.title} (Session #${trt.sessions.length + 1})`,
        unitPrice: sessionPrice,
        costPrice: 0,
        qty: 1,
        maxStock: 1,
        subtotal: sessionPrice
      }
    ]);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.qty + delta;
          if (item.type !== 'SESSION' && nextQty > item.maxStock) {
            setStatusBanner({
              type: 'error',
              text: `Maximum available stock for "${item.name}" is ${item.maxStock} units.`
            });
            return item;
          }
          return nextQty > 0
            ? { ...item, qty: nextQty, subtotal: nextQty * Number(item.unitPrice || 0) }
            : null;
        })
        .filter(Boolean)
    );
  };

  const updateCartPrice = (id, newPrice) => {
    const val = Math.max(0, Number(newPrice) || 0);
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'SESSION'
          ? { ...item, unitPrice: val, subtotal: (item.qty || 1) * val }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountInput(0);
    setApprovedDiscountRecord(null);
    setLinkedTreatmentId('');
  };

  // Core Barcode Processor: Searches inventory, enforces stock limits, plays beep, adds to cart
  const processScannedBarcode = (rawCode) => {
    const code = String(rawCode || '').trim();
    if (!code) return;
    const lowerCode = code.toLowerCase();

    // Look up product by barcode, item ID/SKU, or name
    const found = inventory.find(
      (i) =>
        (i.barcode && i.barcode.toLowerCase() === lowerCode) ||
        (i.id && i.id.toLowerCase() === lowerCode) ||
        (i.name && i.name.toLowerCase() === lowerCode)
    );

    if (found) {
      const availableStock = Number(found.quantity || 0);
      const inCart = cart.find((c) => c.id === found.id);
      const currentQty = inCart ? inCart.qty : 0;

      if (availableStock <= 0) {
        playScannerBeep('error');
        setStatusBanner({
          type: 'error',
          text: `⚠️ Out of Stock! "${found.name}" (Barcode: ${found.barcode}) has 0 units in stock.`
        });
        return;
      }

      if (currentQty + 1 > availableStock) {
        playScannerBeep('error');
        setStatusBanner({
          type: 'error',
          text: `⚠️ Stock Limit Reached! "${found.name}" only has ${availableStock} units in inventory.`
        });
        return;
      }

      addToCart(found);
      playScannerBeep('success');
      setLastScannedItem(found);
      setStatusBanner({
        type: 'success',
        text: `🛒 Barcode Scanned: "${found.name}" (Barcode: ${found.barcode} • Rs. ${Number(found.sellingPrice).toLocaleString()}) added to bill! In Cart: ${currentQty + 1} | Left: ${availableStock - (currentQty + 1)}`
      });
    } else {
      playScannerBeep('error');
      setStatusBanner({
        type: 'error',
        text: `❌ Barcode Not Found! No product matching barcode "${code}" found in inventory.`
      });
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    processScannedBarcode(code);
    setBarcodeInput('');
  };

  // Optional Auto-Focus on Barcode Input Field
  useEffect(() => {
    if (autoFocusScanner && subTab === 'POS' && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [autoFocusScanner, subTab, cart.length]);

  // Global Hardware Barcode Scanner Listener (Hardware USB/Bluetooth Laser & CCD Wedge)
  // Laser guns emulate ultra-fast keystrokes (< 50ms) terminated with 'Enter'
  useEffect(() => {
    let keyBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalScan = (e) => {
      // Allow F2, F4, ESC to function
      if (e.key === 'F2' || e.key === 'F4' || e.key === 'Escape') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      const activeEl = document.activeElement;
      const isBarcodeInput = activeEl === barcodeRef.current;
      const isOtherEditable =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable) &&
        !isBarcodeInput;

      // Reset buffer if delay exceeds 65ms (normal human typing is > 100ms)
      if (diff > 65 && !isBarcodeInput) {
        keyBuffer = '';
      }

      if (e.key === 'Enter') {
        const candidate = isBarcodeInput ? barcodeInput.trim() : keyBuffer.trim();
        if (candidate && candidate.length >= 2) {
          e.preventDefault();
          processScannedBarcode(candidate);
          keyBuffer = '';
          if (isBarcodeInput) setBarcodeInput('');
        }
        return;
      }

      if (e.key.length === 1) {
        if (!isOtherEditable || isBarcodeInput) {
          keyBuffer += e.key;
        } else if (diff < 45) {
          // Rapid keystroke burst detected even inside other elements -> hardware scanner
          keyBuffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalScan);
    return () => window.removeEventListener('keydown', handleGlobalScan);
  }, [inventory, cart, barcodeInput, soundEnabled]);

  // Listen for real-time remote mobile wireless barcode scan
  useEffect(() => {
    if (remoteScannedBarcode?.barcode) {
      processScannedBarcode(remoteScannedBarcode.barcode);
    }
  }, [remoteScannedBarcode]);

  const handleSaveAndPrint = async () => {
    if (cart.length === 0) {
      setStatusBanner({ type: 'error', text: 'Cart is empty! Scan a barcode or select an item first.' });
      return;
    }

    // STRICT CHECK (Image 3): Customer Name & Mobile Phone are strictly MANDATORY!
    if (selectedPatientId === 'pat_walkin') {
      const cleanName = walkInName.trim();
      const cleanPhone = walkInPhone.trim();
      const digitsOnly = cleanPhone.replace(/\D/g, '');

      if (!cleanName || cleanName.toLowerCase() === 'walk-in customer') {
        setWalkInValidationFailed(true);
        setStatusBanner({
          type: 'error',
          text: '⚠️ Customer Name is required to save & print slip so WhatsApp notification can be sent!'
        });
        if (nameInputRef.current) nameInputRef.current.focus();
        return;
      }

      if (!cleanPhone || digitsOnly.length < 10 || cleanPhone === '0300-0000000') {
        setWalkInValidationFailed(true);
        setStatusBanner({
          type: 'error',
          text: '⚠️ Valid Customer Mobile Phone Number (e.g. 0300-1234567) is required to generate receipt slip and send auto-WhatsApp SMS!'
        });
        if (phoneInputRef.current) phoneInputRef.current.focus();
        return;
      }
    }

    setWalkInValidationFailed(false);

    try {
      const res = await onCheckoutSale({
        patientId: selectedPatient.id,
        walkInName: selectedPatient.id === 'pat_walkin' ? walkInName.trim() : undefined,
        walkInPhone: selectedPatient.id === 'pat_walkin' ? walkInPhone.trim() : undefined,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        cashierId: currentUser?.id || 'u_staff',
        cashierName: currentUser?.name || 'Receptionist POS',
        items: cart.map((i) => ({
          ...i,
          subtotal:
            i.subtotal != null && !isNaN(Number(i.subtotal))
              ? Number(i.subtotal)
              : (Number(i.qty || 1) || 1) * (Number(i.unitPrice || 0) || 0)
        })),
        discountAmount: activeDiscount,
        discountRequestId: approvedDiscountRecord?.id || null,
        amountPaidToday: Number(amountPaidInput !== '' ? amountPaidInput : netTotal),
        paymentMethod,
        treatmentId: linkedTreatmentId || null,
        tableNumber: isRestaurant ? selectedTable : undefined,
        waiterName: isRestaurant ? selectedWaiter : undefined,
        orderType: isRestaurant ? (selectedTable.includes('Takeaway') ? 'TAKEAWAY' : selectedTable.includes('Delivery') ? 'DELIVERY' : 'DINE_IN') : 'RETAIL'
      });

      clearCart();
      setWalkInName('');
      setWalkInPhone('');
      if (res?.sale) {
        onOpenReceiptModal(res.sale, res.smsLog);
      }
    } catch (err) {
      setStatusBanner({ type: 'error', text: err.message || 'Checkout failed' });
    }
  };

  // Hold / Park Active Cart to serve next customer
  const handleParkActiveCart = async () => {
    if (cart.length === 0) {
      setStatusBanner({ type: 'error', text: 'Cart is empty! Add products or services before holding/parking the bill.' });
      return;
    }
    if (!onParkCart) return;
    try {
      setParkingInProgress(true);
      await onParkCart({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientPhone: selectedPatient.phone,
        walkInName: selectedPatient.id === 'pat_walkin' ? walkInName : '',
        walkInPhone: selectedPatient.id === 'pat_walkin' ? walkInPhone : '',
        items: cart.map((i) => ({
          ...i,
          subtotal:
            i.subtotal != null && !isNaN(Number(i.subtotal))
              ? Number(i.subtotal)
              : (Number(i.qty || 1) || 1) * (Number(i.unitPrice || 0) || 0)
        })),
        subtotal,
        discount: activeDiscount,
        netTotal,
        cashierId: currentUser?.id || 'u_staff',
        cashierName: currentUser?.name || 'Staff Cashier',
        notes: `Parked at ${new Date().toLocaleTimeString()}`
      });
      clearCart();
      setWalkInName('');
      setWalkInPhone('');
      setStatusBanner({
        type: 'success',
        text: `Bill for "${selectedPatient.name}" is now on HOLD (Parked). Register is free for next customer.`
      });
    } catch (err) {
      setStatusBanner({ type: 'error', text: err?.message || 'Failed to park cart' });
    } finally {
      setParkingInProgress(false);
    }
  };

  // Restore Parked Cart to Active POS
  const handleRestoreParkedCart = async (parkedSale) => {
    if (cart.length > 0) {
      const confirmSwap = window.confirm('Current counter has items in cart. Overwrite with this held bill?');
      if (!confirmSwap) return;
    }
    setCart(parkedSale.items || []);
    if (parkedSale.patientId && parkedSale.patientId !== 'pat_walkin') {
      setSelectedPatientId(parkedSale.patientId);
    } else {
      setSelectedPatientId('pat_walkin');
      setWalkInName(parkedSale.walkInName || parkedSale.patientName || '');
      setWalkInPhone(parkedSale.walkInPhone || parkedSale.patientPhone || '');
    }
    if (parkedSale.discount) {
      setDiscountInput(parkedSale.discount);
    }
    if (onUnparkCart) {
      await onUnparkCart(parkedSale.id);
    }
    setShowParkedModal(false);
    setStatusBanner({
      type: 'success',
      text: `Recalled held bill for "${parkedSale.patientName}". Ready to finalize or add more items!`
    });
  };

  // Open Shift (Guaranteed modal closing & active shift initiation)
  const handleOpenShiftSubmit = async (e) => {
    e.preventDefault();
    const floatVal = Number(openingFloatInput) || 0;
    try {
      if (onOpenShift) {
        await onOpenShift({
          cashierId: currentUser?.id || 'u_staff',
          cashierName: currentUser?.name || 'Reception Staff',
          openingFloat: floatVal
        });
      }
    } catch (err) {
      console.warn('Shift open warning:', err);
    }
    setShowOpenShiftModal(false);
    setStatusBanner({
      type: 'success',
      text: `Cash Drawer Shift opened! Starting cash float: Rs. ${floatVal.toLocaleString()}. Register is active.`
    });
  };

  // Close Shift
  const handleCloseShiftSubmit = async (e) => {
    e.preventDefault();
    if (!onCloseShift || !activeShift) return;
    try {
      const counted = Number(actualCashCountedInput) || 0;
      const res = await onCloseShift({
        shiftId: activeShift.id,
        actualCashCounted: counted,
        notes: shiftClosingNotes
      });
      setShowCloseShiftModal(false);
      setActualCashCountedInput('');
      setShiftClosingNotes('');
      if (res?.shift) {
        setViewingZReport(res.shift);
      }
      setStatusBanner({
        type: 'success',
        text: `Shift #${activeShift.code} closed! Z-Report generated successfully.`
      });
    } catch (err) {
      setStatusBanner({ type: 'error', text: err?.message || 'Failed to close shift' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleSaveAndPrint();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowNewPatientModal(true);
      } else if (e.key === 'F6') {
        e.preventDefault();
        if (cart.length > 0) {
          handleParkActiveCart();
        } else if (parkedSales.length > 0) {
          setShowParkedModal(true);
        }
      } else if (e.key === 'Escape') {
        if (showParkedModal) {
          setShowParkedModal(false);
        } else if (showOpenShiftModal) {
          setShowOpenShiftModal(false);
        } else if (showCloseShiftModal) {
          setShowCloseShiftModal(false);
        } else if (viewingZReport) {
          setViewingZReport(null);
        } else if (showNewPatientModal) {
          setShowNewPatientModal(false);
        } else if (showDiscountModal) {
          setShowDiscountModal(false);
        } else if (sessionPayModal) {
          setSessionPayModal(null);
        } else if (inspectedCustomerModal) {
          setInspectedCustomerModal(null);
        } else if (cart.length > 0) {
          clearCart();
          setStatusBanner({ type: 'info', text: 'POS Cart cleared via ESC shortcut.' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handlePinVerifySubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    if (!discountInput || Number(discountInput) <= 0) {
      setPinError('Please enter a valid discount amount (Rs.)');
      return;
    }
    try {
      const res = await onVerifyPinDiscount({
        pin: adminPinInput,
        staffId: currentUser?.id,
        staffName: currentUser?.name,
        patientName: selectedPatient.name,
        cartTotal: subtotal,
        discountAmount: Number(discountInput),
        reason: discountReason
      });
      if (res?.approved) {
        setApprovedDiscountRecord(res.approvalRecord);
        setShowDiscountModal(false);
        setAdminPinInput('');
        setStatusBanner({
          type: 'success',
          text: `4-Digit Admin PIN Verified! Rs. ${discountInput} discount unlocked.`
        });
      }
    } catch (err) {
      setPinError(err.message || 'Invalid 4-Digit Admin PIN');
    }
  };

  const handleRemoteRequestSubmit = async () => {
    setPinError('');
    if (!discountInput || Number(discountInput) <= 0) {
      setPinError('Please enter a valid discount amount (Rs.) first.');
      return;
    }
    try {
      const res = await onRequestRemoteDiscount({
        staffId: currentUser?.id,
        staffName: currentUser?.name,
        patientName: selectedPatient.name,
        cartTotal: subtotal,
        discountAmount: Number(discountInput),
        reason: discountReason
      });
      if (res?.request) {
        setPendingRemoteReqId(res.request.id);
      }
    } catch (err) {
      setPinError(err.message || 'Could not send remote request');
    }
  };

  // Dynamic Product Categories extracted from live inventory
  const allCategories = ['ALL', ...Array.from(new Set(inventory.map((i) => i.category || 'General').filter(Boolean)))];

  const filteredInventory = inventory.filter((item) => {
    const itemCat = item.category || 'General';
    if (selectedCategory !== 'ALL' && itemCat !== selectedCategory) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q) ||
      itemCat.toLowerCase().includes(q)
    );
  });

  const filteredTreatmentsList = treatments.filter((t) => {
    const q = ledgerFilterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.patientName.toLowerCase().includes(q) ||
      t.patientPhone.toLowerCase().includes(q) ||
      t.patientCode.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q)
    );
  });

  // Open full customer profile + purchase/session history modal
  const openCustomerHistoryModal = (saleOrPatient) => {
    const patId = saleOrPatient.patientId || saleOrPatient.id;
    const patPhone = saleOrPatient.patientPhone || saleOrPatient.phone;
    const patName = saleOrPatient.patientName || saleOrPatient.name;
    const patCode = saleOrPatient.patientCode || 'WALK-IN';

    const customerSales = sales.filter(
      (s) =>
        (patId && patId !== 'pat_walkin' && s.patientId === patId) ||
        (s.patientPhone === patPhone && s.patientName.toLowerCase() === patName.toLowerCase())
    );
    const customerTreatments = treatments.filter(
      (t) =>
        (patId && patId !== 'pat_walkin' && t.patientId === patId) ||
        t.patientPhone === patPhone
    );

    setInspectedCustomerModal({
      name: patName,
      phone: patPhone,
      patientCode: patCode,
      sales: customerSales,
      treatments: customerTreatments
    });
  };

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Sub-navigation Boxes & Keyboard Shortcuts (Box Style, turns Green when active - Image 1 & 2) */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {showPosModule && (
            <button
              type="button"
              onClick={() => setSubTab('POS')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                subTab === 'POS'
                  ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
                  : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    subTab === 'POS' ? 'bg-white/15 text-gold-bright' : 'bg-ice text-navy'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs truncate">1. POS Billing Counter</div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      subTab === 'POS' ? 'text-teal-light' : 'text-slate-500'
                    }`}
                  >
                    Barcode / Fast Scan & Cart
                  </div>
                </div>
              </div>
              {cart.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-gold text-navy font-extrabold text-[10px]">
                  {cart.length} in cart
                </span>
              )}
            </button>
          )}

          {showPatientsModule && (
            <button
              type="button"
              onClick={() => setSubTab('PATIENTS_LEDGER')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                subTab === 'PATIENTS_LEDGER'
                  ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
                  : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    subTab === 'PATIENTS_LEDGER' ? 'bg-white/15 text-gold-bright' : 'bg-ice text-teal'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs truncate">2. Patient Sessions & Ledger</div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      subTab === 'PATIENTS_LEDGER' ? 'text-teal-light' : 'text-slate-500'
                    }`}
                  >
                    Installments & Treatment Dues
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  subTab === 'PATIENTS_LEDGER'
                    ? 'bg-white/20 text-white'
                    : 'bg-teal text-white'
                }`}
              >
                {treatments.filter((t) => t.status === 'IN_PROGRESS').length} Active
              </span>
            </button>
          )}

          {showInventoryModule && (
            <button
              type="button"
              onClick={() => setSubTab('STOCK_ENTRY')}
              className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                subTab === 'STOCK_ENTRY'
                  ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
                  : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
              }`}
            >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  subTab === 'STOCK_ENTRY' ? 'bg-white/15 text-gold-bright' : 'bg-ice text-navy'
                }`}
              >
                <Barcode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs truncate">3. Stock In & Inventory</div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    subTab === 'STOCK_ENTRY' ? 'text-teal-light' : 'text-slate-500'
                  }`}
                >
                  {inventory.length} Products / Stock Audit
                </div>
              </div>
            </div>
          </button>
        )}

        <button
          type="button"
            onClick={() => setSubTab('RECENT_SALES')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
              subTab === 'RECENT_SALES'
                ? 'bg-teal text-white border-teal ring-2 ring-gold shadow-md'
                : 'bg-white text-navy border-slate-200 hover:border-teal hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  subTab === 'RECENT_SALES' ? 'bg-white/15 text-gold-bright' : 'bg-ice text-emerald-700'
                }`}
              >
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs truncate">4. Completed Receipts</div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    subTab === 'RECENT_SALES' ? 'text-teal-light' : 'text-slate-500'
                  }`}
                >
                  {sales.length} Locked Invoices & History
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Keyboard Quick Action Bar */}
        <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
            <span>Quick Keyboard Actions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndPrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <kbd className="px-1.5 py-0.5 bg-navy text-gold font-mono rounded text-[10px] font-extrabold">F2</kbd>
              <span>Save & Print Invoice</span>
            </button>
            {showPatientsModule && (
              <button
                type="button"
                onClick={() => setShowNewPatientModal(true)}
                className="px-3 py-1.5 rounded-lg bg-ice/70 hover:bg-ice border border-slate-300 text-navy font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <kbd className="px-1.5 py-0.5 bg-navy text-gold font-mono rounded text-[10px] font-extrabold">F4</kbd>
                <span>New Patient Profile</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleParkActiveCart}
              disabled={cart.length === 0 || parkingInProgress}
              className="px-3 py-1.5 rounded-lg bg-ice/80 hover:bg-slate-200 border border-slate-300 text-navy font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              title="Hold / Park Current Cart so you can bill the next customer (F6)"
            >
              <kbd className="px-1.5 py-0.5 bg-navy text-gold font-mono rounded text-[10px] font-extrabold">F6</kbd>
              <PauseCircle className="w-3.5 h-3.5 text-navy" />
              <span>Hold Cart</span>
            </button>
            <button
              type="button"
              onClick={() => setShowParkedModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold flex items-center gap-1.5 transition cursor-pointer relative"
              title="View all held / parked customer bills"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Held Bills</span>
              {parkedSales.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold animate-pulse">
                  {parkedSales.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-alert font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <kbd className="px-1.5 py-0.5 bg-alert text-white font-mono rounded text-[10px] font-extrabold">ESC</kbd>
              <span>Clear Cart</span>
            </button>
          </div>
        </div>

        {/* Cash Drawer Shift Management Ribbon */}
        <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs transition ${
          activeShift
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-3 h-3 rounded-full shrink-0 ${activeShift ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <div className="min-w-0">
              <div className="font-extrabold text-xs flex flex-wrap items-center gap-2">
                <span>{activeShift ? `Register Active • Shift #${activeShift.code}` : 'Register Closed / No Shift Opened'}</span>
                {activeShift && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 font-mono font-bold">
                    Cashier: {activeShift.cashierName}
                  </span>
                )}
              </div>
              <div className="text-[11px] opacity-85 mt-0.5 truncate">
                {activeShift
                  ? `Opening Float: Rs. ${Number(activeShift.openingFloat || 0).toLocaleString()} • Started: ${new Date(activeShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Start your shift with an opening cash float to maintain accurate daily drawer reconciliation.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeShift ? (
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-gold-bright" />
                <span>End Shift / Z-Report</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-gold-bright" />
                <span>Open Shift / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            statusBanner.type === 'error'
              ? 'bg-red-50 border-red-300 text-alert'
              : statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-white border-navy text-navy'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-xs underline ml-4 opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 1: HIGH-SPEED MEDICAL POS BILLING COUNTER                       */}
      {/* =================================================================== */}
      {subTab === 'POS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left 7 Columns: Barcode Scanner + Search + Product Grid with Clear Live Stock */}
          <div className="lg:col-span-7 space-y-4">
            {/* Barcode Hardware Scanner & Fast Search Hub */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <span className="font-extrabold text-[11px] text-navy tracking-tight">
                    Hardware Barcode Scanner Active (Laser / CCD / Bluetooth Gun Wedge)
                  </span>
                  <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
                    • Pull trigger anywhere on screen to auto-add to bill
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowDeviceScannerModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-teal text-white border border-teal text-[10px] font-extrabold flex items-center gap-1 shadow-sm transition hover:bg-teal-dark cursor-pointer"
                    title="Connect mobile phone as wireless scanner or connect USB laser gun"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-gold-bright" />
                    <span>Mobile / Cable Scanner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      soundEnabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                    title="Toggle POS Scanner Beep Sound"
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Beep Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAutoFocusScanner((prev) => !prev);
                      if (!autoFocusScanner && barcodeRef.current) barcodeRef.current.focus();
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      autoFocusScanner
                        ? 'bg-navy text-gold-bright border-navy'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    title="Keep cursor automatically focused on barcode input"
                  >
                    <span>Auto-Focus</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 relative">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-navy mb-1 flex items-center justify-between">
                    <span>Scan Barcode Gun</span>
                    <span className="text-slate-400 font-mono text-[9px]">ENTER to submit</span>
                  </label>
                  <div className="relative">
                    <Barcode className="w-4 h-4 text-navy absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      ref={barcodeRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Laser gun code e.g. 8961001001"
                      className="w-full pl-9 pr-14 py-2 rounded-xl border-2 border-navy/20 focus:border-navy bg-ice/30 text-xs font-mono font-semibold outline-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-navy text-gold font-extrabold text-[10px] hover:bg-navy-light transition cursor-pointer"
                    >
                      Scan
                    </button>
                  </div>
                </form>

                <div className="sm:col-span-7">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-teal mb-1">
                    Fast Typeahead Search (Medicine / Product / Procedure)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-teal absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Cream, Augmentin, Scaling, Gel, OPD..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-teal/25 focus:border-teal bg-white text-xs font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 1-Click Barcode Test Simulator Chips */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="font-extrabold text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-gold" />
                  <span>Simulate Barcode Gun:</span>
                </span>
                {inventory.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => processScannedBarcode(item.barcode)}
                    className="px-2 py-0.5 rounded-md bg-ice hover:bg-teal hover:text-white border border-slate-200 text-navy font-mono font-semibold transition cursor-pointer flex items-center gap-1"
                    title={`Click to simulate hardware scan of ${item.name}`}
                  >
                    <span>{item.name.split(' ')[0]}</span>
                    <span className="opacity-70">({item.barcode})</span>
                  </button>
                ))}
              </div>
            </div>

            {isClinic && patientActiveTreatments.length > 0 && (
              <div className="bg-teal text-white rounded-2xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gold-bright font-bold">
                    Active Multi-Session Treatment Ledger Detected
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    {patientActiveTreatments[0].title} — Agreed: Rs.{' '}
                    {patientActiveTreatments[0].totalCost.toLocaleString()} | Paid: Rs.{' '}
                    {patientActiveTreatments[0].paidAmount.toLocaleString()} |{' '}
                    <span className="underline text-gold-bright">
                      Remaining Balance: Rs. {patientActiveTreatments[0].remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addSessionToCart(patientActiveTreatments[0])}
                  className="px-3 py-1.5 rounded-xl bg-gold text-navy font-extrabold text-xs hover:bg-gold-bright transition shrink-0"
                >
                  + Load Next Session Installment to POS
                </button>
              </div>
            )}

            {/* Pharmacy & Products Grid with LIVE STOCK BADGE on EVERY item */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              {/* Restaurant Dining Table Floor Selector Bar */}
              {isRestaurant && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3.5 mb-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍽️</span>
                      <span className="font-extrabold text-xs uppercase tracking-wider text-amber-950">
                        Restaurant Dining Tables &amp; Takeaway
                      </span>
                      <span className="text-[10px] bg-amber-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        Selected: {selectedTable}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowKotModal(true)}
                      disabled={cart.length === 0}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                        cart.length > 0
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>🔥</span>
                      <span>Fire KOT to Kitchen ({cart.length})</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Takeaway / Parcel', 'Delivery'].map((tbl) => {
                      const isSelected = selectedTable === tbl;
                      const isTakeaway = tbl.includes('Takeaway') || tbl.includes('Delivery');
                      return (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => setSelectedTable(tbl)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border-2 ${
                            isSelected
                              ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-105'
                              : isTakeaway
                              ? 'bg-white text-orange-900 border-orange-200 hover:bg-orange-50'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                          }`}
                        >
                          <span>{isTakeaway ? '🛵' : '🪑'}</span>
                          <span>{tbl}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Waiter Management & Assignment */}
                  <div className="flex items-center justify-between gap-3 pt-2.5 mt-2.5 border-t border-amber-200/60 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                        <span>🧑‍🍳</span> Assigned Waiter / Server:
                      </span>
                      <select
                        value={selectedWaiter}
                        onChange={(e) => setSelectedWaiter(e.target.value)}
                        className="bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-xl px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="Waiter Ali">Waiter Ali</option>
                        <option value="Waiter Ahmed">Waiter Ahmed</option>
                        <option value="Waiter Hamza">Waiter Hamza</option>
                        <option value="Waiter Usman">Waiter Usman</option>
                        <option value="Captain Farhan">Captain Farhan</option>
                        <option value="Self Service">Self Service (Takeaway)</option>
                      </select>
                    </div>
                    <div className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg">
                      Order Handled by: <span className="font-black text-amber-950 underline">{selectedWaiter}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-navy">
                  Products, Medicines & Services ({filteredInventory.length})
                </h3>
                <span className="text-[11px] text-teal font-bold">
                  Live Stock Count Shown on Every Item • Auto-Deducts on Sale
                </span>
              </div>

              {/* Dynamic Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-thin">
                {allCategories.map((cat) => {
                  const count = cat === 'ALL'
                    ? inventory.length
                    : inventory.filter((i) => (i.category || 'General') === cat).length;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-navy text-gold-bright border-navy shadow-sm'
                          : 'bg-ice/70 text-slate-700 border-slate-200 hover:bg-ice hover:text-navy hover:border-slate-300'
                      }`}
                    >
                      <Tag className="w-3 h-3 opacity-70" />
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-gold text-navy font-extrabold' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                {filteredInventory.map((item) => {
                  const inCartItem = cart.find((c) => c.id === item.id);
                  const remainingAfterCart = Math.max(0, Number(item.quantity) - (inCartItem?.qty || 0));
                  const isOutOfStock = Number(item.quantity) <= 0;
                  const isLowStock = Number(item.quantity) <= Number(item.minStockAlert || 10);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(item)}
                      className={`text-left p-3 rounded-xl border transition flex flex-col justify-between group relative ${
                        isOutOfStock
                          ? 'bg-red-50/50 border-red-200 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 hover:border-navy hover:bg-ice/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {item.barcode}
                          </span>
                          {/* Prominent Stock Available Badge */}
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${
                              isOutOfStock
                                ? 'bg-alert text-white'
                                : isLowStock
                                ? 'bg-amber-500 text-navy'
                                : 'bg-teal text-white'
                            }`}
                          >
                            {isOutOfStock
                              ? 'OUT OF STOCK (0)'
                              : `In Stock: ${item.quantity} ${inCartItem ? `(After Cart: ${remainingAfterCart})` : ''}`}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-navy line-clamp-1">
                          {item.name}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-extrabold text-sm text-navy">
                          Rs. {Number(item.sellingPrice).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Searchable Patient / Walk-in Customer Input + Cart + Checkout */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-navy/15 flex-1 flex flex-col justify-between">
              <div>
                {/* Searchable Patient Selector OR Store Customer Box */}
                <div className="pb-3 mb-3 border-b border-slate-200 space-y-2.5">
                  {showPatientsModule && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
                          Search Patient (Phone / MR No / Name) or Walk-in
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNewPatientModal(true)}
                          className="text-xs font-bold text-teal hover:underline flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ New Patient (F4)</span>
                        </button>
                      </div>

                      {/* Typeahead Search Box for 100+ Patients */}
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-navy absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={patientSearchQuery}
                              onFocus={() => setShowPatientDropdown(true)}
                              onChange={(e) => {
                                setPatientSearchQuery(e.target.value);
                                setShowPatientDropdown(true);
                              }}
                              placeholder="Type Phone (0300...), MR# (ALS-2026...), or Name..."
                              className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-navy/25 focus:border-navy bg-ice/20 text-xs font-semibold text-navy outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId('pat_walkin');
                              setPatientSearchQuery('');
                              setShowPatientDropdown(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition shrink-0 ${
                              selectedPatientId === 'pat_walkin'
                                ? 'bg-navy text-gold border-navy'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            Walk-in Customer
                          </button>
                        </div>

                        {/* Dropdown Results when searching */}
                        {showPatientDropdown && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border-2 border-navy z-30 max-h-52 overflow-y-auto divide-y divide-slate-100">
                            <div className="px-3 py-1.5 bg-navy text-white text-[10px] font-bold flex justify-between items-center">
                              <span>Matching Registered Patients ({matchingPatientsForPOS.length})</span>
                              <button
                                type="button"
                                onClick={() => setShowPatientDropdown(false)}
                                className="text-gold underline"
                              >
                                Close
                              </button>
                            </div>
                            {matchingPatientsForPOS.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPatientId(p.id);
                                  setPatientSearchQuery(`${p.name} (${p.patientCode}) • ${p.phone}`);
                                  setShowPatientDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-ice/60 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-extrabold text-navy">{p.name}</span>
                                  <span className="ml-2 font-mono text-[11px] text-teal font-bold">
                                    {p.phone}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] bg-navy/10 text-navy px-2 py-0.5 rounded font-bold">
                                  {p.patientCode}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Currently Selected Patient Badge OR Walk-in Customer Name & Phone Inputs (Image 3) */}
                  {selectedPatientId === 'pat_walkin' ? (
                    <div
                      className={`border-2 rounded-xl p-3 space-y-2.5 transition ${
                        walkInValidationFailed && (!walkInName.trim() || !walkInPhone.trim())
                          ? 'bg-red-50/90 border-alert ring-2 ring-red-300'
                          : 'bg-amber-50/80 border-amber-300'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold uppercase text-navy flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>Walk-in Customer Details (Printed on Receipt & Saved in History)</span>
                        </span>
                        <span className="font-mono text-[10px] bg-gold/40 text-navy font-black px-1.5 py-0.5 rounded">
                          WALK-IN
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-navy mb-1 flex items-center justify-between">
                            <span>Customer Name *</span>
                            {walkInValidationFailed && !walkInName.trim() && (
                              <span className="text-alert font-bold text-[9px]">Required</span>
                            )}
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              ref={nameInputRef}
                              type="text"
                              required
                              value={walkInName}
                              onChange={(e) => {
                                setWalkInName(e.target.value);
                                if (walkInValidationFailed) setWalkInValidationFailed(false);
                              }}
                              placeholder="Customer Name (e.g. Ali)"
                              className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs font-bold text-navy outline-none ${
                                walkInValidationFailed && !walkInName.trim()
                                  ? 'border-alert bg-red-50 focus:border-alert ring-1 ring-red-400'
                                  : 'border-amber-300 bg-white focus:border-navy'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-navy mb-1 flex items-center justify-between">
                            <span>Phone Number (Auto-SMS) *</span>
                            {walkInValidationFailed && (!walkInPhone.trim() || walkInPhone.replace(/\D/g, '').length < 10) && (
                              <span className="text-alert font-bold text-[9px]">Valid Phone Required</span>
                            )}
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              ref={phoneInputRef}
                              type="text"
                              required
                              value={walkInPhone}
                              onChange={(e) => {
                                setWalkInPhone(e.target.value);
                                if (walkInValidationFailed) setWalkInValidationFailed(false);
                              }}
                              placeholder="Phone (e.g. 0300-1234567)"
                              className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold text-navy outline-none ${
                                walkInValidationFailed && (!walkInPhone.trim() || walkInPhone.replace(/\D/g, '').length < 10)
                                  ? 'border-alert bg-red-50 focus:border-alert ring-1 ring-red-400'
                                  : 'border-amber-300 bg-white focus:border-navy'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {autoMatchedPatient && (
                        <div className="p-2.5 rounded-xl bg-teal/15 border border-teal text-teal-900 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0">
                            <div className="font-extrabold flex items-center gap-1.5 text-[11px] text-teal-950 truncate">
                              <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span className="truncate">Registered Patient: {autoMatchedPatient.name}</span>
                              <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded border border-teal/30 shrink-0">
                                {autoMatchedPatient.patientCode}
                              </span>
                            </div>
                            <div className="text-[10px] text-teal-800 mt-0.5 truncate">
                              Phone: {autoMatchedPatient.phone} • Switch to patient profile & ledger
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(autoMatchedPatient.id);
                              setWalkInName('');
                              setWalkInPhone('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal text-white hover:bg-teal-dark font-extrabold text-[10px] shrink-0 shadow-sm cursor-pointer"
                          >
                            Select Patient
                          </button>
                        </div>
                      )}

                      <div className="pt-1 flex items-center gap-1.5 text-[10px]">
                        {walkInName.trim() && walkInPhone.replace(/\D/g, '').length >= 10 ? (
                          <div className="text-emerald-800 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Slip ready! Auto-WhatsApp receipt will dispatch to {walkInPhone}</span>
                          </div>
                        ) : (
                          <div className="text-amber-900 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>Slip cannot be printed without Name & Phone (Auto-WhatsApp dispatch requires mobile number)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-ice/50 border border-navy/20 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-navy">
                          {selectedPatient.name}{' '}
                          <span className="font-mono text-[11px] bg-navy text-gold px-1.5 py-0.5 rounded ml-1">
                            {selectedPatient.patientCode}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          Phone: <strong>{selectedPatient.phone}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCustomerHistoryModal(selectedPatient)}
                          className="px-2.5 py-1 rounded-lg bg-teal text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Full History</span>
                        </button>
                        <QRCodeSVG value={`${tenant.domain}|${selectedPatient.patientCode}`} size={28} />
                      </div>
                    </div>
                  )}

                  {patientExistingBalance > 0 && (
                    <div className="px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal">Current Treatment Ledger Balance:</span>
                      <span className="font-extrabold text-teal font-mono">
                        Rs. {patientExistingBalance.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* POS Cart Items List with Live Stock Info */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase pb-1.5 border-b border-slate-200">
                    <span>Cart Items ({cart.length})</span>
                    <span>Qty / Stock / Subtotal</span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                      <p>Scan a medicine barcode or click an item on the left</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[210px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              {item.type === 'SESSION' ? (
                                <span className="text-teal font-semibold">Installment Session Payment</span>
                              ) : (
                                <>
                                  <span>Rs. {item.unitPrice.toLocaleString()}</span>
                                  <span className="text-teal font-mono font-bold">
                                    (Stock Left: {Math.max(0, item.maxStock - item.qty)})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {item.type === 'SESSION' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500">Rs.</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateCartPrice(item.id, e.target.value)}
                                className="w-20 px-2 py-1 rounded border border-teal text-right font-mono font-bold text-xs"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, -1)}
                                className="p-1 hover:bg-white rounded text-slate-700"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 font-mono font-bold text-xs">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.id, 1)}
                                className="p-1 hover:bg-white rounded text-slate-700"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <div className="font-mono font-bold text-navy w-20 text-right">
                            Rs. {(item.qty * item.unitPrice).toLocaleString()}
                          </div>

                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, -999)}
                            className="p-1 text-slate-400 hover:text-alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Summary + Strict Fraud Prevention Discount Gate + Save & Print */}
              <div className="pt-3 border-t-2 border-dashed border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Gross Subtotal:</span>
                    <span className="font-mono font-bold">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5">
                    <div>
                      <div className="font-bold text-navy flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Discount (Admin Auth Required)</span>
                      </div>
                      {approvedDiscountRecord ? (
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Approved Rs. {activeDiscount} by {approvedDiscountRecord.approvedBy}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">
                          Staff cannot apply discount without Admin PIN or Live Approval
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDiscountInput(activeDiscount || 200);
                        setPinError('');
                        setShowDiscountModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-navy text-gold font-bold text-[11px] hover:bg-navy-light transition shrink-0"
                    >
                      {activeDiscount > 0 ? `Rs. -${activeDiscount} (Change)` : 'Request Discount'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-navy text-white px-3.5 py-2.5 rounded-xl">
                    <span className="font-bold uppercase tracking-wider text-xs">Net Total Payable</span>
                    <span className="font-mono font-extrabold text-lg text-gold-bright">
                      Rs. {netTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Paid Today (Rs.)
                      </label>
                      <input
                        type="number"
                        value={amountPaidInput}
                        onChange={(e) => setAmountPaidInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border-2 border-emerald-500 bg-emerald-50/40 font-mono font-bold text-sm text-emerald-950 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-teal uppercase mb-1">
                        Remaining Ledger Balance
                      </label>
                      <div className="w-full px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/30 font-mono font-extrabold text-sm text-teal">
                        Rs.{' '}
                        {Math.max(
                          0,
                          linkedTreatmentId
                            ? patientExistingBalance - Number(amountPaidInput || 0)
                            : patientExistingBalance + (netTotal - Number(amountPaidInput || 0))
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commercial POS Hold / Park Cart Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleParkActiveCart}
                    disabled={cart.length === 0 || parkingInProgress}
                    className="py-2 px-3 rounded-xl bg-ice hover:bg-slate-200 text-navy font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition cursor-pointer disabled:opacity-40"
                    title="Hold current cart and park it in queue so you can bill another customer (F6)"
                  >
                    <PauseCircle className="w-3.5 h-3.5 text-navy" />
                    <span>Hold Bill (F6)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowParkedModal(true)}
                    className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300 transition cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Held Bills ({parkedSales.length})</span>
                  </button>
                </div>

                {isRestaurant && (
                  <button
                    type="button"
                    onClick={() => setShowKotModal(true)}
                    disabled={cart.length === 0}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer disabled:opacity-50"
                  >
                    <span>🔥</span>
                    <span>FIRE / PRINT KOT TO KITCHEN ({selectedTable})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="w-full py-3.5 px-5 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg transition cursor-pointer"
                >
                  <Printer className="w-5 h-5 text-gold-bright" />
                  <span>{isRestaurant ? `CHECKOUT & PRINT BILL (${selectedTable})` : 'SAVE & PRINT THERMAL RECEIPT (F2)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: PATIENT MULTI-SESSION & INSTALLMENT LEDGER MANAGEMENT        */}
      {/* =================================================================== */}
      {subTab === 'PATIENTS_LEDGER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 4 Columns: Create Long-Term Treatment Ledger Plan with Searchable Patient & Backend Treatment Dropdown */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-teal text-white">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-navy">New Multi-Session Treatment Ledger</h3>
                  <p className="text-[11px] text-slate-500">
                    Search patient by Phone/MR# & select treatment from catalog
                  </p>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await onCreateTreatment({
                    ...newTreatmentForm,
                    cashierName: currentUser?.name || 'Receptionist POS'
                  });
                  if (res?.treatment) {
                    setStatusBanner({
                      type: 'success',
                      text: `Treatment Ledger created for ${res.treatment.patientName}! Remaining Balance: Rs. ${res.treatment.remainingBalance.toLocaleString()}`
                    });
                    if (res.sale) {
                      onOpenReceiptModal(res.sale, res.smsLog);
                    }
                  }
                }}
                className="space-y-3 text-xs"
              >
                {/* Searchable Patient Selector for 100+ Patients */}
                <div className="relative">
                  <label className="block font-bold text-slate-700 mb-1">
                    Search & Select Patient (Phone / MR No / Name)
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ledgerPatientSearch}
                      onFocus={() => setShowLedgerPatientList(true)}
                      onChange={(e) => {
                        setLedgerPatientSearch(e.target.value);
                        setShowLedgerPatientList(true);
                      }}
                      placeholder="Search by Phone (0300...), MR# or Name..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-semibold text-navy outline-none focus:border-navy"
                    />
                  </div>

                  {showLedgerPatientList && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border-2 border-navy z-20 max-h-44 overflow-y-auto divide-y divide-slate-100">
                      <div className="px-3 py-1 bg-navy text-white text-[10px] font-bold flex justify-between">
                        <span>Select Patient ({matchingPatientsForLedger.length})</span>
                        <button
                          type="button"
                          onClick={() => setShowLedgerPatientList(false)}
                          className="text-gold underline"
                        >
                          Close
                        </button>
                      </div>
                      {matchingPatientsForLedger.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setNewTreatmentForm({ ...newTreatmentForm, patientId: p.id });
                            setLedgerPatientSearch(`${p.name} (${p.patientCode}) • ${p.phone}`);
                            setShowLedgerPatientList(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-ice/60 flex justify-between items-center text-xs"
                        >
                          <div>
                            <div className="font-bold text-navy">{p.name}</div>
                            <div className="font-mono text-[10px] text-teal">{p.phone}</div>
                          </div>
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                            {p.patientCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {newTreatmentForm.patientId && (
                    <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-ice/60 text-[11px] font-bold text-navy flex justify-between">
                      <span>
                        Selected:{' '}
                        {patients.find((p) => p.id === newTreatmentForm.patientId)?.name || 'Select Patient'}
                      </span>
                      <span className="font-mono text-teal">
                        {patients.find((p) => p.id === newTreatmentForm.patientId)?.patientCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pre-configured Backend Treatment Dropdown + Searchable Typeahead */}
                <div>
                  <label className="block font-bold text-navy mb-1">
                    Select Treatment Package (From Clinic Catalog)
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const chosen = treatmentCatalog.find((c) => c.id === e.target.value);
                      if (chosen) {
                        setNewTreatmentForm({
                          ...newTreatmentForm,
                          title: chosen.name,
                          totalCost: chosen.defaultCost,
                          totalSessions: chosen.defaultSessions
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-teal/40 bg-teal/5 font-bold text-navy mb-1.5 outline-none"
                  >
                    <option value="">-- Choose Pre-Defined Treatment Package --</option>
                    {treatmentCatalog.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — Rs. {Number(c.defaultCost).toLocaleString()} ({c.defaultSessions} Sessions)
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    list="backend-treatment-catalog-list"
                    placeholder="Or type treatment name to filter/customize..."
                    value={newTreatmentForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = treatmentCatalog.find(
                        (c) => c.name.toLowerCase() === val.toLowerCase()
                      );
                      if (match) {
                        setNewTreatmentForm({
                          ...newTreatmentForm,
                          title: match.name,
                          totalCost: match.defaultCost,
                          totalSessions: match.defaultSessions
                        });
                      } else {
                        setNewTreatmentForm({ ...newTreatmentForm, title: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                  <datalist id="backend-treatment-catalog-list">
                    {treatmentCatalog.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-navy mb-1">Agreed Total Cost (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={newTreatmentForm.totalCost}
                      onChange={(e) =>
                        setNewTreatmentForm({ ...newTreatmentForm, totalCost: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-navy/30 font-mono font-bold text-navy"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-700 mb-1">Paid Today Session 1 (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={newTreatmentForm.initialPaid}
                      onChange={(e) =>
                        setNewTreatmentForm({ ...newTreatmentForm, initialPaid: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-emerald-400 font-mono font-bold text-emerald-900"
                    />
                  </div>
                </div>

                <div className="bg-teal/10 border border-teal/30 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-bold text-teal">Auto-Calculated Remaining Balance:</span>
                  <span className="font-mono font-extrabold text-base text-teal">
                    Rs.{' '}
                    {Math.max(
                      0,
                      Number(newTreatmentForm.totalCost || 0) - Number(newTreatmentForm.initialPaid || 0)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Planned Sessions</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newTreatmentForm.totalSessions}
                      onChange={(e) =>
                        setNewTreatmentForm({ ...newTreatmentForm, totalSessions: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Session 1 Visit Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newTreatmentForm.sessionDate}
                      onChange={(e) =>
                        setNewTreatmentForm({ ...newTreatmentForm, sessionDate: e.target.value })
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session 1 Clinical Note</label>
                  <input
                    type="text"
                    value={newTreatmentForm.notes}
                    onChange={(e) => setNewTreatmentForm({ ...newTreatmentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs shadow transition"
                >
                  Create Treatment Ledger & Print Session #1 Receipt
                </button>
              </form>
            </div>
          </div>

          {/* Right 8 Columns: Active Patient Ledgers with Search + Exact Session Dates & Timestamps */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-navy">
                    Multi-Session Patient Treatment Ledgers ({filteredTreatmentsList.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shows exact registration date, every session visit date/time, payment, and remaining balance
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ledgerFilterQuery}
                      onChange={(e) => setLedgerFilterQuery(e.target.value)}
                      placeholder="Search ledger by Phone / MR# / Name..."
                      className="pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-navy w-64"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewPatientModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-navy text-gold font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ New Patient</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTreatmentsList.map((trt) => (
                  <div
                    key={trt.id}
                    className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-ice/20"
                  >
                    <div className="bg-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy text-gold">
                            {trt.patientCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => openCustomerHistoryModal(trt)}
                            className="font-extrabold text-sm text-navy hover:underline flex items-center gap-1"
                          >
                            <span>{trt.patientName}</span>
                            <Eye className="w-3.5 h-3.5 text-teal" />
                          </button>
                          <span className="text-xs font-mono text-slate-600 font-semibold">
                            ({trt.patientPhone})
                          </span>
                          <span className="text-[11px] bg-ice px-2 py-0.5 rounded-md text-navy font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-teal" />
                            <span>Started: {new Date(trt.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </span>
                        </div>
                        <div className="font-bold text-xs text-teal mt-1">{trt.title}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Agreed Cost</div>
                          <div className="font-mono font-bold text-xs text-slate-800">
                            Rs. {Number(trt.totalCost).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-emerald-700 uppercase font-bold">Total Paid</div>
                          <div className="font-mono font-bold text-xs text-emerald-700">
                            Rs. {Number(trt.paidAmount).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right bg-teal text-white px-3 py-1.5 rounded-xl">
                          <div className="text-[9px] uppercase font-bold text-gold-bright">Remaining Balance</div>
                          <div className="font-mono font-extrabold text-sm">
                            Rs. {Number(trt.remainingBalance).toLocaleString()}
                          </div>
                        </div>

                        {trt.remainingBalance > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSessionPayModal(trt);
                              setSessionPayAmount(String(Math.min(trt.remainingBalance, 2000)));
                              setSessionPayNotes(`Session #${trt.sessions.length + 1} Follow-up Installment`);
                              setSessionPayDate(new Date().toISOString().slice(0, 16));
                            }}
                            className="px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs flex items-center gap-1.5 shadow"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Record Session Payment</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            FULLY PAID
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Session Payment History Table with CLEAR DATE & TIME */}
                    <div className="p-3 bg-slate-50/70">
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">
                        Session Visit & Payment Timeline ({trt.sessions.length} / {trt.totalSessions} Sessions) • Immutable By Staff
                      </div>
                      <div className="space-y-1.5">
                        {trt.sessions.map((ses) => (
                          <div
                            key={ses.id}
                            className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-navy bg-gold/25 px-2 py-0.5 rounded">
                                Session #{ses.sessionNumber}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {ses.date
                                  ? new Date(ses.date).toLocaleString([], {
                                      dateStyle: 'medium',
                                      timeStyle: 'short'
                                    })
                                  : 'Date Recorded'}
                              </span>
                              <span className="text-slate-700 font-medium">• {ses.notes}</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {ses.invoiceNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 font-mono text-xs">
                              <span className="text-emerald-700 font-bold">
                                Paid: Rs. {Number(ses.amountPaid).toLocaleString()}
                              </span>
                              <span className="text-teal font-bold">
                                Bal After: Rs. {Number(ses.balanceAfter).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: STOCK IN & PHARMACY INVENTORY                                */}
      {/* =================================================================== */}
      {subTab === 'STOCK_ENTRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-navy">
                    Stock In ({isClinic ? 'Pharmacy' : isRestaurant ? 'Food / Menu' : isPharmacy ? 'Medicine Formulary' : 'Mart Product'} Purchase)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add single stock or import hundreds in bulk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkProductModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-gold-bright" />
                  <span>Bulk Import (CSV)</span>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await onAddStock(stockForm);
                  if (res?.item) {
                    setStatusBanner({
                      type: 'success',
                      text: `Stock updated for ${res.item.name} (Available Qty: ${res.item.quantity})`
                    });
                    setStockForm({
                      barcode: '',
                      name: '',
                      category: isRestaurant ? 'Fast Food & Burgers' : isPharmacy ? 'Medicines' : isClinic ? 'Medicine' : 'Grocery',
                      supplier: '',
                      purchasePrice: '',
                      sellingPrice: '',
                      quantity: '',
                      minStockAlert: 10,
                      expiryDate: isRestaurant ? '' : '2027-12-31',
                      imageUrl: ''
                    });
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        {isRestaurant ? 'Dish Code / SKU' : 'Barcode / SKU'}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setStockForm({
                            ...stockForm,
                            barcode: isRestaurant
                              ? `DISH-${Math.floor(100 + Math.random() * 900)}`
                              : String(Math.floor(100000000 + Math.random() * 900000000))
                          })
                        }
                        className="text-[10px] text-teal hover:underline font-bold"
                      >
                        ⚡ Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      required={!isRestaurant}
                      placeholder={isRestaurant ? 'e.g. DISH-101 (or auto)' : 'e.g. 8961001099'}
                      value={stockForm.barcode}
                      onChange={(e) => setStockForm({ ...stockForm, barcode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={stockForm.category}
                      onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    >
                      {isRestaurant ? (
                        <>
                          <option value="Fast Food & Burgers">Fast Food & Burgers</option>
                          <option value="Desi Karahi & Handi">Desi Karahi & Handi</option>
                          <option value="Rice & Biryani">Rice & Biryani</option>
                          <option value="BBQ & Grills">BBQ & Grills</option>
                          <option value="Beverages & Drinks">Beverages & Drinks</option>
                          <option value="Hot Drinks & Chai">Hot Drinks & Chai</option>
                          <option value="Desserts & Sweets">Desserts & Sweets</option>
                          <option value="Appetizers & Sides">Appetizers & Sides</option>
                        </>
                      ) : isPharmacy ? (
                        <>
                          <option value="Medicines">Medicines & Tablets</option>
                          <option value="Syrups">Syrups & Liquids</option>
                          <option value="Antibiotics">Antibiotics</option>
                          <option value="Pain Relief">Pain Relief</option>
                          <option value="Medical Supplies">Medical Supplies</option>
                        </>
                      ) : isRetailMart ? (
                        <>
                          <option value="Grocery">Grocery & Staples</option>
                          <option value="Beverages">Beverages & Drinks</option>
                          <option value="Dairy">Dairy & Bakery</option>
                          <option value="Personal Care">Personal Care</option>
                          <option value="Household">Household & Cleaning</option>
                          <option value="Snacks">Snacks & Confectionery</option>
                          <option value="General">General Merchandise</option>
                        </>
                      ) : isClinic ? (
                        <>
                          <option value="Medicine">Medicine & Prescription</option>
                          <option value="Dermatology">Dermatology / Cream</option>
                          <option value="Antibiotic">Antibiotic</option>
                          <option value="Analgesic">Analgesic / Painkiller</option>
                          <option value="Oral Care">Oral & Dental Care</option>
                          <option value="Clinical Service">Clinical Procedure / Service</option>
                        </>
                      ) : (
                        <>
                          <option value="General Groceries">General Groceries</option>
                          <option value="Beverages">Beverages & Cold Drinks</option>
                          <option value="Snacks">Snacks & Fast Moving</option>
                          <option value="Dairy">Dairy & Fresh Goods</option>
                          <option value="Personal Care">Personal Care</option>
                          <option value="General">General Products</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRestaurant
                      ? 'Dish / Menu Item Name *'
                      : isPharmacy
                      ? 'Medicine / Formula Name *'
                      : isClinic
                      ? 'Medicine / Treatment Name *'
                      : 'Product / Item Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isRestaurant
                        ? 'e.g. Chicken Biryani / Zinger Burger'
                        : isPharmacy
                        ? 'e.g. Augmentin 625mg (GSK)'
                        : isClinic
                        ? 'e.g. Medicated Skin Cream'
                        : 'e.g. Super Basmati Rice 5kg'
                    }
                    value={stockForm.name}
                    onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRestaurant ? 'Kitchen Prep / Supplier' : 'Supplier Details'}
                  </label>
                  <input
                    type="text"
                    required={!isRestaurant}
                    placeholder={
                      isRestaurant
                        ? 'e.g. Main Kitchen / Cold Storage'
                        : 'e.g. Premier Pharma Distributors / Al-Karam'
                    }
                    value={stockForm.supplier}
                    onChange={(e) => setStockForm({ ...stockForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Purchase Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={stockForm.purchasePrice}
                      onChange={(e) => setStockForm({ ...stockForm, purchasePrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-navy mb-1">Selling Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={stockForm.sellingPrice}
                      onChange={(e) => setStockForm({ ...stockForm, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border-2 border-navy/30 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity In</label>
                    <input
                      type="number"
                      required
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isRestaurant ? 'Best Before (Optional)' : 'Expiry Date'}
                    </label>
                    <input
                      type="date"
                      required={!isRestaurant}
                      value={stockForm.expiryDate}
                      onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                {/* Dish / Product Image Upload */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isRestaurant ? 'Dish / Menu Item Photo' : 'Product Photo / Thumbnail (Optional)'}
                  </label>
                  <div className="flex items-center gap-3">
                    {stockForm.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                        <img src={stockForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setStockForm({ ...stockForm, imageUrl: '' })}
                          className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-bl cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setStockForm((prev) => ({ ...prev, imageUrl: ev.target.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal file:text-white hover:file:bg-teal-dark cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs shadow transition cursor-pointer"
                >
                  {isRestaurant
                    ? '+ Add Dish to Food Menu / Kitchen Stock'
                    : isPharmacy
                    ? '+ Add Medicine to Formulary'
                    : isClinic
                    ? '+ Add Stock to Clinic Inventory'
                    : '+ Add Product to Store Inventory'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-base text-navy mb-3">
                {isClinic
                  ? 'Live Clinic Stock & Expiry Monitor'
                  : isRestaurant
                  ? 'Live Restaurant Menu & Kitchen Stock'
                  : isPharmacy
                  ? 'Live Pharmacy Stock & Expiry Monitor'
                  : 'Live Mart Inventory & Stock Monitor'}{' '}
                ({inventory.length} Items)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-2 px-2">Barcode</th>
                      <th className="py-2 px-2">Item & Supplier</th>
                      <th className="py-2 px-2">Cost / Sale</th>
                      <th className="py-2 px-2">Live Stock Qty</th>
                      <th className="py-2 px-2">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((i) => {
                      const low = Number(i.quantity) <= Number(i.minStockAlert || 10);
                      return (
                        <tr key={i.id} className="hover:bg-ice/30">
                          <td className="py-2.5 px-2 font-mono font-bold text-navy">{i.barcode}</td>
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-slate-900">{i.name}</div>
                            <div className="text-[10px] text-slate-500">{i.supplier}</div>
                          </td>
                          <td className="py-2.5 px-2 font-mono">
                            Rs. {i.purchasePrice} / <strong className="text-navy">Rs. {i.sellingPrice}</strong>
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`px-2.5 py-1 rounded-full font-mono font-extrabold text-[11px] ${
                                low ? 'bg-alert text-white' : 'bg-teal text-white'
                              }`}
                            >
                              {i.quantity} in stock
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-mono text-xs">{i.expiryDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: COMPLETED RECEIPTS WITH ITEM/TREATMENT NAMES & CLICK DETAIL  */}
      {/* =================================================================== */}
      {subTab === 'RECENT_SALES' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
                <Lock className="w-4 h-4 text-alert" />
                <span>Completed POS Invoices — Strict Anti-Fraud Lock</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click on any Patient/Customer Name to view their complete profile, items bought, and session history.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500">
                  <th className="py-2.5 px-3">Invoice & Date/Time</th>
                  <th className="py-2.5 px-3">Patient / Customer (Click for Details)</th>
                  <th className="py-2.5 px-3">Products / Treatments Sold</th>
                  <th className="py-2.5 px-3">Net Bill</th>
                  <th className="py-2.5 px-3">Paid Today</th>
                  <th className="py-2.5 px-3">Ledger Balance</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-ice/30">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-navy">{s.invoiceNumber}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {new Date(s.createdAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => openCustomerHistoryModal(s)}
                        className="text-left group"
                      >
                        <div className="font-extrabold text-navy group-hover:text-teal group-hover:underline flex items-center gap-1">
                          <span>{s.patientName}</span>
                          <Eye className="w-3.5 h-3.5 text-teal" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {s.patientPhone} • {s.patientCode}
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 max-w-xs">
                        {(s.items || []).map((it, idx) => (
                          <div key={idx} className="text-xs font-semibold text-slate-800">
                            • {it.name}{' '}
                            <span className="font-mono text-[10px] text-teal font-bold">
                              (x{it.qty} = Rs. {Number(it.subtotal).toLocaleString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">Rs. {Number(s.netTotal).toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      Rs. {Number(s.amountPaidToday).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal">
                      Rs. {Number(s.remainingLedgerBalance).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(s, null)}
                        className="px-2.5 py-1 rounded-lg bg-navy text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-gold" />
                        <span>Reprint</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onAttemptStaffRefund(s.id);
                          } catch (err) {
                            setStatusBanner({ type: 'error', text: err.message });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-alert font-semibold text-[11px] flex items-center gap-1 hover:bg-red-100"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Void/Delete (Locked)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: INSPECT PATIENT / WALK-IN CUSTOMER COMPLETE PROFILE          */}
      {/* =================================================================== */}
      {inspectedCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border-2 border-navy shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="bg-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-gold text-navy font-mono text-xs font-extrabold">
                    {inspectedCustomerModal.patientCode}
                  </span>
                  <h3 className="font-extrabold text-base">{inspectedCustomerModal.name}</h3>
                </div>
                <p className="text-xs text-ice/80 font-mono mt-0.5">
                  Phone: {inspectedCustomerModal.phone} • Complete Purchases & Treatment Sessions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedCustomerModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Active / Past Treatment Plans */}
              {inspectedCustomerModal.treatments.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-navy uppercase tracking-wider mb-2">
                    Treatment Ledgers & Session Dates ({inspectedCustomerModal.treatments.length})
                  </h4>
                  <div className="space-y-2.5">
                    {inspectedCustomerModal.treatments.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-teal/40 bg-teal/5">
                        <div className="flex flex-wrap justify-between font-bold text-navy">
                          <span>{t.title}</span>
                          <span className="font-mono text-teal">
                            Agreed: Rs. {t.totalCost.toLocaleString()} | Paid: Rs.{' '}
                            {t.paidAmount.toLocaleString()} | Remaining: Rs.{' '}
                            {t.remainingBalance.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {t.sessions.map((s) => (
                            <div
                              key={s.id}
                              className="bg-white px-2.5 py-1.5 rounded border border-slate-200 flex justify-between font-mono text-[11px]"
                            >
                              <span>
                                <strong>Session #{s.sessionNumber}</strong> •{' '}
                                {new Date(s.date).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}{' '}
                                — {s.notes}
                              </span>
                              <span className="text-emerald-700 font-bold">
                                Paid Rs. {s.amountPaid.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Receipts / Products Purchased */}
              <div>
                <h4 className="font-extrabold text-navy uppercase tracking-wider mb-2">
                  All Invoices & Products/Treatments Purchased ({inspectedCustomerModal.sales.length})
                </h4>
                <div className="space-y-2">
                  {inspectedCustomerModal.sales.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-200 bg-ice/30 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-navy">
                          <span className="font-mono">{s.invoiceNumber}</span> •{' '}
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(s.createdAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        <div className="text-slate-800 font-semibold mt-0.5">
                          {(s.items || []).map((i) => `${i.name} (x${i.qty})`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-extrabold text-navy">
                          Paid: Rs. {Number(s.amountPaidToday).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectedCustomerModal(null);
                            onOpenReceiptModal(s, null);
                          }}
                          className="text-[10px] text-teal underline font-sans font-bold"
                        >
                          Open Thermal Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: DUAL-OPTION FRAUD PREVENTION DISCOUNT APPROVAL             */}
      {/* =================================================================== */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-navy shadow-2xl overflow-hidden">
            <div className="bg-navy text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Fraud Prevention & Discount Authorization</h3>
                  <p className="text-[11px] text-ice/80">
                    Staff cannot apply direct discounts without Admin PIN or Live Remote Approval
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-white/70 hover:text-white text-xs font-bold"
              >
                ESC
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy mb-1">Requested Discount (Rs.)</label>
                  <input
                    type="number"
                    min="1"
                    max={subtotal || 50000}
                    value={discountInput}
                    onChange={(e) => setDiscountInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border-2 border-navy font-mono font-extrabold text-base text-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Discount</label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-alert font-bold">
                  {pinError}
                </div>
              )}

              <form
                onSubmit={handlePinVerifySubmit}
                className="p-4 rounded-xl bg-ice/50 border border-navy/20 space-y-2.5"
              >
                <div className="font-extrabold text-navy flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-gold" />
                    <span>Option 1: Enter 4-Digit Clinic Admin PIN</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-32 px-3 py-2 rounded-xl border-2 border-navy text-center font-mono text-base font-extrabold tracking-widest"
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs transition"
                  >
                    Verify Admin PIN & Apply
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-xl bg-teal/10 border border-teal/30 space-y-2.5">
                <div className="font-extrabold text-teal flex items-center gap-1.5">
                  <BellRing className="w-4 h-4" />
                  <span>Option 2: Real-Time WebSocket Push Request to Clinic Admin</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Sends an instant push notification to the Clinic Admin Dashboard for 1-click remote approval.
                </p>

                {pendingRemoteReqId ? (
                  <div className="p-3 rounded-xl bg-white border border-teal text-teal font-bold flex items-center justify-between">
                    <span className="animate-pulse">
                      Waiting for Clinic Admin 1-Click Remote Approval...
                    </span>
                    <span className="text-[10px] font-mono bg-teal text-white px-2 py-0.5 rounded">
                      LIVE WEBSOCKET
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoteRequestSubmit}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs transition"
                  >
                    Send Live WebSocket Approval Request to Clinic Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: FAST NEW PATIENT REGISTRATION WITH AUTO QR ID (F4)         */}
      {/* =================================================================== */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-navy shadow-2xl overflow-hidden">
            <div className="bg-navy text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold" />
                <h3 className="font-extrabold text-sm">Register New Patient (F4)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="text-xs text-white/80 hover:text-white"
              >
                ESC
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await onCreatePatient(newPatientForm);
                if (res?.patient) {
                  setSelectedPatientId(res.patient.id);
                  setNewTreatmentForm((prev) => ({ ...prev, patientId: res.patient.id }));
                  setShowNewPatientModal(false);
                  setNewPatientForm({ name: '', phone: '', age: '', gender: 'Male' });
                  setStatusBanner({
                    type: 'success',
                    text: `Patient ${res.patient.name} registered with MR/QR ID: ${res.patient.patientCode}`
                  });
                }
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp / Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300-8877665"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    placeholder="32"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs shadow transition"
              >
                Generate QR Patient ID & Select for POS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: RECORD SUBSEQUENT TREATMENT SESSION INSTALLMENT + DATE     */}
      {/* =================================================================== */}
      {sessionPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-teal shadow-2xl overflow-hidden">
            <div className="bg-teal text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">Record Session Installment Payment</h3>
                <p className="text-[11px] text-teal-light">
                  {sessionPayModal.patientName} • Current Balance: Rs.{' '}
                  {sessionPayModal.remainingBalance.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSessionPayModal(null)}
                className="text-xs text-white/80 hover:text-white"
              >
                ESC
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await onPayTreatmentSession(sessionPayModal.id, {
                  amountPaid: Number(sessionPayAmount),
                  notes: sessionPayNotes,
                  sessionDate: sessionPayDate,
                  cashierName: currentUser?.name || 'Receptionist POS'
                });
                setSessionPayModal(null);
                if (res?.sale) {
                  onOpenReceiptModal(res.sale, res.smsLog);
                }
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div className="bg-ice/50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-navy">{sessionPayModal.title}</div>
                <div className="flex justify-between text-slate-600">
                  <span>Agreed Cost: Rs. {sessionPayModal.totalCost.toLocaleString()}</span>
                  <span>Paid So Far: Rs. {sessionPayModal.paidAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-navy mb-1">Amount Paid Today (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={sessionPayModal.remainingBalance}
                    value={sessionPayAmount}
                    onChange={(e) => setSessionPayAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-teal font-mono font-extrabold text-base text-teal"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionPayDate}
                    onChange={(e) => setSessionPayDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-teal/10 px-3 py-2 rounded-xl font-bold text-teal">
                <span>New Remaining Balance After Payment:</span>
                <span className="font-mono text-sm">
                  Rs.{' '}
                  {Math.max(
                    0,
                    sessionPayModal.remainingBalance - Number(sessionPayAmount || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Clinical Notes</label>
                <input
                  type="text"
                  required
                  value={sessionPayNotes}
                  onChange={(e) => setSessionPayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs shadow transition"
              >
                Update Ledger, Send WhatsApp/SMS & Print Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CABLE / USB & WIRELESS MOBILE BARCODE SCANNER MODAL                */}
      {/* =================================================================== */}
      {showDeviceScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-navy shadow-2xl overflow-hidden my-6">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gold text-navy font-extrabold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Cable & Mobile Barcode Scanner Hub</h3>
                  <p className="text-[11px] text-gold-bright">
                    Connect USB Laser Gun or Pair Mobile Phone as Wireless Scanner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceScannerModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Method 1: USB / Cable Barcode Laser Gun */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-emerald-700" />
                    <span>Method 1: USB / Bluetooth Laser Gun (Cable Device)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    AUTO-CONNECTED
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Koi bhi USB barcode scanner gun cable se PC mein connect karein — ye <strong>HID Keyboard Wedge</strong> ke tor par direct auto-connect hoti hai. Screen par kahin bhi laser trigger dabayein, barcode foran scan ho kar POS bill mein add ho jayega!
                </p>
              </div>

              {/* Method 2: Wireless Mobile Scanner (Scan QR with phone) */}
              <div className="p-4 rounded-2xl bg-teal/10 border-2 border-teal/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-navy flex items-center gap-2">
                    <Radio className="w-4 h-4 text-teal" />
                    <span>Method 2: Use Smartphone as Wireless Barcode Gun</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal text-white text-[10px] font-bold">
                    WebSockets Live Sync
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-teal/30">
                  <div className="p-2 bg-white rounded-xl border shadow-sm shrink-0">
                    <QRCodeSVG
                      value={`${window.location.origin}/?mobileScanner=true&tenantId=${tenant?.id || 'default'}`}
                      size={120}
                    />
                  </div>
                  <div className="text-[11px] space-y-1.5 text-slate-600">
                    <div className="font-extrabold text-navy text-xs">
                      Scan QR Code with Mobile Phone
                    </div>
                    <p>
                      Mobile camera se ye QR code scan karein. Phone par wireless scanner page khulay ga jahan se aap camera se product barcodes scan kar sakte hain.
                    </p>
                    <div className="text-teal font-mono text-[10px] font-bold">
                      Phone scan → Instant Real-Time WebSocket Push → PC Bill Auto-Add
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Simulator Test Input */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-bold text-navy text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-gold" />
                    <span>Test Mobile / Device Scan Signal:</span>
                  </span>
                  <span className="text-slate-400 font-normal text-[10px]">Instant Simulation</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mobileSimulateCode}
                    onChange={(e) => setMobileSimulateCode(e.target.value)}
                    placeholder="Enter or paste barcode e.g. 8961001001"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-navy outline-none focus:border-navy text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (mobileSimulateCode.trim()) {
                        processScannedBarcode(mobileSimulateCode.trim());
                        setMobileSimulateCode('');
                        setShowDeviceScannerModal(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-extrabold text-xs shadow transition cursor-pointer shrink-0"
                  >
                    Simulate Scan
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeviceScannerModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition cursor-pointer"
              >
                Close Scanner Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Parked / Held Bills Drawer */}
      {showParkedModal && (
        <div className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Parked / Held Customer Invoices</h3>
                  <p className="text-[10px] text-slate-300">
                    {parkedSales.length} cart{parkedSales.length === 1 ? '' : 's'} on hold
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowParkedModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {parkedSales.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <PauseCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">No bills currently parked on hold.</p>
                  <p className="text-[11px]">When a customer needs time, click "Hold Bill (F6)" to park their cart and serve the next person.</p>
                </div>
              ) : (
                parkedSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-navy">{sale.patientName || 'Walk-in'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                          {sale.patientPhone || 'No Phone'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(sale.parkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">
                        {sale.items?.map((it) => `${it.name} (x${it.qty})`).join(', ')}
                      </div>
                      <div className="text-xs font-extrabold text-teal">
                        Net: Rs. {Number(sale.netTotal || 0).toLocaleString()} • {sale.items?.length || 0} item(s)
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleRestoreParkedCart(sale)}
                        className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-gold-bright" />
                        <span>Recall to Cart</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onUnparkCart && onUnparkCart(sale.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-alert border border-transparent hover:border-red-200 transition cursor-pointer"
                        title="Discard this parked bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowParkedModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-navy font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Open Register Shift */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-teal text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Open Cash Drawer & Register Shift</h3>
                  <p className="text-[10px] text-teal-light">Daily POS Float Reconciliation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOpenShiftModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenShiftSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-navy uppercase mb-1">Active Cashier</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 font-bold text-xs text-navy border border-slate-200">
                  {currentUser?.name || 'Staff Cashier'} ({currentUser?.role || 'STAFF'})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-navy uppercase mb-1 flex items-center justify-between">
                  <span>Opening Cash Float (Rs.) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Drawer starting change</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={openingFloatInput}
                    onChange={(e) => setOpeningFloatInput(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-teal/40 focus:border-teal font-mono font-bold text-sm text-navy outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Cash kept in the physical drawer for making change to customers.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 text-gold-bright" />
                  <span>Begin Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Close Register Shift */}
      {showCloseShiftModal && activeShift && (
        <div className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Close Cash Drawer & Generate Z-Report</h3>
                  <p className="text-[10px] text-slate-300">Shift #{activeShift.code} • {activeShift.cashierName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseShiftModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opening Float:</span>
                  <span className="font-mono font-bold text-navy">Rs. {Number(activeShift.openingFloat || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shift Started At:</span>
                  <span className="text-navy font-medium">{new Date(activeShift.openedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-navy uppercase mb-1 flex items-center justify-between">
                  <span>Actual Cash Counted in Drawer (Rs.) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Physical cash count</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={actualCashCountedInput}
                    onChange={(e) => setActualCashCountedInput(e.target.value)}
                    placeholder="Enter physical cash in drawer"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-navy/30 focus:border-navy font-mono font-bold text-sm text-navy outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Count the physical notes and coins in the cash drawer to compute shortage / overage.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase mb-1">Closing Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={shiftClosingNotes}
                  onChange={(e) => setShiftClosingNotes(e.target.value)}
                  placeholder="e.g. End of day evening closing, all cash tallied."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-navy"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-gold-bright" />
                  <span>Close & Generate Z-Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Z-Report Viewer / Printable Slip */}
      {viewingZReport && (
        <div className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gold-bright" />
                <div>
                  <h3 className="font-extrabold text-sm">Z-Report Cash Drawer Reconciliation</h3>
                  <p className="text-[10px] text-slate-300">Shift #{viewingZReport.code} • {viewingZReport.cashierName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingZReport(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-extrabold text-sm text-navy uppercase">{tenant?.name || 'Clinic POS'}</h4>
                <p className="text-[10px] text-slate-500">OFFICIAL REGISTER SHIFT CLOSING (Z-REPORT)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Closed: {new Date(viewingZReport.closedAt || Date.now()).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Invoices Billed:</span>
                  <span className="font-bold text-navy">{viewingZReport.salesCount || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Gross Sales Value:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingZReport.grossSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Discounts Given:</span>
                  <span className="font-bold text-alert">Rs. {Number(viewingZReport.totalDiscounts || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Net Sales Volume:</span>
                  <span className="font-bold text-teal">Rs. {Number(viewingZReport.netSales || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-[11px] text-navy uppercase pb-1 border-b border-slate-200">
                  Payment Mode Distribution
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cash Invoices:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingZReport.paymentBreakdown?.CASH || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Card Invoices:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingZReport.paymentBreakdown?.CARD || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bank Transfer / Online:</span>
                  <span className="font-bold text-navy">Rs. {Number(viewingZReport.paymentBreakdown?.BANK_TRANSFER || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border-2 border-navy/20 bg-ice/40 space-y-2">
                <div className="font-extrabold text-[11px] text-navy uppercase pb-1 border-b border-navy/10">
                  Cash Reconciliation & Discrepancy
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Opening Float:</span>
                  <span className="font-bold">Rs. {Number(viewingZReport.openingFloat || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Net Cash Collected:</span>
                  <span className="font-bold">Rs. {Number(viewingZReport.netCashCollected || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-navy pt-1 border-t border-slate-200">
                  <span>Expected Drawer Cash:</span>
                  <span>Rs. {Number(viewingZReport.expectedCashInDrawer || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-teal">
                  <span>Counted Actual Cash:</span>
                  <span>Rs. {Number(viewingZReport.actualCashCounted || 0).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between font-extrabold p-2 rounded-xl text-xs ${
                  viewingZReport.difference === 0
                    ? 'bg-emerald-100 text-emerald-900'
                    : viewingZReport.difference < 0
                    ? 'bg-red-100 text-alert'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  <span>Reconciliation Result:</span>
                  <span>
                    {viewingZReport.difference === 0
                      ? 'EXACT MATCH (Rs. 0)'
                      : viewingZReport.difference < 0
                      ? `SHORTAGE: Rs. ${Math.abs(viewingZReport.difference).toLocaleString()}`
                      : `OVERAGE: +Rs. ${Number(viewingZReport.difference).toLocaleString()}`}
                  </span>
                </div>
              </div>

              {viewingZReport.notes && (
                <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-700">
                  <span className="font-bold">Notes:</span> {viewingZReport.notes}
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
                onClick={() => setViewingZReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-navy font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRODUCT IMPORT MODAL */}
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
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-left transition flex items-center justify-between"
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
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-left transition flex items-center justify-between"
                  >
                    <span>💊 Load Pharmacy Pack (10 Medicines)</span>
                    <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded font-extrabold">Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const restaurantItems = [
                        { barcode: '896600101', name: 'Chicken Biryani Special', category: 'Main Course', supplier: 'Kitchen Prep', quantity: 40, purchasePrice: 280, sellingPrice: 450, unit: 'Plate', expiryDate: '2026-12-31' },
                        { barcode: '896600102', name: 'Chicken Karahi Full (Desi Ghee)', category: 'Main Course', supplier: 'Kitchen Prep', quantity: 25, purchasePrice: 1100, sellingPrice: 1750, unit: 'Karahi', expiryDate: '2026-12-31' },
                        { barcode: '896600103', name: 'Zinger Burger with Fries & Drink', category: 'Fast Food', supplier: 'Kitchen Prep', quantity: 50, purchasePrice: 320, sellingPrice: 580, unit: 'Combo', expiryDate: '2026-12-31' },
                        { barcode: '896600104', name: 'Chicken Tikka Boti Plate', category: 'BBQ & Grills', supplier: 'Kitchen Prep', quantity: 30, purchasePrice: 240, sellingPrice: 420, unit: 'Plate', expiryDate: '2026-12-31' },
                        { barcode: '896600105', name: 'Seekh Kabab Beef (4 Pcs)', category: 'BBQ & Grills', supplier: 'Kitchen Prep', quantity: 35, purchasePrice: 300, sellingPrice: 520, unit: 'Plate', expiryDate: '2026-12-31' },
                        { barcode: '896600106', name: 'Club Sandwich with Coleslaw', category: 'Fast Food', supplier: 'Kitchen Prep', quantity: 30, purchasePrice: 250, sellingPrice: 480, unit: 'Plate', expiryDate: '2026-12-31' },
                        { barcode: '896600107', name: 'Chicken Chowmein Special', category: 'Chinese', supplier: 'Kitchen Prep', quantity: 25, purchasePrice: 320, sellingPrice: 590, unit: 'Platter', expiryDate: '2026-12-31' },
                        { barcode: '896600108', name: 'Margherita Pizza Large', category: 'Fast Food', supplier: 'Kitchen Prep', quantity: 20, purchasePrice: 750, sellingPrice: 1350, unit: 'Box', expiryDate: '2026-12-31' },
                        { barcode: '896600109', name: 'Roghni Naan Fresh', category: 'Breads', supplier: 'Tandoor Station', quantity: 150, purchasePrice: 30, sellingPrice: 60, unit: 'Pc', expiryDate: '2026-12-31' },
                        { barcode: '896600110', name: 'Mint Margarita Chilled', category: 'Beverages', supplier: 'Bar Station', quantity: 60, purchasePrice: 90, sellingPrice: 240, unit: 'Glass', expiryDate: '2026-12-31' },
                        { barcode: '896600111', name: 'Fresh Lime 7Up', category: 'Beverages', supplier: 'Bar Station', quantity: 60, purchasePrice: 70, sellingPrice: 180, unit: 'Glass', expiryDate: '2026-12-31' },
                        { barcode: '896600112', name: 'Special Karak Chai (Doodh Patti)', category: 'Beverages', supplier: 'Tea Station', quantity: 100, purchasePrice: 40, sellingPrice: 100, unit: 'Cup', expiryDate: '2026-12-31' },
                        { barcode: '896600113', name: 'Gulab Jamun Warm (2 Pcs)', category: 'Desserts', supplier: 'Dessert Station', quantity: 40, purchasePrice: 80, sellingPrice: 160, unit: 'Bowl', expiryDate: '2026-12-31' },
                        { barcode: '896600114', name: 'Molten Lava Cake with Ice Cream', category: 'Desserts', supplier: 'Dessert Station', quantity: 20, purchasePrice: 250, sellingPrice: 490, unit: 'Plate', expiryDate: '2026-12-31' },
                        { barcode: '896600115', name: 'Mineral Water Large 1.5L', category: 'Beverages', supplier: 'Nestle', quantity: 80, purchasePrice: 80, sellingPrice: 120, unit: 'Bottle', expiryDate: '2027-12-31' }
                      ];
                      if (onBulkAddProducts) onBulkAddProducts(restaurantItems);
                      setBulkImportSuccess(`Imported ${restaurantItems.length} Popular Restaurant & Cafe Dishes!`);
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-left transition flex items-center justify-between sm:col-span-2 cursor-pointer"
                  >
                    <span>🍽️ Load Restaurant &amp; Cafe Menu (15 Dishes)</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-extrabold">Instant Menu</span>
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
                    className="text-[10px] text-teal hover:underline font-bold"
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
                    className="flex-1 py-1.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-extrabold text-[11px] shadow transition"
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
                className="px-4 py-1.5 rounded-xl bg-navy text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* RESTAURANT KITCHEN ORDER TICKET (KOT) THERMAL PRINT MODAL */}
      {showKotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-500 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Kitchen Order Ticket (KOT)</h3>
                  <div className="text-[11px] text-amber-100 font-bold">Table: {selectedTable} • Live Station Dispatch</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowKotModal(false); setKotSuccessAlert(''); }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {kotSuccessAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{kotSuccessAlert}</span>
                </div>
              )}

              {/* Thermal Paper Preview */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 rounded-2xl font-mono text-slate-800 space-y-2">
                <div className="text-center border-b pb-2">
                  <div className="font-black text-base uppercase text-navy">{tenant?.name || 'Restaurant'}</div>
                  <div className="text-[10px] text-slate-500 font-bold">KITCHEN ORDER TICKET (KOT)</div>
                  <div className="text-[11px] font-black text-amber-600 mt-1">*** TABLE: {selectedTable} ***</div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Server: {currentUser?.name || 'Counter'}</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="border-t border-b py-2 space-y-1.5">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-[11px] text-slate-500">KOT Item</span>
                    </div>
                  ))}
                </div>

                {kotKitchenNote && (
                  <div className="bg-amber-100 p-2 rounded text-[11px] font-bold text-amber-900">
                    Chef Note: {kotKitchenNote}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] uppercase mb-1">
                  Special Kitchen Instructions / Chef Note:
                </label>
                <input
                  type="text"
                  value={kotKitchenNote}
                  onChange={(e) => setKotKitchenNote(e.target.value)}
                  placeholder="e.g. Less spicy, serve drinks first, extra raita..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-500 outline-none text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setKotSuccessAlert(`KOT Fired for ${selectedTable}! Sent to Kitchen Printer.`);
                    setTimeout(() => {
                      setShowKotModal(false);
                      setKotSuccessAlert('');
                    }, 1500);
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT KOT TO KITCHEN</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowKotModal(false); setKotSuccessAlert(''); }}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
