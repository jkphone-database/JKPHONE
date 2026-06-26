import { 
  PhoneProduct, 
  BarangMasuk, 
  BarangKeluar, 
  Expense, 
  Transaction, 
  BcaMutation,
  AccessoryProduct,
  SparepartProduct,
  AccessorySparepartSale,
  ImeiUnlockRequest,
  ServiceNote,
  MasterProduct
} from './types';

export const initialProducts: PhoneProduct[] = [
  {
    id: 'prod-1',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    storage: '256GB',
    color: 'Natural Titanium',
    condition: 'Baru',
    purchasePrice: 20500000,
    sellingPrice: 22499000,
    stock: 3,
    imeis: ['358912110023456', '358912110023457', '358912110023458'],
    signalType: 'iBox'
  },
  {
    id: 'prod-2',
    brand: 'Samsung',
    modelName: 'Galaxy S24 Ultra',
    storage: '512GB',
    color: 'Titanium Gray',
    condition: 'Baru',
    purchasePrice: 18000000,
    sellingPrice: 19999000,
    stock: 2,
    imeis: ['354456220088112', '354456220088113'],
    signalType: 'Official Local'
  },
  {
    id: 'prod-3',
    brand: 'Xiaomi',
    modelName: 'Redmi Note 13 Pro+',
    storage: '256GB',
    color: 'Midnight Black',
    condition: 'Baru',
    purchasePrice: 5100000,
    sellingPrice: 5799000,
    stock: 5,
    imeis: ['352211990044551', '352211990044552', '352211990044553', '352211990044554', '352211990044555'],
    signalType: 'Xiaomi'
  },
  {
    id: 'prod-4',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '128GB',
    color: 'Blue',
    condition: 'Bekas',
    purchasePrice: 7500000,
    sellingPrice: 8900000,
    stock: 0,
    imeis: [],
    signalType: 'Inter'
  }
];

export const initialBarangMasuk: BarangMasuk[] = [
  {
    id: 'bm-1',
    date: '2026-06-20',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    storage: '256GB',
    color: 'Natural Titanium',
    condition: 'Baru',
    qty: 4,
    purchasePrice: 20500000,
    supplier: 'PT Sinar Distribusi',
    imeis: ['358912110023456', '358912110023457', '358912110023458', '358912110023459'],
    signalType: 'iBox',
    notes: 'Stok awal promo toko'
  },
  {
    id: 'bm-2',
    date: '2026-06-21',
    brand: 'Samsung',
    modelName: 'Galaxy S24 Ultra',
    storage: '512GB',
    color: 'Titanium Gray',
    condition: 'Baru',
    qty: 2,
    purchasePrice: 18000000,
    supplier: 'Samsung Indonesia Direct',
    imeis: ['354456220088112', '354456220088113'],
    signalType: 'Official Local',
    notes: 'Pre-order Customer'
  },
  {
    id: 'bm-3',
    date: '2026-06-22',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '128GB',
    color: 'Blue',
    condition: 'Bekas',
    qty: 1,
    purchasePrice: 7500000,
    supplier: 'Budi (Titip Jual / Tukar Tambah)',
    imeis: ['351122334455667'],
    signalType: 'Inter',
    notes: 'Kondisi mulus 95%, Battery Health 88%'
  }
];

export const initialBarangKeluar: BarangKeluar[] = [
  {
    id: 'bk-1',
    date: '2026-06-22',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    storage: '256GB',
    color: 'Natural Titanium',
    condition: 'Baru',
    qty: 1,
    sellingPrice: 22499000,
    buyer: 'Budi Santoso',
    imeis: ['358912110023459'],
    signalType: 'iBox',
    linkedTransactionId: 'tx-1',
    notes: 'Penjualan via invoice INV-20260622-001'
  },
  {
    id: 'bk-2',
    date: '2026-06-23',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '128GB',
    color: 'Blue',
    condition: 'Bekas',
    qty: 1,
    sellingPrice: 8900000,
    buyer: 'Siti Rahma',
    imeis: ['351122334455667'],
    signalType: 'Inter',
    linkedTransactionId: 'tx-2',
    notes: 'Penjualan COD di toko'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-06-15',
    category: 'Sewa Ruko',
    reference: 'REF-RUKO-06',
    amount: 5000000,
    qty: 1,
    totalAmount: 5000000,
    description: 'Sewa ruko Toko HP bulan Juni 2026',
    paymentMethod: 'Transfer BCA',
    accountName: 'REK BCA - HENDRI'
  },
  {
    id: 'exp-2',
    date: '2026-06-22',
    category: 'Listrik & Internet',
    reference: 'REF-PLN-INDY',
    amount: 750000,
    qty: 1,
    totalAmount: 750000,
    description: 'Token Listrik PLN 500rb + Tagihan IndiHome Toko HP 250rb',
    paymentMethod: 'Tunai',
    accountName: 'KAS KECIL'
  },
  {
    id: 'exp-3',
    date: '2026-06-23',
    category: 'Lainnya',
    reference: 'KWT-THERMAL',
    amount: 50000,
    qty: 3,
    totalAmount: 150000,
    description: 'Beli kertas thermal kasir 3 roll',
    paymentMethod: 'Tunai',
    accountName: 'KAS KECIL'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    invoiceNumber: 'INV-20260622-001',
    date: '2026-06-22',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    items: [
      {
        productId: 'prod-1',
        brand: 'Apple',
        modelName: 'iPhone 15 Pro Max',
        storage: '256GB',
        color: 'Natural Titanium',
        condition: 'Baru',
        imei: '358912110023459',
        price: 22499000,
        signalType: 'iBox'
      }
    ],
    discount: 0,
    totalAmount: 22499000,
    paymentMethod: 'Transfer BCA',
    status: 'Lunas',
    bcaMutationId: 'mut-1',
    notes: 'Dikirim dengan Grab Instant. Pembayaran via KlikBCA terverifikasi.'
  },
  {
    id: 'tx-2',
    invoiceNumber: 'INV-20260623-001',
    date: '2026-06-23',
    customerName: 'Siti Rahma',
    customerPhone: '085711223344',
    items: [
      {
        productId: 'prod-4',
        brand: 'Apple',
        modelName: 'iPhone 13',
        storage: '128GB',
        color: 'Blue',
        condition: 'Bekas',
        imei: '351122334455667',
        price: 8900000,
        signalType: 'Inter'
      }
    ],
    discount: 100000,
    totalAmount: 8800000,
    paymentMethod: 'Tunai',
    status: 'Lunas',
    notes: 'Pembayaran cash pas di toko. Bonus tempered glass + casing.'
  }
];

export const initialBcaMutations: BcaMutation[] = [
  {
    id: 'mut-1',
    date: '2026-06-22',
    description: 'TRSF E-BANKING CR 2206/F8822/WS9012 BUDI SANTOSO PENJUALAN IPHONE',
    amount: 22499000,
    type: 'CR',
    rawText: '22/06 TRSF E-BANKING CR 2206/F8822/WS9012 BUDI SANTOSO 22.499.000,00',
    linkedTransactionId: 'tx-1',
    status: 'Matched'
  },
  {
    id: 'mut-2',
    date: '2026-06-23',
    description: 'TRSF E-BANKING CR 2306/F1234/WS1102 SITI LESTARI DP SAMSUNG S24',
    amount: 5000000,
    type: 'CR',
    rawText: '23/06 TRSF E-BANKING CR 2306/F1234/WS1102 SITI LESTARI 5.000.000,00',
    status: 'Unmatched'
  },
  {
    id: 'mut-3',
    date: '2026-06-23',
    description: 'WS DEBET MANDIRI BI-FAST DB BIAYA ADMIN',
    amount: 2500,
    type: 'DB',
    rawText: '23/06 WS DEBET MANDIRI BI-FAST DB BIAYA ADMIN 2.500,00',
    status: 'Manual'
  }
];

export const initialAccessories: AccessoryProduct[] = [
  {
    id: 'acc-1',
    name: 'Charger Anker Nano 20W USB-C',
    category: 'Charger',
    purchasePrice: 120000,
    sellingPrice: 199000,
    stock: 10,
    minStockAlert: 3
  },
  {
    id: 'acc-2',
    name: 'Casing Premium Clear iPhone 15 Pro',
    category: 'Casing',
    purchasePrice: 35000,
    sellingPrice: 85000,
    stock: 12,
    minStockAlert: 5
  },
  {
    id: 'acc-3',
    name: 'Tempered Glass KingKong iPhone 15',
    category: 'Tempered Glass',
    purchasePrice: 15000,
    sellingPrice: 50000,
    stock: 2, // low stock alert!
    minStockAlert: 5
  }
];

export const initialSpareparts: SparepartProduct[] = [
  {
    id: 'sp-1',
    name: 'LCD iPhone 11 Original',
    category: 'LCD',
    purchasePrice: 450000,
    sellingPrice: 750000,
    stock: 4,
    minStockAlert: 2
  },
  {
    id: 'sp-2',
    name: 'Baterai iPhone X Standard Capacity',
    category: 'Baterai',
    purchasePrice: 120000,
    sellingPrice: 250000,
    stock: 1, // low stock alert!
    minStockAlert: 2
  },
  {
    id: 'sp-3',
    name: 'LCD Samsung Galaxy A51',
    category: 'LCD',
    purchasePrice: 300000,
    sellingPrice: 550000,
    stock: 3,
    minStockAlert: 2
  }
];

export const initialAccSales: AccessorySparepartSale[] = [
  {
    id: 'acc-sale-1',
    invoiceNumber: 'ACC-20260622-001',
    date: '2026-06-22',
    customerName: 'Ahmad Dani',
    customerPhone: '081255556666',
    items: [
      {
        itemId: 'acc-1',
        type: 'Aksesoris',
        name: 'Charger Anker Nano 20W USB-C',
        category: 'Charger',
        price: 199000,
        qty: 1,
        total: 199000
      }
    ],
    totalAmount: 199000,
    paymentMethod: 'Tunai',
    notes: 'Pembeli datang langsung'
  }
];

export const initialUnlockRequests: ImeiUnlockRequest[] = [
  {
    id: 'unlock-1',
    date: '2026-06-22',
    customerName: 'Rian Hidayat',
    customerPhone: '081922334455',
    deviceModel: 'iPhone 12 Pro Max',
    imei: '359001223344551',
    cost: 450000,
    status: 'Sukses',
    notes: 'Sinyal sudah aktif setelah 2 hari registrasi'
  },
  {
    id: 'unlock-2',
    date: '2026-06-23',
    customerName: 'Maya Safitri',
    customerPhone: '085299887766',
    deviceModel: 'iPhone 13 Pro',
    imei: '352331889900224',
    cost: 600000,
    status: 'Proses',
    notes: 'Proses Unlock Bea Cukai via KPP'
  }
];

export const initialServiceNotes: ServiceNote[] = [
  {
    id: 'srv-1',
    serviceNumber: 'SRV-20260622-001',
    date: '2026-06-22',
    customerName: 'Indah Permata',
    customerPhone: '081299991111',
    deviceModel: 'iPhone 11',
    imeiOrSerial: '359012344567789',
    damageDescription: 'Ganti Baterai + Tombol Power macet',
    estimatedCost: 450000,
    actualCost: 450000,
    estimatedCompletion: '2026-06-23',
    status: 'Selesai',
    technicianNotes: 'Baterai diganti kualitas original. Tombol power dibersihkan.'
  },
  {
    id: 'srv-2',
    serviceNumber: 'SRV-20260623-001',
    date: '2026-06-23',
    customerName: 'Agus Pratama',
    customerPhone: '087811223344',
    deviceModel: 'Samsung Note 20 Ultra',
    imeiOrSerial: '352345678901234',
    damageDescription: 'LCD bergaris hijau dan touchscreen ghost touch',
    estimatedCost: 1950000,
    estimatedCompletion: '2026-06-25',
    status: 'Proses',
    technicianNotes: 'Suku cadang LCD sedang dikirim oleh distributor.'
  }
];

export const initialMasterProducts: MasterProduct[] = [
  {
    id: 'master-1',
    brand: 'Apple',
    modelName: 'iPhone 11',
    storage: '64GB',
    colors: ['Black', 'White', 'Purple', 'Green', 'Yellow', 'Red']
  },
  {
    id: 'master-2',
    brand: 'Apple',
    modelName: 'iPhone 11',
    storage: '128GB',
    colors: ['Black', 'White', 'Purple', 'Green', 'Yellow', 'Red']
  },
  {
    id: 'master-3',
    brand: 'Apple',
    modelName: 'iPhone 11',
    storage: '256GB',
    colors: ['Black', 'White', 'Purple', 'Green', 'Yellow', 'Red']
  },
  {
    id: 'master-4',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '128GB',
    colors: ['Starlight', 'Midnight', 'Blue', 'Pink', 'Green', 'Red']
  },
  {
    id: 'master-5',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '256GB',
    colors: ['Starlight', 'Midnight', 'Blue', 'Pink', 'Green', 'Red']
  },
  {
    id: 'master-6',
    brand: 'Apple',
    modelName: 'iPhone 13',
    storage: '512GB',
    colors: ['Starlight', 'Midnight', 'Blue', 'Pink', 'Green', 'Red']
  },
  {
    id: 'master-7',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    storage: '256GB',
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
  },
  {
    id: 'master-8',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    storage: '512GB',
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium']
  },
  {
    id: 'master-9',
    brand: 'Samsung',
    modelName: 'Galaxy S24 Ultra',
    storage: '512GB',
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow']
  },
  {
    id: 'master-10',
    brand: 'Xiaomi',
    modelName: 'Redmi Note 13 Pro+',
    storage: '256GB',
    colors: ['Midnight Black', 'Moonlight White', 'Aurora Purple']
  }
];

