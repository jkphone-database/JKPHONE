import React, { useState } from 'react';
import { AccessoryProduct, SparepartProduct, AccessorySparepartSale, AccessorySparepartSaleItem } from '../types';
import { Plus, Search, Trash2, Printer, ShoppingBag, ShoppingCart, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Smartphone, ClipboardList, Send, Edit, X } from 'lucide-react';

interface AccessoriesAndSparepartsProps {
  accessories: AccessoryProduct[];
  spareparts: SparepartProduct[];
  accSales: AccessorySparepartSale[];
  onAddAccessory: (item: Omit<AccessoryProduct, 'id'>) => void;
  onEditAccessory: (item: AccessoryProduct) => void;
  onDeleteAccessory: (id: string) => void;
  onAddAccSale: (sale: Omit<AccessorySparepartSale, 'id' | 'invoiceNumber'>) => void;
  onDeleteAccSale: (id: string) => void;
}

export default function AccessoriesAndSpareparts({
  accessories,
  spareparts,
  accSales,
  onAddAccessory,
  onEditAccessory,
  onDeleteAccessory,
  onAddAccSale,
  onDeleteAccSale
}: AccessoriesAndSparepartsProps) {

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Local tabs
  const [activeTab, setActiveTab] = useState<'stok-acc' | 'kasir' | 'riwayat'>('stok-acc');

  // Search & Filters
  const [searchAcc, setSearchAcc] = useState('');
  const [searchSale, setSearchSale] = useState('');

  // Editing / Form states
  const [showAccForm, setShowAccForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState<AccessoryProduct | null>(null);
  const [accPartNumber, setAccPartNumber] = useState('');
  const [accName, setAccName] = useState('');
  const [accCategory, setAccCategory] = useState('Charger');
  const [accPurchase, setAccPurchase] = useState(0);
  const [accSelling, setAccSelling] = useState(0);
  const [accStock, setAccStock] = useState(0);
  const [accMinAlert, setAccMinAlert] = useState(3);

  // Kasir / Cart State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Debit' | 'Transfer BCA' | 'Lainnya' | 'Kredivo' | 'ShopeePay' | 'Yes Credit'>('Tunai');
  const [cart, setCart] = useState<AccessorySparepartSaleItem[]>([]);
  const [cartNotes, setCartNotes] = useState('');

  const [selectedItemType, setSelectedItemType] = useState<'Aksesoris' | 'Sparepart'>('Aksesoris');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(0);

  // Receipt Modal State
  const [selectedSale, setSelectedSale] = useState<AccessorySparepartSale | null>(null);

  // Lists of categories
  const accCategories = ['Charger', 'Casing', 'Tempered Glass', 'Earphone', 'Powerbank', 'Kabel', 'Memory Card', 'Lainnya'];

  // Low Stock Alerts Filter
  const lowStockAcc = accessories.filter(a => a.stock <= a.minStockAlert);

  // Handle Accessory Submission
  const handleAccSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || accPurchase <= 0 || accSelling <= 0) {
      alert('Mohon lengkapi data aksesoris dengan benar!');
      return;
    }

    const finalPartNo = accPartNumber.trim() || `ACC-${accCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingAcc) {
      onEditAccessory({
        id: editingAcc.id,
        partNumber: finalPartNo,
        name: accName.trim(),
        category: accCategory,
        purchasePrice: Number(accPurchase),
        sellingPrice: Number(accSelling),
        stock: Number(accStock),
        minStockAlert: Number(accMinAlert)
      });
      alert('Data aksesoris berhasil diperbarui!');
    } else {
      onAddAccessory({
        partNumber: finalPartNo,
        name: accName.trim(),
        category: accCategory,
        purchasePrice: Number(accPurchase),
        sellingPrice: Number(accSelling),
        stock: Number(accStock),
        minStockAlert: Number(accMinAlert)
      });
      alert('Aksesoris baru berhasil ditambahkan!');
    }

    // Reset Form
    setEditingAcc(null);
    setAccPartNumber('');
    setAccName('');
    setAccPurchase(0);
    setAccSelling(0);
    setAccStock(0);
    setShowAccForm(false);
  };

  const startEditAcc = (item: AccessoryProduct) => {
    setEditingAcc(item);
    setAccPartNumber(item.partNumber || '');
    setAccName(item.name);
    setAccCategory(item.category);
    setAccPurchase(item.purchasePrice);
    setAccSelling(item.sellingPrice);
    setAccStock(item.stock);
    setAccMinAlert(item.minStockAlert);
    setShowAccForm(true);
  };

  // Kasir / Cart handlers
  const handleItemTypeChange = (type: 'Aksesoris' | 'Sparepart') => {
    setSelectedItemType(type);
    setSelectedItemId('');
    setSelectedPrice(0);
    setSelectedQty(1);
  };

  const handleItemIdChange = (id: string) => {
    setSelectedItemId(id);
    if (!id) {
      setSelectedPrice(0);
      return;
    }

    if (selectedItemType === 'Aksesoris') {
      const item = accessories.find(a => a.id === id);
      setSelectedPrice(item ? item.sellingPrice : 0);
    } else {
      const item = spareparts.find(s => s.id === id);
      setSelectedPrice(item ? item.sellingPrice : 0);
    }
  };

  const handleAddToCart = () => {
    if (!selectedItemId) {
      alert('Pilih produk terlebih dahulu!');
      return;
    }

    const isAcc = selectedItemType === 'Aksesoris';
    const foundInStock = isAcc 
      ? accessories.find(a => a.id === selectedItemId)
      : spareparts.find(s => s.id === selectedItemId);

    if (!foundInStock) return;

    if (foundInStock.stock < selectedQty) {
      alert(`Stok tidak mencukupi! Sisa stok aktif hanya ${foundInStock.stock} unit.`);
      return;
    }

    // Check if duplicate in cart
    const dupIdx = cart.findIndex(c => c.itemId === selectedItemId && c.type === selectedItemType);
    if (dupIdx > -1) {
      const currentQty = cart[dupIdx].qty;
      if (foundInStock.stock < (currentQty + selectedQty)) {
        alert(`Gagal menambah jumlah! Total di keranjang melebihi stok yang tersedia (${foundInStock.stock} unit).`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[dupIdx].qty += selectedQty;
      updatedCart[dupIdx].total = updatedCart[dupIdx].qty * updatedCart[dupIdx].price;
      setCart(updatedCart);
    } else {
      const cartItem: AccessorySparepartSaleItem = {
        itemId: selectedItemId,
        type: selectedItemType,
        name: foundInStock.name,
        category: foundInStock.category,
        price: selectedPrice,
        qty: selectedQty,
        total: selectedPrice * selectedQty
      };
      setCart([...cart, cartItem]);
    }

    // Reset selectors
    setSelectedItemId('');
    setSelectedPrice(0);
    setSelectedQty(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCheckoutSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang kasir masih kosong!');
      return;
    }

    if (!customerName.trim()) {
      alert('Mohon masukkan nama pelanggan!');
      return;
    }

    onAddAccSale({
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: cart,
      totalAmount: cartTotalAmount,
      paymentMethod,
      notes: cartNotes.trim() || undefined
    });

    alert('Nota penjualan aksesoris / sparepart berhasil dibuat!');
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCartNotes('');
    setActiveTab('riwayat');
  };

  // Filtered lists
  const filteredAccessories = accessories.filter(a => 
    a.name.toLowerCase().includes(searchAcc.toLowerCase()) ||
    a.category.toLowerCase().includes(searchAcc.toLowerCase()) ||
    (a.partNumber && a.partNumber.toLowerCase().includes(searchAcc.toLowerCase()))
  );

  const filteredSales = accSales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchSale.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchSale.toLowerCase()) ||
    s.items.some(i => i.name.toLowerCase().includes(searchSale.toLowerCase()))
  );

  // Generate WhatsApp Message
  const getWhatsAppMessage = (sale: AccessorySparepartSale) => {
    const header = `*JK PHONE - NOTA PENJUALAN AKSESORIS & SPAREPART*\n-----------------------------------------\n`;
    const meta = `*No Nota:* ${sale.invoiceNumber}\n*Tanggal:* ${sale.date}\n*Pelanggan:* ${sale.customerName}\n*Bayar via:* ${sale.paymentMethod}\n-----------------------------------------\n`;
    
    let itemsText = `*Rincian Belanja:*\n`;
    sale.items.forEach((item, idx) => {
      itemsText += `${idx+1}. ${item.name} (${item.type})\n    ${item.qty} pcs x ${formatIDR(item.price)} = *${formatIDR(item.total)}*\n`;
    });
    
    const footer = `-----------------------------------------\n*TOTAL BAYAR: ${formatIDR(sale.totalAmount)}*\n\nTerima kasih telah berbelanja di *JK PHONE*!\nHubungi kami jika ada keluhan atau kebutuhan sparepart lainnya.`;
    
    return encodeURIComponent(header + meta + itemsText + footer);
  };

  return (
    <div className="space-y-6" id="acc-sp-management-wrapper">
      
      {/* Alert Reminders for Low Stock */}
      {lowStockAcc.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs" id="low-stock-alert-banner">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Peringatan Kritis: Sisa Stok Limit!</h4>
              <p className="text-xs text-amber-700 mt-1">
                Beberapa item aksesoris ({lowStockAcc.length}) telah mencapai batas minimum pengadaan. Silakan lakukan pemesanan ulang (restock) segera.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockAcc.slice(0, 5).map(item => (
                  <span key={item.id} className="bg-white/80 border border-amber-200 text-amber-900 font-medium text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                    {item.name} ({item.stock} unit sisa)
                  </span>
                ))}
                {lowStockAcc.length > 5 && (
                  <span className="bg-amber-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md">
                    +{lowStockAcc.length - 5} lainnya
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary tab bar */}
      <div className="flex border-b border-slate-100" id="acc-tabs-nav">
        <button
          onClick={() => setActiveTab('stok-acc')}
          className={`pb-4 px-5 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stok-acc' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="h-4 w-4" /> Stok Aksesoris
        </button>
        <button
          onClick={() => setActiveTab('kasir')}
          className={`pb-4 px-5 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'kasir' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingCart className="h-4 w-4" /> Kasir Penjualan
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`pb-4 px-5 font-semibold text-sm border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'riwayat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Riwayat Nota
        </button>
      </div>

      {/* VIEW 1: STOK AKSESORIS */}
      {activeTab === 'stok-acc' && (
        <div className="space-y-4 animate-fade-in" id="acc-view">
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aksesoris, kategori, atau kode part..."
                value={searchAcc}
                onChange={(e) => setSearchAcc(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={() => {
                setEditingAcc(null);
                setAccPartNumber('');
                setAccName('');
                setAccCategory('Charger');
                setAccPurchase(0);
                setAccSelling(0);
                setAccStock(0);
                setAccMinAlert(3);
                setShowAccForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Plus className="h-4.5 w-4.5" /> Tambah Aksesoris
            </button>
          </div>

          {/* Form Modal / Panel */}
          {showAccForm && (
            <div className="bg-white border border-indigo-100 p-6 rounded-2xl shadow-xs space-y-4 max-w-xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <h4 className="font-bold text-slate-900 text-md">{editingAcc ? 'Edit Data Aksesoris' : 'Tambah Aksesoris Baru'}</h4>
                <button onClick={() => setShowAccForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleAccSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">KODE PART / SKU (KOSONGKAN UNTUK AUTO-GENERATE)</label>
                    <input
                      type="text"
                      placeholder="e.g. ACC-ANK-001 (Opsional)"
                      value={accPartNumber}
                      onChange={(e) => setAccPartNumber(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-800 font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NAMA PRODUK AKSESORIS</label>
                    <input
                      type="text"
                      placeholder="e.g. Charger Anker Nano II 30W USB-C"
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">KATEGORI</label>
                    <select
                      value={accCategory}
                      onChange={(e) => setAccCategory(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {accCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">STOK MASUK / AWAL</label>
                    <input
                      type="number"
                      min="0"
                      value={accStock}
                      onChange={(e) => setAccStock(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">HARGA BELI / MODAL (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={accPurchase || ''}
                      onChange={(e) => setAccPurchase(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">HARGA JUAL TOKO (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={accSelling || ''}
                      onChange={(e) => setAccSelling(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">BATAS MINIMUM STOK REMINDER (UNIT)</label>
                    <input
                      type="number"
                      min="1"
                      value={accMinAlert}
                      onChange={(e) => setAccMinAlert(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
                  <button type="button" onClick={() => setShowAccForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs">Simpan Aksesoris</button>
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
                    <th className="py-3.5 px-4 font-semibold">Nama Aksesoris</th>
                    <th className="py-3.5 px-4 font-semibold">Kategori</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Harga Modal</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Harga Jual</th>
                    <th className="py-3.5 px-4 text-center font-semibold">Stok Sisa</th>
                    <th className="py-3.5 px-4 text-center font-semibold text-indigo-600">Terjual</th>
                    <th className="py-3.5 px-4 text-right font-semibold text-emerald-600">Laba Bersih</th>
                    <th className="py-3.5 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAccessories.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">Tidak ada produk aksesoris ditemukan.</td>
                    </tr>
                  ) : (
                    filteredAccessories.map(item => {
                      const isLowStock = item.stock <= item.minStockAlert;
                      
                      // Calculate on-the-fly sold quantity and profit
                      const soldQty = accSales.reduce((sum, sale) => {
                        const matchItems = sale.items.filter(i => i.itemId === item.id && i.type === 'Aksesoris');
                        return sum + matchItems.reduce((s, i) => s + i.qty, 0);
                      }, 0);

                      const netProfit = accSales.reduce((sum, sale) => {
                        const matchItems = sale.items.filter(i => i.itemId === item.id && i.type === 'Aksesoris');
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
                              <button onClick={() => startEditAcc(item)} className="p-1 hover:bg-slate-100 text-indigo-600 rounded" title="Edit"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => { if(confirm('Hapus aksesoris ini?')) onDeleteAccessory(item.id); }} className="p-1 hover:bg-rose-50 text-rose-500 rounded" title="Hapus"><Trash2 className="h-4 w-4" /></button>
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


      {/* VIEW 3: KASIR PENJUALAN */}
      {activeTab === 'kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="kasir-grid-container">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-md">Pilih Item Aksesoris / Sparepart</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">TIPE PRODUK</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleItemTypeChange('Aksesoris')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedItemType === 'Aksesoris' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Aksesoris
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemTypeChange('Sparepart')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      selectedItemType === 'Sparepart' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Spareparts
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">PILIH PRODUK (STOK READY)</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => handleItemIdChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Pilih --</option>
                  {selectedItemType === 'Aksesoris' ? (
                    accessories.filter(a => a.stock > 0).map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Sisa {a.stock})</option>
                    ))
                  ) : (
                    spareparts.filter(s => s.stock > 0).map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Sisa {s.stock})</option>
                    ))
                  )}
                </select>
              </div>

              {selectedItemId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">HARGA JUAL NOTA (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedPrice || ''}
                      onChange={(e) => setSelectedPrice(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">JUMLAH (QTY)</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Masukkan Keranjang
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cart list table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Keranjang Kasir Parts & Acc
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold bg-slate-50/40">
                    <th className="py-2 px-4">Nama Produk</th>
                    <th className="py-2 px-4">Kategori / Tipe</th>
                    <th className="py-2 px-4 text-right">Harga</th>
                    <th className="py-2 px-4 text-center">Qty</th>
                    <th className="py-2 px-4 text-right">Total</th>
                    <th className="py-2 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">Keranjang belanja kosong.</td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/25">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-4 text-xs">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'Aksesoris' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {item.type} ({item.category})
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">{formatIDR(item.price)}</td>
                        <td className="py-2.5 px-4 text-center font-bold">{item.qty} pcs</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatIDR(item.total)}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button onClick={() => handleRemoveFromCart(idx)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><X className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing Form */}
          <form onSubmit={handleCheckoutSale} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardList className="h-5 w-5 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-md">Pembeli & Billing</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">NAMA PELANGGAN</label>
              <input
                type="text"
                placeholder="e.g. Ahmad Dani"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">NO. HP PELANGGAN (UNTUK WA)</label>
              <input
                type="text"
                placeholder="e.g. 0812xxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">METODE PEMBAYARAN</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Tunai">Tunai / CASH</option>
                <option value="Transfer BCA">Transfer / Qris BCA</option>
                <option value="Debit">Kartu Debit</option>
                <option value="Kredivo">Kredit (Kredivo)</option>
                <option value="ShopeePay">ShopeePay</option>
                <option value="Yes Credit">Yes Credit</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">CATATAN NOTA</label>
              <input
                type="text"
                placeholder="e.g. Garansi toko sparepart 3 hari"
                value={cartNotes}
                onChange={(e) => setCartNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Belanja</span>
                <span>{formatIDR(cartTotalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wide shadow-md transition cursor-pointer"
            >
              Proses Cetak & Buat Nota
            </button>
          </form>
        </div>
      )}

      {/* VIEW 4: RIWAYAT PENJUALAN NOTA */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4 animate-fade-in" id="riwayat-sales-view">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nota, nama pelanggan, atau nama parts..."
                value={searchSale}
                onChange={(e) => setSearchSale(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-6 font-semibold">No Nota</th>
                    <th className="py-3.5 px-4 font-semibold">Tanggal</th>
                    <th className="py-3.5 px-4 font-semibold">Pelanggan</th>
                    <th className="py-3.5 px-4 font-semibold">Detail Barang</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Total Nilai</th>
                    <th className="py-3.5 px-4 font-semibold">Metode Bayar</th>
                    <th className="py-3.5 px-6 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">Belum ada nota penjualan tercatat.</td>
                    </tr>
                  ) : (
                    [...filteredSales]
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(sale => (
                        <tr key={sale.id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-6 font-bold text-indigo-700">{sale.invoiceNumber}</td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{sale.date}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            <div>{sale.customerName}</div>
                            {sale.customerPhone && <div className="text-[10px] text-slate-400 font-mono">{sale.customerPhone}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {sale.items.map((i, idx) => (
                                <div key={idx} className="text-xs text-slate-600">
                                  • {i.name} <span className="font-bold text-slate-800">({i.qty} pcs)</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatIDR(sale.totalAmount)}</td>
                          <td className="py-3.5 px-4 font-semibold text-indigo-600">{sale.paymentMethod}</td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => setSelectedSale(sale)}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded flex items-center gap-1"
                                title="Lihat & Cetak"
                              >
                                <Printer className="h-4 w-4" /> <span className="text-xs font-semibold">Cetak</span>
                              </button>
                              {sale.customerPhone && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${sale.customerPhone.startsWith('0') ? '62' + sale.customerPhone.slice(1) : sale.customerPhone}&text=${getWhatsAppMessage(sale)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-emerald-50 text-emerald-600 rounded flex items-center gap-1"
                                  title="Kirim ke WhatsApp"
                                >
                                  <Send className="h-4 w-4" /> <span className="text-xs font-semibold">Kirim WA</span>
                                </a>
                              )}
                              <button
                                onClick={() => { if(confirm('Hapus nota ini? Suku cadang/aksesoris yang terjual akan dikembalikan ke dalam stok.')) onDeleteAccSale(sale.id); }}
                                className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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

      {/* RETAIL PREVIEW NOTA MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="acc-receipt-modal">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-sm tracking-wide">NOTA PENJUALAN AKSESORIS & SPAREPART</span>
              <button onClick={() => setSelectedSale(null)} className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm" id="printable-acc-receipt">
              <div className="text-center space-y-1 border-b border-dashed border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">JK PHONE</h2>
                <p className="text-xs text-slate-500">Mal Ambasador Lantai 3 No. 45, Jakarta Selatan</p>
                <p className="text-xs text-slate-400">Telp/WA: {selectedSale.customerPhone || '0812-9988-7766'}</p>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">NOMOR NOTA</span>
                  <strong className="text-slate-900">{selectedSale.invoiceNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase">TANGGAL</span>
                  <strong className="text-slate-900">{selectedSale.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PELANGGAN</span>
                  <strong className="text-slate-900">{selectedSale.customerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase">METODE BAYAR</span>
                  <strong className="text-indigo-600">{selectedSale.paymentMethod}</strong>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-200 py-3 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                  <span>Nama Item</span>
                  <span>Qty x Harga</span>
                  <span className="text-right">Total</span>
                </div>
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs text-slate-800">
                    <div className="max-w-[160px]">
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.type} ({item.category})</span>
                    </div>
                    <span className="text-slate-500 text-xs whitespace-nowrap">{item.qty} x {formatIDR(item.price)}</span>
                    <span className="font-bold text-right">{formatIDR(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-slate-900 font-extrabold text-base">
                <span>TOTAL BAYAR</span>
                <span>{formatIDR(selectedSale.totalAmount)}</span>
              </div>

              {selectedSale.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-500 italic border border-slate-100">
                  <strong>Catatan:</strong> "{selectedSale.notes}"
                </div>
              )}

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-dashed border-slate-200">
                <p>Terima kasih telah berbelanja di JK PHONE!</p>
                <p>Suku cadang / aksesoris tidak dapat ditukar tanpa nota resmi.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition"
              >
                <Printer className="h-4 w-4" /> Cetak Nota
              </button>
              {selectedSale.customerPhone && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${selectedSale.customerPhone.startsWith('0') ? '62' + selectedSale.customerPhone.slice(1) : selectedSale.customerPhone}&text=${getWhatsAppMessage(selectedSale)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition"
                >
                  <Send className="h-4 w-4" /> WA Nota
                </a>
              )}
              <button onClick={() => setSelectedSale(null)} className="px-3 py-2 border border-slate-200 rounded-xl font-semibold text-xs text-slate-500">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
