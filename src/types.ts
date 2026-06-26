export interface PhoneProduct {
  id: string;
  brand: string;
  modelName: string;
  storage: string;
  color: string;
  condition: 'Baru' | 'Bekas';
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  imeis: string[]; // List of available IMEIs in stock
  signalType: string; // e.g. 'Inter', 'Beacukai', 'iBox', 'Official Local', 'Lainnya'
}

export interface BarangMasuk {
  id: string;
  date: string; // YYYY-MM-DD
  brand: string;
  modelName: string;
  storage: string;
  color: string;
  condition: 'Baru' | 'Bekas';
  qty: number;
  purchasePrice: number;
  sellingPrice?: number;
  supplier: string;
  imeis: string[];
  signalType: string;
  notes?: string;
}

export interface BarangKeluar {
  id: string;
  date: string; // YYYY-MM-DD
  brand: string;
  modelName: string;
  storage: string;
  color: string;
  condition: 'Baru' | 'Bekas';
  qty: number;
  sellingPrice: number;
  buyer: string;
  imeis: string[];
  signalType: string;
  notes?: string;
  linkedTransactionId?: string; // If sold via a formal invoice
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // e.g., Gaji, Sewa Ruko, Listrik, Internet, Promosi, Lainnya
  reference: string; // e.g. No. Kwitansi / Nota referensi
  amount: number; // Harga satuan pengeluaran
  qty: number; // Kuantitas pengeluaran
  totalAmount: number; // Jumlah total (amount * qty)
  description: string;
  paymentMethod: 'Tunai' | 'Transfer BCA' | 'Lainnya'; // CASH / Transfer
  accountName?: string; // Nama rekening tujuan transfer / penanggung jawab
}

export interface TransactionItem {
  productId: string;
  brand: string;
  modelName: string;
  storage: string;
  color: string;
  condition: 'Baru' | 'Bekas';
  imei: string;
  price: number;
  signalType: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string; // INV-YYYYMMDD-XXX
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: TransactionItem[];
  discount: number;
  totalAmount: number;
  paymentMethod: 'Tunai' | 'Debit' | 'Transfer BCA' | 'Lainnya' | 'Kredivo' | 'ShopeePay' | 'Yes Credit' | 'Split';
  status: 'Lunas' | 'Pending';
  bcaMutationId?: string; // Links to verified BCA mutation
  notes?: string;
  paymentSplit?: {
    cashAmount: number;
    transferAmount: number;
    creditAmount: number;
    creditProvider?: 'Akulaku' | 'Yes Kredit' | 'Home Credit' | 'Kredivo' | 'Spaylater' | 'Indodana' | string;
  };
}

export interface BcaMutation {
  id: string;
  date: string; // YYYY-MM-DD or DD/MM from bank
  description: string;
  amount: number;
  type: 'CR' | 'DB';
  rawText: string;
  linkedTransactionId?: string; // Reconciled transaction
  status: 'Unmatched' | 'Matched' | 'Manual';
}

// Accessory Inventory Model
export interface AccessoryProduct {
  id: string;
  partNumber?: string; // Custom or auto-generated part number/SKU
  name: string;
  category: string; // Charger, Casing, Tempered Glass, Earphone, Powerbank, Kabel, Lainnya
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number; // Minimum stock before warning triggers
}

// Sparepart Inventory Model
export interface SparepartProduct {
  id: string;
  partNumber?: string; // Custom or auto-generated part number/SKU
  name: string;
  category: string; // LCD, Baterai, Kamera, Backdoor, Flex Cable, Konektor, Lainnya
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number; // Minimum stock before warning triggers
}

// Accessory & Sparepart Sale Transaction Model
export interface AccessorySparepartSaleItem {
  itemId: string;
  type: 'Aksesoris' | 'Sparepart';
  name: string;
  category: string;
  price: number;
  qty: number;
  total: number;
}

export interface AccessorySparepartSale {
  id: string;
  invoiceNumber: string; // ACC-YYYYMMDD-XXX
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone?: string;
  items: AccessorySparepartSaleItem[];
  totalAmount: number;
  paymentMethod: 'Tunai' | 'Debit' | 'Transfer BCA' | 'Lainnya' | 'Kredivo' | 'ShopeePay' | 'Yes Credit';
  notes?: string;
}

// IMEI Unlock Registration Model
export interface ImeiUnlockRequest {
  id: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei: string;
  cost: number;
  status: 'Pending' | 'Proses' | 'Sukses' | 'Gagal';
  notes?: string;
}

// Master Product Catalog Template
export interface MasterProduct {
  id: string;
  brand: string;      // e.g. Apple, Samsung
  modelName: string;  // e.g. iPhone 11, iPhone 13
  storage: string;    // e.g. 64GB, 128GB, 256GB
  colors: string[];   // e.g. ['Black', 'White', 'Purple', 'Green', 'Yellow', 'Red']
}

// Service Note Model
export interface ServiceNote {
  id: string;
  serviceNumber: string; // SRV-YYYYMMDD-XXX
  date: string; // YYYY-MM-DD
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imeiOrSerial?: string;
  damageDescription: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedCompletion: string; // Estimated date/time
  status: 'Diterima' | 'Proses' | 'Selesai' | 'Diambil' | 'Dibatalkan';
  technicianNotes?: string;
}

// App data payload for backup import/export
export interface BackupData {
  products: PhoneProduct[];
  barangMasuk: BarangMasuk[];
  barangKeluar: BarangKeluar[];
  expenses: Expense[];
  transactions: Transaction[];
  bcaMutations: BcaMutation[];
  accessories: AccessoryProduct[];
  spareparts: SparepartProduct[];
  accSales: AccessorySparepartSale[];
  unlockRequests: ImeiUnlockRequest[];
  serviceNotes: ServiceNote[];
  masterProducts?: MasterProduct[];
}
