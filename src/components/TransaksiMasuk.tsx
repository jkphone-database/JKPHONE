import React, { useState } from 'react';
import { PhoneProduct, Transaction, TransactionItem, BcaMutation } from '../types';
import { Plus, Search, FileText, ShoppingCart, User, Printer, CheckCircle2, AlertCircle, X, Trash2, Smartphone, Camera, Edit, Mail, Share2 } from 'lucide-react';
import ImeiScannerModal from './ImeiScannerModal';

interface TransaksiMasukProps {
  products: PhoneProduct[];
  transactions: Transaction[];
  mutations: BcaMutation[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'invoiceNumber'>) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function TransaksiMasuk({
  products,
  transactions,
  mutations,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}: TransaksiMasukProps) {

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
  
  // Invoice Preview State
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // Form POS State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedImei, setSelectedImei] = useState('');
  const [customPrice, setCustomPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Debit' | 'Transfer BCA' | 'Lainnya' | 'Kredivo' | 'ShopeePay' | 'Yes Credit' | 'Split'>('Tunai');
  const [status, setStatus] = useState<'Lunas' | 'Pending'>('Lunas');
  const [notes, setNotes] = useState('');

  // Split payment state details
  const [splitCashAmount, setSplitCashAmount] = useState(0);
  const [splitTransferAmount, setSplitTransferAmount] = useState(0);
  const [splitCreditAmount, setSplitCreditAmount] = useState(0);
  const [splitCreditProvider, setSplitCreditProvider] = useState('Kredivo');

  // Editing transaction
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Cart / Items list
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleImeiScanSuccess = (scannedImei: string) => {
    const foundProduct = products.find(p => p.imeis.includes(scannedImei));
    if (foundProduct) {
      setSelectedProductId(foundProduct.id);
      setSelectedImei(scannedImei);
      setCustomPrice(foundProduct.sellingPrice);
      alert(`Berhasil menemukan & memilih produk: ${foundProduct.brand} ${foundProduct.modelName} (IMEI: ${scannedImei})!`);
    } else {
      alert(`IMEI "${scannedImei}" tidak ditemukan di dalam daftar stok toko, atau sudah terjual.`);
    }
  };

  // List of products that actually have stock
  const availableProducts = products.filter(p => p.stock > 0);

  // Selected product details for form
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Handle product selection to prefill pricing and trigger IMEI options
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setCustomPrice(prod.sellingPrice);
      setSelectedImei(prod.imeis[0] || '');
    } else {
      setCustomPrice(0);
      setSelectedImei('');
    }
  };

  // Add Item to Temporary Cart
  const handleAddItemToCart = () => {
    if (!selectedProductId || !selectedImei) {
      alert('Silakan pilih tipe HP dan IMEI yang akan dijual!');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Avoid adding the exact same IMEI twice
    if (cart.some(item => item.imei === selectedImei)) {
      alert('IMEI ini sudah ada di dalam keranjang!');
      return;
    }

    const newItem: TransactionItem = {
      productId: prod.id,
      brand: prod.brand,
      modelName: prod.modelName,
      storage: prod.storage,
      color: prod.color,
      condition: prod.condition,
      imei: selectedImei,
      price: customPrice,
      signalType: prod.signalType || 'iBox'
    };

    setCart([...cart, newItem]);
    
    // Reset product selection in form
    setSelectedProductId('');
    setSelectedImei('');
    setCustomPrice(0);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Calculate Cart Subtotal
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartTotal = Math.max(0, cartSubtotal - discount);

  const startEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setCustName(tx.customerName);
    setCustPhone(tx.customerPhone || '');
    setCustEmail(tx.customerEmail || '');
    setCart(tx.items);
    setDiscount(tx.discount);
    setPaymentMethod(tx.paymentMethod);
    setStatus(tx.status);
    setNotes(tx.notes || '');
    if (tx.paymentSplit) {
      setSplitCashAmount(tx.paymentSplit.cashAmount);
      setSplitTransferAmount(tx.paymentSplit.transferAmount);
      setSplitCreditAmount(tx.paymentSplit.creditAmount);
      setSplitCreditProvider(tx.paymentSplit.creditProvider || 'Kredivo');
    } else {
      setSplitCashAmount(0);
      setSplitTransferAmount(0);
      setSplitCreditAmount(0);
      setSplitCreditProvider('Kredivo');
    }
    setActiveSubTab('buat');
  };

  // Handle Checkout Submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Keranjang penjualan masih kosong! Tambahkan minimal 1 HP.');
      return;
    }

    if (!custName.trim()) {
      alert('Silakan isi Nama Pelanggan!');
      return;
    }

    if (paymentMethod === 'Split') {
      const sumSplit = Number(splitCashAmount) + Number(splitTransferAmount) + Number(splitCreditAmount);
      if (sumSplit !== cartTotal) {
        alert(`Jumlah pembayaran split (${formatIDR(sumSplit)}) tidak sama dengan total tagihan (${formatIDR(cartTotal)}). Harap sesuaikan!\nTunai: ${formatIDR(splitCashAmount)}\nTransfer BCA: ${formatIDR(splitTransferAmount)}\nKredit: ${formatIDR(splitCreditAmount)}`);
        return;
      }
    }

    const splitData = paymentMethod === 'Split' ? {
      cashAmount: Number(splitCashAmount),
      transferAmount: Number(splitTransferAmount),
      creditAmount: Number(splitCreditAmount),
      creditProvider: splitCreditProvider
    } : undefined;

    if (editingTransaction) {
      onEditTransaction({
        ...editingTransaction,
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        customerEmail: custEmail.trim(),
        items: cart,
        discount: Number(discount),
        totalAmount: cartTotal,
        paymentMethod,
        status,
        notes: notes.trim(),
        paymentSplit: splitData
      });
      setEditingTransaction(null);
      alert('Invoice penjualan JK PHONE berhasil diperbarui!');
    } else {
      onAddTransaction({
        date: new Date().toISOString().split('T')[0],
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        customerEmail: custEmail.trim(),
        items: cart,
        discount: Number(discount),
        totalAmount: cartTotal,
        paymentMethod,
        status,
        notes: notes.trim(),
        paymentSplit: splitData
      });
      alert('Invoice penjualan JK PHONE berhasil dibuat! Stok barang telah berkurang.');
    }

    // Reset Form & state
    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCart([]);
    setDiscount(0);
    setPaymentMethod('Tunai');
    setStatus('Lunas');
    setNotes('');
    setSplitCashAmount(0);
    setSplitTransferAmount(0);
    setSplitCreditAmount(0);
    setSplitCreditProvider('Kredivo');
    
    // Redirect
    setActiveSubTab('daftar');
  };

  // Filter Transactions for Listing
  const filteredTransactions = transactions.filter(tx => {
    return (
      tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.items.some(item => `${item.brand} ${item.modelName} ${item.imei}`.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6" id="tx-masuk-section-wrapper">
      {/* Tab Nav */}
      <div className="flex border-b border-slate-100" id="tx-tabs-nav">
        <button
          id="btn-tx-tab-daftar"
          onClick={() => setActiveSubTab('daftar')}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeSubTab === 'daftar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Daftar Barang Keluar / Invoice Penjualan
        </button>
        <button
          id="btn-tx-tab-buat"
          onClick={() => {
            setEditingTransaction(null);
            setCustName('');
            setCustPhone('');
            setCustEmail('');
            setCart([]);
            setDiscount(0);
            setPaymentMethod('Tunai');
            setStatus('Lunas');
            setNotes('');
            setSplitCashAmount(0);
            setSplitTransferAmount(0);
            setSplitCreditAmount(0);
            setSplitCreditProvider('Kredivo');
            setActiveSubTab('buat');
          }}
          className={`pb-4 px-6 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'buat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Plus className="h-4 w-4" /> Kasir Penjualan HP (Checkout)
        </button>
      </div>

      {/* VIEW 1: DAFTAR INVOICE PENJUALAN */}
      {activeSubTab === 'daftar' && (
        <div className="space-y-4 animate-fade-in" id="tx-list-view">
          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex gap-3" id="tx-search-container">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="tx-search-input"
                type="text"
                placeholder="Cari nomor nota, nama pelanggan, imei, tipe HP, atau jenis pembayaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="tx-table-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="tx-table">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4 px-6">No. Invoice / Nota</th>
                    <th className="py-4 px-4">Tanggal Jual</th>
                    <th className="py-4 px-4">Nama & No HP Customer</th>
                    <th className="py-4 px-4">Detail HP & Sinyal</th>
                    <th className="py-4 px-4 text-right">Harga Jual</th>
                    <th className="py-4 px-4">Pembayaran Melalui</th>
                    <th className="py-4 px-4 text-center">Rekonsiliasi BCA</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Belum ada barang keluar / invoice penjualan tercatat.
                      </td>
                    </tr>
                  ) : (
                    [...filteredTransactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(tx => {
                        const isBcaReconciled = tx.paymentMethod === 'Transfer BCA' && tx.bcaMutationId;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/40 transition duration-150" id={`tx-row-${tx.id}`}>
                            <td className="py-4 px-6 font-extrabold text-slate-900">{tx.invoiceNumber}</td>
                            <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-800">{tx.customerName}</div>
                              <div className="text-xs text-slate-500">{tx.customerPhone || 'Tanpa No. HP'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                {tx.items.map((item, idx) => (
                                  <div key={idx} className="text-xs bg-slate-50 p-1.5 rounded border border-slate-100">
                                    <div className="font-bold text-slate-700">{item.brand} {item.modelName} ({item.storage} • {item.color})</div>
                                    <div className="text-[10px] text-indigo-600 font-bold">Sinyal: {item.signalType || 'iBox'}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">IMEI: {item.imei}</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="font-extrabold text-indigo-700">{formatIDR(tx.totalAmount)}</div>
                              {tx.discount > 0 && (
                                <div className="text-[10px] text-rose-500 font-medium">Potongan -{formatIDR(tx.discount)}</div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold block w-fit shadow-3xs">
                                {tx.paymentMethod === 'Tunai' ? 'CASH' : tx.paymentMethod === 'Transfer BCA' ? 'Transfer / Qris' : tx.paymentMethod}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1 block">Status: <strong>{tx.status}</strong></span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {tx.paymentMethod !== 'Transfer BCA' ? (
                                <span className="text-xs text-slate-400">-</span>
                              ) : isBcaReconciled ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                  <CheckCircle2 className="h-3 w-3" /> Rekonsiliasi OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                  <AlertCircle className="h-3 w-3" /> Perlu Dicocokkan
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex gap-1 justify-center items-center">
                                <button
                                  id={`btn-view-invoice-${tx.id}`}
                                  onClick={() => setSelectedInvoice(tx)}
                                  className="p-1.5 hover:bg-slate-100 text-indigo-600 rounded-lg transition cursor-pointer"
                                  title="Cetak & Lihat Invoice"
                                >
                                  <Printer className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  id={`btn-edit-invoice-${tx.id}`}
                                  onClick={() => startEditTransaction(tx)}
                                  className="p-1.5 hover:bg-slate-100 text-amber-600 rounded-lg transition cursor-pointer"
                                  title="Edit Invoice"
                                >
                                  <Edit className="h-4.5 w-4.5" />
                                </button>
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${tx.customerPhone ? tx.customerPhone.replace(/\D/g, '') : ''}&text=${encodeURIComponent(
                                    `Halo Kak ${tx.customerName},\n\nTerima kasih telah berbelanja di JK PHONE. Berikut detail transaksi Anda:\n\n*Nota:* ${tx.invoiceNumber}\n*Tanggal:* ${tx.date}\n\n*Item HP:*\n${tx.items.map((it: any) => `- ${it.brand} ${it.modelName} (IMEI: ${it.imei}): ${formatIDR(it.price)}`).join('\n')}\n\n*Diskon:* ${formatIDR(tx.discount)}\n*Total Pembayaran:* ${formatIDR(tx.totalAmount)}\n*Metode:* ${tx.paymentMethod}\n\n_Semoga awet dan bermanfaat! Jika ada kendala, silakan hubungi kami._`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition cursor-pointer flex items-center"
                                  title="Kirim via WhatsApp"
                                >
                                  <Share2 className="h-4.5 w-4.5" />
                                </a>
                                <a
                                  href={`mailto:${tx.customerEmail || ''}?subject=${encodeURIComponent(`Invoice JK PHONE ${tx.invoiceNumber}`)}&body=${encodeURIComponent(
                                    `Halo Kak ${tx.customerName},\n\nTerima kasih telah berbelanja di JK PHONE. Berikut detail transaksi Anda:\n\nNota: ${tx.invoiceNumber}\nTanggal: ${tx.date}\n\nItem HP:\n${tx.items.map((it: any) => `- ${it.brand} ${it.modelName} (IMEI: ${it.imei}): ${formatIDR(it.price)}`).join('\n')}\n\nDiskon: ${formatIDR(tx.discount)}\nTotal Pembayaran: ${formatIDR(tx.totalAmount)}\nMetode: ${tx.paymentMethod}\n\nSemoga awet dan bermanfaat! Jika ada kendala, silakan hubungi kami.`
                                  )}`}
                                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer flex items-center"
                                  title="Kirim via Email"
                                >
                                  <Mail className="h-4.5 w-4.5" />
                                </a>
                                <button
                                  id={`btn-del-invoice-${tx.id}`}
                                  onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin membatalkan/menghapus invoice ini? HP yang terjual akan dikembalikan ke dalam stok.')) {
                                      onDeleteTransaction(tx.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                                  title="Batalkan Invoice"
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

      {/* VIEW 2: KASIR PENJUALAN HP BARU */}
      {activeSubTab === 'buat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="pos-view">
          {/* Left Column: POS Form & Item Selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-6" id="pos-selectors">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-md">Pilih Item HP Penjualan (Barang Keluar)</h3>
            </div>

            {/* Selector inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="pos-item-selectors">
              {/* Product Select */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase text-slate-500">Tipe HP (Stok Ready di Toko)</label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="text-xs text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" /> Scan IMEI via Kamera
                  </button>
                </div>
                <select
                  id="pos-select-product"
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Pilih HP In Stock --</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.modelName} ({p.storage} • {p.color} • {p.condition} • Sinyal {p.signalType || 'iBox'}) - Sisa {p.stock} Unit
                    </option>
                  ))}
                </select>

                {/* Camera Scanner Modal Component */}
                <ImeiScannerModal
                  isOpen={isScannerOpen}
                  onClose={() => setIsScannerOpen(false)}
                  mode="single"
                  onScanSuccess={handleImeiScanSuccess}
                  title="Scan IMEI HP Kasir"
                  placeholder="Scan barcode IMEI pada boks atau punggung HP untuk memilih otomatis barang in-stock."
                />
              </div>

              {/* IMEI Select */}
              {selectedProduct && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Pilih IMEI HP</label>
                    <select
                      id="pos-select-imei"
                      value={selectedImei}
                      onChange={(e) => setSelectedImei(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {selectedProduct.imeis.map(imei => (
                        <option key={imei} value={imei}>{imei}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price input */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Harga Kesepakatan Jual (Rp)</label>
                    <input
                      id="pos-selling-price-input"
                      type="number"
                      value={customPrice || ''}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Sinyal info badge */}
                  <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Jenis Sinyal HP: <strong className="text-indigo-600">{selectedProduct.signalType || 'iBox'}</strong></span>
                    <span>Harga Modal Unit: <strong>{formatIDR(selectedProduct.purchasePrice)}</strong></span>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      id="btn-add-to-cart"
                      type="button"
                      onClick={handleAddItemToCart}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Masukkan ke Keranjang
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cart list table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden" id="pos-cart-container">
              <div className="bg-slate-50 px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Keranjang Belanja Penjualan
              </div>
              <table className="w-full text-left text-sm" id="pos-cart-table">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold bg-slate-50/40">
                    <th className="py-2.5 px-4">Deskripsi Item HP</th>
                    <th className="py-2.5 px-4 font-mono">Sinyal & IMEI</th>
                    <th className="py-2.5 px-4 text-right">Harga Jual</th>
                    <th className="py-2.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                        Belum ada item ditambahkan ke keranjang.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/25" id={`cart-item-row-${idx}`}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{item.brand} {item.modelName}</div>
                          <div className="text-[10px] text-slate-400">{item.storage} • {item.color} • {item.condition}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded mr-1">
                            {item.signalType}
                          </span>
                          <span className="font-mono text-xs text-slate-500 block mt-1">{item.imei}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{formatIDR(item.price)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            id={`btn-remove-cart-${idx}`}
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded-md transition cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Checkout Billing & Client Info */}
          <form onSubmit={handleCheckout} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5" id="pos-checkout">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-md">Nama Pelanggan & Metode Bayar</h3>
            </div>

            {/* Nama Pelanggan */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Nama Customer</label>
              <input
                id="checkout-cust-name"
                type="text"
                placeholder="e.g. Richard William"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            {/* No HP Pelanggan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">No. HP Customer (Optional)</label>
                <input
                  id="checkout-cust-phone"
                  type="text"
                  placeholder="e.g. 08129933221"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Email Customer (Optional)</label>
                <input
                  id="checkout-cust-email"
                  type="email"
                  placeholder="e.g. customer@gmail.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Pembayaran Melalui</label>
              <select
                id="checkout-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Tunai">CASH / Tunai</option>
                <option value="Transfer BCA">Transfer / QRIS (BCA)</option>
                <option value="Debit">Debit BCA / Mandiri / EDC</option>
                <option value="Kredivo">Kredit dari Kredivo</option>
                <option value="ShopeePay">Kredit dari Shopeepay Later</option>
                <option value="Yes Credit">Kredit dari Yes Credit</option>
                <option value="Split">SPLIT PAYMENT (Kombinasi / Cicilan)</option>
                <option value="Lainnya">Lainnya / Cicilan Toko</option>
              </select>
            </div>

            {/* Split Payment Form Fields (Conditional) */}
            {paymentMethod === 'Split' && (
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 space-y-3.5 animate-fade-in" id="split-payment-breakdown">
                <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold text-xs uppercase tracking-wider">
                  <Smartphone className="h-4 w-4" /> Detail Pembayaran Split
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-indigo-900 mb-1">Tunai / CASH (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitCashAmount || ''}
                      onChange={(e) => setSplitCashAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-indigo-900 mb-1">Transfer BCA (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitTransferAmount || ''}
                      onChange={(e) => setSplitTransferAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-indigo-900 mb-1">Kredit (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitCreditAmount || ''}
                      onChange={(e) => setSplitCreditAmount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-indigo-900 mb-1">Penyedia Kredit / Finansial</label>
                  <select
                    value={splitCreditProvider}
                    onChange={(e) => setSplitCreditProvider(e.target.value)}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Akulaku">Akulaku</option>
                    <option value="Yes Kredit">Yes Kredit</option>
                    <option value="Home Credit">Home Credit</option>
                    <option value="Kredivo">Kredivo</option>
                    <option value="Spaylater">Spaylater / Shopee</option>
                    <option value="Indodana">Indodana</option>
                  </select>
                </div>

                <div className="text-[10px] font-bold flex justify-between pt-1 border-t border-indigo-200/50">
                  <span className="text-indigo-900">Total Alokasi Split:</span>
                  <span className={splitCashAmount + splitTransferAmount + splitCreditAmount === cartTotal ? "text-emerald-600" : "text-rose-500"}>
                    {formatIDR(splitCashAmount + splitTransferAmount + splitCreditAmount)} / {formatIDR(cartTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Status Pembayaran</label>
              <select
                id="checkout-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Lunas">Lunas</option>
                <option value="Pending">Pending / Belum Lunas / Kredit</option>
              </select>
            </div>

            {/* Diskon / Potongan Nota */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Diskon Tambahan (Rp)</label>
              <input
                id="checkout-discount"
                type="number"
                min="0"
                placeholder="e.g. 100000"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Catatan Transaksi */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Catatan Nota Penjualan</label>
              <textarea
                id="checkout-notes"
                rows={2}
                placeholder="e.g. Free Tempered Glass & Softcase. Garansi sinyal aman."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Totals Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5" id="pos-totals">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal Jual HP</span>
                <span>{formatIDR(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-rose-500 font-medium">
                  <span>Diskon Nota</span>
                  <span>-{formatIDR(discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200/60 pt-2.5 flex justify-between font-bold text-slate-900 text-lg">
                <span>Total Bayar</span>
                <span>{formatIDR(cartTotal)}</span>
              </div>
            </div>

            {/* Submit checkout */}
            <button
              id="btn-pos-checkout"
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition shadow-md shadow-indigo-100 flex justify-center items-center gap-2 cursor-pointer"
            >
              <FileText className="h-5 w-5" /> {editingTransaction ? 'Simpan Perubahan Nota' : 'Buat Nota & Simpan Penjualan'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL PREVIEW INVOICE UNTUK DICETAK */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="invoice-modal">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-indigo-950 text-white flex justify-between items-center">
              <span className="font-extrabold text-sm tracking-widest">PREVIEW NOTA JK PHONE</span>
              <button
                id="btn-close-modal"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Receipt layout */}
            <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-stone-50/30" id="printable-invoice">
              {/* Receipt Header */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-5">
                <h2 className="text-2xl font-extrabold text-indigo-950 font-sans tracking-widest">JK PHONE</h2>
                <p className="text-xs text-slate-600 font-bold uppercase">Pusat Handphone Baru, Bekas, Servis & Unlock IMEI</p>
                <p className="text-xs text-slate-500 font-mono mt-1">ITC Roxy Mas Lantai Dasar No. 12B, Jakarta Barat</p>
                <p className="text-xs text-slate-400">Hubungi: 0812-JKPHONE-888 | Mutasi BCA Rekening Toko</p>
              </div>

              {/* Invoice Metadata */}
              <div className="grid grid-cols-2 gap-y-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">NOMOR NOTA INVOICE</span>
                  <strong className="text-slate-900 text-sm font-mono">{selectedInvoice.invoiceNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">TANGGAL PENJUALAN</span>
                  <strong className="text-slate-900 font-mono">{selectedInvoice.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">NAMA CUSTOMER</span>
                  <strong className="text-slate-900 text-sm font-bold">{selectedInvoice.customerName}</strong>
                  {selectedInvoice.customerPhone && <span className="block font-mono text-slate-500 text-[10px]">{selectedInvoice.customerPhone}</span>}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">METODE BAYAR / STATUS</span>
                  <strong className="text-indigo-600 font-bold block">{selectedInvoice.paymentMethod}</strong>
                  <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-extrabold inline-block mt-0.5">{selectedInvoice.status}</span>
                </div>
              </div>

              {/* Items list */}
              <div className="border-t border-b border-dashed border-slate-300 py-4 space-y-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                  <span>Deskripsi Item HP & Sinyal</span>
                  <span>Total Harga Jual</span>
                </div>
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs text-slate-800" id={`invoice-modal-item-${idx}`}>
                    <div>
                      <span className="font-extrabold text-slate-800">{item.brand} {item.modelName}</span>
                      <span className="text-slate-500 ml-1">({item.storage} • {item.color} • {item.condition})</span>
                      <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Sinyal Operator: {item.signalType}</div>
                      <div className="text-[10px] text-slate-400 font-mono">IMEI: {item.imei}</div>
                    </div>
                    <span className="font-extrabold text-slate-950">{formatIDR(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-700" id="invoice-modal-totals">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal Belanja</span>
                  <span className="font-bold">{formatIDR(selectedInvoice.items.reduce((sum, i) => sum + i.price, 0))}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Diskon Pembayaran</span>
                    <span>-{formatIDR(selectedInvoice.discount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between text-base text-slate-950 font-extrabold">
                  <span>Total Net Jual</span>
                  <span className="text-indigo-600">{formatIDR(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Notes & Footer */}
              {selectedInvoice.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 italic">
                  <strong>Syarat/Keterangan Toko:</strong> "{selectedInvoice.notes}"
                </div>
              )}

              <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-dashed border-slate-300 space-y-1.5 font-mono">
                <p className="font-semibold text-slate-500">Matur Nuwun / Terima kasih atas kepercayaan Anda di JK PHONE!</p>
                <p>Garansi Toko HP Bekas 7 Hari sejak tanggal kuitansi.</p>
                <p>Silakan simpan struk fisik ini untuk klaim garansi atau IMEI.</p>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                id="btn-invoice-print-act"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Cetak Nota Penjualan
              </button>
              <button
                id="btn-invoice-close-act"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition cursor-pointer"
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
