import React, { useState } from 'react';
import { PhoneProduct, BarangMasuk, MasterProduct } from '../types';
import { Plus, Search, Smartphone, ClipboardList, Info, Trash2, Calendar, Tag, ShieldCheck, TrendingUp, AlertCircle, Camera, Edit } from 'lucide-react';
import ImeiScannerModal from './ImeiScannerModal';

interface StockAndBarangMasukProps {
  products: PhoneProduct[];
  barangMasukList: BarangMasuk[];
  onAddBarangMasuk: (item: Omit<BarangMasuk, 'id'>) => void;
  onEditBarangMasuk: (item: BarangMasuk) => void;
  onDeleteBarangMasuk: (id: string) => void;
  masterProducts?: MasterProduct[];
  userRole?: 'atasan' | 'karyawan';
}

export default function StockAndBarangMasuk({ 
  products, 
  barangMasukList, 
  onAddBarangMasuk, 
  onEditBarangMasuk,
  onDeleteBarangMasuk,
  masterProducts = [],
  userRole = 'atasan'
}: StockAndBarangMasukProps) {
  
  // Format currency helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local State
  const [activeSubTab, setActiveSubTab] = useState<'stok' | 'form-masuk' | 'riwayat'>('stok');

  // Force activeSubTab to 'stok' for employee role
  React.useEffect(() => {
    if (userRole === 'karyawan' && activeSubTab !== 'stok') {
      setActiveSubTab('stok');
    }
  }, [userRole, activeSubTab]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('Semua');
  const [periodFilter, setPeriodFilter] = useState('Semua'); // monthly period filter e.g. "2026-06"

  // Stock Stats and Calculation States
  const [stockStatsView, setStockStatsView] = useState<'current' | 'monthly'>('current');
  const [stockStatsMonth, setStockStatsMonth] = useState<string>(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  });

  // Form State
  const [isManualInput, setIsManualInput] = useState<boolean>(() => {
    return !masterProducts || masterProducts.length === 0;
  });
  const [selectedMasterId, setSelectedMasterId] = useState<string>(() => {
    return masterProducts && masterProducts.length > 0 ? masterProducts[0].id : '';
  });

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Initialize from first master product if catalog is not empty
  const [formBrand, setFormBrand] = useState(() => {
    const init = masterProducts && masterProducts.length > 0 ? masterProducts[0] : null;
    return init ? init.brand : 'Apple';
  });
  const [formModelName, setFormModelName] = useState(() => {
    const init = masterProducts && masterProducts.length > 0 ? masterProducts[0] : null;
    return init ? init.modelName : '';
  });
  const [formStorage, setFormStorage] = useState(() => {
    const init = masterProducts && masterProducts.length > 0 ? masterProducts[0] : null;
    return init ? init.storage : '128GB';
  });
  const [formColor, setFormColor] = useState(() => {
    const init = masterProducts && masterProducts.length > 0 ? masterProducts[0] : null;
    return init ? (init.colors[0] || '') : '';
  });

  const [formCondition, setFormCondition] = useState<'Baru' | 'Bekas'>('Baru');
  const [formQty, setFormQty] = useState(1);
  const [formPurchasePrice, setFormPurchasePrice] = useState(0);
  const [formSellingPrice, setFormSellingPrice] = useState(0);
  const [formSupplier, setFormSupplier] = useState('');
  const [formSignalType, setFormSignalType] = useState<'Inter' | 'Beacukai' | 'iBox' | 'Xiaomi' | 'Oppo' | 'Vivo' | 'Lainnya'>('iBox');
  const [formImeiInput, setFormImeiInput] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingBmItem, setEditingBmItem] = useState<BarangMasuk | null>(null);

  const startEditBm = (item: BarangMasuk) => {
    setEditingBmItem(item);
    setIsManualInput(true);
    setFormDate(item.date);
    setFormBrand(item.brand);
    setFormModelName(item.modelName);
    setFormStorage(item.storage);
    setFormColor(item.color);
    setFormCondition(item.condition);
    setFormQty(item.qty);
    setFormPurchasePrice(item.purchasePrice);
    setFormSellingPrice(item.sellingPrice || 0);
    setFormSupplier(item.supplier);
    setFormSignalType(item.signalType as any || 'iBox');
    setFormImeiInput(item.imeis.join('\n'));
    setFormNotes(item.notes || '');
    setActiveSubTab('form-masuk');
  };

  const handleSelectMasterProduct = (masterId: string) => {
    setSelectedMasterId(masterId);
    if (!masterId) {
      setFormBrand('Apple');
      setFormModelName('');
      setFormStorage('128GB');
      setFormColor('');
      return;
    }
    const found = masterProducts.find(m => m.id === masterId);
    if (found) {
      setFormBrand(found.brand);
      setFormModelName(found.modelName);
      setFormStorage(found.storage);
      setFormColor(found.colors[0] || '');
    }
  };

  const selectedMaster = masterProducts.find(m => m.id === selectedMasterId);

  const handleScanMultipleSuccess = (scannedImeis: string[]) => {
    const currentList = formImeiInput.split(/[\n, ]+/).map(i => i.trim()).filter(Boolean);
    const updatedList = [...currentList];
    scannedImeis.forEach(imei => {
      if (!updatedList.includes(imei)) {
        updatedList.push(imei);
      }
    });
    setFormImeiInput(updatedList.join('\n'));
    if (updatedList.length > formQty) {
      setFormQty(updatedList.length);
    }
  };

  // Extract unique brands for filtering
  const uniqueBrands = ['Semua', ...Array.from(new Set(products.map(p => p.brand)))];

  // Extract unique month periods from dates (YYYY-MM format)
  const uniquePeriods = [
    'Semua',
    ...Array.from(
      new Set([
        ...barangMasukList.map(bm => bm.date.substring(0, 7)),
        new Date().toISOString().substring(0, 7)
      ])
    ).sort().reverse()
  ];

  // Helper to determine IMEI availability: Is it sold or ready?
  const isImeiReady = (imei: string) => {
    // Find if this IMEI exists in any active product's imeis list
    return products.some(p => p.imeis.includes(imei));
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = `${p.brand} ${p.modelName} ${p.storage} ${p.color} ${p.signalType || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'Semua' || p.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  // Filtered Incoming Goods Log
  const filteredBarangMasuk = barangMasukList.filter(bm => {
    const matchesSearch = `${bm.brand} ${bm.modelName} ${bm.supplier} ${bm.signalType || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPeriod = periodFilter === 'Semua' || bm.date.startsWith(periodFilter);
    return matchesSearch && matchesPeriod;
  });

  // Calculate overall estimated profit margin of the stock or filtered transactions
  const totalStockInvestment = filteredProducts.reduce((sum, p) => sum + (p.purchasePrice * p.stock), 0);
  const totalStockPotentialValue = filteredProducts.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);
  const totalStockPotentialProfit = totalStockPotentialValue - totalStockInvestment;

  // Monthly procurement statistics (Barang Masuk per Bulan)
  const monthlyBM = barangMasukList.filter(bm => {
    const matchesMonth = stockStatsMonth === 'Semua' || bm.date.startsWith(stockStatsMonth);
    const matchesBrand = brandFilter === 'Semua' || bm.brand === brandFilter;
    const matchesSearch = searchQuery === '' || `${bm.brand} ${bm.modelName} ${bm.supplier} ${bm.signalType || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesBrand && matchesSearch;
  });

  const totalMonthlyInvestment = monthlyBM.reduce((sum, bm) => sum + (bm.purchasePrice * bm.qty), 0);
  const totalMonthlyPotentialValue = monthlyBM.reduce((sum, bm) => sum + ((bm.sellingPrice || 0) * bm.qty), 0);
  const totalMonthlyPotentialProfit = totalMonthlyPotentialValue - totalMonthlyInvestment;

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formBrand || !formModelName || !formColor || formPurchasePrice <= 0 || formSellingPrice <= 0) {
      alert('Silakan lengkapi data Brand, Model, Warna, Harga Beli, dan Harga Jual!');
      return;
    }

    // Process IMEIs: Split by comma, space or new lines
    const rawImeis = formImeiInput
      .split(/[\n, ]+/)
      .map(i => i.trim())
      .filter(i => i.length > 0);

    // Verify IMEI count matches qty
    if (rawImeis.length !== formQty) {
      if (!confirm(`Pemberitahuan: Jumlah IMEI yang diinput (${rawImeis.length}) tidak sama dengan Qty (${formQty}). Tetap simpan?`)) {
        return;
      }
    }

    if (editingBmItem) {
      onEditBarangMasuk({
        ...editingBmItem,
        date: formDate,
        brand: formBrand.trim(),
        modelName: formModelName.trim(),
        storage: formStorage,
        color: formColor.trim(),
        condition: formCondition,
        qty: Number(formQty),
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        supplier: formSupplier.trim() || 'Supplier Umum',
        signalType: formSignalType,
        imeis: rawImeis,
        notes: formNotes.trim()
      });
      setEditingBmItem(null);
      alert('Catatan barang masuk berhasil diperbarui!');
    } else {
      onAddBarangMasuk({
        date: formDate,
        brand: formBrand.trim(),
        modelName: formModelName.trim(),
        storage: formStorage,
        color: formColor.trim(),
        condition: formCondition,
        qty: Number(formQty),
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        supplier: formSupplier.trim() || 'Supplier Umum',
        signalType: formSignalType,
        imeis: rawImeis,
        notes: formNotes.trim()
      });
      alert('Barang masuk berhasil dicatat, keuntungan modal dikalkulasikan, dan stok toko diperbarui!');
    }

    // Reset Form
    if (masterProducts && masterProducts.length > 0) {
      const init = masterProducts[0];
      setSelectedMasterId(init.id);
      setIsManualInput(false);
      setFormBrand(init.brand);
      setFormModelName(init.modelName);
      setFormStorage(init.storage);
      setFormColor(init.colors[0] || '');
    } else {
      setSelectedMasterId('');
      setIsManualInput(true);
      setFormBrand('Apple');
      setFormModelName('');
      setFormStorage('128GB');
      setFormColor('');
    }
    setFormQty(1);
    setFormPurchasePrice(0);
    setFormSellingPrice(0);
    setFormSupplier('');
    setFormImeiInput('');
    setFormNotes('');
    setFormSignalType('iBox');
    
    // Switch view to stock list
    setActiveSubTab('stok');
    alert('Barang masuk berhasil dicatat, keuntungan modal dikalkulasikan, dan stok toko diperbarui!');
  };

  return (
    <div className="space-y-6" id="stock-section-wrapper">
      
      {/* Sub-tab Navigation */}
      {userRole !== 'karyawan' && (
        <div className="flex border-b border-slate-100" id="stock-tabs-nav">
          <button
            id="btn-subtab-stok"
            onClick={() => setActiveSubTab('stok')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer ${
              activeSubTab === 'stok'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Daftar Stok HP & Laba Rugi
          </button>
          <button
            id="btn-subtab-form"
            onClick={() => {
              setEditingBmItem(null);
              setFormQty(1);
              setFormPurchasePrice(0);
              setFormSellingPrice(0);
              setFormSupplier('');
              setFormImeiInput('');
              setFormNotes('');
              setFormSignalType('iBox');
              setActiveSubTab('form-masuk');
            }}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'form-masuk'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Plus className="h-4 w-4" /> Catat Barang Masuk (Restock)
          </button>
          <button
            id="btn-subtab-riwayat"
            onClick={() => setActiveSubTab('riwayat')}
            className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'riwayat'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ClipboardList className="h-4 w-4" /> Log Riwayat Barang Masuk
          </button>
        </div>
      )}

      {/* VIEW 1: DAFTAR STOK HP */}
      {activeSubTab === 'stok' && (
        <div className="space-y-4 animate-fade-in" id="stock-list-view">
          {/* Summary Control Header & Cards */}
          {userRole !== 'karyawan' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs gap-3" id="stock-calc-header">
                <div>
                  <h4 className="text-sm font-black text-slate-800">Kalkulator Modal & Nilai Jual HP</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Beralih antara sisa investasi stok aktif (Ready) dan pengadaan barang masuk bulanan</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Stats Mode Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200" id="stats-view-mode-toggle">
                    <button
                      type="button"
                      id="btn-stats-current"
                      onClick={() => setStockStatsView('current')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        stockStatsView === 'current'
                          ? 'bg-white text-indigo-700 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sisa Stok Ready
                    </button>
                    <button
                      type="button"
                      id="btn-stats-monthly"
                      onClick={() => setStockStatsView('monthly')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        stockStatsView === 'monthly'
                          ? 'bg-white text-indigo-700 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Pengadaan Bulanan
                    </button>
                  </div>

                  {/* Monthly Filter Dropdown */}
                  {stockStatsView === 'monthly' && (
                    <select
                      id="select-stats-month"
                      value={stockStatsMonth}
                      onChange={(e) => setStockStatsMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700 font-sans"
                    >
                      {uniquePeriods.map(period => (
                        <option key={period} value={period}>
                          {period === 'Semua' ? 'Semua Periode' : `Bulan: ${period}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans" id="stock-summary-cards">
                {/* Card 1: Modal Investasi */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    {stockStatsView === 'current' ? 'Total Modal Investasi HP' : `Modal Investasi HP Masuk (${stockStatsMonth === 'Semua' ? 'Semua' : stockStatsMonth})`}
                  </span>
                  <strong className="text-xl font-extrabold text-slate-800 mt-1 block">
                    {stockStatsView === 'current' ? formatIDR(totalStockInvestment) : formatIDR(totalMonthlyInvestment)}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {stockStatsView === 'current' ? 'Rincian modal seluruh unit HP aktif saat ini' : 'Total biaya modal untuk unit masuk pada periode ini'}
                  </span>
                </div>

                {/* Card 2: Total Nilai Jual */}
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                  <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block">
                    {stockStatsView === 'current' ? 'Total Nilai Jual HP' : `Total Proyeksi Jual (${stockStatsMonth === 'Semua' ? 'Semua' : stockStatsMonth})`}
                  </span>
                  <strong className="text-xl font-extrabold text-indigo-950 mt-1 block">
                    {stockStatsView === 'current' ? formatIDR(totalStockPotentialValue) : formatIDR(totalMonthlyPotentialValue)}
                  </strong>
                  <span className="text-[10px] text-indigo-500 mt-1 block">
                    {stockStatsView === 'current' ? 'Omset kotor jika semua unit in-stock terjual' : 'Proyeksi omset kotor jika semua unit masuk terjual'}
                  </span>
                </div>

                {/* Card 3: Estimasi Keuntungan */}
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                  <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">
                    {stockStatsView === 'current' ? 'Estimasi Keuntungan (Laba Kotor)' : `Proyeksi Untung (${stockStatsMonth === 'Semua' ? 'Semua' : stockStatsMonth})`}
                  </span>
                  <strong className="text-xl font-extrabold text-emerald-950 mt-1 block flex items-center gap-1.5">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    {stockStatsView === 'current' ? formatIDR(totalStockPotentialProfit) : formatIDR(totalMonthlyPotentialProfit)}
                  </strong>
                  <span className="text-[10px] text-emerald-500 mt-1 block">
                    {stockStatsView === 'current' ? 'Margin keuntungan sisa stok HP aktif saat ini' : 'Estimasi keuntungan kotor dari unit masuk'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs" id="stock-filters">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="stock-search-input"
                type="text"
                placeholder="Cari brand, model, kapasitas, warna, jenis sinyal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                id="stock-brand-select"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Semua">Semua Brand</option>
                {uniqueBrands.filter(b => b !== 'Semua').map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="stock-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="stock-table">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4 px-6">Informasi HP & Sinyal</th>
                    <th className="py-4 px-3">Kondisi</th>
                    {userRole !== 'karyawan' && <th className="py-4 px-3 text-right">Harga Modal Beli</th>}
                    <th className="py-4 px-3 text-right">Harga Jual Toko</th>
                    {userRole !== 'karyawan' && <th className="py-4 px-3 text-right text-emerald-700">Margin Laba</th>}
                    <th className="py-4 px-3 text-center">Sisa Stok</th>
                    <th className="py-4 px-6">IMEI Aktif di Toko</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={userRole === 'karyawan' ? 5 : 7} className="text-center py-12 text-slate-400">
                        Tidak ada kecocokan stok barang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => {
                      const profitMargin = prod.sellingPrice - prod.purchasePrice;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/40 transition duration-150" id={`stock-row-${prod.id}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                                <Smartphone className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-base">{prod.brand} {prod.modelName}</div>
                                <div className="text-xs text-slate-400 flex flex-wrap gap-2 mt-0.5 items-center">
                                  <span>Kapasitas: <strong className="text-slate-600">{prod.storage}</strong></span>
                                  <span>•</span>
                                  <span>Warna: <strong className="text-slate-600">{prod.color}</strong></span>
                                  <span>•</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    prod.signalType === 'iBox' ? 'bg-indigo-50 text-indigo-700' :
                                    prod.signalType === 'Beacukai' ? 'bg-emerald-50 text-emerald-700' :
                                    prod.signalType === 'Inter' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    Sinyal: {prod.signalType || 'iBox'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                              prod.condition === 'Baru' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {prod.condition}
                            </span>
                          </td>
                          {userRole !== 'karyawan' && (
                            <td className="py-4 px-3 text-right font-medium text-slate-600">
                              {formatIDR(prod.purchasePrice)}
                            </td>
                          )}
                          <td className="py-4 px-3 text-right font-bold text-slate-900">
                            {formatIDR(prod.sellingPrice)}
                          </td>
                          {userRole !== 'karyawan' && (
                            <td className="py-4 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                              {formatIDR(profitMargin)}
                              <span className="block text-[9px] text-slate-400 font-medium">
                                ({((profitMargin / prod.purchasePrice) * 100).toFixed(1)}% Laba)
                              </span>
                            </td>
                          )}
                          <td className="py-4 px-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                              prod.stock === 0 
                                ? 'bg-rose-100 text-rose-700' 
                                : prod.stock <= 2 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {prod.stock} unit
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {prod.imeis.length === 0 ? (
                              <span className="text-xs text-rose-500 font-bold">Habis / Sold Out</span>
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[280px]">
                                {prod.imeis.map(imei => (
                                  <span key={imei} className="bg-slate-50 text-slate-600 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200/50 flex items-center gap-1 shadow-3xs">
                                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                                    {imei}
                                  </span>
                                ))}
                              </div>
                            )}
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

      {/* VIEW 2: FORM CATAT BARANG MASUK */}
      {activeSubTab === 'form-masuk' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs max-w-3xl mx-auto animate-fade-in" id="barang-masuk-form-view">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{editingBmItem ? 'Edit Catatan Barang Masuk' : 'Form Pengadaan / Barang Masuk JK PHONE'}</h3>
              <p className="text-xs text-slate-500">{editingBmItem ? 'Mengubah detail catatan barang masuk dan memperbarui stok serta modal' : 'Mencatat pembelian hp baru atau bekas, mendata status sinyal operator, modal, dan menghitung laba rugi margin penjualan'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" id="add-stock-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method Selector */}
              <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200 gap-3" id="method-selector-container">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Metode Pengisian Produk
                  </label>
                  <p className="text-[10px] text-slate-400 font-medium">Pilih dari katalog master atau isi secara manual</p>
                </div>
                <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualInput(false);
                      if (masterProducts.length > 0) {
                        handleSelectMasterProduct(masterProducts[0].id);
                      }
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${!isManualInput ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-300/50'}`}
                  >
                    ⚡ Katalog Master
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualInput(true);
                      setSelectedMasterId('');
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${isManualInput ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-300/50'}`}
                  >
                    📝 Manual Mandiri
                  </button>
                </div>
              </div>

              {/* Tanggal Masuk */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tanggal Masuk</label>
                <input
                  id="form-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Supplier / Asal HP */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Barang Masuk Dari Mana (Supplier / Asal)</label>
                <input
                  id="form-supplier"
                  type="text"
                  placeholder="e.g. PT Sinar Distribusi, Lelangan, Budi, dll."
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                  required
                />
              </div>

              {!isManualInput ? (
                <>
                  {/* Dropdown by Katalog (Model / Tipe HP & Kapasitas) */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Model / Tipe HP & Kapasitas (Katalog)
                    </label>
                    <select
                      id="form-master-select"
                      value={selectedMasterId}
                      onChange={(e) => handleSelectMasterProduct(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    >
                      <option value="" disabled>-- Pilih Model & Kapasitas dari Katalog --</option>
                      {masterProducts.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.brand}] {m.modelName} • {m.storage}
                        </option>
                      ))}
                    </select>
                    {selectedMaster && (
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2 py-1 rounded">
                          Brand: {selectedMaster.brand}
                        </span>
                        <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2 py-1 rounded">
                          Storage: {selectedMaster.storage}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Warna Dropdown from Selected Master Product only */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Pilihan Warna (Warna Resmi Katalog)
                    </label>
                    {selectedMaster ? (
                      <div className="space-y-2">
                        <select
                          id="form-color-select"
                          value={selectedMaster.colors.includes(formColor) ? formColor : (formColor ? 'custom' : '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setFormColor('');
                            } else {
                              setFormColor(val);
                            }
                          }}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          required
                        >
                          <option value="" disabled>-- Pilih Warna Resmi --</option>
                          {selectedMaster.colors.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="custom">-- Input Warna Kustom --</option>
                        </select>
                        
                        {(!selectedMaster.colors.includes(formColor) || formColor === '') && (
                          <input
                            type="text"
                            placeholder="Ketik warna kustom..."
                            value={formColor}
                            onChange={(e) => setFormColor(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            required
                          />
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400 rounded-xl">
                        Pilih Model Katalog terlebih dahulu
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Brand Manual */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Brand HP</label>
                    <select
                      id="form-brand-select"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {(() => {
                        const DEFAULT_BRANDS = [
                          'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 
                          'Realme', 'Infinix', 'Itel', 'Tecno', 'Huawei', 
                          'ZTE', 'Poco', 'Motorola', 'Villaon', 'Honor', 'Lainnya'
                        ];
                        const saved = localStorage.getItem('tokohp_master_brands');
                        const brandsList = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
                        return brandsList.map((brand: string) => (
                          <option key={brand} value={brand}>
                            {brand === 'Apple' ? 'Apple (iPhone)' : brand}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  {/* Model HP Manual */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Model / Tipe HP</label>
                    <input
                      id="form-model"
                      type="text"
                      placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra, dst."
                      value={formModelName}
                      onChange={(e) => setFormModelName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  {/* Storage Manual */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Kapasitas Penyimpanan</label>
                    <select
                      id="form-storage"
                      value={formStorage}
                      onChange={(e) => setFormStorage(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="32GB">32GB</option>
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>

                  {/* Warna Manual */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Pilihan Warna</label>
                    <input
                      id="form-color"
                      type="text"
                      placeholder="e.g. Natural Titanium, Deep Purple, Phantom Black"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </>
              )}

              {/* Sinyal Operator */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Registrasi Sinyal / Garansi Bea Cukai</label>
                <select
                  id="form-signal-type"
                  value={formSignalType}
                  onChange={(e) => setFormSignalType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                >
                  <option value="iBox">Garansi Resmi Lokal iBox / TAM / GDN</option>
                  <option value="Beacukai">Inter - Terdaftar Bea Cukai Resmi (Sinyal Permanen)</option>
                  <option value="Inter">Inter - Sinyal Blokir / Sementara (Perlu Unlock)</option>
                  <option value="Xiaomi">Resmi Xiaomi Indonesia</option>
                  <option value="Oppo">Resmi Oppo Indonesia</option>
                  <option value="Vivo">Resmi Vivo Indonesia</option>
                  <option value="Lainnya">Lainnya / Global Non-Refurbished</option>
                </select>
              </div>

              {/* Kondisi */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Kondisi Fisik</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700">
                    <input
                      id="form-condition-baru"
                      type="radio"
                      name="condition"
                      checked={formCondition === 'Baru'}
                      onChange={() => setFormCondition('Baru')}
                      className="accent-indigo-600 h-4 w-4"
                    />
                    Baru (BNIB)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer font-medium text-slate-700">
                    <input
                      id="form-condition-bekas"
                      type="radio"
                      name="condition"
                      checked={formCondition === 'Bekas'}
                      onChange={() => setFormCondition('Bekas')}
                      className="accent-indigo-600 h-4 w-4"
                    />
                    Bekas (Second Hand)
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Quantity (Qty Unit)</label>
                <input
                  id="form-qty"
                  type="number"
                  min="1"
                  value={formQty}
                  onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                  required
                />
              </div>

              {/* Harga Beli Modal */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Harga Modal Beli per Unit (Harga Modal)</label>
                <input
                  id="form-purchase-price"
                  type="number"
                  min="0"
                  placeholder="Harga modal beli"
                  value={formPurchasePrice || ''}
                  onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Harga Jual */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Harga Jual per Unit (Harga Jual)</label>
                <input
                  id="form-selling-price"
                  type="number"
                  min="0"
                  placeholder="Harga jual toko standar"
                  value={formSellingPrice || ''}
                  onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Laba Rugi Calc */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Kalkulasi Keuntungan Modal (Laba Kotor)</label>
                <div className={`p-2.5 rounded-xl text-sm font-bold border ${
                  formSellingPrice > formPurchasePrice ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {formSellingPrice > formPurchasePrice ? (
                    <span>Laba: {formatIDR(formSellingPrice - formPurchasePrice)} / unit (Total: {formatIDR((formSellingPrice - formPurchasePrice) * formQty)})</span>
                  ) : (
                    <span>Buntung / Belum Untung: {formatIDR(formSellingPrice - formPurchasePrice)} / unit</span>
                  )}
                </div>
              </div>
            </div>

            {/* Serial / IMEI Inputs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Daftar Nomor IMEI HP (Pisahkan dengan baris baru untuk {formQty} unit)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="text-xs text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" /> Scan via Kamera
                  </button>
                  <span className="text-xs text-indigo-500 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                    Masukkan {formQty} IMEI
                  </span>
                </div>
              </div>
              <textarea
                id="form-imei-text"
                rows={3}
                placeholder="e.g.&#10;358901234567891&#10;358901234567892"
                value={formImeiInput}
                onChange={(e) => setFormImeiInput(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2"
                required
              />

              {/* Camera Scanner Modal Component */}
              <ImeiScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                mode="multiple"
                onScanSuccess={(val) => handleScanMultipleSuccess([val])}
                onScanMultipleSuccess={handleScanMultipleSuccess}
                title="Scan Barcode IMEI HP Masuk"
                placeholder="Arahkan kamera ke barcode IMEI pada boks HP. Scan beberapa barcode berturut-turut untuk dimasukkan ke antrean."
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Keterangan Tambahan</label>
              <input
                id="form-notes"
                type="text"
                placeholder="e.g. Pembelian batch pertama bulan ini, kelengkapan fullset box tipis"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
              <button
                id="btn-cancel-form"
                type="button"
                onClick={() => {
                  setActiveSubTab('stok');
                  setSelectedMasterId('');
                }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-semibold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-stock-form"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-xs cursor-pointer"
              >
                {editingBmItem ? 'Simpan Perubahan Barang Masuk' : 'Simpan Barang Masuk & Update Stok'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: RIWAYAT BARANG MASUK */}
      {activeSubTab === 'riwayat' && (
        <div className="space-y-4 animate-fade-in" id="riwayat-masuk-view">
          {/* Monthly Period and Search Filters */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari supplier, tipe hp, imei atau sinyal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-sm px-4 py-2 focus:outline-none"
              >
                <option value="Semua">Semua Periode Bulan</option>
                {uniquePeriods.filter(p => p !== 'Semua').map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto" id="riwayat-masuk-table-container">
              <table className="w-full text-left text-sm" id="riwayat-masuk-table">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold bg-slate-50/30">
                    <th className="py-3 px-6">Tanggal & Periode</th>
                    <th className="py-3 px-4">Informasi Barang & Sinyal</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Harga Modal</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-right">Kalkulasi Laba Kotor</th>
                    <th className="py-3 px-4">Supplier / Asal</th>
                    <th className="py-3 px-4">IMEI & Status Unit</th>
                    <th className="py-3 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBarangMasuk.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400">
                        Belum ada riwayat barang masuk tercatat pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    [...filteredBarangMasuk]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(item => {
                        const totalProfit = (item.sellingPrice - item.purchasePrice) * item.qty;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/30 transition duration-150" id={`riwayat-masuk-row-${item.id}`}>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{item.date}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Periode: {item.date.substring(0, 7)}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div>
                                <span className="font-semibold text-slate-800">{item.brand} {item.modelName}</span>
                                <span className="text-xs text-slate-500 ml-1">({item.storage} • {item.color})</span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.condition}</span>
                                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Sinyal: {item.signalType || 'iBox'}</span>
                                {item.notes && <span className="italic">"{item.notes}"</span>}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.qty} unit</td>
                            <td className="py-3.5 px-4 text-right font-medium text-slate-800">{formatIDR(item.purchasePrice)}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatIDR(item.sellingPrice)}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                              {formatIDR(totalProfit)}
                              <span className="block text-[9px] text-slate-400 font-normal">({formatIDR(item.sellingPrice - item.purchasePrice)} / unit)</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-bold">{item.supplier}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1 max-w-[200px]">
                                {item.imeis.map(imei => {
                                  const ready = isImeiReady(imei);
                                  return (
                                    <span key={imei} className={`font-mono text-[9px] px-1.5 py-0.5 rounded border flex items-center justify-between gap-1 ${
                                      ready 
                                        ? 'bg-indigo-50/40 text-indigo-700 border-indigo-100' 
                                        : 'bg-rose-50/40 text-rose-700 border-rose-100'
                                    }`}>
                                      <span>{imei}</span>
                                      <strong className="text-[8px] uppercase">{ready ? 'Ready' : 'Terjual'}</strong>
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                             <td className="py-3.5 px-6 text-center">
                               <div className="flex gap-1 justify-center">
                                 <button
                                   id={`btn-edit-bm-${item.id}`}
                                   onClick={() => startEditBm(item)}
                                   className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-400 transition cursor-pointer"
                                   title="Edit riwayat barang masuk"
                                 >
                                   <Edit className="h-4.5 w-4.5" />
                                 </button>
                                 <button
                                   id={`btn-del-bm-${item.id}`}
                                   onClick={() => {
                                     if (confirm('Apakah Anda yakin ingin menghapus catatan barang masuk ini? Stok barang akan disesuaikan kembali.')) {
                                       onDeleteBarangMasuk(item.id);
                                     }
                                   }}
                                   className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition cursor-pointer"
                                   title="Hapus riwayat barang masuk"
                                 >
                                   <Trash2 className="h-4.5 w-4.5" />
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
    </div>
  );
}
