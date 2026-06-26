import React, { useState } from 'react';
import { 
  PhoneProduct, 
  Expense, 
  Transaction, 
  AccessoryProduct, 
  SparepartProduct, 
  AccessorySparepartSale, 
  ImeiUnlockRequest, 
  ServiceNote, 
  BarangMasuk 
} from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  ShoppingBag, 
  Wrench, 
  KeyRound, 
  Layers, 
  Calendar, 
  FileText,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';

interface FinanceReportProps {
  products: PhoneProduct[];
  expenses: Expense[];
  transactions: Transaction[];
  accessories: AccessoryProduct[];
  spareparts: SparepartProduct[];
  accSales: AccessorySparepartSale[];
  unlockRequests: ImeiUnlockRequest[];
  serviceNotes: ServiceNote[];
  barangMasukList: BarangMasuk[];
}

export default function FinanceReport({
  products,
  expenses,
  transactions,
  accessories = [],
  spareparts = [],
  accSales = [],
  unlockRequests = [],
  serviceNotes = [],
  barangMasukList = []
}: FinanceReportProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // State to toggle active timeframe overview
  const [activeTimeframe, setActiveTimeframe] = useState<'today' | 'month' | 'year'>('today');

  // Dates Helper
  const getTodayStr = () => {
    // Return today in local timezone as YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getYearStr = () => {
    return String(new Date().getFullYear());
  };

  const todayStr = getTodayStr();
  const currentMonthStr = getMonthStr();
  const currentYearStr = getYearStr();

  // Price helper definitions
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

  const getAccessoryPurchasePrice = (item: any) => {
    const acc = accessories.find(a => a.id === item.itemId);
    if (acc) return acc.purchasePrice;
    return item.price * 0.6; // default fallback 40% margin
  };

  const getSparepartPurchasePrice = (item: any) => {
    const sp = spareparts.find(s => s.id === item.itemId);
    if (sp) return sp.purchasePrice;
    return item.price * 0.6; // default fallback 40% margin
  };

  // Helper function to extract and calculate financial metrics for a specific filter
  const calculateMetricsForFilter = (filterFn: (dateStr: string) => boolean) => {
    const periodTransactions = transactions.filter(t => filterFn(t.date));
    const periodAccSales = accSales.filter(s => filterFn(s.date));
    const periodUnlockRequests = unlockRequests.filter(r => filterFn(r.date));
    const periodServiceNotes = serviceNotes.filter(n => filterFn(n.date));
    const periodExpenses = expenses.filter(e => filterFn(e.date));
    const periodBarangMasuk = barangMasukList.filter(b => filterFn(b.date));

    // 1. Phone Omset
    const phoneOmset = periodTransactions
      .filter(tx => tx.status === 'Lunas')
      .reduce((sum, tx) => sum + tx.totalAmount, 0);

    // 2. Accessories & Spareparts Omset
    const accessoryOmset = periodAccSales.reduce((sum, s) => {
      return sum + s.items
        .filter(item => item.type === 'Aksesoris')
        .reduce((iSum, item) => iSum + item.total, 0);
    }, 0);

    const sparepartOmset = periodAccSales.reduce((sum, s) => {
      return sum + s.items
        .filter(item => item.type === 'Sparepart')
        .reduce((iSum, item) => iSum + item.total, 0);
    }, 0);

    // 3. Unlock IMEI Omset
    const unlockOmset = periodUnlockRequests
      .filter(r => r.status === 'Sukses')
      .reduce((sum, r) => sum + r.cost, 0);

    // 4. Services Omset
    const serviceOmset = periodServiceNotes
      .filter(n => n.status === 'Diambil' || n.status === 'Selesai')
      .reduce((sum, n) => sum + (n.actualCost || n.estimatedCost || 0), 0);

    // Total Omset
    const totalOmset = phoneOmset + accessoryOmset + sparepartOmset + unlockOmset + serviceOmset;

    // 5. Net Profit Phone
    const netProfitPhone = periodTransactions
      .filter(t => t.status === 'Lunas')
      .reduce((sum, t) => {
        const itemsProfit = t.items.reduce((pSum, item) => pSum + (item.price - getPhonePurchasePrice(item)), 0);
        return sum + itemsProfit - t.discount;
      }, 0);

    // 6. Net Profit Accessories
    const netProfitAccessories = periodAccSales.reduce((sum, s) => {
      const accProfit = s.items
        .filter(item => item.type === 'Aksesoris')
        .reduce((pSum, item) => pSum + (item.total - item.qty * getAccessoryPurchasePrice(item)), 0);
      return sum + accProfit;
    }, 0);

    // 7. Net Profit Spareparts
    const netProfitSpareparts = periodAccSales.reduce((sum, s) => {
      const spProfit = s.items
        .filter(item => item.type === 'Sparepart')
        .reduce((pSum, item) => pSum + (item.total - item.qty * getSparepartPurchasePrice(item)), 0);
      return sum + spProfit;
    }, 0);

    // 8. Operating Expenses (Operational Outflow)
    const totalOperatingExpense = periodExpenses.reduce((sum, exp) => sum + (exp.totalAmount || exp.amount || 0), 0);

    // 9. Total Laba Bersih Akhir (Final Net Profit)
    const netProfit = (netProfitPhone + netProfitAccessories + netProfitSpareparts + unlockOmset + serviceOmset) - totalOperatingExpense;

    // 10. Pengeluaran Beli HP / Aset (Capital Outflow for Inventory)
    const totalHpPurchaseCost = periodBarangMasuk.reduce((sum, item) => sum + (item.purchasePrice * item.qty), 0);
    const assetExpenses = periodExpenses
      .filter(exp => exp.category.toLowerCase().includes('aset') || exp.category.toLowerCase().includes('inventaris') || exp.category.toLowerCase().includes('ruko'))
      .reduce((sum, exp) => sum + (exp.totalAmount || exp.amount || 0), 0);
    
    const totalAssetAndHpSpending = totalHpPurchaseCost + assetExpenses;

    return {
      phoneOmset,
      accessoryOmset,
      sparepartOmset,
      unlockOmset,
      serviceOmset,
      totalOmset,
      netProfitPhone,
      netProfitAccessories,
      netProfitSpareparts,
      totalOperatingExpense,
      netProfit,
      totalHpPurchaseCost,
      assetExpenses,
      totalAssetAndHpSpending,
      transactionsCount: periodTransactions.length,
      expensesCount: periodExpenses.length,
      barangMasukCount: periodBarangMasuk.length
    };
  };

  // Filter Functions
  const isToday = (dateStr: string) => dateStr === todayStr;
  const isThisMonth = (dateStr: string) => dateStr.startsWith(currentMonthStr);
  const isThisYear = (dateStr: string) => dateStr.startsWith(currentYearStr);

  // Computed metrics for active views
  const todayMetrics = calculateMetricsForFilter(isToday);
  const monthMetrics = calculateMetricsForFilter(isThisMonth);
  const yearMetrics = calculateMetricsForFilter(isThisYear);

  const getActiveMetrics = () => {
    if (activeTimeframe === 'month') return monthMetrics;
    if (activeTimeframe === 'year') return yearMetrics;
    return todayMetrics;
  };

  const metrics = getActiveMetrics();

  // Prepare simple dynamic trend or timeline
  const getPeriodLabel = () => {
    if (activeTimeframe === 'today') return `Hari Ini (${todayStr})`;
    if (activeTimeframe === 'month') return `Bulan Ini (${currentMonthStr})`;
    return `Tahun Ini (${currentYearStr})`;
  };

  return (
    <div className="space-y-6" id="finance-report-tab">
      
      {/* Top Banner and Timeframe Toggles */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="finance-header-panel">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Laporan Keuangan JK PHONE</h2>
            <p className="text-xs text-slate-400 font-medium">Analisis omset, pengeluaran, pembelian HP, dan estimasi laba/rugi bersih</p>
          </div>
        </div>

        {/* Timeframe switchers */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100" id="finance-timeframe-switch">
          <button
            id="btn-tf-today"
            onClick={() => setActiveTimeframe('today')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTimeframe === 'today'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            id="btn-tf-month"
            onClick={() => setActiveTimeframe('month')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTimeframe === 'month'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            id="btn-tf-year"
            onClick={() => setActiveTimeframe('year')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTimeframe === 'year'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="finance-kpi-grid">
        
        {/* KPI: OMSET */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-44" id="card-omset">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Omset Penjualan</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5">{formatIDR(metrics.totalOmset)}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Dari semua unit & jasa</span>
            <span className="text-indigo-600 font-bold">{getPeriodLabel()}</span>
          </div>
        </div>

        {/* KPI: LABA / RUGI BERSIH */}
        <div className={`bg-white p-6 rounded-3xl border shadow-xs relative overflow-hidden flex flex-col justify-between h-44 ${
          metrics.netProfit >= 0 ? 'border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/10' : 'border-rose-100/80 bg-gradient-to-br from-white to-rose-50/10'
        }`} id="card-laba-rugi">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Laba / Rugi Bersih</p>
              <h3 className={`text-2xl font-black mt-1.5 ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatIDR(metrics.netProfit)}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${metrics.netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {metrics.netProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Omset dikurangi modal & operasional</span>
            <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {metrics.netProfit >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
        </div>

        {/* KPI: PENGELUARAN BELI HP & ASET */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between h-44" id="card-spending">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Beli HP & Aset / Inventaris</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1.5">{formatIDR(metrics.totalAssetAndHpSpending)}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Arus keluar modal / stok HP</span>
            <span className="text-amber-600 font-bold">{getPeriodLabel()}</span>
          </div>
        </div>

      </div>

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="finance-breakdown-details">
        
        {/* Source of Revenue List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4" id="revenue-sources-breakdown">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Rincian Sumber Pendapatan (Omset)</h4>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{getPeriodLabel()}</span>
          </div>

          <div className="space-y-3.5">
            {/* Phone Sales */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Penjualan Unit HP (Retail)</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Laba Kotor: {formatIDR(metrics.netProfitPhone)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{formatIDR(metrics.phoneOmset)}</p>
                <p className="text-[10px] text-slate-400 font-bold">{metrics.transactionsCount} Transaksi</p>
              </div>
            </div>

            {/* Accessories Sales */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Penjualan Aksesoris</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Laba Kotor: {formatIDR(metrics.netProfitAccessories)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{formatIDR(metrics.accessoryOmset)}</p>
              </div>
            </div>

            {/* Spareparts Sales */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Penjualan Spareparts</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Laba Kotor: {formatIDR(metrics.netProfitSpareparts)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{formatIDR(metrics.sparepartOmset)}</p>
              </div>
            </div>

            {/* Unlock IMEI */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Jasa Unlock IMEI</h5>
                  <p className="text-[10px] text-slate-400 font-medium">100% Margin (Jasa Murni)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{formatIDR(metrics.unlockOmset)}</p>
              </div>
            </div>

            {/* Servis HP */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Jasa Service / Servis HP</h5>
                  <p className="text-[10px] text-slate-400 font-medium">100% Margin (Jasa Murni)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{formatIDR(metrics.serviceOmset)}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Operating & Capital Outflows Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4" id="spending-breakdown">
          <h4 className="font-bold text-slate-900 text-sm">Rincian Arus Kas Keluar</h4>

          <div className="space-y-4">
            
            {/* Operational Expenses Block */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-rose-100/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Operasional & Gaji</span>
                <span className="text-xs font-black text-rose-600">{formatIDR(metrics.totalOperatingExpense)}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Biaya operasional bulanan seperti gaji karyawan, sewa, listrik, promosi, dan internet tercatat dalam {metrics.expensesCount} item pengeluaran.
              </p>
            </div>

            {/* Capital Outflows (Beli HP / Aset) Block */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-amber-100/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Belanja Stok HP Baru/Bekas</span>
                <span className="text-xs font-black text-amber-600">{formatIDR(metrics.totalHpPurchaseCost)}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Pembelian unit handphone baru atau bekas untuk stok penjualan yang tercatat dalam pengadaan/barang masuk ({metrics.barangMasukCount} kali pengadaan).
              </p>
            </div>

            {/* Belanja Aset Block */}
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-indigo-100/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Belanja Aset & Inventaris</span>
                <span className="text-xs font-black text-indigo-600">{formatIDR(metrics.assetExpenses)}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Pembelian aset tetap atau inventaris toko seperti renovasi, sewa ruko, etalase, CCTV, dll.
              </p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-normal flex gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Info Pembukuan:</strong> Pengeluaran modal pembelian HP dimasukkan ke dalam Valuasi Stok Toko (Aset Lancar), sementara Laba Bersih dihitung murni dari selisih Harga Jual dikurangi Modal pada unit yang <em>sudah terjual</em>.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Comparison table of Today, Month, Year */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="finance-comparison-panel">
        <h4 className="font-bold text-slate-900 text-sm mb-4">Perbandingan Kinerja Keuangan Multi-Periode</h4>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs" id="table-comparison">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Indikator Keuangan</th>
                <th className="py-3.5 px-6 text-right">Hari Ini</th>
                <th className="py-3.5 px-6 text-right">Bulan Ini</th>
                <th className="py-3.5 px-6 text-right">Tahun Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              <tr>
                <td className="py-3.5 px-6 font-bold text-slate-900">Total Omset (Semua Penjualan & Jasa)</td>
                <td className="py-3.5 px-6 text-right text-slate-900 font-bold">{formatIDR(todayMetrics.totalOmset)}</td>
                <td className="py-3.5 px-6 text-right text-slate-900 font-bold">{formatIDR(monthMetrics.totalOmset)}</td>
                <td className="py-3.5 px-6 text-right text-slate-900 font-bold">{formatIDR(yearMetrics.totalOmset)}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 text-slate-500">└ Omset Penjualan Unit HP</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(todayMetrics.phoneOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(monthMetrics.phoneOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(yearMetrics.phoneOmset)}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 text-slate-500">└ Omset Aksesoris & Sparepart</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(todayMetrics.accessoryOmset + todayMetrics.sparepartOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(monthMetrics.accessoryOmset + monthMetrics.sparepartOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(yearMetrics.accessoryOmset + yearMetrics.sparepartOmset)}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 text-slate-500">└ Omset Jasa Service & Unlock IMEI</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(todayMetrics.serviceOmset + todayMetrics.unlockOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(monthMetrics.serviceOmset + monthMetrics.unlockOmset)}</td>
                <td className="py-3.5 px-6 text-right">{formatIDR(yearMetrics.serviceOmset + yearMetrics.unlockOmset)}</td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-3.5 px-6 font-bold text-slate-900">Total Laba Bersih Penjualan (Kotor)</td>
                <td className="py-3.5 px-6 text-right text-emerald-600 font-bold">{formatIDR(todayMetrics.netProfitPhone + todayMetrics.netProfitAccessories + todayMetrics.netProfitSpareparts + todayMetrics.unlockOmset + todayMetrics.serviceOmset)}</td>
                <td className="py-3.5 px-6 text-right text-emerald-600 font-bold">{formatIDR(monthMetrics.netProfitPhone + monthMetrics.netProfitAccessories + monthMetrics.netProfitSpareparts + monthMetrics.unlockOmset + monthMetrics.serviceOmset)}</td>
                <td className="py-3.5 px-6 text-right text-emerald-600 font-bold">{formatIDR(yearMetrics.netProfitPhone + yearMetrics.netProfitAccessories + yearMetrics.netProfitSpareparts + yearMetrics.unlockOmset + yearMetrics.serviceOmset)}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 text-slate-500">└ Pengeluaran Biaya Operasional (Gaji, dll)</td>
                <td className="py-3.5 px-6 text-right text-rose-500">-{formatIDR(todayMetrics.totalOperatingExpense)}</td>
                <td className="py-3.5 px-6 text-right text-rose-500">-{formatIDR(monthMetrics.totalOperatingExpense)}</td>
                <td className="py-3.5 px-6 text-right text-rose-500">-{formatIDR(yearMetrics.totalOperatingExpense)}</td>
              </tr>
              <tr className="bg-emerald-50/20 font-extrabold">
                <td className="py-3.5 px-6 text-emerald-800">Laba / Rugi Bersih Final (Net Profit)</td>
                <td className={`py-3.5 px-6 text-right ${todayMetrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatIDR(todayMetrics.netProfit)}</td>
                <td className={`py-3.5 px-6 text-right ${monthMetrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatIDR(monthMetrics.netProfit)}</td>
                <td className={`py-3.5 px-6 text-right ${yearMetrics.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatIDR(yearMetrics.netProfit)}</td>
              </tr>
              <tr className="bg-amber-50/10">
                <td className="py-3.5 px-6 font-bold text-amber-800">Pengeluaran Beli HP / Aset</td>
                <td className="py-3.5 px-6 text-right text-amber-600 font-bold">{formatIDR(todayMetrics.totalAssetAndHpSpending)}</td>
                <td className="py-3.5 px-6 text-right text-amber-600 font-bold">{formatIDR(monthMetrics.totalAssetAndHpSpending)}</td>
                <td className="py-3.5 px-6 text-right text-amber-600 font-bold">{formatIDR(yearMetrics.totalAssetAndHpSpending)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
