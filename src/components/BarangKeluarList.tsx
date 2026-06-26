import React, { useState } from 'react';
import { PhoneProduct, BarangKeluar } from '../types';
import { ArrowUpRight, Search, Plus, Calendar, Smartphone, Info, Trash2 } from 'lucide-react';

interface BarangKeluarListProps {
  products: PhoneProduct[];
  barangKeluarList: BarangKeluar[];
  onAddBarangKeluar: (item: Omit<BarangKeluar, 'id'>) => void;
  onDeleteBarangKeluar: (id: string) => void;
}

export default function BarangKeluarList({
  products,
  barangKeluarList,
  onAddBarangKeluar,
  onDeleteBarangKeluar
}: BarangKeluarListProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local state
  const [activeSubTab, setActiveSubTab] = useState<'riwayat' | 'form-keluar'>('riwayat');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formPrice, setFormPrice] = useState(0);
  const [formBuyer, setFormBuyer] = useState('');
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Get active products in stock
  const availableProducts = products.filter(p => p.stock > 0);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Handle product selection to prefill pricing and trigger IMEI options
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    setSelectedImeis([]);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setFormPrice(prod.sellingPrice);
    } else {
      setFormPrice(0);
    }
  };

  // Handle multi IMEI checkbox select
  const handleImeiCheck = (imei: string, isChecked: boolean) => {
    if (isChecked) {
      if (selectedImeis.length >= formQty) {
        alert(`Anda telah memilih ${formQty} IMEI sesuai dengan Qty. Kurangi Qty jika ingin menambah unit!`);
        return;
      }
      setSelectedImeis([...selectedImeis, imei]);
    } else {
      setSelectedImeis(selectedImeis.filter(i => i !== imei));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert('Silakan pilih tipe HP!');
      return;
    }

    if (selectedImeis.length !== formQty) {
      alert(`Silakan pilih tepat ${formQty} IMEI sesuai dengan Qty yang diinput!`);
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    onAddBarangKeluar({
      date: formDate,
      brand: prod.brand,
      modelName: prod.modelName,
      storage: prod.storage,
      color: prod.color,
      condition: prod.condition,
      qty: Number(formQty),
      sellingPrice: Number(formPrice),
      buyer: formBuyer.trim() || 'Penyesuaian Manual',
      imeis: selectedImeis,
      signalType: prod.signalType || 'iBox',
      notes: formNotes.trim()
    });

    // Reset Form
    setSelectedProductId('');
    setFormQty(1);
    setFormPrice(0);
    setFormBuyer('');
    setSelectedImeis([]);
    setFormNotes('');
    
    // Move tab
    setActiveSubTab('riwayat');
    alert('Barang keluar berhasil dicatat dan stok toko diperbarui!');
  };

  // Filter lists
  const filteredBarangKeluar = barangKeluarList.filter(item => {
    return (
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.imeis.some(imei => imei.includes(searchQuery))
    );
  });

  return (
    <div className="space-y-6" id="barang-keluar-wrapper">
      {/* Sub-tab navigation */}
      <div className="flex border-b border-slate-100" id="bk-tabs-nav">
        <button
          id="btn-bk-tab-riwayat"
          onClick={() => setActiveSubTab('riwayat')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'riwayat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Riwayat Barang Keluar
        </button>
        <button
          id="btn-bk-tab-form"
          onClick={() => setActiveSubTab('form-keluar')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'form-keluar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="h-4 w-4" /> Catat Barang Keluar Manual
        </button>
      </div>

      {/* VIEW 1: RIWAYAT BARANG KELUAR LOG */}
      {activeSubTab === 'riwayat' && (
        <div className="space-y-4 animate-fade-in" id="bk-riwayat-view">
          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex gap-3" id="bk-search-container">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="bk-search-input"
                type="text"
                placeholder="Cari brand, model, pembeli, IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="bk-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="bk-table">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4 px-6">Tanggal Keluar</th>
                    <th className="py-4 px-4">Informasi Barang</th>
                    <th className="py-4 px-4 text-center">Qty</th>
                    <th className="py-4 px-4 text-right">Harga Keluar / Jual</th>
                    <th className="py-4 px-4">Penerima / Pembeli</th>
                    <th className="py-4 px-4">IMEI Terjual/Keluar</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBarangKeluar.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Belum ada barang keluar tercatat.
                      </td>
                    </tr>
                  ) : (
                    [...filteredBarangKeluar]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/40 transition duration-150" id={`bk-row-${item.id}`}>
                          <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{item.date}</td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="font-semibold text-slate-800">{item.brand} {item.modelName}</span>
                              <span className="text-xs text-slate-500 ml-1">({item.storage} • {item.color})</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold">{item.condition}</span>
                              {item.notes && <span className="italic">"{item.notes}"</span>}
                              {item.linkedTransactionId && (
                                <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[9px]">
                                  Invoice: {item.linkedTransactionId}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-700">{item.qty} unit</td>
                          <td className="py-4 px-4 text-right font-medium text-slate-800">{formatIDR(item.sellingPrice)}</td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-700">{item.buyer}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.imeis.map(imei => (
                                <span key={imei} className="bg-rose-50 text-rose-600 font-mono text-[9px] px-1 py-0.5 rounded border border-rose-100/50">
                                  {imei}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              id={`btn-del-bk-${item.id}`}
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus catatan barang keluar ini? HP akan dikembalikan ke dalam stok toko.')) {
                                  onDeleteBarangKeluar(item.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition cursor-pointer"
                              title="Hapus riwayat barang keluar"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
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

      {/* VIEW 2: FORM CATAT BARANG KELUAR MANUAL */}
      {activeSubTab === 'form-keluar' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-2xl mx-auto animate-fade-in" id="bk-form-view">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Catat Barang Keluar Manual / Penyesuaian</h3>
              <p className="text-xs text-slate-500">Mencatat pengeluaran unit HP secara manual dari gudang tanpa invoice retail</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="add-bk-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal Keluar */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Tanggal Keluar</label>
                <input
                  id="bk-form-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Penerima / Alasan */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Penerima / Alasan Keluar</label>
                <input
                  id="bk-form-buyer"
                  type="text"
                  placeholder="e.g. Retur Supplier, Hilang, Inventaris Toko, dst."
                  value={formBuyer}
                  onChange={(e) => setFormBuyer(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Pilih HP */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Pilih Unit HP yang Keluar</label>
                <select
                  id="bk-form-product"
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                >
                  <option value="">-- Pilih HP In Stock --</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.modelName} ({p.storage} • {p.color} • {p.condition}) - Sisa {p.stock} Unit
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <>
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Quantity (Maks {selectedProduct.stock} unit)</label>
                    <input
                      id="bk-form-qty"
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={formQty}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(selectedProduct.stock, Number(e.target.value)));
                        setFormQty(val);
                        setSelectedImeis([]); // Reset imei choices as count shifts
                      }}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  {/* Nominal Estimasi */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Nominal Harga per Unit (Rp)</label>
                    <input
                      id="bk-form-price"
                      type="number"
                      value={formPrice || ''}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* IMEI check selector */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-500 block">
                      Pilih IMEI unit yang Keluar (Pilih {formQty} unit)
                    </label>
                    <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
                      {selectedProduct.imeis.map(imei => (
                        <label key={imei} className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 p-2 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                          <input
                            id={`bk-form-imei-check-${imei}`}
                            type="checkbox"
                            checked={selectedImeis.includes(imei)}
                            onChange={(e) => handleImeiCheck(imei, e.target.checked)}
                            className="accent-rose-600 rounded"
                          />
                          {imei}
                        </label>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Info className="h-3 w-3" /> IMEI yang Anda centang akan dihapus dari data stok aktif.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Catatan Tambahan / Alasan detail</label>
              <input
                id="bk-form-notes"
                type="text"
                placeholder="e.g. Layar bergaris, diretur ke PT Sinar Distribusi"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
              <button
                id="btn-cancel-bk"
                type="button"
                onClick={() => setActiveSubTab('riwayat')}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-bk"
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Simpan Barang Keluar & Kurangi Stok
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
