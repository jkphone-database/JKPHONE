import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Search, DollarSign, ClipboardList, Trash2, Tag, Layers, CreditCard } from 'lucide-react';

interface ExpensesListProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpensesList({
  expenses,
  onAddExpense,
  onDeleteExpense
}: ExpensesListProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local state
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'buat'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Listrik & Internet');
  const [formReference, setFormReference] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formQty, setFormQty] = useState(1);
  const [formPaymentMethod, setFormPaymentMethod] = useState('Tunai');
  const [formAccountName, setFormAccountName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const categories = [
    'Gaji Karyawan',
    'Sewa Ruko',
    'Listrik & Internet',
    'Alat Tulis & Kasir',
    'Promosi & Iklan',
    'Konsumsi / Kebersihan',
    'Stok Sparepart',
    'Stok Aksesoris',
    'Lainnya'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formAmount <= 0 || !formDescription.trim()) {
      alert('Silakan isi jumlah nominal pengeluaran dan keterangan detail!');
      return;
    }

    const calculatedTotal = Number(formAmount) * Number(formQty);

    onAddExpense({
      date: formDate,
      category: formCategory,
      reference: formReference.trim() || undefined,
      amount: Number(formAmount),
      qty: Number(formQty),
      totalAmount: calculatedTotal,
      description: formDescription.trim(),
      paymentMethod: formPaymentMethod,
      accountName: formAccountName.trim() || undefined
    });

    // Reset Form
    setFormAmount(0);
    setFormQty(1);
    setFormReference('');
    setFormAccountName('');
    setFormDescription('');
    setFormPaymentMethod('Tunai');
    
    // Redirect
    setActiveSubTab('daftar');
    alert('Catatan pengeluaran operasional berhasil disimpan!');
  };

  // Filter List
  const filteredExpenses = expenses.filter(exp => {
    return (
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.reference && exp.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.accountName && exp.accountName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + (item.totalAmount || item.amount), 0);

  return (
    <div className="space-y-6" id="expenses-wrapper">
      {/* Sub tabs nav */}
      <div className="flex border-b border-slate-100" id="expenses-tabs-nav">
        <button
          id="btn-exp-tab-daftar"
          onClick={() => setActiveSubTab('daftar')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'daftar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Riwayat Pengeluaran Toko
        </button>
        <button
          id="btn-exp-tab-buat"
          onClick={() => setActiveSubTab('buat')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'buat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="h-4 w-4" /> Catat Pengeluaran Baru
        </button>
      </div>

      {/* VIEW 1: DAFTAR PENGELUARAN */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in" id="expenses-list-view">
          {/* Summary Box & Search bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="expenses-summary-bar">
            {/* Total Expense card */}
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl md:col-span-1 flex items-center gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">Total Pengeluaran Terfilter</p>
                <h3 className="text-xl font-extrabold text-rose-950 font-sans mt-0.5">{formatIDR(totalFilteredAmount)}</h3>
              </div>
            </div>

            {/* Search filter card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs md:col-span-2 flex items-center" id="expenses-search-container">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="expenses-search-input"
                  type="text"
                  placeholder="Cari referensi, kategori, rekening penerima, keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Table content */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="expenses-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="expenses-table">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4 px-6">Tanggal</th>
                    <th className="py-4 px-4">Kategori & Referensi</th>
                    <th className="py-4 px-4">Deskripsi / Keterangan</th>
                    <th className="py-4 px-4 text-center">Qty x Harga Satuan</th>
                    <th className="py-4 px-4 text-right">Jumlah Nominal</th>
                    <th className="py-4 px-4">Metode Bayar & Akun</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Belum ada pencatatan pengeluaran ditemukan.
                      </td>
                    </tr>
                  ) : (
                    [...filteredExpenses]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50/40 transition duration-150" id={`exp-row-${exp.id}`}>
                          <td className="py-4 px-6 text-slate-500 whitespace-nowrap">{exp.date}</td>
                          <td className="py-4 px-4">
                            <span className="bg-rose-50 text-rose-800 font-bold text-xs px-2.5 py-1 rounded-full border border-rose-100/30 block w-fit">
                              {exp.category}
                            </span>
                            {exp.reference && (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1">
                                <Tag className="h-3 w-3 inline" /> Ref: {exp.reference}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-700 font-medium">
                            {exp.description}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-500 font-medium">
                            {exp.qty || 1} x {formatIDR(exp.amount)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-rose-600">
                            {formatIDR(exp.totalAmount || (exp.amount * (exp.qty || 1)))}
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-semibold block w-fit">
                              {exp.paymentMethod}
                            </span>
                            {exp.accountName && (
                              <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
                                A.N. {exp.accountName}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              id={`btn-del-exp-${exp.id}`}
                              onClick={() => {
                                if (confirm('Apakah Anda yakin ingin menghapus catatan pengeluaran ini?')) {
                                  onDeleteExpense(exp.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition cursor-pointer"
                              title="Hapus Pengeluaran"
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

      {/* VIEW 2: FORM CATAT PENGELUARAN BARU */}
      {activeSubTab === 'buat' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-lg mx-auto animate-fade-in" id="expenses-form-view">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Catat Pengeluaran Operasional</h3>
              <p className="text-xs text-slate-500">Mencatat pengeluaran sewa ruko, gaji, listrik, pembelian sparepart/aksesoris</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="add-expense-form">
            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Tanggal Pengeluaran</label>
                <input
                  id="exp-form-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Referensi */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">No Referensi / Kuitansi</label>
                <input
                  id="exp-form-reference"
                  type="text"
                  placeholder="e.g. KWT-99221"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Kategori Pengeluaran</label>
                <select
                  id="exp-form-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Qty */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Quantity (Qty)</label>
                <input
                  id="exp-form-qty"
                  type="number"
                  min="1"
                  value={formQty}
                  onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Harga Satuan */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Harga Satuan (Rp)</label>
                <input
                  id="exp-form-amount"
                  type="number"
                  min="1"
                  placeholder="Jumlah Rupiah"
                  value={formAmount || ''}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Estimasi Total */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Total Pengeluaran (Kalkulasi)</label>
                <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200">
                  {formatIDR(Number(formAmount) * Number(formQty))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Metode Bayar */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Metode Pembayaran</label>
                <select
                  id="exp-form-payment-method"
                  value={formPaymentMethod}
                  onChange={(e) => setFormPaymentMethod(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                >
                  <option value="Tunai">Tunai / CASH</option>
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Lainnya">Lainnya / Kartu</option>
                </select>
              </div>

              {/* Akun Rekening Penerima */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Nama Rekening Penerima / Akun</label>
                <input
                  id="exp-form-account-name"
                  type="text"
                  placeholder="e.g. CV Sinar Jaya / KAS KECIL"
                  value={formAccountName}
                  onChange={(e) => setFormAccountName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Keterangan / Deskripsi Detail</label>
              <textarea
                id="exp-form-desc"
                rows={2}
                placeholder="e.g. Pembelian suku cadang LCD dan baterai stok cadangan untuk servis hp"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                required
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
              <button
                id="btn-cancel-exp"
                type="button"
                onClick={() => setActiveSubTab('daftar')}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-exp"
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Simpan Catatan Pengeluaran
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
