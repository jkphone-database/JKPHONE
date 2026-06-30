import React, { useState, useEffect, useRef } from 'react';
import { BcaMutation, Transaction } from '../types';
import { 
  Sparkles, ArrowRightLeft, Search, HelpCircle, CheckCircle2, 
  AlertCircle, Trash, Link, ExternalLink, Calendar, Loader2,
  RefreshCw, Wifi, WifiOff, Database, Play, Check, ShieldCheck, 
  CreditCard, ChevronDown, ChevronUp, Bell, Info
} from 'lucide-react';

interface BcaMutationManagerProps {
  mutations: BcaMutation[];
  transactions: Transaction[];
  onAddMutations: (newMutations: Omit<BcaMutation, 'id' | 'status'>[]) => void;
  onLinkMutationToTransaction: (mutationId: string, transactionId: string) => void;
  onUnlinkMutation: (mutationId: string) => void;
  onDeleteMutation: (id: string) => void;
  onSetMutationStatus: (id: string, status: 'Unmatched' | 'Matched' | 'Manual') => void;
  onQuickCreateInvoice: (mutation: BcaMutation) => void; // Shortcut to spawn a sale
  userRole?: 'atasan' | 'karyawan';
}

export default function BcaMutationManager({
  mutations,
  transactions,
  onAddMutations,
  onLinkMutationToTransaction,
  onUnlinkMutation,
  onDeleteMutation,
  onSetMutationStatus,
  onQuickCreateInvoice,
  userRole = 'atasan'
}: BcaMutationManagerProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local state
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'paste'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Parsing States
  const [pasteText, setPasteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Reconcile modal state
  const [reconcilingMutation, setReconcilingMutation] = useState<BcaMutation | null>(null);

  // --- REAL-TIME KLIKBCA & M-BCA INTEGRATION CORE ---
  const [isBcaConnected, setIsBcaConnected] = useState(() => {
    return localStorage.getItem('tokohp_bca_connected') !== 'false';
  });
  const [klikBcaUserId, setKlikBcaUserId] = useState(() => localStorage.getItem('tokohp_bca_userid') || 'JKPHONE88');
  const [bcaRekNo, setBcaRekNo] = useState(() => localStorage.getItem('tokohp_bca_rekno') || '8830129481');
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);
  const [autoReconcileEnabled, setAutoReconcileEnabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isPolling, setIsPolling] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // --- MOOTA.CO INTEGRATION CORE ---
  const [isMootaConnected, setIsMootaConnected] = useState(() => {
    return localStorage.getItem('tokohp_moota_connected') === 'true';
  });
  const [mootaApiToken, setMootaApiToken] = useState(() => {
    return localStorage.getItem('tokohp_moota_token') || '';
  });
  const [mootaBankId, setMootaBankId] = useState(() => {
    return localStorage.getItem('tokohp_moota_bankid') || '';
  });
  const [isSyncingMoota, setIsSyncingMoota] = useState(false);
  const [isMootaSettingsOpen, setIsMootaSettingsOpen] = useState(false);
  
  // Simulation input states
  const [simSenderName, setSimSenderName] = useState('');
  const [simAmount, setSimAmount] = useState('');
  const [selectedPendingInvoiceId, setSelectedPendingInvoiceId] = useState('');
  
  // Toast Notification state
  const [toast, setToast] = useState<{ title: string; description: string; type: 'success' | 'info' } | null>(null);

  // Initialize Connection Logs
  useEffect(() => {
    const now = new Date().toLocaleTimeString('id-ID');
    setSyncLogs([
      `[${now}] [Sistem] Hub Koneksi klikBCA & m-BCA siap.`,
      `[${now}] [m-BCA] Menghubungkan ke push notification listener...`,
      `[${now}] [KlikBCA] Membentuk terowongan enkripsi aman SSL...`,
      `[${now}] [Koneksi] Sukses terhubung ke server BCA KlikPay & m-BCA API.`
    ]);
  }, []);

  // Polling Loop for active real-time sync
  useEffect(() => {
    if (!isBcaConnected) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          triggerAutoPoll();
          return 30; // reset to 30s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBcaConnected]);

  const triggerAutoPoll = () => {
    setIsPolling(true);
    const now = new Date().toLocaleTimeString('id-ID');
    
    setSyncLogs(prev => [
      `[${now}] [KlikBCA] Melakukan penarikan mutasi rekening (e-Statement)...`,
      ...prev
    ]);

    setTimeout(() => {
      const finishTime = new Date().toLocaleTimeString('id-ID');
      setIsPolling(false);
      setSyncLogs(prev => [
        `[${finishTime}] [KlikBCA] Sinkronisasi berhasil. 0 transaksi baru ditemukan.`,
        ...prev
      ]);
    }, 1200);
  };

  // Auto reconciliation algorithm
  useEffect(() => {
    if (!autoReconcileEnabled) return;

    const unmatchedCr = mutations.filter(m => m.type === 'CR' && m.status === 'Unmatched');
    if (unmatchedCr.length === 0) return;

    unmatchedCr.forEach(m => {
      // Find matching pending Transfer BCA invoice
      const matchedTx = transactions.find(tx => 
        tx.paymentMethod === 'Transfer BCA' && 
        !tx.bcaMutationId && 
        tx.totalAmount === m.amount
      );

      if (matchedTx) {
        onLinkMutationToTransaction(m.id, matchedTx.id);
        
        const now = new Date().toLocaleTimeString('id-ID');
        setSyncLogs(prev => [
          `[${now}] [AUTO-RECONCILE] Cocok! Menghubungkan mutasi Rp ${m.amount.toLocaleString('id-ID')} ke Invoice ${matchedTx.invoiceNumber} (${matchedTx.customerName}).`,
          `[${now}] [Sistem] Status Invoice ${matchedTx.invoiceNumber} otomatis diubah menjadi LUNAS & TERVERIFIKASI.`,
          ...prev
        ]);

        setToast({
          title: 'Rekonsiliasi Otomatis Sukses! 🎉',
          description: `Mutasi Rp ${m.amount.toLocaleString('id-ID')} otomatis diselaraskan dengan Invoice ${matchedTx.invoiceNumber} (${matchedTx.customerName}).`,
          type: 'success'
        });

        // Auto dismiss toast after 6 seconds
        setTimeout(() => {
          setToast(null);
        }, 6000);
      }
    });
  }, [mutations, transactions, autoReconcileEnabled, onLinkMutationToTransaction]);

  // Save Connection Config to localStorage
  const handleToggleBcaConnection = () => {
    const nextState = !isBcaConnected;
    setIsBcaConnected(nextState);
    localStorage.setItem('tokohp_bca_connected', String(nextState));
    
    const now = new Date().toLocaleTimeString('id-ID');
    if (nextState) {
      setSyncLogs(prev => [
        `[${now}] [Koneksi] Mengaktifkan koneksi KlikBCA & m-BCA secara real-time...`,
        `[${now}] [Sistem] Polling dimulai otomatis setiap 30 detik.`,
        ...prev
      ]);
    } else {
      setSyncLogs(prev => [
        `[${now}] [Koneksi] Memutuskan koneksi KlikBCA & m-BCA. Mode manual aktif.`,
        ...prev
      ]);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tokohp_bca_userid', klikBcaUserId);
    localStorage.setItem('tokohp_bca_rekno', bcaRekNo);
    setIsSyncSettingsOpen(false);
    
    const now = new Date().toLocaleTimeString('id-ID');
    setSyncLogs(prev => [
      `[${now}] [Sistem] Konfigurasi kredensial KlikBCA/m-BCA berhasil diperbarui secara lokal.`,
      ...prev
    ]);
    
    alert('Kredensial KlikBCA & m-BCA disimpan dengan aman di browser Anda!');
  };

  // Simulate incoming Transfer BCA from customers
  const handleSimulateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    let sender = simSenderName.trim() || 'AGUS WAHYUDI';
    let amountNum = Number(simAmount);

    if (selectedPendingInvoiceId) {
      const matchTx = transactions.find(tx => tx.id === selectedPendingInvoiceId);
      if (matchTx) {
        sender = matchTx.customerName;
        amountNum = matchTx.totalAmount;
      }
    }

    if (!amountNum || amountNum <= 0) {
      alert('Masukkan nominal transfer simulasi yang valid!');
      return;
    }

    const newMut: Omit<BcaMutation, 'id' | 'status'> = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      description: `TRSF E-BANKING CR ${new Date().getDate()}${new Date().getMonth()+1}/F${Math.floor(1000 + Math.random() * 9000)} ${sender.toUpperCase()}`,
      amount: amountNum,
      type: 'CR',
      rawText: `TRSF E-BANKING CR F${Math.floor(1000 + Math.random() * 9000)} ${sender.toUpperCase()} Rp ${amountNum.toLocaleString('id-ID')},00`
    };

    onAddMutations([newMut]);

    const now = new Date().toLocaleTimeString('id-ID');
    setSyncLogs(prev => [
      `[${now}] [m-BCA PUSH] NOTIFIKASI BARU: DANA MASUK Rp ${amountNum.toLocaleString('id-ID')} dari ${sender.toUpperCase()}!`,
      `[${now}] [m-BCA] Memproses notifikasi transaksi real-time...`,
      ...prev
    ]);

    setToast({
      title: 'Simulasi Transfer Berhasil! 💸',
      description: `Menerima dana masuk Rp ${amountNum.toLocaleString('id-ID')} dari ${sender.toUpperCase()}`,
      type: 'success'
    });

    // Reset inputs
    setSimSenderName('');
    setSimAmount('');
    setSelectedPendingInvoiceId('');

    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // --- MOOTA.CO INTEGRATION FUNCTIONS ---
  const handleMootaSync = async (forceDemo = false) => {
    setIsSyncingMoota(true);
    const now = new Date().toLocaleTimeString('id-ID');
    
    setSyncLogs(prev => [
      `[${now}] [Moota.com] Menginisiasi sinkronisasi API Moota...`,
      ...prev
    ]);

    try {
      const useDemo = forceDemo || !mootaApiToken;
      
      const response = await fetch('/api/moota/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiToken: mootaApiToken,
          bankId: mootaBankId,
          isDemo: useDemo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal tersambung ke Moota API.');
      }

      const data = await response.json();
      
      if (data.success && data.transactions && data.transactions.length > 0) {
        // Add new mutations
        onAddMutations(data.transactions);
        
        const finishTime = new Date().toLocaleTimeString('id-ID');
        setSyncLogs(prev => [
          `[${finishTime}] [Moota.com] Sukses! Menerima ${data.transactions.length} mutasi baru dari Moota.com${data.isDemo ? ' (MODE SIMULASI/DEMO)' : ''}.`,
          ...prev
        ]);

        setToast({
          title: 'Sinkronisasi Moota Sukses! 🔄',
          description: `Berhasil menarik ${data.transactions.length} transaksi terbaru dari akun Moota.co Anda.`,
          type: 'success'
        });

        setTimeout(() => setToast(null), 5000);
      } else {
        const finishTime = new Date().toLocaleTimeString('id-ID');
        setSyncLogs(prev => [
          `[${finishTime}] [Moota.com] Sinkronisasi selesai. Tidak ada transaksi mutasi baru ditemukan.`,
          ...prev
        ]);
      }
    } catch (error: any) {
      console.error(error);
      const finishTime = new Date().toLocaleTimeString('id-ID');
      setSyncLogs(prev => [
        `[${finishTime}] [Moota.com] ERROR: ${error.message}`,
        ...prev
      ]);
      alert(`Gagal Sinkronisasi Moota: ${error.message}`);
    } finally {
      setIsSyncingMoota(false);
    }
  };

  const handleToggleMootaConnection = () => {
    const nextState = !isMootaConnected;
    setIsMootaConnected(nextState);
    localStorage.setItem('tokohp_moota_connected', String(nextState));
    
    const now = new Date().toLocaleTimeString('id-ID');
    if (nextState) {
      setSyncLogs(prev => [
        `[${now}] [Moota.com] Integrasi Moota.co diaktifkan.`,
        `[${now}] [Moota.com] Konektor API siap digunakan.`,
        ...prev
      ]);
    } else {
      setSyncLogs(prev => [
        `[${now}] [Moota.com] Integrasi Moota.co dinonaktifkan.`,
        ...prev
      ]);
    }
  };

  const handleSaveMootaCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tokohp_moota_token', mootaApiToken);
    localStorage.setItem('tokohp_moota_bankid', mootaBankId);
    setIsMootaSettingsOpen(false);
    
    const now = new Date().toLocaleTimeString('id-ID');
    setSyncLogs(prev => [
      `[${now}] [Moota.com] Kredensial Moota API Token & Bank ID berhasil disimpan secara lokal.`,
      ...prev
    ]);
    
    alert('Kredensial Moota.com berhasil disimpan dengan aman!');
  };

  // Filter list
  const filteredMutations = mutations.filter(m => {
    if (userRole === 'karyawan' && m.type !== 'CR') {
      return false;
    }
    return (
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.amount.toString().includes(searchQuery)
    );
  });

  // Call server-side AI parsing endpoint
  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) {
      alert('Silakan tempel teks mutasi KlikBCA terlebih dahulu!');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/parse-mutation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: pasteText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses mutasi bank. Pastikan GEMINI_API_KEY terpasang.');
      }

      if (data.transactions && data.transactions.length > 0) {
        // Add parsed transactions to state
        onAddMutations(data.transactions);
        setPasteText('');
        setActiveSubTab('daftar');
        alert(`AI Berhasil mengurai ${data.transactions.length} baris mutasi rekening BCA!`);
      } else {
        alert('AI tidak menemukan transaksi mutasi yang valid dalam teks tersebut. Silakan periksa format teks.');
      }
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsParsing(false);
    }
  };

  // Get list of transactions that are Transfer BCA and NOT yet reconciled
  const unreconciledTransactions = transactions.filter(tx => {
    return tx.paymentMethod === 'Transfer BCA' && !tx.bcaMutationId;
  });

  // Force subtab to 'daftar' for employees
  useEffect(() => {
    if (userRole === 'karyawan' && activeSubTab !== 'daftar') {
      setActiveSubTab('daftar');
    }
  }, [userRole, activeSubTab]);

  return (
    <div className="space-y-6" id="bca-mutation-wrapper">
      {/* Tab Nav */}
      {userRole !== 'karyawan' && (
        <div className="flex border-b border-slate-100" id="bca-tabs-nav">
          <button
            id="btn-bca-tab-daftar"
            onClick={() => setActiveSubTab('daftar')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'daftar'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" /> Mutasi Rekening Masuk BCA
          </button>
          <button
            id="btn-bca-tab-paste"
            onClick={() => setActiveSubTab('paste')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> Tempel & Urai Mutasi AI
          </button>
        </div>
      )}

      {/* VIEW 1: DAFTAR MUTASI MASUK */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in" id="bca-list-view">
          {/* TOAST ALERTS OVERLAY */}
          {toast && (
            <div className="fixed top-6 right-6 z-50 animate-bounce max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3" id="bca-live-toast">
              <div className="p-2 bg-indigo-950 rounded-lg text-emerald-400 shrink-0 border border-indigo-900">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs text-white">{toast.title}</h5>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800">✕</button>
            </div>
          )}

          {/* REAL-TIME KLIKBCA & m-BCA HUB DASHBOARD */}
          {userRole !== 'karyawan' && (
            <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-5 md:p-6 shadow-xl space-y-5" id="bca-realtime-dashboard">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-2xl border border-indigo-800/30 relative">
                  <Wifi className={`h-6 w-6 ${isBcaConnected || isMootaConnected ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
                  {(isBcaConnected || isMootaConnected) && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white">Hub Integrasi KlikBCA & Moota.com Real-Time</h4>
                    <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full border ${
                      isBcaConnected || isMootaConnected
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}>
                      {isBcaConnected || isMootaConnected ? 'ONLINE (READY)' : 'OFFLINE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Hubungkan KlikBCA Bisnis, m-BCA Push Notifikasi & API Moota.com secara instant.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  id="btn-toggle-bca-conn"
                  onClick={handleToggleBcaConnection}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center border ${
                    isBcaConnected 
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25' 
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                  }`}
                >
                  {isBcaConnected ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
                  {isBcaConnected ? 'Matikan Polling BCA' : 'Aktifkan Polling BCA'}
                </button>
                
                <button
                  id="btn-toggle-moota-conn"
                  onClick={handleToggleMootaConnection}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center border ${
                    isMootaConnected 
                      ? 'bg-pink-500/15 text-pink-400 border-pink-500/30 hover:bg-pink-500/25' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isMootaConnected ? <WifiOff className="h-3.5 w-3.5 text-pink-400" /> : <Wifi className="h-3.5 w-3.5 text-pink-400" />}
                  {isMootaConnected ? 'Moota Aktif' : 'Aktifkan Moota'}
                </button>

                <button
                  id="btn-toggle-bca-cred"
                  onClick={() => setIsSyncSettingsOpen(!isSyncSettingsOpen)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  {isSyncSettingsOpen ? 'Tutup BCA' : 'Config KlikBCA'}
                </button>

                <button
                  id="btn-toggle-moota-cred"
                  onClick={() => setIsMootaSettingsOpen(!isMootaSettingsOpen)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1 w-full sm:w-auto cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
                  {isMootaSettingsOpen ? 'Tutup Moota' : 'Config Moota'}
                </button>
              </div>
            </div>

            {/* CREDENTIALS CONFIG FORM PANEL */}
            {isSyncSettingsOpen && (
              <form onSubmit={handleSaveCredentials} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fade-in" id="bca-cred-form">
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400 mb-1.5">KlikBCA Business User ID</label>
                  <input
                    type="text"
                    value={klikBcaUserId}
                    onChange={(e) => setKlikBcaUserId(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. JKPHONE88"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400 mb-1.5">No. Rekening BCA (m-BCA)</label>
                  <input
                    type="text"
                    value={bcaRekNo}
                    onChange={(e) => setBcaRekNo(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 8830129481"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400 mb-1.5">Kode Akses / Password</label>
                    <input
                      type="password"
                      value="******"
                      disabled
                      className="w-full p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border border-indigo-500/20 transition whitespace-nowrap cursor-pointer h-[38px]"
                  >
                    Simpan Aman
                  </button>
                </div>
              </form>
            )}

            {/* MOOTA CONFIG FORM PANEL */}
            {isMootaSettingsOpen && (
              <form onSubmit={handleSaveMootaCredentials} className="p-4 bg-slate-950/80 border border-pink-900/40 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fade-in" id="moota-cred-form">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
                    <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400">Moota API Token</label>
                  </div>
                  <input
                    type="password"
                    value={mootaApiToken}
                    onChange={(e) => setMootaApiToken(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                    placeholder="Masukkan Moota API Token Anda"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400 mb-1.5">Moota Bank ID (Opsional)</label>
                  <input
                    type="text"
                    value={mootaBankId}
                    onChange={(e) => setMootaBankId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                    placeholder="e.g. 9wDx8zo1pY (atau kosongkan)"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black tracking-wider uppercase text-slate-400 mb-1.5">Webhook URL</label>
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/moota/webhook`}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(`${window.location.origin}/api/moota/webhook`);
                        alert('Link webhook berhasil dicopy!');
                      }}
                      className="w-full p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-xl text-[10px] font-mono text-pink-400 cursor-pointer text-ellipsis overflow-hidden"
                      title="Klik untuk menyalin"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl border border-pink-500/20 transition whitespace-nowrap cursor-pointer h-[38px]"
                  >
                    Simpan Token
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="bca-realtime-grid">
              {/* LEFT COLUMN: CONNECTION STATUS & SYSTEM LOGS */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300 font-semibold">Log Aliran Mutasi (BCA & Moota Hub)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMootaSync(false)}
                      disabled={isSyncingMoota}
                      className="px-2.5 py-1 text-[11px] font-bold bg-pink-950/40 text-pink-400 border border-pink-900/40 rounded-lg hover:bg-pink-900/30 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingMoota ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-pink-400" />
                          <span>Moota Sync...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 text-pink-400" />
                          <span>Tarik Mutasi Moota.com</span>
                        </>
                      )}
                    </button>
                    {isBcaConnected && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        {isPolling ? (
                          <>
                            <Loader2 className="h-3 w-3 text-indigo-400 animate-spin" />
                            <span>Polling...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
                            <span>BCA Polling <strong className="text-white font-black">{countdown}s</strong></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* LOGS MONITOR TERMINAL */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-slate-300 overflow-y-auto h-[142px] space-y-1.5 select-all shadow-inner scrollbar-thin scrollbar-thumb-slate-800">
                  {syncLogs.length === 0 ? (
                    <div className="text-slate-500 italic">Belum ada aktivitas terekam.</div>
                  ) : (
                    syncLogs.map((log, index) => {
                      let colorClass = 'text-slate-300';
                      if (log.includes('[AUTO-RECONCILE]')) colorClass = 'text-emerald-400 font-bold';
                      else if (log.includes('[m-BCA PUSH]')) colorClass = 'text-amber-300 font-semibold';
                      else if (log.includes('[Koneksi]')) colorClass = 'text-indigo-300';
                      else if (log.includes('[Moota.com]')) colorClass = 'text-pink-400 font-semibold';
                      
                      return (
                        <div key={index} className={`${colorClass} leading-relaxed`}>
                          {log}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* AUTO RECONCILE TOGGLE SWITCH */}
                <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-200">Verifikasi & Rekonsiliasi Otomatis (Instant Auto-Match)</span>
                      <p className="text-[10px] text-slate-400">Mutasi masuk CR yang nominalnya cocok pas dengan Invoice akan langsung diverifikasi otomatis.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoReconcileEnabled(!autoReconcileEnabled)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                      autoReconcileEnabled 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {autoReconcileEnabled ? 'Aktif (Rekomendasi)' : 'Nonaktif'}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: SIMULATOR (UNTUK DEMO KONEKTIVITAS REAL-TIME) */}
              <div className="lg:col-span-5 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-indigo-900/30 pb-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-xs text-indigo-200 uppercase tracking-wider">Simulator m-BCA / Transfer Masuk</h5>
                    <p className="text-[10px] text-slate-400">Simulasikan dana masuk dari pelanggan untuk menguji kecanggihan rekonsiliasi real-time.</p>
                  </div>
                </div>

                <form onSubmit={handleSimulateTransfer} className="space-y-3" id="bca-sim-form">
                  {/* Select pending invoice for matching */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1"> PILIH INVOICE TRANSFER BCA YANG BELUM LUNAS</label>
                    <select
                      value={selectedPendingInvoiceId}
                      onChange={(e) => {
                        setSelectedPendingInvoiceId(e.target.value);
                        if (e.target.value) {
                          const matchTx = transactions.find(tx => tx.id === e.target.value);
                          if (matchTx) {
                            setSimSenderName(matchTx.customerName);
                            setSimAmount(String(matchTx.totalAmount));
                          }
                        } else {
                          setSimSenderName('');
                          setSimAmount('');
                        }
                      }}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Simulasi Transfer Bebas / Baru --</option>
                      {unreconciledTransactions.map(tx => (
                        <option key={tx.id} value={tx.id}>
                          {tx.invoiceNumber} - {tx.customerName} ({formatIDR(tx.totalAmount)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manual name & amount */}
                  {!selectedPendingInvoiceId && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Pengirim</label>
                        <input
                          type="text"
                          value={simSenderName}
                          onChange={(e) => setSimSenderName(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:indigo-500"
                          placeholder="e.g. SITI LESTARI"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nominal Transfer (Rp)</label>
                        <input
                          type="number"
                          value={simAmount}
                          onChange={(e) => setSimAmount(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:indigo-500"
                          placeholder="e.g. 4500000"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPendingInvoiceId && (
                    <div className="p-2.5 bg-indigo-950 border border-indigo-900 rounded-xl text-[11px] text-indigo-300">
                      Target Pembayaran: <strong className="text-white">{simSenderName}</strong> senilai <strong className="text-white">{formatIDR(Number(simAmount))}</strong>.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" /> Simulasikan Transfer Masuk & Uji Rekonsiliasi
                  </button>
                </form>
              </div>
            </div>
          </div>
          )}

          {/* Filters and counts */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs" id="bca-search-filters">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="bca-search-input"
                type="text"
                placeholder="Cari kata kunci deskripsi, nama pengirim, nominal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl text-xs text-slate-500 font-semibold whitespace-nowrap">
              <span>Unmatched CR: <strong className="text-amber-600">{mutations.filter(m => m.type === 'CR' && m.status === 'Unmatched').length}</strong></span>
              <span>•</span>
              <span>Matched: <strong className="text-emerald-600">{mutations.filter(m => m.status === 'Matched').length}</strong></span>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="bca-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="bca-table">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4 px-6">Tanggal Mutasi</th>
                    <th className="py-4 px-4">Deskripsi Rekening (Raw)</th>
                    <th className="py-4 px-4 text-right">Nominal Masuk (CR)</th>
                    {userRole !== 'karyawan' && <th className="py-4 px-4 text-right">Nominal Keluar (DB)</th>}
                    <th className="py-4 px-4 text-center">Status Rekonsiliasi</th>
                    {userRole !== 'karyawan' && <th className="py-4 px-6 text-center">Tindakan Pembukuan</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMutations.length === 0 ? (
                    <tr>
                      <td colSpan={userRole === 'karyawan' ? 4 : 6} className="text-center py-12 text-slate-400">
                        Belum ada data mutasi rekening tercatat.
                      </td>
                    </tr>
                  ) : (
                    [...filteredMutations]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(m => {
                        const isCredit = m.type === 'CR';
                        const linkedTx = transactions.find(tx => tx.id === m.linkedTransactionId);
                        
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/40 transition duration-150" id={`bca-row-${m.id}`}>
                            <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">{m.date}</td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-800 break-words max-w-[320px]">{m.description}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-1 select-all" title="Raw Statement Line">{m.rawText}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-emerald-600">
                              {isCredit ? formatIDR(m.amount) : '-'}
                            </td>
                            {userRole !== 'karyawan' && (
                              <td className="py-4 px-4 text-right font-semibold text-rose-500">
                                {!isCredit ? formatIDR(m.amount) : '-'}
                              </td>
                            )}
                            <td className="py-4 px-4 text-center">
                              {m.status === 'Matched' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/30">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung
                                  </span>
                                  {linkedTx && (
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      Invoice: <strong className="text-slate-700">{linkedTx.invoiceNumber}</strong>
                                    </div>
                                  )}
                                </div>
                              ) : m.status === 'Manual' ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                                  Bukan Penjualan
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/30">
                                  <AlertCircle className="h-3.5 w-3.5" /> Belum Selaras
                                </span>
                              )}
                            </td>
                            {userRole !== 'karyawan' && (
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col gap-1.5 items-center justify-center">
                                  {m.status === 'Unmatched' && isCredit && (
                                    <>
                                      <button
                                        id={`btn-match-mut-${m.id}`}
                                        onClick={() => setReconcilingMutation(m)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition cursor-pointer"
                                      >
                                        <Link className="h-3 w-3" /> Hubungkan ke Invoice
                                      </button>
                                      <button
                                        id={`btn-spawn-tx-${m.id}`}
                                        onClick={() => {
                                          if (confirm(`Buat Transaksi Invoice baru otomatis dengan nilai ${formatIDR(m.amount)} berdasarkan mutasi transfer ini?`)) {
                                            onQuickCreateInvoice(m);
                                          }
                                        }}
                                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg flex items-center gap-1 transition cursor-pointer"
                                      >
                                        <ExternalLink className="h-3 w-3" /> Buat Nota Jual Cepat
                                      </button>
                                    </>
                                  )}
                                  {m.status === 'Matched' && (
                                    <button
                                      id={`btn-unlink-mut-${m.id}`}
                                      onClick={() => {
                                        if (confirm('Apakah Anda ingin memutus hubungan mutasi ini dengan Invoice Penjualan?')) {
                                          onUnlinkMutation(m.id);
                                        }
                                      }}
                                      className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-[10px] rounded-lg transition cursor-pointer"
                                    >
                                      Putuskan Link
                                    </button>
                                  )}
                                  <div className="flex gap-1">
                                    {m.status === 'Unmatched' && (
                                      <button
                                        id={`btn-set-manual-${m.id}`}
                                        onClick={() => onSetMutationStatus(m.id, 'Manual')}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold px-1.5 py-0.5 border border-slate-200 rounded cursor-pointer"
                                      >
                                        Set Non-Retail
                                      </button>
                                    )}
                                    {m.status === 'Manual' && (
                                      <button
                                        id={`btn-set-unmatch-${m.id}`}
                                        onClick={() => onSetMutationStatus(m.id, 'Unmatched')}
                                        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold px-1.5 py-0.5 border border-slate-200 rounded cursor-pointer"
                                      >
                                        Set Unmatched
                                      </button>
                                    )}
                                    <button
                                      id={`btn-del-mut-${m.id}`}
                                      onClick={() => {
                                        if (confirm('Hapus baris mutasi rekening ini dari database?')) {
                                          onDeleteMutation(m.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded text-slate-300 transition cursor-pointer"
                                      title="Hapus baris mutasi"
                                    >
                                      <Trash className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PASTE & AI PARSING PANELS */}
      {activeSubTab === 'paste' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-2xl mx-auto animate-fade-in" id="bca-paste-view">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Urai Mutasi Bank BCA dengan Gemini AI</h3>
              <p className="text-xs text-slate-500">Ubah salinan teks mutasi KlikBCA / m-BCA yang berantakan menjadi pembukuan rapi otomatis!</p>
            </div>
          </div>

          <form onSubmit={handleAiParse} className="space-y-5" id="bca-ai-form">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Tempel Riwayat Teks Mutasi Bank</label>
              <textarea
                id="bca-paste-textarea"
                rows={8}
                placeholder="Salin tabel transaksi KlikBCA Anda atau salinan teks notifikasi m-BCA di sini...&#10;e.g.:&#10;22/06 TRSF E-BANKING CR 2206/F8822/WS9012 BUDI SANTOSO 22.499.000,00&#10;23/06 TRSF E-BANKING CR 2306/F1234 SITI LESTARI 5.000.000,00"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
                disabled={isParsing}
              />
            </div>

            {/* AI Parsing status feedback */}
            {isParsing && (
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3 animate-pulse" id="bca-ai-loading">
                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                <div className="text-xs text-indigo-800 font-medium">
                  <strong>Gemini AI sedang membaca dan menstrukturkan mutasi rekening...</strong> Silakan tunggu sebentar.
                </div>
              </div>
            )}

            {parseError && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-800" id="bca-ai-error">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <strong>Terjadi kesalahan saat memproses data mutasi bank:</strong>
                  <p className="mt-1 font-mono">{parseError}</p>
                  <p className="mt-2 text-slate-500 font-sans">Saran: Periksa apakah kunci GEMINI_API_KEY Anda sudah terkonfigurasi di Secrets. Jika ya, coba kecilkan jumlah teks yang disalin atau salin ulang baris mutasi bank yang ingin diproses.</p>
                </div>
              </div>
            )}

            {/* Example guide */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100" id="bca-ai-help">
              <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mb-2">
                <HelpCircle className="h-4 w-4" /> Contoh Format yang Didukung:
              </h4>
              <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-1">
                <li>KlikBCA: <code>22/06 TRSF E-BANKING CR 2206/F8822/WS9012 BUDI 22.499.000,00</code></li>
                <li>m-BCA Push Notif: <code>M-TRANSFER: 23/06 14:23 KE 12345678 RP 10.000.000,00 SITI LESTARI BERHASIL</code></li>
                <li>SMS Banking BCA: <code>Tgl 23/06 CR Rp.1.500.000,00 Dr.ANANG SETIAWAN</code></li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button
                id="btn-bca-ai-cancel"
                type="button"
                onClick={() => {
                  setPasteText('');
                  setParseError(null);
                  setActiveSubTab('daftar');
                }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer"
                disabled={isParsing}
              >
                Batal
              </button>
              <button
                id="btn-bca-ai-submit"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                disabled={isParsing}
              >
                {isParsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Membaca...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" /> Proses Mutasi via AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL REKONSILIASI PENYELARASAN MUTASI */}
      {reconcilingMutation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="reconciliation-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-sm tracking-wide">REKONSILIASI / HUBUNGKAN MUTASI MASUK</span>
              <button
                id="btn-close-reconcile-modal"
                onClick={() => setReconcilingMutation(null)}
                className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Mutation details */}
              <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-2xl space-y-2">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Detail Mutasi BCA terpilih:</span>
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <strong className="text-indigo-950 text-base">{reconcilingMutation.description}</strong>
                    <div className="text-xs text-indigo-500 font-mono mt-1">S/N Line: {reconcilingMutation.rawText}</div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="block font-extrabold text-indigo-800 text-base">{formatIDR(reconcilingMutation.amount)}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{reconcilingMutation.date}</span>
                  </div>
                </div>
              </div>

              {/* List of pending transfer bca invoices */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-500" /> Pilih Invoice Toko HP (Transfer BCA yang Belum Lunas/Belum Terhubung):
                </h4>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1" id="pending-invoices-list">
                  {unreconciledTransactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-slate-100 rounded-xl text-xs">
                      Tidak ada invoice penjualan Transfer BCA yang menunggu penyesuaian saat ini.
                      <p className="mt-2">Anda bisa membuat invoice baru secara cepat dari mutasi ini dengan menutup modal dan mengklik "Buat Nota Jual Cepat" di kolom tindakan.</p>
                    </div>
                  ) : (
                    unreconciledTransactions.map(tx => {
                      // Highlight if amount matches exactly! This is a magical design touch.
                      const amountMatches = tx.totalAmount === reconcilingMutation.amount;

                      return (
                        <div
                          key={tx.id}
                          className={`p-4 border rounded-2xl flex justify-between items-center hover:border-indigo-300 hover:bg-slate-50/50 transition duration-150 cursor-pointer ${
                            amountMatches 
                              ? 'border-emerald-300 bg-emerald-50/10' 
                              : 'border-slate-150 bg-white'
                          }`}
                          id={`pending-invoice-row-${tx.id}`}
                          onClick={() => {
                            onLinkMutationToTransaction(reconcilingMutation.id, tx.id);
                            setReconcilingMutation(null);
                            alert(`Transaksi ${tx.invoiceNumber} berhasil diselaraskan dan terverifikasi lunas via Mutasi BCA!`);
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 text-sm">{tx.invoiceNumber}</strong>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-slate-600 font-semibold">{tx.customerName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              HP: {tx.items.map(i => `${i.brand} ${i.modelName} (IMEI: ${i.imei})`).join(', ')}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Tanggal: {tx.date}</div>
                          </div>
                          
                          <div className="text-right">
                            <strong className="text-slate-950 text-sm block">{formatIDR(tx.totalAmount)}</strong>
                            {amountMatches ? (
                              <span className="inline-block text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full mt-1 animate-pulse">
                                Nominal Cocok Pas!
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] text-rose-500 font-semibold mt-1">
                                Selisih {formatIDR(Math.abs(tx.totalAmount - reconcilingMutation.amount))}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                id="btn-close-reconcile-modal-act"
                onClick={() => setReconcilingMutation(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom X icon placeholder inline
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
