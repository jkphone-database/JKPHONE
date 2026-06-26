import React, { useState } from 'react';
import { 
  PhoneProduct, 
  Expense, 
  Transaction, 
  BcaMutation,
  AccessoryProduct,
  SparepartProduct,
  AccessorySparepartSale,
  ImeiUnlockRequest,
  ServiceNote,
  BarangMasuk
} from '../types';
import { 
  TrendingUp, 
  ArrowDownRight, 
  Smartphone, 
  DollarSign, 
  AlertCircle, 
  FileText, 
  CheckCircle2,
  Tag,
  Wrench,
  KeyRound,
  Layers,
  Sparkles,
  ClipboardList,
  Calendar,
  Filter
} from 'lucide-react';

interface DashboardProps {
  products: PhoneProduct[];
  expenses: Expense[];
  transactions: Transaction[];
  mutations: BcaMutation[];
  onTabChange: (tab: string) => void;
  accessories: AccessoryProduct[];
  spareparts: SparepartProduct[];
  accSales: AccessorySparepartSale[];
  unlockRequests: ImeiUnlockRequest[];
  serviceNotes: ServiceNote[];
  barangMasukList: BarangMasuk[];
}

export default function Dashboard({ 
  products, 
  expenses, 
  transactions, 
  mutations, 
  onTabChange,
  accessories = [],
  spareparts = [],
  accSales = [],
  unlockRequests = [],
  serviceNotes = [],
  barangMasukList = []
}: DashboardProps) {
  // Format currency helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // State for filtering period
  const [filterType, setFilterType] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-12-31');

  // Check if a date string falls within the selected period
  const isInPeriod = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    
    // dateStr is in YYYY-MM-DD format (e.g. 2026-06-25)
    const parts = dateStr.split('-');
    if (parts.length !== 3) return true;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // 0-indexed month
    const d = parseInt(parts[2], 10);
    
    const itemTime = new Date(y, m, d).getTime();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (filterType === 'all') {
      return true;
    }
    if (filterType === 'this-month') {
      const startOfMonth = new Date(currentYear, currentMonth, 1).getTime();
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();
      return itemTime >= startOfMonth && itemTime <= endOfMonth;
    }
    if (filterType === 'this-year') {
      const startOfYear = new Date(currentYear, 0, 1).getTime();
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999).getTime();
      return itemTime >= startOfYear && itemTime <= endOfYear;
    }
    if (filterType === 'y2026') {
      // Preset Januari 2026 s/d Desember 2026
      const startOf2026 = new Date(2026, 0, 1).getTime();
      const endOf2026 = new Date(2026, 11, 31, 23, 59, 59, 999).getTime();
      return itemTime >= startOf2026 && itemTime <= endOf2026;
    }
    if (filterType === 'y2026-next') {
      // Preset Januari 2026 s/d tahun-tahun berikut (2026 - 2027 dan seterusnya)
      const startOf2026 = new Date(2026, 0, 1).getTime();
      const endOf2027 = new Date(2027, 11, 31, 23, 59, 59, 999).getTime();
      return itemTime >= startOf2026 && itemTime <= endOf2027;
    }
    if (filterType === 'custom') {
      if (!customStartDate || !customEndDate) return true;
      
      const sParts = customStartDate.split('-');
      const eParts = customEndDate.split('-');
      
      if (sParts.length === 3 && eParts.length === 3) {
        const sy = parseInt(sParts[0], 10);
        const sm = parseInt(sParts[1], 10) - 1;
        const sd = parseInt(sParts[2], 10);
        
        const ey = parseInt(eParts[0], 10);
        const em = parseInt(eParts[1], 10) - 1;
        const ed = parseInt(eParts[2], 10);
        
        const startLimit = new Date(sy, sm, sd, 0, 0, 0, 0).getTime();
        const endLimit = new Date(ey, em, ed, 23, 59, 59, 999).getTime();
        
        return itemTime >= startLimit && itemTime <= endLimit;
      }
    }
    return true;
  };

  // Filtered lists based on period
  const filteredTransactions = transactions.filter(t => isInPeriod(t.date));
  const filteredAccSales = accSales.filter(s => isInPeriod(s.date));
  const filteredUnlockRequests = unlockRequests.filter(r => isInPeriod(r.date));
  const filteredServiceNotes = serviceNotes.filter(n => isInPeriod(n.date));
  const filteredExpenses = expenses.filter(e => isInPeriod(e.date));

  // ================= FINANCIAL CALCULATIONS (FILTERED) =================

  // 1. Phone Sales Omset
  const phoneOmset = filteredTransactions
    .filter(tx => tx.status === 'Lunas')
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  // 2. Accessories & Spareparts Omset
  const accessoryOmset = filteredAccSales.reduce((sum, s) => {
    return sum + s.items
      .filter(item => item.type === 'Aksesoris')
      .reduce((iSum, item) => iSum + item.total, 0);
  }, 0);

  const sparepartOmset = filteredAccSales.reduce((sum, s) => {
    return sum + s.items
      .filter(item => item.type === 'Sparepart')
      .reduce((iSum, item) => iSum + item.total, 0);
  }, 0);

  // 3. Unlock IMEI Omset
  const unlockOmset = filteredUnlockRequests
    .filter(r => r.status === 'Sukses')
    .reduce((sum, r) => sum + r.cost, 0);

  // 4. HP Service/Servis Omset
  const serviceOmset = filteredServiceNotes
    .filter(n => n.status === 'Diambil' || n.status === 'Selesai')
    .reduce((sum, n) => sum + (n.actualCost || n.estimatedCost || 0), 0);

  // --- Total Omset ---
  const totalOmset = phoneOmset + accessoryOmset + sparepartOmset + unlockOmset + serviceOmset;

  // 5. Total Laba Bersih Penjualan HP (Revenues - Purchase Costs - Discounts)
  const getPhonePurchasePrice = (item: any) => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) return prod.purchasePrice;
    
    const bm = barangMasukList.find(b => 
      b.brand.toLowerCase() === item.brand.toLowerCase() &&
      b.modelName.toLowerCase() === item.modelName.toLowerCase() &&
      b.storage === item.storage &&
      b.color.toLowerCase() === item.color.toLowerCase()
    );
    if (bm) return bm.purchasePrice;
    
    return item.price * 0.85; // default fallback 15% margin
  };

  const totalLabaBersihPenjualan = filteredTransactions
    .filter(t => t.status === 'Lunas')
    .reduce((sum, t) => {
      const itemsProfit = t.items.reduce((pSum, item) => pSum + (item.price - getPhonePurchasePrice(item)), 0);
      return sum + itemsProfit - t.discount;
    }, 0);

  // 6. Total Laba Bersih Aksesoris (Selling Price - Purchase Cost)
  const getAccessoryPurchasePrice = (item: any) => {
    const acc = accessories.find(a => a.id === item.itemId);
    if (acc) return acc.purchasePrice;
    return item.price * 0.6; // default fallback 40% margin
  };

  const totalLabaBersihAksesoris = filteredAccSales.reduce((sum, s) => {
    const accProfit = s.items
      .filter(item => item.type === 'Aksesoris')
      .reduce((pSum, item) => pSum + (item.total - item.qty * getAccessoryPurchasePrice(item)), 0);
    return sum + accProfit;
  }, 0);

  // 7. Total Laba Bersih Spareparts (Selling Price - Purchase Cost)
  const getSparepartPurchasePrice = (item: any) => {
    const sp = spareparts.find(s => s.id === item.itemId);
    if (sp) return sp.purchasePrice;
    return item.price * 0.6; // default fallback 40% margin
  };

  const totalLabaBersihSpareparts = filteredAccSales.reduce((sum, s) => {
    const spProfit = s.items
      .filter(item => item.type === 'Sparepart')
      .reduce((pSum, item) => pSum + (item.total - item.qty * getSparepartPurchasePrice(item)), 0);
    return sum + spProfit;
  }, 0);

  // 8. Total Pengeluaran
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + (exp.totalAmount || exp.amount || 0), 0);

  // 9. Laba Bersih Akhir (Final Net Profit)
  // Jasa Unlock & Servis HP are computed with 100% margin here since they represent service fees (pure profit)
  const netProfit = (totalLabaBersihPenjualan + totalLabaBersihAksesoris + totalLabaBersihSpareparts + unlockOmset + serviceOmset) - totalExpense;

  // Aset & Stock values
  const totalStockCount = products.reduce((sum, prod) => sum + prod.stock, 0);
  const totalStockValuation = products.reduce((sum, prod) => sum + (prod.purchasePrice * prod.stock), 0);

  const pendingTransactions = transactions.filter(tx => tx.status === 'Pending');
  const unmatchedBcaMutations = mutations.filter(m => m.type === 'CR' && m.status === 'Unmatched');

  // Low stock products warning (stok <= 1)
  const lowStockProducts = products.filter(p => p.stock <= 1);

  // Recent transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Header and Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" id="dashboard-filter-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Ringkasan Keuangan Toko</h2>
            <p className="text-xs text-slate-400 font-medium">Analisis real-time omset, pengeluaran, dan laba bersih</p>
          </div>
        </div>

        {/* Period Selector Panel */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" id="period-selector-ui">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 font-bold bg-slate-50 p-1.5 rounded-2xl border border-slate-100" id="period-options">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'all' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('y2026')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'y2026' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Jan - Des 2026
            </button>
            <button
              onClick={() => setFilterType('y2026-next')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'y2026-next' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
              title="Januari 2026 sampai tahun berikut"
            >
              Jan 2026 - Depan
            </button>
            <button
              onClick={() => setFilterType('this-month')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'this-month' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setFilterType('this-year')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'this-year' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Tahun Ini
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterType === 'custom' ? 'bg-indigo-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Kustom 📅
            </button>
          </div>

          {filterType === 'custom' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 animate-fadeIn" id="custom-date-inputs">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase px-1">Mulai</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase px-1">Sampai</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        {/* Total Omset */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200" id="card-omset">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-[10px] font-black tracking-wider uppercase">TOTAL OMSET (SEMUA SEGMEN)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2 font-sans tracking-tight">
                {formatIDR(totalOmset)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center justify-between">
            <span>HP, Aksesoris, Jasa & Servis</span>
            <span className="font-bold text-slate-500">Omset</span>
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200" id="card-expense">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-[10px] font-black tracking-wider uppercase">TOTAL PENGELUARAN OPERASIONAL</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2 font-sans tracking-tight">
                {formatIDR(totalExpense)}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center justify-between">
            <span>Listrik, ruko, gaji, dll.</span>
            <span className="font-bold text-rose-500">Cost</span>
          </p>
        </div>

        {/* Laba Bersih Akhir */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200" id="card-profit">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-[10px] font-black tracking-wider uppercase">LABA BERSIH BERSIH AKHIR</p>
              <h3 className={`text-2xl font-black mt-2 font-sans tracking-tight ${netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                {formatIDR(netProfit)}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center justify-between">
            <span>Laba kotor dikurangi biaya</span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>Profit Net</span>
          </p>
        </div>

        {/* Aset Stok HP */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200" id="card-stock">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-[10px] font-black tracking-wider uppercase">NILAI ASET STOK HP AKTIF</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans tracking-tight">
                {formatIDR(totalStockValuation)}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Smartphone className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex justify-between items-center">
            <span>Total unit siap jual:</span>
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{totalStockCount} unit</span>
          </p>
        </div>
      </div>

      {/* Actionable Alerts for Bank reconciliation & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="alerts-row">
        {/* Bank & Reconciliation Alert Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden" id="card-reconciliation">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="h-6 w-6 text-indigo-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">Penyelarasan Mutasi BCA</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Anda memiliki <span className="text-amber-400 font-bold">{unmatchedBcaMutations.length} mutasi masuk BCA</span> yang belum dihubungkan dengan Transaksi Penjualan. Segera selaraskan untuk validitas pembukuan.
              </p>
              <div className="pt-3 flex gap-2">
                <button
                  id="btn-goto-mutation"
                  onClick={() => onTabChange('bca')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Selaraskan Mutasi Sekarang
                </button>
                {pendingTransactions.length > 0 && (
                  <span className="text-xs bg-white/10 text-slate-200 px-3 py-2 rounded-xl flex items-center">
                    {pendingTransactions.length} Invoice Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="card-low-stock">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-md">Peringatan Stok HP Menipis</h3>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
              {lowStockProducts.length} Item
            </span>
          </div>

          <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-50 pr-1" id="low-stock-list">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Semua stok barang tercukupi dengan baik 👍
              </div>
            ) : (
              lowStockProducts.map(prod => (
                <div key={prod.id} className="py-2.5 flex justify-between items-center text-sm" id={`low-stock-item-${prod.id}`}>
                  <div>
                    <span className="font-medium text-slate-800">{prod.brand} {prod.modelName}</span>
                    <span className="text-xs text-slate-400 ml-1">({prod.storage} • {prod.color} • {prod.condition})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prod.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      Sisa {prod.stock} unit
                    </span>
                    <button
                      id={`btn-restock-${prod.id}`}
                      onClick={() => onTabChange('stock')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Tambah Stok
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Transactions & Cashflow Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-lower-grid">
        {/* Recent Transactions list */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2" id="card-recent-tx">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 text-md flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              Transaksi Terkini
            </h3>
            <button
              id="btn-view-all-tx"
              onClick={() => onTabChange('transactions')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto" id="recent-tx-table-container">
            <table className="w-full text-left text-sm" id="recent-tx-table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3">No. Invoice</th>
                  <th className="py-3">Pelanggan</th>
                  <th className="py-3">Tanggal</th>
                  <th className="py-3">Pembayaran</th>
                  <th className="py-3 text-right">Total</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition duration-150" id={`recent-tx-row-${tx.id}`}>
                      <td className="py-3 font-semibold text-slate-800">{tx.invoiceNumber}</td>
                      <td className="py-3 text-slate-700">{tx.customerName}</td>
                      <td className="py-3 text-slate-500">{tx.date}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">{formatIDR(tx.totalAmount)}</td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Struktur Keuangan Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="card-cashflow-vis">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5 mb-5 pb-3 border-b border-slate-100">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Struktur Keuangan
          </h3>
          
          <div className="space-y-4" id="struktur-keuangan-container">
            {/* 1. Total Omset */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 transition hover:bg-slate-100/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Omset</span>
                </div>
                <span className="text-sm font-black text-slate-900">{formatIDR(totalOmset)}</span>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1 text-[8.5px] text-slate-400 font-extrabold text-center uppercase tracking-wider">
                <div className="bg-white p-1 rounded-md border border-slate-200/50">
                  <div className="text-[7.5px] text-slate-400">HP</div>
                  <div className="text-slate-700 mt-0.5">{formatIDR(phoneOmset)}</div>
                </div>
                <div className="bg-white p-1 rounded-md border border-slate-200/50">
                  <div className="text-[7.5px] text-slate-400">Aks</div>
                  <div className="text-slate-700 mt-0.5">{formatIDR(accessoryOmset)}</div>
                </div>
                <div className="bg-white p-1 rounded-md border border-slate-200/50">
                  <div className="text-[7.5px] text-slate-400">Spr</div>
                  <div className="text-slate-700 mt-0.5">{formatIDR(sparepartOmset)}</div>
                </div>
                <div className="bg-white p-1 rounded-md border border-slate-200/50">
                  <div className="text-[7.5px] text-slate-400">Srv</div>
                  <div className="text-slate-700 mt-0.5">{formatIDR(serviceOmset)}</div>
                </div>
                <div className="bg-white p-1 rounded-md border border-slate-200/50">
                  <div className="text-[7.5px] text-slate-400">Unl</div>
                  <div className="text-slate-700 mt-0.5">{formatIDR(unlockOmset)}</div>
                </div>
              </div>
            </div>

            {/* 2. Total Laba Bersih Penjualan HP */}
            <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 transition hover:bg-emerald-50/70">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Laba HP</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-800 block">{formatIDR(totalLabaBersihPenjualan)}</span>
                  <span className="text-[9px] text-slate-400 font-semibold block">
                    Eff: {phoneOmset > 0 ? `${((totalLabaBersihPenjualan / phoneOmset) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Total Laba Bersih Aksesories */}
            <div className="p-3 bg-teal-50/40 rounded-2xl border border-teal-100/50 transition hover:bg-teal-50/70">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Laba Aksesoris</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-teal-800 block">{formatIDR(totalLabaBersihAksesoris)}</span>
                  <span className="text-[9px] text-slate-400 font-semibold block">
                    Eff: {accessoryOmset > 0 ? `${((totalLabaBersihAksesoris / accessoryOmset) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Total Laba Bersih Spareparts */}
            <div className="p-3 bg-sky-50/40 rounded-2xl border border-sky-100/50 transition hover:bg-sky-50/70">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Laba Sparepart</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-sky-800 block">{formatIDR(totalLabaBersihSpareparts)}</span>
                  <span className="text-[9px] text-slate-400 font-semibold block">
                    Eff: {sparepartOmset > 0 ? `${((totalLabaBersihSpareparts / sparepartOmset) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Total Pengeluaran */}
            <div className="p-3 bg-rose-50/40 rounded-2xl border border-rose-100/50 transition hover:bg-rose-50/70">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Total Pengeluaran</span>
                </div>
                <span className="text-sm font-black text-rose-800">{formatIDR(totalExpense)}</span>
              </div>
            </div>

            {/* Final Laba Bersih Bersih Summary Footer inside Section */}
            <div className="pt-3.5 mt-2 border-t border-slate-100">
              <div className="p-3.5 bg-indigo-900 text-white rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Laba Bersih Toko</div>
                  <div className="text-[8px] text-indigo-400 font-semibold leading-none">Setelah dipotong Pengeluaran</div>
                </div>
                <div className="text-right">
                  <span className="text-md font-black">{formatIDR(netProfit)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
