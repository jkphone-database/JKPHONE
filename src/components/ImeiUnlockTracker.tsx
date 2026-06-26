import React, { useState } from 'react';
import { ImeiUnlockRequest } from '../types';
import { Plus, Search, CheckCircle2, AlertCircle, Trash2, Smartphone, ShieldAlert, Sparkles, ClipboardList, Clock, Check, X, Camera } from 'lucide-react';
import ImeiScannerModal from './ImeiScannerModal';

interface ImeiUnlockTrackerProps {
  unlockRequests: ImeiUnlockRequest[];
  onAddUnlockRequest: (request: Omit<ImeiUnlockRequest, 'id'>) => void;
  onUpdateUnlockStatus: (id: string, status: ImeiUnlockRequest['status'], notes?: string) => void;
  onDeleteUnlockRequest: (id: string) => void;
}

export default function ImeiUnlockTracker({
  unlockRequests,
  onAddUnlockRequest,
  onUpdateUnlockStatus,
  onDeleteUnlockRequest
}: ImeiUnlockTrackerProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local tab/states
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'buat'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [imei, setImei] = useState('');
  const [cost, setCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Editing status note
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatusNotes, setNewStatusNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim() || !custPhone.trim() || !deviceModel.trim() || !imei.trim() || cost <= 0) {
      alert('Mohon lengkapi semua data formulir registrasi unlock!');
      return;
    }

    if (imei.trim().length < 14 || imei.trim().length > 16) {
      alert('IMEI HP biasanya terdiri dari 15 digit angka. Pastikan IMEI benar!');
      if (!confirm('Lanjutkan simpan IMEI ini?')) {
        return;
      }
    }

    onAddUnlockRequest({
      date: formDate,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      deviceModel: deviceModel.trim(),
      imei: imei.trim(),
      cost: Number(cost),
      status: 'Pending',
      notes: notes.trim() || undefined
    });

    // Reset
    setCustName('');
    setCustPhone('');
    setDeviceModel('');
    setImei('');
    setCost(0);
    setNotes('');
    
    setActiveSubTab('daftar');
    alert('Permohonan registrasi Unlock IMEI berhasil dicatat!');
  };

  const handleQuickStatusUpdate = (id: string, status: ImeiUnlockRequest['status']) => {
    onUpdateUnlockStatus(id, status);
    alert(`Status pendaftaran Unlock IMEI berhasil diubah ke ${status}!`);
  };

  const handleUpdateNotesSubmit = (id: string, status: ImeiUnlockRequest['status']) => {
    onUpdateUnlockStatus(id, status, newStatusNotes.trim());
    setUpdatingId(null);
    setNewStatusNotes('');
    alert(`Status pendaftaran & catatan berhasil diperbarui!`);
  };

  // Filter requests
  const filteredRequests = unlockRequests.filter(req => {
    return (
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.imei.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6" id="imei-unlock-tracker-wrapper">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 font-sans">
        <button
          onClick={() => setActiveSubTab('daftar')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'daftar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5" /> Antrean Unlock IMEI
        </button>
        <button
          onClick={() => setActiveSubTab('buat')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'buat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="h-4.5 w-4.5" /> Daftar Registrasi Baru
        </button>
      </div>

      {/* VIEW 1: DAFTAR REGISTRASI UNLOCK */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pelanggan, model HP, atau IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Unlock Requests Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6 font-semibold">Tanggal Daftar</th>
                    <th className="py-3.5 px-4 font-semibold">Pelanggan</th>
                    <th className="py-3.5 px-4 font-semibold">Model HP & IMEI</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Biaya / Tarah Jasa</th>
                    <th className="py-3.5 px-4 font-semibold">Status Sinyal</th>
                    <th className="py-3.5 px-4 font-semibold">Keterangan / Notes</th>
                    <th className="py-3.5 px-6 text-center font-semibold">Tindakan / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">Belum ada registrasi Unlock IMEI yang terdaftar.</td>
                    </tr>
                  ) : (
                    [...filteredRequests]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(req => {
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/40">
                            <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{req.date}</td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{req.customerName}</div>
                              <div className="text-xs text-slate-400 font-mono">{req.customerPhone}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-700">{req.deviceModel}</div>
                              <div className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100/40 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                IMEI: {req.imei}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-slate-900">{formatIDR(req.cost)}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                req.status === 'Sukses' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                  : req.status === 'Gagal'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                    : req.status === 'Proses'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200/50'
                              }`}>
                                {req.status === 'Sukses' && <Check className="h-3 w-3" />}
                                {req.status === 'Gagal' && <X className="h-3 w-3" />}
                                {req.status === 'Proses' && <Clock className="h-3 w-3 animate-spin" />}
                                {req.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              {updatingId === req.id ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={newStatusNotes}
                                    onChange={(e) => setNewStatusNotes(e.target.value)}
                                    placeholder="Tulis catatan update..."
                                    className="p-1 text-xs border border-slate-300 rounded w-full"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleUpdateNotesSubmit(req.id, req.status)}
                                      className="px-2 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      onClick={() => setUpdatingId(null)}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[10px] rounded border"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="max-w-[200px] text-xs leading-relaxed">
                                  {req.notes || <span className="text-slate-400 italic">Tidak ada catatan</span>}
                                  <button
                                    onClick={() => {
                                      setUpdatingId(req.id);
                                      setNewStatusNotes(req.notes || '');
                                    }}
                                    className="text-[10px] text-indigo-500 hover:underline block font-semibold mt-1"
                                  >
                                    Edit Catatan
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col gap-1 items-center">
                                <div className="flex gap-1">
                                  {req.status === 'Pending' && (
                                    <button
                                      onClick={() => handleQuickStatusUpdate(req.id, 'Proses')}
                                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-1 rounded transition border border-indigo-200/50"
                                    >
                                      Proses
                                    </button>
                                  )}
                                  {(req.status === 'Pending' || req.status === 'Proses') && (
                                    <>
                                      <button
                                        onClick={() => handleQuickStatusUpdate(req.id, 'Sukses')}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-1 rounded transition border border-emerald-200/50"
                                      >
                                        Sukses
                                      </button>
                                      <button
                                        onClick={() => handleQuickStatusUpdate(req.id, 'Gagal')}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-1 rounded transition border border-rose-200/50"
                                      >
                                        Gagal
                                      </button>
                                    </>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm('Hapus pendaftaran unlock IMEI ini dari sistem?')) {
                                      onDeleteUnlockRequest(req.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                                  title="Hapus Registrasi"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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

      {/* VIEW 2: FORM PENDAFTARAN BARU */}
      {activeSubTab === 'buat' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-lg mx-auto animate-fade-in">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Registrasi IMEI Unlock (Sinyal HP)</h3>
              <p className="text-xs text-slate-500">Mendaftarkan IMEI HP Internasional ke KPP / Beacukai agar sinyal operator Indonesia aktif</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">TANGGAL DAFTAR</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">NAMA PELANGGAN</label>
                <input
                  type="text"
                  placeholder="e.g. Rian Hidayat"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">NO HP PELANGGAN</label>
                <input
                  type="text"
                  placeholder="e.g. 0819xxxxxxxx"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">MODEL & WARNA HP</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Max Blue"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500">NOMOR IMEI HP (15 DIGIT)</label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="text-xs text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" /> Scan via Kamera
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 358901234567891"
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono"
                  maxLength={15}
                  required
                />

                <ImeiScannerModal
                  isOpen={isScannerOpen}
                  onClose={() => setIsScannerOpen(false)}
                  mode="single"
                  onScanSuccess={(val) => setImei(val.replace(/[^0-9]/g, '').substring(0, 15))}
                  title="Scan IMEI HP Unlock"
                  placeholder="Scan barcode IMEI pada boks HP atau punggung HP untuk registrasi unlock sinyal."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">BIAYA JASA REGISTRASI (Rp)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500000"
                value={cost || ''}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">CATATAN TAMBAHAN (OPTIONAL)</label>
              <textarea
                placeholder="e.g. Paket unlock garansi 1 tahun aman blokir"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setActiveSubTab('daftar')}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Simpan Registrasi
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
