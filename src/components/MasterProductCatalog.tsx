import React, { useState } from 'react';
import { MasterProduct, BarangMasuk, BarangKeluar } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Tag, 
  Smartphone, 
  ClipboardList, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ListFilter, 
  Info, 
  Check, 
  X,
  History,
  Sparkles
} from 'lucide-react';

interface MasterProductCatalogProps {
  masterProducts: MasterProduct[];
  onAddMasterProduct: (product: Omit<MasterProduct, 'id'>) => void;
  onEditMasterProduct: (product: MasterProduct) => void;
  onDeleteMasterProduct: (id: string) => void;
  barangMasukList: BarangMasuk[];
  barangKeluarList: BarangKeluar[];
}

export default function MasterProductCatalog({
  masterProducts,
  onAddMasterProduct,
  onEditMasterProduct,
  onDeleteMasterProduct,
  barangMasukList,
  barangKeluarList
}: MasterProductCatalogProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'katalog' | 'historis'>('katalog');

  // Brand States & Management
  const DEFAULT_BRANDS = [
    'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 
    'Realme', 'Infinix', 'Itel', 'Tecno', 'Huawei', 
    'ZTE', 'Poco', 'Motorola', 'Villaon', 'Honor', 'Lainnya'
  ];

  const [brands, setBrands] = useState<string[]>(() => {
    const saved = localStorage.getItem('tokohp_master_brands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  const [isManagingBrands, setIsManagingBrands] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [formBrand, setFormBrand] = useState(() => {
    const saved = localStorage.getItem('tokohp_master_brands');
    const list = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
    return list.includes('Apple') ? 'Apple' : (list[0] || 'Lainnya');
  });
  const [formModelName, setFormModelName] = useState('');
  const [formStorage, setFormStorage] = useState('128GB');
  const [formColorsText, setFormColorsText] = useState('');
  
  // Filtering & searching states
  const [katalogSearch, setKatalogSearch] = useState('');
  const [historisSearch, setHistorisSearch] = useState('');
  const [historisTypeFilter, setHistorisTypeFilter] = useState<'semua' | 'masuk' | 'keluar'>('semua');

  // Reset form helper
  const resetForm = () => {
    setIsEditing(false);
    setEditId('');
    setFormBrand(brands.includes('Apple') ? 'Apple' : (brands[0] || 'Lainnya'));
    setFormModelName('');
    setFormStorage('128GB');
    setFormColorsText('');
  };

  const handleAddBrand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    if (brands.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      alert('Merek tersebut sudah ada dalam daftar!');
      return;
    }
    const updated = [...brands];
    // Insert before 'Lainnya' if possible, or just append
    const lainnyaIdx = updated.indexOf('Lainnya');
    if (lainnyaIdx > -1) {
      updated.splice(lainnyaIdx, 0, trimmed);
    } else {
      updated.push(trimmed);
    }
    setBrands(updated);
    localStorage.setItem('tokohp_master_brands', JSON.stringify(updated));
    setFormBrand(trimmed);
    setNewBrandInput('');
    alert(`Berhasil menambahkan merek "${trimmed}"!`);
  };

  const handleDeleteBrand = (brandToDelete: string) => {
    if (brandToDelete === 'Lainnya') {
      alert('Merek "Lainnya" tidak dapat dihapus.');
      return;
    }
    if (confirm(`Yakin ingin menghapus merek "${brandToDelete}" dari daftar pilihan?`)) {
      const updated = brands.filter(b => b !== brandToDelete);
      setBrands(updated);
      localStorage.setItem('tokohp_master_brands', JSON.stringify(updated));
      if (formBrand === brandToDelete) {
        setFormBrand(updated[0] || 'Lainnya');
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModelName.trim()) {
      alert('Nama tipe model HP harus diisi!');
      return;
    }
    if (!formColorsText.trim()) {
      alert('Pilihan warna harus diisi minimal 1!');
      return;
    }

    // Split colors by comma, trim whitespace, and ignore empty values
    const colorsList = formColorsText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (isEditing) {
      onEditMasterProduct({
        id: editId,
        brand: formBrand,
        modelName: formModelName.trim(),
        storage: formStorage.trim(),
        colors: colorsList
      });
      alert('Berhasil mengupdate spesifikasi master produk!');
    } else {
      // Check for duplicate brand + model + storage
      const duplicate = masterProducts.find(
        p => p.brand.toLowerCase() === formBrand.toLowerCase() &&
             p.modelName.toLowerCase() === formModelName.trim().toLowerCase() &&
             p.storage.toLowerCase() === formStorage.trim().toLowerCase()
      );

      if (duplicate) {
        if (!confirm('Tipe HP dan kapasitas penyimpanan tersebut sudah terdaftar. Tetap tambahkan spesifikasi baru?')) {
          return;
        }
      }

      onAddMasterProduct({
        brand: formBrand,
        modelName: formModelName.trim(),
        storage: formStorage.trim(),
        colors: colorsList
      });
      alert('Berhasil mendaftarkan spesifikasi master produk baru!');
    }

    resetForm();
  };

  const startEdit = (item: MasterProduct) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormBrand(item.brand);
    setFormModelName(item.modelName);
    setFormStorage(item.storage);
    setFormColorsText(item.colors.join(', '));
  };

  // Prepare combined chronological log for "Historis Barang"
  const getChronologicalHistory = () => {
    const masukLogs = barangMasukList.map(bm => ({
      ...bm,
      movementType: 'masuk' as const,
      sortDate: bm.date
    }));

    const keluarLogs = barangKeluarList.map(bk => ({
      ...bk,
      movementType: 'keluar' as const,
      sortDate: bk.date
    }));

    // Combine and sort descending by date (most recent first)
    const combined = [...masukLogs, ...keluarLogs].sort((a, b) => 
      new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );

    // Apply search and type filters
    return combined.filter(log => {
      // Filter by type
      if (historisTypeFilter === 'masuk' && log.movementType !== 'masuk') return false;
      if (historisTypeFilter === 'keluar' && log.movementType !== 'keluar') return false;

      // Filter by search text
      if (!historisSearch.trim()) return true;
      const searchLower = historisSearch.toLowerCase();
      const modelMatch = `${log.brand} ${log.modelName}`.toLowerCase().includes(searchLower);
      const storageMatch = log.storage.toLowerCase().includes(searchLower);
      const colorMatch = log.color.toLowerCase().includes(searchLower);
      const imeiMatch = log.imeis.some(imei => imei.includes(searchLower));
      const personMatch = (log.movementType === 'masuk' ? (log as any).supplier : (log as any).buyer || '').toLowerCase().includes(searchLower);

      return modelMatch || storageMatch || colorMatch || imeiMatch || personMatch;
    });
  };

  const filteredMasterProducts = masterProducts.filter(item => {
    if (!katalogSearch.trim()) return true;
    const searchLower = katalogSearch.toLowerCase();
    return (
      item.brand.toLowerCase().includes(searchLower) ||
      item.modelName.toLowerCase().includes(searchLower) ||
      item.storage.toLowerCase().includes(searchLower) ||
      item.colors.some(c => c.toLowerCase().includes(searchLower))
    );
  });

  const formattedHistory = getChronologicalHistory();

  return (
    <div className="space-y-6" id="master-catalog-view-root">
      
      {/* Title Header with Subtabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
            Persediaan Master & Historis Barang
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Definisikan spesifikasi katalog model HP Anda dan pantau seluruh pergerakan mutasi barang masuk/keluar.
          </p>
        </div>

        {/* Subtabs Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('katalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'katalog'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="h-4 w-4" /> Master Tipe & Warna
          </button>
          <button
            onClick={() => setActiveSubTab('historis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'historis'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-4 w-4" /> Historis Barang HP
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CATALOG MASTER SPECIFICATIONS */}
      {activeSubTab === 'katalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Side - Left Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col h-fit">
            <h3 className="font-extrabold text-xs tracking-wider text-slate-500 uppercase mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              {isEditing ? 'Ubah Spesifikasi HP' : 'Input Manual Spesifikasi HP'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand Selection */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Merek (Brand)</label>
                  <button
                    type="button"
                    onClick={() => setIsManagingBrands(!isManagingBrands)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-0.5 cursor-pointer"
                    id="btn-manage-brands"
                  >
                    {isManagingBrands ? ' Kembali ke Pilihan' : '✏️ Kelola Pilihan Brand'}
                  </button>
                </div>

                {isManagingBrands ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5" id="brand-manager-container">
                    <p className="text-[10px] text-slate-500 font-bold leading-normal">Tambah / hapus opsi merek:</p>
                    
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Nama brand baru..."
                        value={newBrandInput}
                        onChange={(e) => setNewBrandInput(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBrand();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddBrand()}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-500 transition cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>

                    {/* tag cloud of brands */}
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-white border border-slate-100 rounded-lg">
                      {brands.map((brand) => (
                        <div
                          key={brand}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700"
                        >
                          <span>{brand}</span>
                          {brand !== 'Lainnya' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(brand)}
                              className="text-slate-400 hover:text-rose-600 text-[9px] font-bold p-0.5 rounded transition cursor-pointer"
                              title={`Hapus ${brand}`}
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <select
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    id="form-brand-select"
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Model Name */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1">Nama Tipe / Model</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13, Galaxy S24"
                  value={formModelName}
                  onChange={(e) => setFormModelName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  required
                />
              </div>

              {/* Storage Capacity */}
              <div>
                <label className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1">Kapasitas Penyimpanan</label>
                <select
                  value={formStorage}
                  onChange={(e) => setFormStorage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                >
                  <option value="32GB">32GB</option>
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Colors comma-separated */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Pilihan Warna Resmi</label>
                  <span className="text-[10px] text-slate-400 font-medium">Pisahkan dengan koma</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Starlight, Midnight, Blue, Pink, Green, Red"
                  value={formColorsText}
                  onChange={(e) => setFormColorsText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none leading-relaxed"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Masukkan seluruh varian warna HP yang valid sesuai model. Sistem akan mengunci warna-warna ini sebagai opsi dropdown di Barang Masuk.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  {isEditing ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {isEditing ? 'Simpan Perubahan' : 'Daftarkan Tipe'}
                </button>
              </div>
            </form>
          </div>

          {/* Master List Side - Right Columns */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col">
            
            {/* Table Header Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-extrabold text-xs tracking-wider text-slate-500 uppercase">
                Daftar Katalog Spesifikasi HP ({filteredMasterProducts.length})
              </h3>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari tipe, brand, warna..."
                  value={katalogSearch}
                  onChange={(e) => setKatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400"
                />
              </div>
            </div>

            {/* List Table / Card layout */}
            {filteredMasterProducts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center space-y-2">
                <Smartphone className="h-12 w-12 text-slate-300 animate-pulse" />
                <p className="text-slate-400 text-xs font-semibold">Belum ada spesifikasi master produk yang cocok.</p>
                <p className="text-slate-300 text-[10px]">Gunakan form sebelah kiri untuk menambahkan tipe baru.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                      <th className="pb-3 pl-2">Merek</th>
                      <th className="pb-3">Model Tipe HP</th>
                      <th className="pb-3">Kapasitas</th>
                      <th className="pb-3">Pilihan Varian Warna</th>
                      <th className="pb-3 text-right pr-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMasterProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 group transition">
                        <td className="py-3.5 pl-2">
                          <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                            {item.brand}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-slate-800 text-xs">{item.modelName}</td>
                        <td className="py-3.5 font-mono text-slate-500 font-bold text-xs">{item.storage}</td>
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {item.colors.map((color, cIdx) => (
                              <span 
                                key={cIdx} 
                                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-200/50"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Edit Spesifikasi"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus spesifikasi master untuk ${item.brand} ${item.modelName} ${item.storage}? (Tidak akan mempengaruhi stok yang sudah terdaftar)`)) {
                                  onDeleteMasterProduct(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus Spesifikasi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CHRONOLOGICAL ITEM LOGS (HISTORIS BARANG) */}
      {activeSubTab === 'historis' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col">
          
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            {/* Movement Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                onClick={() => setHistorisTypeFilter('semua')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  historisTypeFilter === 'semua'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua Gerakan
              </button>
              <button
                onClick={() => setHistorisTypeFilter('masuk')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 text-emerald-600 cursor-pointer ${
                  historisTypeFilter === 'masuk'
                    ? 'bg-white shadow-2xs'
                    : 'text-slate-500 hover:text-emerald-500'
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5" /> Barang Masuk
              </button>
              <button
                onClick={() => setHistorisTypeFilter('keluar')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 text-rose-600 cursor-pointer ${
                  historisTypeFilter === 'keluar'
                    ? 'bg-white shadow-2xs'
                    : 'text-slate-500 hover:text-rose-500'
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" /> Barang Keluar
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari IMEI, model, supplier/buyer, tanggal..."
                value={historisSearch}
                onChange={(e) => setHistorisSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Timeline Table */}
          {formattedHistory.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-2">
              <Clock className="h-12 w-12 text-slate-200 animate-pulse" />
              <p className="text-slate-400 text-xs font-semibold">Tidak ditemukan riwayat pergerakan barang.</p>
              <p className="text-slate-300 text-[10px]">Ubah filter pencarian atau rekam mutasi baru pada sistem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                    <th className="pb-3 pl-2">Tanggal</th>
                    <th className="pb-3">Jenis Gerakan</th>
                    <th className="pb-3">Spesifikasi Model HP</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3">Harga Satuan</th>
                    <th className="pb-3">Supplier / Pembeli</th>
                    <th className="pb-3">No. IMEI</th>
                    <th className="pb-3 pr-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formattedHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition">
                      {/* Date */}
                      <td className="py-3.5 pl-2 font-mono text-slate-600 font-semibold text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {log.date}
                        </span>
                      </td>

                      {/* Movement Type badge */}
                      <td className="py-3.5 whitespace-nowrap">
                        {log.movementType === 'masuk' ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-extrabold border border-emerald-100">
                            <ArrowDownLeft className="h-3 w-3" /> MASUK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[10px] font-extrabold border border-rose-100">
                            <ArrowUpRight className="h-3 w-3" /> KELUAR
                          </span>
                        )}
                      </td>

                      {/* Specs */}
                      <td className="py-3.5">
                        <div>
                          <div className="font-bold text-slate-800 text-xs">
                            {log.brand} {log.modelName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold space-x-1.5 mt-0.5">
                            <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">{log.storage}</span>
                            <span>•</span>
                            <span>{log.color}</span>
                            <span>•</span>
                            <span className={log.condition === 'Baru' ? 'text-emerald-600' : 'text-amber-600'}>{log.condition}</span>
                            <span>•</span>
                            <span className="bg-slate-100 text-slate-500 px-1 py-0.2 rounded">{log.signalType || 'iBox'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-3.5 text-center font-mono font-bold text-slate-800 text-xs">
                        {log.qty} unit
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                          log.movementType === 'masuk' ? log.purchasePrice : log.sellingPrice
                        )}
                      </td>

                      {/* Supplier or Buyer */}
                      <td className="py-3.5 text-xs text-slate-600 font-bold whitespace-nowrap">
                        {log.movementType === 'masuk' ? (
                          <span className="text-emerald-700 font-bold">From: {(log as any).supplier}</span>
                        ) : (
                          <span className="text-indigo-700 font-bold">To: {(log as any).buyer || 'Penjualan POS'}</span>
                        )}
                      </td>

                      {/* IMEIs */}
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {log.imeis.map((imei, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-slate-100 font-mono text-[9px] font-bold text-slate-500 rounded border border-slate-200">
                              {imei}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 pr-2 max-w-[200px] truncate text-slate-400 text-[10px] font-medium italic">
                        {log.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
