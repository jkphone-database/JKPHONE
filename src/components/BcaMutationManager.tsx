import React, { useState } from 'react';
import { BcaMutation, Transaction } from '../types';
import { Sparkles, ArrowRightLeft, Search, HelpCircle, CheckCircle2, AlertCircle, Trash, Link, ExternalLink, Calendar, Loader2 } from 'lucide-react';

interface BcaMutationManagerProps {
  mutations: BcaMutation[];
  transactions: Transaction[];
  onAddMutations: (newMutations: Omit<BcaMutation, 'id' | 'status'>[]) => void;
  onLinkMutationToTransaction: (mutationId: string, transactionId: string) => void;
  onUnlinkMutation: (mutationId: string) => void;
  onDeleteMutation: (id: string) => void;
  onSetMutationStatus: (id: string, status: 'Unmatched' | 'Matched' | 'Manual') => void;
  onQuickCreateInvoice: (mutation: BcaMutation) => void; // Shortcut to spawn a sale
}

export default function BcaMutationManager({
  mutations,
  transactions,
  onAddMutations,
  onLinkMutationToTransaction,
  onUnlinkMutation,
  onDeleteMutation,
  onSetMutationStatus,
  onQuickCreateInvoice
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

  // Filter list
  const filteredMutations = mutations.filter(m => {
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

  return (
    <div className="space-y-6" id="bca-mutation-wrapper">
      {/* Tab Nav */}
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

      {/* VIEW 1: DAFTAR MUTASI MASUK */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in" id="bca-list-view">
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
                    <th className="py-4 px-4 text-right">Nominal Keluar (DB)</th>
                    <th className="py-4 px-4 text-center">Status Rekonsiliasi</th>
                    <th className="py-4 px-6 text-center">Tindakan Pembukuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMutations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Belum ada data mutasi rekening tercatat. Silakan tempel mutasi BCA menggunakan tab AI di atas!
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
                            <td className="py-4 px-4 text-right font-semibold text-rose-500">
                              {!isCredit ? formatIDR(m.amount) : '-'}
                            </td>
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
