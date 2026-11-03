import React, { useState } from 'react';
import { Printer, X, MessageSquare, CheckCircle2, Usb, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ThermalReceiptModal({
  sale,
  tenant,
  smsLog,
  onClose
}) {
  const [paperSize, setPaperSize] = useState('80mm'); // '58mm' or '80mm'
  const [escPosStatus, setEscPosStatus] = useState(null);

  if (!sale || !tenant) return null;

  const handlePrint = () => {
    document.documentElement.style.setProperty('--thermal-width', paperSize);
    window.print();
  };

  // Direct WebUSB / WebSerial ESC/POS Thermal Printer Integration
  const handleDirectEscPosPrint = async () => {
    try {
      if ('serial' in navigator) {
        setEscPosStatus('Connecting to ESC/POS Serial Thermal Printer...');
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();

        // Standard ESC/POS initialization + centered header
        const ESC = '\x1B';
        const GS = '\x1D';
        const init = `${ESC}@`;
        const center = `${ESC}a\x01`;
        const left = `${ESC}a\x00`;
        const boldOn = `${ESC}E\x01`;
        const boldOff = `${ESC}E\x00`;
        const cut = `${GS}V\x41\x03`;

        let receiptText =
          init +
          center +
          boldOn +
          `${tenant.name}\n` +
          boldOff +
          `${tenant.address}\nTel: ${tenant.phone}\n` +
          `--------------------------------\n` +
          left +
          `Receipt: ${sale.invoiceNumber}\n` +
          `Date: ${new Date(sale.createdAt).toLocaleString()}\n` +
          `Patient: ${sale.patientName} (${sale.patientCode})\n` +
          `Cashier: ${sale.cashierName}\n` +
          `--------------------------------\n`;

        sale.items.forEach((item) => {
          const itemTotal = (item.subtotal != null && !isNaN(Number(item.subtotal)))
            ? Number(item.subtotal)
            : ((Number(item.qty || 1) || 1) * (Number(item.unitPrice || 0) || 0));
          receiptText += `${item.name.slice(0, 22)} x${item.qty}  Rs.${itemTotal}\n`;
        });

        receiptText +=
          `--------------------------------\n` +
          `Subtotal:        Rs. ${sale.subtotal}\n` +
          (sale.discountAmount > 0 ? `Discount:       -Rs. ${sale.discountAmount}\n` : '') +
          boldOn +
          `NET TOTAL:       Rs. ${sale.netTotal}\n` +
          `PAID TODAY:      Rs. ${sale.amountPaidToday}\n` +
          `BALANCE DUE:     Rs. ${sale.remainingLedgerBalance}\n` +
          boldOff +
          `--------------------------------\n` +
          center +
          `${tenant.receiptFooter}\n\n\n` +
          cut;

        await writer.write(encoder.encode(receiptText));
        writer.releaseLock();
        await port.close();
        setEscPosStatus('Direct ESC/POS 80mm hardware print succeeded!');
      } else {
        setEscPosStatus('Browser Serial API unavailable; opening silent OS Thermal Print dialog...');
        handlePrint();
      }
    } catch (err) {
      setEscPosStatus('Direct USB cancelled — opening standard OS Thermal Print...');
      handlePrint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-navy max-w-2xl w-full overflow-hidden my-auto">
        {/* Top Action Bar */}
        <div className="bg-navy text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gold text-navy font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Thermal Receipt Ready ({paperSize} ESC/POS)</h3>
              <p className="text-xs text-ice/80">Invoice #{sale.invoiceNumber} • Saved & Locked in Tenant Ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-navy-dark p-1 rounded-lg flex items-center text-xs border border-white/15">
              <button
                type="button"
                onClick={() => setPaperSize('58mm')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  paperSize === '58mm' ? 'bg-gold text-navy' : 'text-white/80 hover:text-white'
                }`}
              >
                58mm Roll
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('80mm')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  paperSize === '80mm' ? 'bg-gold text-navy' : 'text-white/80 hover:text-white'
                }`}
              >
                80mm Roll
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-ice/40">
          {/* Left Column: Thermal Paper Preview */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div
              id="thermal-receipt-print-area"
              className={`bg-white text-black font-mono border border-slate-300 shadow-md p-4 transition-all ${
                paperSize === '58mm' ? 'w-[250px] text-[11px]' : 'w-[320px] text-xs'
              }`}
            >
              {/* White-Label Clinic Header */}
              <div className="text-center border-b border-dashed border-black pb-2 mb-2">
                {tenant.logoUrl ? (
                  <img
                    src={tenant.logoUrl}
                    alt={tenant.name}
                    className="h-10 mx-auto mb-1 object-contain"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-white font-bold text-sm mb-1">
                    {tenant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="font-bold text-sm uppercase tracking-tight leading-snug">
                  {tenant.name}
                </div>
                {tenant.receiptHeader && (
                  <div className="text-[10px] italic text-neutral-700 mt-0.5">
                    {tenant.receiptHeader}
                  </div>
                )}
                <div className="text-[10px] mt-1 leading-tight">{tenant.address}</div>
                <div className="text-[10px] font-semibold mt-0.5">Tel: {tenant.phone}</div>
              </div>

              {/* Invoice & Patient Metadata */}
              <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="font-bold">RECEIPT:</span>
                  <span className="font-bold">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(sale.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>PATIENT:</span>
                  <span className="font-bold text-right">{sale.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PATIENT ID:</span>
                  <span>{sale.patientCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span className="truncate max-w-[150px]">{sale.cashierName}</span>
                </div>
              </div>

              {/* Itemized List */}
              <div className="border-b border-dashed border-black pb-2 mb-2">
                <div className="flex justify-between font-bold text-[10px] border-b border-black pb-1 mb-1">
                  <span>ITEM / DESCRIPTION</span>
                  <span>QTY x AMT</span>
                </div>
                <div className="space-y-1.5">
                  {sale.items.map((item, idx) => {
                    const itemTotal = (item.subtotal != null && !isNaN(Number(item.subtotal)))
                      ? Number(item.subtotal)
                      : ((Number(item.qty || 1) || 1) * (Number(item.unitPrice || 0) || 0));
                    return (
                      <div key={idx} className="leading-tight">
                        <div className="font-semibold">{item.name}</div>
                        <div className="flex justify-between text-[10px] text-neutral-700">
                          <span>
                            {item.qty} x Rs. {Number(item.unitPrice || 0).toLocaleString()}
                          </span>
                          <span className="font-bold text-black">
                            Rs. {Number(itemTotal).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals & Multi-Session Ledger Breakdown */}
              <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Gross Total:</span>
                  <span>Rs. {Number(sale.subtotal).toLocaleString()}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount ({sale.discountApprovedBy?.split(' ')[0] || 'Auth'}):</span>
                    <span>- Rs. {Number(sale.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-0.5 border-t border-dotted border-black">
                  <span>NET PAYABLE:</span>
                  <span>Rs. {Number(sale.netTotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold bg-neutral-100 px-1 py-0.5">
                  <span>PAID TODAY ({sale.paymentMethod}):</span>
                  <span>Rs. {Number(sale.amountPaidToday).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-xs">
                  <span>REMAINING BALANCE:</span>
                  <span>Rs. {Number(sale.remainingLedgerBalance).toLocaleString()}</span>
                </div>
              </div>

              {/* Patient QR Code & Custom Footer */}
              <div className="text-center pt-1 space-y-1.5">
                <div className="flex justify-center my-1">
                  <QRCodeSVG
                    value={`${tenant.domain}|${sale.invoiceNumber}|${sale.patientCode}|PAID:${sale.amountPaidToday}|BAL:${sale.remainingLedgerBalance}`}
                    size={68}
                  />
                </div>
                <div className="text-[10px] leading-snug font-medium">
                  {tenant.receiptFooter}
                </div>
                <div className="text-[9px] text-neutral-500 pt-1">
                  Powered by {tenant.domain}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Print Controls + Auto SMS/WhatsApp Status */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Auto SMS / WhatsApp Notification Confirmation Box */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto SMS / WhatsApp Dispatched</span>
                </div>
                <p className="text-xs text-emerald-800 mb-2">
                  Sent to <span className="font-mono font-bold">{sale.patientPhone}</span>:
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs font-mono text-slate-800 leading-relaxed">
                  {smsLog?.message ||
                    `"Dear ${sale.patientName}, Thank you for visiting ${tenant.name}. Amount Paid: Rs. ${Number(
                      sale.amountPaidToday
                    ).toLocaleString()} | Remaining Balance: Rs. ${Number(
                      sale.remainingLedgerBalance
                    ).toLocaleString()}."`}
                </div>
              </div>

              {/* Fraud & Security Seal */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-navy">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Immutable Ledger Record</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  This receipt is locked under <strong>Strict POS Control</strong>. Receptionist/Staff cannot edit or delete this transaction.
                </p>
              </div>

              {escPosStatus && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900 font-medium">
                  {escPosStatus}
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Printer className="w-4 h-4 text-gold" />
                <span>Print Thermal Receipt ({paperSize})</span>
              </button>

              <button
                type="button"
                onClick={handleDirectEscPosPrint}
                className="w-full py-2.5 px-4 rounded-xl bg-teal hover:bg-teal-dark text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Usb className="w-4 h-4" />
                <span>Direct USB / Serial ESC/POS Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
              >
                Done & Return to POS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
