import React, { useState } from 'react';
import { ServiceNote, SparepartProduct, AccessorySparepartSale } from '../types';
import { Plus, Search, Trash2, Printer, Smartphone, Send, Clock, CheckCircle2, AlertCircle, RefreshCw, ClipboardList, Shield, X, Camera, Edit } from 'lucide-react';
import ImeiScannerModal from './ImeiScannerModal';

interface ServiceNotesManagerProps {
  serviceNotes: ServiceNote[];
  onAddServiceNote: (note: Omit<ServiceNote, 'id' | 'serviceNumber'>) => void;
  onUpdateServiceStatus: (id: string, status: ServiceNote['status'], actualCost?: number, techNotes?: string) => void;
  onDeleteServiceNote: (id: string) => void;
  spareparts: SparepartProduct[];
  accSales: AccessorySparepartSale[];
  onAddSparepart: (item: Omit<SparepartProduct, 'id'>) => void;
  onEditSparepart: (item: SparepartProduct) => void;
  onDeleteSparepart: (id: string) => void;
}

export default function ServiceNotesManager({
  serviceNotes,
  onAddServiceNote,
  onUpdateServiceStatus,
  onDeleteServiceNote,
  spareparts,
  accSales,
  onAddSparepart,
  onEditSparepart,
  onDeleteSparepart
}: ServiceNotesManagerProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local state
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'buat' | 'stok-sp'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [damage, setDamage] = useState('');
  const [estCost, setEstCost] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [estCompletion, setEstCompletion] = useState('');

  // Status updating states
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceNote['status']>('Proses');
  const [actualCostInput, setActualCostInput] = useState(0);
  const [techNotesInput, setTechNotesInput] = useState('');

  // Ticket Preview
  const [selectedService, setSelectedService] = useState<ServiceNote | null>(null);

  // Spareparts local form and search state
  const [searchSp, setSearchSp] = useState('');
  const [showSpForm, setShowSpForm] = useState(false);
  const [editingSp, setEditingSp] = useState<SparepartProduct | null>(null);
  const [spPartNumber, setSpPartNumber] = useState('');
  const [spName, setSpName] = useState('');
  const [spCategory, setSpCategory] = useState('LCD');
  const [spPurchase, setSpPurchase] = useState(0);
  const [spSelling, setSpSelling] = useState(0);
  const [spStock, setSpStock] = useState(0);
  const [spMinAlert, setSpMinAlert] = useState(2);

  const spCategories = ['LCD', 'Baterai', 'Kamera', 'Backdoor', 'Flex Cable', 'IC', 'Konektor Charger', 'Solder / Timah', 'Lainnya'];

  const handleSpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spName.trim() || spPurchase <= 0 || spSelling <= 0) {
      alert('Mohon lengkapi data sparepart dengan benar!');
      return;
    }

    const finalPartNo = spPartNumber.trim() || `SP-${spCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingSp) {
      onEditSparepart({
        id: editingSp.id,
        partNumber: finalPartNo,
        name: spName.trim(),
        category: spCategory,
        purchasePrice: Number(spPurchase),
        sellingPrice: Number(spSelling),
        stock: Number(spStock),
        minStockAlert: Number(spMinAlert)
      });
      alert('Data sparepart berhasil diperbarui!');
    } else {
      onAddSparepart({
        partNumber: finalPartNo,
        name: spName.trim(),
        category: spCategory,
        purchasePrice: Number(spPurchase),
        sellingPrice: Number(spSelling),
        stock: Number(spStock),
        minStockAlert: Number(spMinAlert)
      });
      alert('Sparepart baru berhasil ditambahkan!');
    }

    // Reset Form
    setEditingSp(null);
    setSpPartNumber('');
    setSpName('');
    setSpPurchase(0);
    setSpSelling(0);
    setSpStock(0);
    setShowSpForm(false);
  };

  const startEditSp = (item: SparepartProduct) => {
    setEditingSp(item);
    setSpPartNumber(item.partNumber || '');
    setSpName(item.name);
    setSpCategory(item.category);
    setSpPurchase(item.purchasePrice);
    setSpSelling(item.sellingPrice);
    setSpStock(item.stock);
    setSpMinAlert(item.minStockAlert);
    setShowSpForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim() || !custPhone.trim() || !deviceModel.trim() || !damage.trim() || estCost <= 0 || !estCompletion.trim()) {
      alert('Mohon lengkapi seluruh rincian nota service!');
      return;
    }

    onAddServiceNote({
      date: formDate,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      deviceModel: deviceModel.trim(),
      imeiOrSerial: imeiOrSerial.trim() || undefined,
      damageDescription: damage.trim(),
      estimatedCost: Number(estCost),
      estimatedCompletion: estCompletion.trim(),
      status: 'Diterima'
    });

    // Reset
    setCustName('');
    setCustPhone('');
    setDeviceModel('');
    setImeiOrSerial('');
    setDamage('');
    setEstCost(0);
    setEstCompletion('');
    
    setActiveSubTab('daftar');
    alert('Nota service baru berhasil dicatat!');
  };

  const handleStatusSubmit = (id: string) => {
    onUpdateServiceStatus(id, newStatus, Number(actualCostInput), techNotesInput.trim());
    setUpdatingId(null);
    alert('Status perbaikan berhasil diperbarui!');
  };

  const startStatusUpdate = (note: ServiceNote) => {
    setUpdatingId(note.id);
    setNewStatus(note.status);
    setActualCostInput(note.actualCost || note.estimatedCost);
    setTechNotesInput(note.technicianNotes || '');
  };

  // Filter lists
  const filteredServices = serviceNotes.filter(item => {
    return (
      item.serviceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.damageDescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredSpareparts = spareparts.filter(s => 
    s.name.toLowerCase().includes(searchSp.toLowerCase()) ||
    s.category.toLowerCase().includes(searchSp.toLowerCase()) ||
    (s.partNumber && s.partNumber.toLowerCase().includes(searchSp.toLowerCase()))
  );

  // Generate WhatsApp Message for Service Update
  const getWhatsAppServiceMessage = (note: ServiceNote) => {
    const header = `*JK PHONE - UPDATE STATUS SERVICE HP*\n-----------------------------------------\n`;
    const meta = `*No Service:* ${note.serviceNumber}\n*Model HP:* ${note.deviceModel}\n*Pelanggan:* ${note.customerName}\n*Status Perbaikan:* *[ ${note.status.toUpperCase()} ]*\n-----------------------------------------\n`;
    
    let detailsText = `*Detail Service:*\n`;
    detailsText += `• *Kerusakan:* ${note.damageDescription}\n`;
    detailsText += `• *Biaya Estimasi:* ${formatIDR(note.estimatedCost)}\n`;
    if (note.actualCost) {
      detailsText += `• *Biaya Akhir:* ${formatIDR(note.actualCost)}\n`;
    }
    detailsText += `• *Estimasi Selesai:* ${note.estimatedCompletion}\n`;
    if (note.technicianNotes) {
      detailsText += `• *Catatan Teknisi:* "${note.technicianNotes}"\n`;
    }
    
    let alertMsg = '';
    if (note.status === 'Selesai') {
      alertMsg = `\n🎉 *Hore! HP Anda sudah selesai diperbaiki.* Silakan datang ke toko JK Phone untuk mengambil unit HP Anda dengan membawa nota service fisik.\n`;
    } else if (note.status === 'Diambil') {
      alertMsg = `\n✅ *Unit HP sudah diambil oleh pelanggan.* Terima kasih telah mempercayakan perbaikan HP Anda di JK Phone!\n`;
    }

    const footer = `${alertMsg}\nHubungi kami jika ada pertanyaan lebih lanjut.\n*JK PHONE*`;
    
    return encodeURIComponent(header + meta + detailsText + footer);
  };

  return (
    <div className="space-y-6" id="service-manager-wrapper">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-100 font-sans">
        <button
          onClick={() => setActiveSubTab('daftar')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'daftar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5" /> Antrean Servis Toko
        </button>
        <button
          onClick={() => setActiveSubTab('buat')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'buat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="h-4.5 w-4.5" /> Buat Tanda Terima Servis
        </button>
        <button
          onClick={() => setActiveSubTab('stok-sp')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'stok-sp' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Smartphone className="h-4.5 w-4.5" /> Stok Sparepart
        </button>
      </div>

      {/* VIEW 1: DAFTAR ANTREAN SERVICE */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari no service, nama pelanggan, tipe HP, atau kerusakan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table log */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6 font-semibold">No Servis / Tgl</th>
                    <th className="py-3.5 px-4 font-semibold">Pelanggan</th>
                    <th className="py-3.5 px-4 font-semibold">HP & IMEI</th>
                    <th className="py-3.5 px-4 font-semibold">Kerusakan / Keluhan</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Estimasi Biaya</th>
                    <th className="py-3.5 px-4 font-semibold">Estimasi Selesai</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">Belum ada perangkat diservis tercatat.</td>
                    </tr>
                  ) : (
                    [...filteredServices]
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(note => {
                        return (
                          <tr key={note.id} className="hover:bg-slate-50/40">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="font-bold text-indigo-700">{note.serviceNumber}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{note.date}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{note.customerName}</div>
                              <div className="text-xs text-slate-400 font-mono">{note.customerPhone}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-slate-700">{note.deviceModel}</div>
                              {note.imeiOrSerial && <div className="text-[10px] text-slate-400 font-mono">S/N: {note.imeiOrSerial}</div>}
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-100/40 px-2 py-1 rounded-lg max-w-[180px]">
                                {note.damageDescription}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-slate-900">
                              <div>{formatIDR(note.estimatedCost)}</div>
                              {note.actualCost && note.actualCost !== note.estimatedCost && (
                                <div className="text-[10px] text-indigo-600">Akhir: {formatIDR(note.actualCost)}</div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 whitespace-nowrap text-xs font-semibold">{note.estimatedCompletion}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                note.status === 'Selesai' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40' 
                                  : note.status === 'Diambil'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/40'
                                    : note.status === 'Proses'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200/40 animate-pulse'
                                      : note.status === 'Dibatalkan'
                                        ? 'bg-slate-100 text-slate-500 border border-slate-200/40'
                                        : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {note.status}
                              </span>
                              {note.technicianNotes && (
                                <p className="text-[10px] italic text-slate-400 mt-1 max-w-[140px] truncate">"{note.technicianNotes}"</p>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex gap-2 justify-center items-center">
                                <button
                                  onClick={() => setSelectedService(note)}
                                  className="p-1 hover:bg-slate-100 text-slate-600 rounded flex items-center gap-0.5"
                                  title="Cetak Tanda Terima"
                                >
                                  <Printer className="h-4 w-4" /> <span className="text-[10px] font-bold">Cetak</span>
                                </button>
                                
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${note.customerPhone.startsWith('0') ? '62' + note.customerPhone.slice(1) : note.customerPhone}&text=${getWhatsAppServiceMessage(note)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-emerald-50 text-emerald-600 rounded flex items-center gap-0.5"
                                  title="WA Status Update"
                                >
                                  <Send className="h-4 w-4" /> <span className="text-[10px] font-bold">WA</span>
                                </a>

                                <button
                                  onClick={() => startStatusUpdate(note)}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] px-2 py-1 rounded border border-indigo-100"
                                >
                                  Update
                                </button>

                                <button
                                  onClick={() => { if(confirm('Hapus nota service ini?')) onDeleteServiceNote(note.id); }}
                                  className="p-1 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded"
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

          {/* Quick status updating modal block */}
          {updatingId && (
            <div className="bg-indigo-50/50 border border-indigo-200/70 p-5 rounded-2xl max-w-md mx-auto space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                <h4 className="font-bold text-slate-800 text-sm">Update Status Pengerjaan Servis</h4>
                <button onClick={() => setUpdatingId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4.5 w-4.5" /></button>
              </div>
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">STATUS SEKARANG</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Diterima">Diterima (Antrean)</option>
                    <option value="Proses">Sedang Dikerjakan (Proses)</option>
                    <option value="Selesai">Perbaikan Selesai (Selesai)</option>
                    <option value="Diambil">Sudah Diambil Pelanggan (Diambil)</option>
                    <option value="Dibatalkan">Dibatalkan (Suku cadang kosong / Gagal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">BIAYA NYATA AKHIR (Rp)</label>
                  <input
                    type="number"
                    value={actualCostInput}
                    onChange={(e) => setActualCostInput(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">CATATAN TEKNISI / STATUS PARTS</label>
                  <input
                    type="text"
                    value={techNotesInput}
                    onChange={(e) => setTechNotesInput(e.target.value)}
                    placeholder="e.g. LCD LCD diganti baru, IC Touch disolder ulang"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-2">
                  <button onClick={() => setUpdatingId(null)} className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-500 font-semibold">Batal</button>
                  <button onClick={() => handleStatusSubmit(updatingId)} className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg">Update Status</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FORM BUAT TANDA TERIMA SERVIS BARU */}
      {activeSubTab === 'buat' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-lg mx-auto animate-fade-in">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Buat Tanda Terima Servis</h3>
              <p className="text-xs text-slate-500">Mencatat keluhan, kerusakan perangkat, dan memberikan tanda terima estimasi selesai</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">TANGGAL MASUK SERVIS</label>
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
                  placeholder="e.g. Indah Permata"
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
                  placeholder="e.g. 0812xxxxxxxx"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">TIPE / SERI HP</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 11 Pro"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-500">NO IMEI / SERIAL (OPTIONAL)</label>
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
                  placeholder="e.g. 359012xxxxxxx"
                  value={imeiOrSerial}
                  onChange={(e) => setImeiOrSerial(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono"
                />

                <ImeiScannerModal
                  isOpen={isScannerOpen}
                  onClose={() => setIsScannerOpen(false)}
                  mode="single"
                  onScanSuccess={setImeiOrSerial}
                  title="Scan IMEI / Serial HP Servis"
                  placeholder="Scan barcode IMEI atau serial number pada punggung/boks HP servis."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">RINCIAN KERUSAKAN / KELUHAN</label>
              <textarea
                placeholder="e.g. Ganti baterai original, tombol power macet tidak membal, lcd berkedip"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">BIAYA ESTIMASI (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 450000"
                  value={estCost || ''}
                  onChange={(e) => setEstCost(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">ESTIMASI SELESAI</label>
                <input
                  type="text"
                  placeholder="e.g. Besok Sore / 2026-06-25"
                  value={estCompletion}
                  onChange={(e) => setEstCompletion(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
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
                className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Cetak Tanda Terima & Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: STOK SPAREPART */}
      {activeSubTab === 'stok-sp' && (
        <div className="space-y-4 animate-fade-in" id="sp-view">
          
          {/* Low Stock Alerts Filter */}
          {spareparts.filter(s => s.stock <= s.minStockAlert).length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs" id="low-stock-alert-banner-sp">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Peringatan Kritis: Sisa Stok Sparepart Limit!</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Beberapa item sparepart ({spareparts.filter(s => s.stock <= s.minStockAlert).length}) telah mencapai batas minimum pengadaan. Silakan lakukan pemesanan ulang (restock) segera.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sparepart, kategori, atau kode part..."
                value={searchSp}
                onChange={(e) => setSearchSp(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={() => {
                setEditingSp(null);
                setSpPartNumber('');
                setSpName('');
                setSpCategory('LCD');
                setSpPurchase(0);
                setSpSelling(0);
                setSpStock(0);
                setSpMinAlert(2);
                setShowSpForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Plus className="h-4.5 w-4.5" /> Tambah Sparepart
            </button>
          </div>

          {/* Form Modal / Panel */}
          {showSpForm && (
            <div className="bg-white border border-indigo-100 p-6 rounded-2xl shadow-xs space-y-4 max-w-xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <h4 className="font-bold text-slate-900 text-md">{editingSp ? 'Edit Data Sparepart' : 'Tambah Sparepart Baru'}</h4>
                <button onClick={() => setShowSpForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSpSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">KODE PART / SKU (KOSONGKAN UNTUK AUTO-GENERATE)</label>
                    <input
                      type="text"
                      placeholder="e.g. SP-LCD-001 (Opsional)"
                      value={spPartNumber}
                      onChange={(e) => setSpPartNumber(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-800 font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NAMA PARTS</label>
                    <input
                      type="text"
                      placeholder="e.g. LCD iPhone 12 Pro Original OLED"
                      value={spName}
                      onChange={(e) => setSpName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">KATEGORI SPAREPART</label>
                    <select
                      value={spCategory}
                      onChange={(e) => setSpCategory(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {spCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">SISA STOK</label>
                    <input
                      type="number"
                      min="0"
                      value={spStock}
                      onChange={(e) => setSpStock(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">HARGA BELI MODAL (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={spPurchase || ''}
                      onChange={(e) => setSpPurchase(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">HARGA JUAL / JASA PARTS (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={spSelling || ''}
                      onChange={(e) => setSpSelling(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">BATAS MINIMUM STOK REMINDER (UNIT)</label>
                    <input
                      type="number"
                      min="1"
                      value={spMinAlert}
                      onChange={(e) => setSpMinAlert(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                  <button type="button" onClick={() => setShowSpForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs">Simpan Sparepart</button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6 font-semibold">Kode Part</th>
                    <th className="py-3.5 px-4 font-semibold">Nama Sparepart</th>
                    <th className="py-3.5 px-4 font-semibold">Kategori Parts</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Harga Modal</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Harga Jual / Parts</th>
                    <th className="py-3.5 px-4 text-center font-semibold">Stok Sisa</th>
                    <th className="py-3.5 px-4 text-center font-semibold text-indigo-600">Terjual</th>
                    <th className="py-3.5 px-4 text-right font-semibold text-emerald-600">Laba Bersih</th>
                    <th className="py-3.5 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSpareparts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">Tidak ada produk sparepart ditemukan.</td>
                    </tr>
                  ) : (
                    filteredSpareparts.map(item => {
                      const isLowStock = item.stock <= item.minStockAlert;

                      // Calculate on-the-fly sold quantity and profit
                      const soldQty = accSales.reduce((sum, sale) => {
                        const matchItems = sale.items.filter(i => i.itemId === item.id && i.type === 'Sparepart');
                        return sum + matchItems.reduce((s, i) => s + i.qty, 0);
                      }, 0);

                      const netProfit = accSales.reduce((sum, sale) => {
                        const matchItems = sale.items.filter(i => i.itemId === item.id && i.type === 'Sparepart');
                        return sum + matchItems.reduce((s, i) => s + (i.total - (i.qty * item.purchasePrice)), 0);
                      }, 0);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/40">
                          <td className="py-3 px-6 font-mono text-xs font-black text-slate-600 bg-slate-50/50">{item.partNumber || '-'}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{item.category}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-500">{formatIDR(item.purchasePrice)}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{formatIDR(item.sellingPrice)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              item.stock === 0 ? 'bg-rose-100 text-rose-700' : isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {item.stock} unit {isLowStock && '⚠️'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-extrabold text-indigo-600">{soldQty} pcs</td>
                          <td className={`py-3 px-4 text-right font-black ${netProfit > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {netProfit > 0 ? formatIDR(netProfit) : '-'}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => startEditSp(item)} className="p-1 hover:bg-slate-100 text-indigo-600 rounded" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => { if(confirm('Hapus sparepart ini?')) onDeleteSparepart(item.id); }} className="p-1 hover:bg-rose-50 text-rose-500 rounded" title="Hapus"><Trash2 className="h-4 w-4" /></button>
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

      {/* PRINTABLE TICKET / SERVICE NOTE MODAL PREVIEW */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="service-note-modal">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-sm tracking-wide">SURAT TANDA TERIMA SERVIS HP</span>
              <button onClick={() => setSelectedService(null)} className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm" id="printable-service-ticket">
              <div className="text-center space-y-1 border-b border-dashed border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">JK PHONE</h2>
                <p className="text-xs text-slate-500">Mal Ambasador Lantai 3 No. 45, Jakarta Selatan</p>
                <p className="text-xs text-slate-400">Telp/WA: 0812-9988-7766 | Layanan Servis Profesional</p>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">NOMOR SERVICE</span>
                  <strong className="text-slate-900 text-sm">{selectedService.serviceNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">TANGGAL TERIMA</span>
                  <strong className="text-slate-900">{selectedService.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">PELANGGAN</span>
                  <strong className="text-slate-900">{selectedService.customerName}</strong>
                  <span className="block text-[10px] text-slate-400">{selectedService.customerPhone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">ESTIMASI SELESAI</span>
                  <strong className="text-indigo-600">{selectedService.estimatedCompletion}</strong>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-200 py-3 space-y-2">
                <div className="text-xs text-slate-700">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">PERANGKAT & IDENTITAS</span>
                  <span className="font-bold text-slate-900">{selectedService.deviceModel}</span>
                  {selectedService.imeiOrSerial && <span className="block text-[10px] text-slate-500 font-mono">IMEI/SN: {selectedService.imeiOrSerial}</span>}
                </div>

                <div className="text-xs text-slate-700">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">KELUHAN / DETIL KERUSAKAN</span>
                  <p className="text-rose-700 font-semibold bg-rose-50/50 p-2 border border-rose-100 rounded-lg mt-1">
                    {selectedService.damageDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between font-semibold">
                  <span>Biaya Jasa Estimasi</span>
                  <span>{formatIDR(selectedService.estimatedCost)}</span>
                </div>
                {selectedService.actualCost ? (
                  <div className="flex justify-between font-extrabold text-slate-900 border-t border-slate-100 pt-1 text-sm">
                    <span>Biaya Akhir Disepakati</span>
                    <span className="text-indigo-600">{formatIDR(selectedService.actualCost)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs font-semibold mt-1">
                  <span>Status Pengerjaan</span>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{selectedService.status}</span>
                </div>
              </div>

              {selectedService.technicianNotes && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500 italic border border-slate-100">
                  <strong>Catatan Teknisi:</strong> "{selectedService.technicianNotes}"
                </div>
              )}

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-dashed border-slate-200 space-y-1 leading-normal">
                <p>JK PHONE menggunakan suku cadang berkualitas dengan garansi servis sesuai jenis kerusakan.</p>
                <p>Harap membawa tanda terima ini ketika mengambil HP Anda.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition"
              >
                <Printer className="h-4 w-4" /> Cetak Nota Fisik
              </button>
              
              <a
                href={`https://api.whatsapp.com/send?phone=${selectedService.customerPhone.startsWith('0') ? '62' + selectedService.customerPhone.slice(1) : selectedService.customerPhone}&text=${getWhatsAppServiceMessage(selectedService)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition"
              >
                <Send className="h-4 w-4" /> Kirim Status WA
              </a>

              <button onClick={() => setSelectedService(null)} className="px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs text-slate-500">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
