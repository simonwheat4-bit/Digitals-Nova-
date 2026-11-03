import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Barcode,
  Smartphone,
  Radio,
  Send,
  CheckCircle2,
  Volume2,
  VolumeX,
  Zap,
  ArrowLeft
} from 'lucide-react';

export default function MobileScannerView({ tenantId }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [socket, setSocket] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on('connect', () => {
      setSocketConnected(true);
      if (tenantId) {
        s.emit('join_tenant', tenantId);
      }
    });

    s.on('disconnect', () => {
      setSocketConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, [tenantId]);

  const playMobileBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  };

  const handleSendBarcode = (codeToSend) => {
    const code = String(codeToSend || barcodeInput).trim();
    if (!code) return;

    if (socket) {
      socket.emit('mobile_barcode_scanned', {
        tenantId,
        barcode: code,
        deviceName: 'Mobile Phone Laser'
      });
      playMobileBeep();
      setStatusMessage(`✓ Barcode "${code}" transmitted to POS Counter!`);
      setRecentScans((prev) => [code, ...prev.slice(0, 4)]);
      setBarcodeInput('');
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage('⚠️ Socket connecting... please wait');
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold text-navy font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white">Digital Snove Mobile Scanner</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-ice/70">
                <Radio className={`w-3 h-3 ${socketConnected ? 'text-emerald-400 animate-pulse' : 'text-alert'}`} />
                <span>{socketConnected ? 'Connected to POS Counter' : 'Connecting to Server...'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((p) => !p)}
            className="p-2 rounded-xl bg-white/10 text-white"
            title="Toggle Beep Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Barcode Input & Laser Trigger */}
        <div className="bg-navy-dark p-5 rounded-3xl border-2 border-gold/40 shadow-xl space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gold-bright mb-1.5">
              Scan or Type Product Barcode
            </label>
            <div className="relative">
              <Barcode className="w-5 h-5 text-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendBarcode();
                  }
                }}
                placeholder="Scan code e.g. 8961001001"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border-2 border-gold/40 focus:border-gold outline-none font-mono font-bold text-base text-white tracking-wider"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSendBarcode()}
            className="w-full py-4 rounded-2xl bg-gold hover:bg-gold-bright text-navy font-black text-sm flex items-center justify-center gap-2 shadow-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>⚡ Push Scan to POS Screen</span>
          </button>
        </div>

        {/* Quick Test Barcode Buttons */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-gold" />
            <span>1-Click Test Barcodes:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: 'Augmentin 625mg', code: '8961001001' },
              { name: 'Panadol Extra', code: '8961002002' },
              { name: 'Hydra Facial', code: '8961003003' },
              { name: 'Teeth Scaling', code: '8961004004' }
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSendBarcode(item.code)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition"
              >
                <div className="font-extrabold text-white text-[11px] truncate">{item.name}</div>
                <div className="font-mono text-[10px] text-gold-bright">{item.code}</div>
              </button>
            ))}
          </div>
        </div>

        {recentScans.length > 0 && (
          <div className="text-[10px] text-slate-400 text-center font-mono">
            Recent Scans: {recentScans.join(', ')}
          </div>
        )}
      </div>

      {/* Footer Return Link */}
      <div className="pt-4 border-t border-white/10 text-center">
        <a
          href="/"
          className="text-xs text-gold-bright hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Scanner & Open Full Portal</span>
        </a>
      </div>
    </div>
  );
}
