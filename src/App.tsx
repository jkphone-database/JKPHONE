import React, { useState, useEffect } from 'react';
import { 
  PhoneProduct, 
  BarangMasuk, 
  BarangKeluar, 
  Expense, 
  Transaction, 
  BcaMutation, 
  BackupData,
  AccessoryProduct,
  SparepartProduct,
  AccessorySparepartSale,
  ImeiUnlockRequest,
  ServiceNote,
  MasterProduct
} from './types';
import { 
  initialProducts, 
  initialBarangMasuk, 
  initialBarangKeluar, 
  initialExpenses, 
  initialTransactions, 
  initialBcaMutations,
  initialAccessories,
  initialSpareparts,
  initialAccSales,
  initialUnlockRequests,
  initialServiceNotes,
  initialMasterProducts
} from './initialData';

// Component Imports
import Dashboard from './components/Dashboard';
import StockAndBarangMasuk from './components/StockAndBarangMasuk';
import TransaksiMasuk from './components/TransaksiMasuk';
import BarangKeluarList from './components/BarangKeluarList';
import ExpensesList from './components/ExpensesList';
import BcaMutationManager from './components/BcaMutationManager';
import AccessoriesAndSpareparts from './components/AccessoriesAndSpareparts';
import ImeiUnlockTracker from './components/ImeiUnlockTracker';
import ServiceNotesManager from './components/ServiceNotesManager';
import MasterProductCatalog from './components/MasterProductCatalog';
import FinanceReport from './components/FinanceReport';

// Icon Imports
import { 
  Smartphone, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  FileText, 
  ArrowRightLeft, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  LogOut,
  Sparkles,
  ShoppingBag,
  Info,
  X,
  Wrench,
  KeyRound,
  Layers,
  ClipboardList,
  Coins
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States
  const [products, setProducts] = useState<PhoneProduct[]>([]);
  const [barangMasukList, setBarangMasukList] = useState<BarangMasuk[]>([]);
  const [barangKeluarList, setBarangKeluarList] = useState<BarangKeluar[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bcaMutations, setBcaMutations] = useState<BcaMutation[]>([]);

  // Accessory, Spareparts, Unlock & Service States
  const [accessories, setAccessories] = useState<AccessoryProduct[]>([]);
  const [spareparts, setSpareparts] = useState<SparepartProduct[]>([]);
  const [accSales, setAccSales] = useState<AccessorySparepartSale[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<ImeiUnlockRequest[]>([]);
  const [serviceNotes, setServiceNotes] = useState<ServiceNote[]>([]);
  
  // Master Product Catalog State
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);

  // Local Quick-invoice trigger state from bank mutation
  const [quickSaleMutation, setQuickSaleMutation] = useState<BcaMutation | null>(null);
  const [quickSaleProdId, setQuickSaleProdId] = useState('');
  const [quickSaleImei, setQuickSaleImei] = useState('');

  // 1. Initial State Loading & Persistence
  useEffect(() => {
    // Load products
    const storedProducts = localStorage.getItem('tokohp_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('tokohp_products', JSON.stringify(initialProducts));
    }

    // Load barang masuk
    const storedBM = localStorage.getItem('tokohp_bm');
    if (storedBM) {
      setBarangMasukList(JSON.parse(storedBM));
    } else {
      setBarangMasukList(initialBarangMasuk);
      localStorage.setItem('tokohp_bm', JSON.stringify(initialBarangMasuk));
    }

    // Load barang keluar
    const storedBK = localStorage.getItem('tokohp_bk');
    if (storedBK) {
      setBarangKeluarList(JSON.parse(storedBK));
    } else {
      setBarangKeluarList(initialBarangKeluar);
      localStorage.setItem('tokohp_bk', JSON.stringify(initialBarangKeluar));
    }

    // Load expenses
    const storedExpenses = localStorage.getItem('tokohp_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(initialExpenses);
      localStorage.setItem('tokohp_expenses', JSON.stringify(initialExpenses));
    }

    // Load transactions
    const storedTx = localStorage.getItem('tokohp_tx');
    if (storedTx) {
      setTransactions(JSON.parse(storedTx));
    } else {
      setTransactions(initialTransactions);
      localStorage.setItem('tokohp_tx', JSON.stringify(initialTransactions));
    }

    // Load mutations
    const storedMutations = localStorage.getItem('tokohp_mutations');
    if (storedMutations) {
      setBcaMutations(JSON.parse(storedMutations));
    } else {
      setBcaMutations(initialBcaMutations);
      localStorage.setItem('tokohp_mutations', JSON.stringify(initialBcaMutations));
    }

    // Load Accessories
    const storedAcc = localStorage.getItem('tokohp_accessories');
    if (storedAcc) {
      setAccessories(JSON.parse(storedAcc));
    } else {
      setAccessories(initialAccessories);
      localStorage.setItem('tokohp_accessories', JSON.stringify(initialAccessories));
    }

    // Load Spareparts
    const storedSp = localStorage.getItem('tokohp_spareparts');
    if (storedSp) {
      setSpareparts(JSON.parse(storedSp));
    } else {
      setSpareparts(initialSpareparts);
      localStorage.setItem('tokohp_spareparts', JSON.stringify(initialSpareparts));
    }

    // Load Accessory/Sparepart Sales
    const storedAccSales = localStorage.getItem('tokohp_accsales');
    if (storedAccSales) {
      setAccSales(JSON.parse(storedAccSales));
    } else {
      setAccSales(initialAccSales);
      localStorage.setItem('tokohp_accsales', JSON.stringify(initialAccSales));
    }

    // Load IMEI Unlock requests
    const storedUnlock = localStorage.getItem('tokohp_unlock');
    if (storedUnlock) {
      setUnlockRequests(JSON.parse(storedUnlock));
    } else {
      setUnlockRequests(initialUnlockRequests);
      localStorage.setItem('tokohp_unlock', JSON.stringify(initialUnlockRequests));
    }

    // Load Service Notes
    const storedServices = localStorage.getItem('tokohp_servicenotes');
    if (storedServices) {
      setServiceNotes(JSON.parse(storedServices));
    } else {
      setServiceNotes(initialServiceNotes);
      localStorage.setItem('tokohp_servicenotes', JSON.stringify(initialServiceNotes));
    }

    // Load Master Products Catalog
    const storedMaster = localStorage.getItem('tokohp_masterproducts');
    if (storedMaster) {
      setMasterProducts(JSON.parse(storedMaster));
    } else {
      setMasterProducts(initialMasterProducts);
      localStorage.setItem('tokohp_masterproducts', JSON.stringify(initialMasterProducts));
    }
  }, []);

  // Save changes to LocalStorage helpers
  const saveProducts = (data: PhoneProduct[]) => {
    setProducts(data);
    localStorage.setItem('tokohp_products', JSON.stringify(data));
  };

  const saveBarangMasuk = (data: BarangMasuk[]) => {
    setBarangMasukList(data);
    localStorage.setItem('tokohp_bm', JSON.stringify(data));
  };

  const saveBarangKeluar = (data: BarangKeluar[]) => {
    setBarangKeluarList(data);
    localStorage.setItem('tokohp_bk', JSON.stringify(data));
  };

  const saveExpenses = (data: Expense[]) => {
    setExpenses(data);
    localStorage.setItem('tokohp_expenses', JSON.stringify(data));
  };

  const saveTransactions = (data: Transaction[]) => {
    setTransactions(data);
    localStorage.setItem('tokohp_tx', JSON.stringify(data));
  };

  const saveMutations = (data: BcaMutation[]) => {
    setBcaMutations(data);
    localStorage.setItem('tokohp_mutations', JSON.stringify(data));
  };

  const saveAccessories = (data: AccessoryProduct[]) => {
    setAccessories(data);
    localStorage.setItem('tokohp_accessories', JSON.stringify(data));
  };

  const saveSpareparts = (data: SparepartProduct[]) => {
    setSpareparts(data);
    localStorage.setItem('tokohp_spareparts', JSON.stringify(data));
  };

  const saveAccSales = (data: AccessorySparepartSale[]) => {
    setAccSales(data);
    localStorage.setItem('tokohp_accsales', JSON.stringify(data));
  };

  const saveUnlockRequests = (data: ImeiUnlockRequest[]) => {
    setUnlockRequests(data);
    localStorage.setItem('tokohp_unlock', JSON.stringify(data));
  };

  const saveServiceNotes = (data: ServiceNote[]) => {
    setServiceNotes(data);
    localStorage.setItem('tokohp_servicenotes', JSON.stringify(data));
  };

  const saveMasterProducts = (data: MasterProduct[]) => {
    setMasterProducts(data);
    localStorage.setItem('tokohp_masterproducts', JSON.stringify(data));
  };


  // 2. State mutating Functions (Business Logic)

  // - Barang Masuk
  const handleAddBarangMasuk = (item: Omit<BarangMasuk, 'id'>) => {
    const newBmId = `bm-${Date.now()}`;
    const newBmEntry: BarangMasuk = { ...item, id: newBmId };
    
    // Append entry to history
    const updatedBMList = [newBmEntry, ...barangMasukList];
    saveBarangMasuk(updatedBMList);

    // Update Products Stock
    const updatedProducts = [...products];
    const matchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === item.brand.toLowerCase() &&
      p.modelName.toLowerCase() === item.modelName.toLowerCase() &&
      p.storage === item.storage &&
      p.color.toLowerCase() === item.color.toLowerCase() &&
      p.condition === item.condition &&
      (p.signalType || 'iBox').toLowerCase() === (item.signalType || 'iBox').toLowerCase()
    );

    if (matchIdx > -1) {
      // Exist: Update stock and append IMEIs
      updatedProducts[matchIdx].stock += item.qty;
      updatedProducts[matchIdx].imeis = [...updatedProducts[matchIdx].imeis, ...item.imeis];
      // Keep averaged purchase price
      updatedProducts[matchIdx].purchasePrice = Math.round((updatedProducts[matchIdx].purchasePrice + item.purchasePrice) / 2);
      if (item.sellingPrice && item.sellingPrice > 0) {
        updatedProducts[matchIdx].sellingPrice = item.sellingPrice;
      }
    } else {
      // New Product
      const newProduct: PhoneProduct = {
        id: `prod-${Date.now()}`,
        brand: item.brand,
        modelName: item.modelName,
        storage: item.storage,
        color: item.color,
        condition: item.condition,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice || (item.purchasePrice + 500000), // markup default
        stock: item.qty,
        imeis: item.imeis,
        signalType: item.signalType || 'iBox'
      };
      updatedProducts.push(newProduct);
    }
    saveProducts(updatedProducts);
  };

  const handleDeleteBarangMasuk = (id: string) => {
    const bmEntry = barangMasukList.find(b => b.id === id);
    if (!bmEntry) return;

    // Deduct stock and remove IMEIs
    const updatedProducts = [...products];
    const matchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === bmEntry.brand.toLowerCase() &&
      p.modelName.toLowerCase() === bmEntry.modelName.toLowerCase() &&
      p.storage === bmEntry.storage &&
      p.color.toLowerCase() === bmEntry.color.toLowerCase() &&
      p.condition === bmEntry.condition &&
      (p.signalType || 'iBox').toLowerCase() === (bmEntry.signalType || 'iBox').toLowerCase()
    );

    if (matchIdx > -1) {
      updatedProducts[matchIdx].stock = Math.max(0, updatedProducts[matchIdx].stock - bmEntry.qty);
      // Filter out the exact IMEIs introduced by this BM entry
      updatedProducts[matchIdx].imeis = updatedProducts[matchIdx].imeis.filter(
        imei => !bmEntry.imeis.includes(imei)
      );
    }

    const updatedBMList = barangMasukList.filter(b => b.id !== id);
    saveBarangMasuk(updatedBMList);
    saveProducts(updatedProducts);
  };

  const handleEditBarangMasuk = (editedItem: BarangMasuk) => {
    const oldItem = barangMasukList.find(b => b.id === editedItem.id);
    if (!oldItem) return;

    let updatedProducts = [...products];

    // Revert the old item stock deduction and IMEI removal
    const oldMatchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === oldItem.brand.toLowerCase() &&
      p.modelName.toLowerCase() === oldItem.modelName.toLowerCase() &&
      p.storage === oldItem.storage &&
      p.color.toLowerCase() === oldItem.color.toLowerCase() &&
      p.condition === oldItem.condition &&
      (p.signalType || 'iBox').toLowerCase() === (oldItem.signalType || 'iBox').toLowerCase()
    );
    if (oldMatchIdx > -1) {
      updatedProducts[oldMatchIdx].stock = Math.max(0, updatedProducts[oldMatchIdx].stock - oldItem.qty);
      updatedProducts[oldMatchIdx].imeis = updatedProducts[oldMatchIdx].imeis.filter(
        imei => !oldItem.imeis.includes(imei)
      );
    }

    // Apply the new edited item stock addition and IMEI append
    const newMatchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === editedItem.brand.toLowerCase() &&
      p.modelName.toLowerCase() === editedItem.modelName.toLowerCase() &&
      p.storage === editedItem.storage &&
      p.color.toLowerCase() === editedItem.color.toLowerCase() &&
      p.condition === editedItem.condition &&
      (p.signalType || 'iBox').toLowerCase() === (editedItem.signalType || 'iBox').toLowerCase()
    );

    if (newMatchIdx > -1) {
      updatedProducts[newMatchIdx].stock += editedItem.qty;
      updatedProducts[newMatchIdx].imeis = [...updatedProducts[newMatchIdx].imeis, ...editedItem.imeis];
      if (editedItem.sellingPrice && editedItem.sellingPrice > 0) {
        updatedProducts[newMatchIdx].sellingPrice = editedItem.sellingPrice;
      }
    } else {
      const newProduct: PhoneProduct = {
        id: `prod-${Date.now()}`,
        brand: editedItem.brand,
        modelName: editedItem.modelName,
        storage: editedItem.storage,
        color: editedItem.color,
        condition: editedItem.condition,
        purchasePrice: editedItem.purchasePrice,
        sellingPrice: editedItem.sellingPrice || (editedItem.purchasePrice + 500000),
        stock: editedItem.qty,
        imeis: editedItem.imeis,
        signalType: editedItem.signalType || 'iBox'
      };
      updatedProducts.push(newProduct);
    }

    const updatedBMList = barangMasukList.map(b => b.id === editedItem.id ? editedItem : b);
    saveBarangMasuk(updatedBMList);
    saveProducts(updatedProducts);
  };


  // - Formal Retail sales (Transaksi Masuk / Barang Keluar)
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'invoiceNumber'>) => {
    // Generate Invoice Number: INV-YYYYMMDD-XXX
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const txCountToday = transactions.filter(t => t.date.replace(/-/g, '') === todayStr).length;
    const invNum = `INV-${todayStr}-${String(txCountToday + 1).padStart(3, '0')}`;
    
    const newTxId = `tx-${Date.now()}`;
    const newTransaction: Transaction = {
      ...tx,
      id: newTxId,
      invoiceNumber: invNum
    };

    // 1. Deduct units from stock & remove individual IMEI numbers
    const updatedProducts = [...products];
    const newBkList = [...barangKeluarList];

    tx.items.forEach(soldItem => {
      const matchIdx = updatedProducts.findIndex(p => p.id === soldItem.productId);
      if (matchIdx > -1) {
        updatedProducts[matchIdx].stock = Math.max(0, updatedProducts[matchIdx].stock - 1);
        updatedProducts[matchIdx].imeis = updatedProducts[matchIdx].imeis.filter(i => i !== soldItem.imei);
      }

      // 2. Spawn corresponding dynamic "Barang Keluar" logs
      const bkId = `bk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      newBkList.unshift({
        id: bkId,
        date: tx.date,
        brand: soldItem.brand,
        modelName: soldItem.modelName,
        storage: soldItem.storage,
        color: soldItem.color,
        condition: soldItem.condition,
        qty: 1,
        sellingPrice: soldItem.price,
        buyer: tx.customerName,
        imeis: [soldItem.imei],
        linkedTransactionId: newTxId,
        signalType: soldItem.signalType || 'iBox',
        notes: `Penjualan kasir Invoice ${invNum}`
      });
    });

    // 3. Reconcile matching bank mutation if bcaMutationId is pre-bound
    if (tx.bcaMutationId) {
      const updatedMutations = bcaMutations.map(m => {
        if (m.id === tx.bcaMutationId) {
          return { ...m, status: 'Matched' as const, linkedTransactionId: newTxId };
        }
        return m;
      });
      saveMutations(updatedMutations);
    }

    saveBarangKeluar(newBkList);
    saveProducts(updatedProducts);
    saveTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // 1. Restore product stocks and replenish IMEIs
    const updatedProducts = [...products];
    tx.items.forEach(soldItem => {
      const matchIdx = updatedProducts.findIndex(p => p.id === soldItem.productId);
      if (matchIdx > -1) {
        updatedProducts[matchIdx].stock += 1;
        // replenish IMEI back into lists
        if (!updatedProducts[matchIdx].imeis.includes(soldItem.imei)) {
          updatedProducts[matchIdx].imeis.push(soldItem.imei);
        }
      }
    });

    // 2. Remove associated Barang Keluar list
    const updatedBK = barangKeluarList.filter(bk => bk.linkedTransactionId !== id);
    
    // 3. If reconciled to a BCA bank statement mutation, restore it to Unmatched
    let updatedMutations = [...bcaMutations];
    if (tx.bcaMutationId) {
      updatedMutations = updatedMutations.map(m => {
        if (m.id === tx.bcaMutationId) {
          return { ...m, status: 'Unmatched' as const, linkedTransactionId: undefined };
        }
        return m;
      });
      saveMutations(updatedMutations);
    }

    saveProducts(updatedProducts);
    saveBarangKeluar(updatedBK);
    saveTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEditTransaction = (editedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === editedTx.id);
    if (!oldTx) return;

    // 1. Restore product stock of old items
    let updatedProducts = [...products];
    oldTx.items.forEach(soldItem => {
      const matchIdx = updatedProducts.findIndex(p => p.id === soldItem.productId);
      if (matchIdx > -1) {
        updatedProducts[matchIdx].stock += 1;
        if (!updatedProducts[matchIdx].imeis.includes(soldItem.imei)) {
          updatedProducts[matchIdx].imeis.push(soldItem.imei);
        }
      }
    });

    // 2. Deduct product stock of new items
    editedTx.items.forEach(soldItem => {
      const matchIdx = updatedProducts.findIndex(p => p.id === soldItem.productId);
      if (matchIdx > -1) {
        updatedProducts[matchIdx].stock = Math.max(0, updatedProducts[matchIdx].stock - 1);
        updatedProducts[matchIdx].imeis = updatedProducts[matchIdx].imeis.filter(i => i !== soldItem.imei);
      }
    });

    // 3. Update Barang Keluar log entries
    let updatedBK = barangKeluarList.filter(bk => bk.linkedTransactionId !== editedTx.id);
    editedTx.items.forEach(item => {
      const newBkEntry: BarangKeluar = {
        id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: editedTx.date,
        brand: item.brand,
        modelName: item.modelName,
        storage: item.storage,
        color: item.color,
        condition: item.condition,
        qty: 1,
        sellingPrice: item.price,
        buyer: editedTx.customerName,
        imeis: [item.imei],
        signalType: item.signalType || 'iBox',
        notes: `Penjualan ${editedTx.invoiceNumber}`,
        linkedTransactionId: editedTx.id
      };
      updatedBK.push(newBkEntry);
    });

    // 4. Update bca mutation link
    let updatedMutations = [...bcaMutations];
    if (oldTx.bcaMutationId && oldTx.bcaMutationId !== editedTx.bcaMutationId) {
      updatedMutations = updatedMutations.map(m => {
        if (m.id === oldTx.bcaMutationId) {
          return { ...m, status: 'Unmatched' as const, linkedTransactionId: undefined };
        }
        return m;
      });
    }
    if (editedTx.bcaMutationId) {
      updatedMutations = updatedMutations.map(m => {
        if (m.id === editedTx.bcaMutationId) {
          return { ...m, status: 'Matched' as const, linkedTransactionId: editedTx.id };
        }
        return m;
      });
    }

    saveProducts(updatedProducts);
    saveBarangKeluar(updatedBK);
    saveMutations(updatedMutations);
    
    const updatedTransactions = transactions.map(t => t.id === editedTx.id ? editedTx : t);
    saveTransactions(updatedTransactions);
  };


  // - Barang Keluar (Manual Adjustments)
  const handleAddBarangKeluar = (item: Omit<BarangKeluar, 'id'>) => {
    const newBkId = `bk-${Date.now()}`;
    const newBkEntry: BarangKeluar = { ...item, id: newBkId };

    // Update stock
    const updatedProducts = [...products];
    const matchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === item.brand.toLowerCase() &&
      p.modelName.toLowerCase() === item.modelName.toLowerCase() &&
      p.storage === item.storage &&
      p.color.toLowerCase() === item.color.toLowerCase() &&
      p.condition === item.condition &&
      p.signalType === item.signalType
    );

    if (matchIdx > -1) {
      updatedProducts[matchIdx].stock = Math.max(0, updatedProducts[matchIdx].stock - item.qty);
      // Remove selected IMEIs
      updatedProducts[matchIdx].imeis = updatedProducts[matchIdx].imeis.filter(
        i => !item.imeis.includes(i)
      );
    }

    saveProducts(updatedProducts);
    saveBarangKeluar([newBkEntry, ...barangKeluarList]);
  };

  const handleDeleteBarangKeluar = (id: string) => {
    const bkEntry = barangKeluarList.find(b => b.id === id);
    if (!bkEntry) return;

    // Put unit and IMEIs back
    const updatedProducts = [...products];
    const matchIdx = updatedProducts.findIndex(p => 
      p.brand.toLowerCase() === bkEntry.brand.toLowerCase() &&
      p.modelName.toLowerCase() === bkEntry.modelName.toLowerCase() &&
      p.storage === bkEntry.storage &&
      p.color.toLowerCase() === bkEntry.color.toLowerCase() &&
      p.condition === bkEntry.condition &&
      p.signalType === bkEntry.signalType
    );

    if (matchIdx > -1) {
      updatedProducts[matchIdx].stock += bkEntry.qty;
      bkEntry.imeis.forEach(imei => {
        if (!updatedProducts[matchIdx].imeis.includes(imei)) {
          updatedProducts[matchIdx].imeis.push(imei);
        }
      });
    }

    saveProducts(updatedProducts);
    saveBarangKeluar(barangKeluarList.filter(b => b.id !== id));
  };


  // - Expenses
  const handleAddExpense = (item: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...item, id: `exp-${Date.now()}` };
    saveExpenses([newExp, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };


  // - Bank Mutations (AI-Powered)
  const handleAddMutations = (newMutList: Omit<BcaMutation, 'id' | 'status'>[]) => {
    const updatedMutations = [...bcaMutations];
    let addedCount = 0;

    newMutList.forEach(m => {
      // Intelligent DUPLICATE detection
      const isDuplicate = updatedMutations.some(exist => 
        exist.date === m.date &&
        exist.amount === m.amount &&
        exist.type === m.type &&
        exist.description.toLowerCase() === m.description.toLowerCase()
      );

      if (!isDuplicate) {
        updatedMutations.unshift({
          ...m,
          id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'Unmatched'
        });
        addedCount++;
      }
    });

    saveMutations(updatedMutations);
    if (addedCount === 0) {
      alert('Semua baris mutasi rekening sudah terdaftar di database.');
    }
  };

  const handleLinkMutationToTransaction = (mutationId: string, transactionId: string) => {
    // 1. Link mutation side
    const updatedMutations = bcaMutations.map(m => {
      if (m.id === mutationId) {
        return { ...m, status: 'Matched' as const, linkedTransactionId: transactionId };
      }
      return m;
    });

    // 2. Link transaction side
    const updatedTransactions = transactions.map(tx => {
      if (tx.id === transactionId) {
        return { ...tx, bcaMutationId: mutationId, status: 'Lunas' as const };
      }
      return tx;
    });

    saveMutations(updatedMutations);
    saveTransactions(updatedTransactions);
  };

  const handleUnlinkMutation = (mutationId: string) => {
    // 1. Unlink mutation
    const updatedMutations = bcaMutations.map(m => {
      if (m.id === mutationId) {
        return { ...m, status: 'Unmatched' as const, linkedTransactionId: undefined };
      }
      return m;
    });

    // 2. Unlink transaction
    const updatedTransactions = transactions.map(tx => {
      if (tx.bcaMutationId === mutationId) {
        return { ...tx, bcaMutationId: undefined };
      }
      return tx;
    });

    saveMutations(updatedMutations);
    saveTransactions(updatedTransactions);
  };

  const handleDeleteMutation = (id: string) => {
    const mut = bcaMutations.find(m => m.id === id);
    if (mut && mut.status === 'Matched') {
      handleUnlinkMutation(id);
    }
    saveMutations(bcaMutations.filter(m => m.id !== id));
  };

  const handleSetMutationStatus = (id: string, status: 'Unmatched' | 'Matched' | 'Manual') => {
    const mut = bcaMutations.find(m => m.id === id);
    if (mut && mut.status === 'Matched' && status !== 'Matched') {
      handleUnlinkMutation(id);
    }
    saveMutations(bcaMutations.map(m => m.id === id ? { ...m, status } : m));
  };


  // - Accessories Operations
  const handleAddAccessory = (item: Omit<AccessoryProduct, 'id'>) => {
    const newAcc: AccessoryProduct = { ...item, id: `acc-${Date.now()}` };
    saveAccessories([newAcc, ...accessories]);
  };

  const handleEditAccessory = (item: AccessoryProduct) => {
    saveAccessories(accessories.map(a => a.id === item.id ? item : a));
  };

  const handleDeleteAccessory = (id: string) => {
    saveAccessories(accessories.filter(a => a.id !== id));
  };


  // - Spareparts Operations
  const handleAddSparepart = (item: Omit<SparepartProduct, 'id'>) => {
    const newSp: SparepartProduct = { ...item, id: `sp-${Date.now()}` };
    saveSpareparts([newSp, ...spareparts]);
  };

  const handleEditSparepart = (item: SparepartProduct) => {
    saveSpareparts(spareparts.map(s => s.id === item.id ? item : s));
  };

  const handleDeleteSparepart = (id: string) => {
    saveSpareparts(spareparts.filter(s => s.id !== id));
  };


  // - Accessory Sparepart Sales Checkout
  const handleAddAccSale = (sale: Omit<AccessorySparepartSale, 'id' | 'invoiceNumber'>) => {
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const countToday = accSales.filter(s => s.date.replace(/-/g, '') === todayStr).length;
    const invNum = `ACC-${todayStr}-${String(countToday + 1).padStart(3, '0')}`;

    const newSale: AccessorySparepartSale = {
      ...sale,
      id: `acc-sale-${Date.now()}`,
      invoiceNumber: invNum
    };

    // Decrease inventories
    const updatedAcc = [...accessories];
    const updatedSp = [...spareparts];

    sale.items.forEach(item => {
      if (item.type === 'Aksesoris') {
        const idx = updatedAcc.findIndex(a => a.id === item.itemId);
        if (idx > -1) {
          updatedAcc[idx].stock = Math.max(0, updatedAcc[idx].stock - item.qty);
        }
      } else {
        const idx = updatedSp.findIndex(s => s.id === item.itemId);
        if (idx > -1) {
          updatedSp[idx].stock = Math.max(0, updatedSp[idx].stock - item.qty);
        }
      }
    });

    saveAccessories(updatedAcc);
    saveSpareparts(updatedSp);
    saveAccSales([newSale, ...accSales]);
  };

  const handleDeleteAccSale = (id: string) => {
    const sale = accSales.find(s => s.id === id);
    if (!sale) return;

    // Restore stock
    const updatedAcc = [...accessories];
    const updatedSp = [...spareparts];

    sale.items.forEach(item => {
      if (item.type === 'Aksesoris') {
        const idx = updatedAcc.findIndex(a => a.id === item.itemId);
        if (idx > -1) {
          updatedAcc[idx].stock += item.qty;
        }
      } else {
        const idx = updatedSp.findIndex(s => s.id === item.itemId);
        if (idx > -1) {
          updatedSp[idx].stock += item.qty;
        }
      }
    });

    saveAccessories(updatedAcc);
    saveSpareparts(updatedSp);
    saveAccSales(accSales.filter(s => s.id !== id));
  };


  // - IMEI Unlock Requests
  const handleAddUnlockRequest = (request: Omit<ImeiUnlockRequest, 'id'>) => {
    const newReq: ImeiUnlockRequest = { ...request, id: `unlock-${Date.now()}` };
    saveUnlockRequests([newReq, ...unlockRequests]);
  };

  const handleUpdateUnlockStatus = (id: string, status: ImeiUnlockRequest['status'], notes?: string) => {
    saveUnlockRequests(unlockRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          notes: notes !== undefined ? notes : r.notes
        };
      }
      return r;
    }));
  };

  const handleDeleteUnlockRequest = (id: string) => {
    saveUnlockRequests(unlockRequests.filter(r => r.id !== id));
  };


  // - Service Notes Operations
  const handleAddServiceNote = (note: Omit<ServiceNote, 'id' | 'serviceNumber'>) => {
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const countToday = serviceNotes.filter(s => s.date.replace(/-/g, '') === todayStr).length;
    const srvNum = `SRV-${todayStr}-${String(countToday + 1).padStart(3, '0')}`;

    const newNote: ServiceNote = {
      ...note,
      id: `srv-${Date.now()}`,
      serviceNumber: srvNum
    };
    saveServiceNotes([newNote, ...serviceNotes]);
  };

  const handleUpdateServiceStatus = (id: string, status: ServiceNote['status'], actualCost?: number, techNotes?: string) => {
    saveServiceNotes(serviceNotes.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          actualCost: actualCost !== undefined ? actualCost : s.actualCost,
          technicianNotes: techNotes !== undefined ? techNotes : s.technicianNotes
        };
      }
      return s;
    }));
  };

  const handleDeleteServiceNote = (id: string) => {
    saveServiceNotes(serviceNotes.filter(s => s.id !== id));
  };


  // - Master Product Catalog Operations
  const handleAddMasterProduct = (product: Omit<MasterProduct, 'id'>) => {
    const newProd: MasterProduct = {
      ...product,
      id: `master-${Date.now()}`
    };
    saveMasterProducts([newProd, ...masterProducts]);
  };

  const handleEditMasterProduct = (updatedProduct: MasterProduct) => {
    saveMasterProducts(masterProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteMasterProduct = (id: string) => {
    saveMasterProducts(masterProducts.filter(p => p.id !== id));
  };


  // 3. Backup & Reset Systems (Thoroughly handles all 12 models!)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify({
      products,
      barangMasuk: barangMasukList,
      barangKeluar: barangKeluarList,
      expenses,
      transactions,
      bcaMutations,
      accessories,
      spareparts,
      accSales,
      unlockRequests,
      serviceNotes,
      masterProducts
    } as BackupData, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_jkphone_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed: any = JSON.parse(evt.target?.result as string);
        
        if (parsed.products) saveProducts(parsed.products);
        if (parsed.barangMasuk) saveBarangMasuk(parsed.barangMasuk);
        if (parsed.barangKeluar) saveBarangKeluar(parsed.barangKeluar);
        if (parsed.expenses) saveExpenses(parsed.expenses);
        if (parsed.transactions) saveTransactions(parsed.transactions);
        if (parsed.bcaMutations) saveMutations(parsed.bcaMutations);
        if (parsed.accessories) saveAccessories(parsed.accessories);
        if (parsed.spareparts) saveSpareparts(parsed.spareparts);
        if (parsed.accSales) saveAccSales(parsed.accSales);
        if (parsed.unlockRequests) saveUnlockRequests(parsed.unlockRequests);
        if (parsed.serviceNotes) saveServiceNotes(parsed.serviceNotes);
        if (parsed.masterProducts) saveMasterProducts(parsed.masterProducts);

        alert('Database JK PHONE berhasil dipulihkan lunas dari file backup!');
        window.location.reload();
      } catch (err: any) {
        alert(`Gagal meng-import file cadangan: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSeeds = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang database JK PHONE Anda kembali ke template contoh awal? Semua data input baru Anda akan terhapus.')) {
      saveProducts(initialProducts);
      saveBarangMasuk(initialBarangMasuk);
      saveBarangKeluar(initialBarangKeluar);
      saveExpenses(initialExpenses);
      saveTransactions(initialTransactions);
      saveMutations(initialBcaMutations);
      saveAccessories(initialAccessories);
      saveSpareparts(initialSpareparts);
      saveAccSales(initialAccSales);
      saveUnlockRequests(initialUnlockRequests);
      saveServiceNotes(initialServiceNotes);
      saveMasterProducts(initialMasterProducts);
      alert('Database JK PHONE berhasil disetel ulang ke kondisi awal!');
      window.location.reload();
    }
  };


  // Quick Sale generation handler from bank mutation modal
  const handleQuickSaleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSaleMutation || !quickSaleProdId || !quickSaleImei) {
      alert('Silakan pilih HP dan nomor IMEI terlebih dahulu!');
      return;
    }

    const prod = products.find(p => p.id === quickSaleProdId);
    if (!prod) return;

    // Generate Sale Transaction
    handleAddTransaction({
      date: quickSaleMutation.date.includes('/') 
        ? `${new Date().getFullYear()}-${quickSaleMutation.date.split('/').reverse().join('-')}`
        : quickSaleMutation.date,
      customerName: `Pembeli Transfer via BCA`,
      customerPhone: '',
      items: [
        {
          productId: prod.id,
          brand: prod.brand,
          modelName: prod.modelName,
          storage: prod.storage,
          color: prod.color,
          condition: prod.condition,
          imei: quickSaleImei,
          price: quickSaleMutation.amount,
          signalType: prod.signalType || 'iBox'
        }
      ],
      discount: 0,
      totalAmount: quickSaleMutation.amount,
      paymentMethod: 'Transfer BCA',
      status: 'Lunas',
      bcaMutationId: quickSaleMutation.id,
      notes: `Ditulis otomatis via Jual Cepat Mutasi BCA: "${quickSaleMutation.description}"`
    });

    // Close and reset popup
    setQuickSaleMutation(null);
    setQuickSaleProdId('');
    setQuickSaleImei('');
    
    alert('Invoice penjualan instan berhasil dibuat & langsung terverifikasi lunas via Mutasi BCA!');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* Top Professional Header Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-wider">JK PHONE</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Sistem Manajemen Stok HP & Mutasi BCA</p>
            </div>
          </div>

          {/* Action Tools: Backup & Cadangan */}
          <div className="flex items-center gap-2">
            <button
              id="btn-seed-reset"
              onClick={handleResetToSeeds}
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition cursor-pointer"
              title="Reset ke Contoh Awal"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
            <button
              id="btn-backup-export"
              onClick={handleExportBackup}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Ekspor Backup File Cadangan JSON"
            >
              <Download className="h-4.5 w-4.5" /> <span className="hidden sm:inline">Backup</span>
            </button>
            <label className="p-2 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold">
              <Upload className="h-4.5 w-4.5" /> <span className="hidden sm:inline">Import</span>
              <input
                id="btn-backup-import"
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main Body Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6 w-full" id="app-body-container">
        
        {/* SIDEBAR NAVIGATION BAR */}
        <nav className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none" id="sidebar-nav">
          {/* 1. Ringkasan Toko */}
          <button
            id="nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" /> Ringkasan Toko
          </button>
          
          {/* 2. Master Barang & Historis Barang */}
          <button
            id="nav-master-catalog"
            onClick={() => setActiveTab('master-catalog')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'master-catalog'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <ClipboardList className="h-4.5 w-4.5" /> Master Barang & Historis Barang
          </button>

          {/* 3. Stok HP & Barang Masuk */}
          <button
            id="nav-stock"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Smartphone className="h-4.5 w-4.5" /> Stok HP & Barang Masuk
          </button>

          {/* 4. Penjualan & Barang Keluar */}
          <button
            id="nav-transactions"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" /> Penjualan & Barang Keluar
          </button>

          {/* 5. Stok Aksesoris */}
          <button
            id="nav-acc-sp"
            onClick={() => setActiveTab('acc-sp')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'acc-sp'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Layers className="h-4.5 w-4.5" /> Stok Aksesoris
          </button>

          {/* 6. Stok Sparerpart & Nota Service */}
          <button
            id="nav-services"
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Wrench className="h-4.5 w-4.5" /> Stok Sparepart & Nota Service
          </button>

          {/* 7. Jasa Unlock IMEI */}
          <button
            id="nav-unlock"
            onClick={() => setActiveTab('unlock')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'unlock'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <KeyRound className="h-4.5 w-4.5" /> Jasa Unlock IMEI
          </button>

          {/* 8. Pengeluaran Operasional */}
          <button
            id="nav-expenses"
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <DollarSign className="h-4.5 w-4.5" /> Pengeluaran Operasional
          </button>

          {/* 9. Laporan Mutasi BCA */}
          <button
            id="nav-bca"
            onClick={() => setActiveTab('bca')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'bca'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="h-4.5 w-4.5" /> Laporan Mutasi BCA
            </div>
            {bcaMutations.filter(m => m.type === 'CR' && m.status === 'Unmatched').length > 0 && (
              <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {bcaMutations.filter(m => m.type === 'CR' && m.status === 'Unmatched').length}
              </span>
            )}
          </button>

          {/* 10. Laporan Keuangan */}
          <button
            id="nav-finance-report"
            onClick={() => setActiveTab('finance-report')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'finance-report'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <Coins className="h-4.5 w-4.5" /> Laporan Keuangan
          </button>
        </nav>

        {/* MAIN COMPONENT VIEWER AREA */}
        <main className="flex-1 min-w-0" id="main-content-view">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products}
              expenses={expenses}
              transactions={transactions}
              mutations={bcaMutations}
              onTabChange={setActiveTab}
              accessories={accessories}
              spareparts={spareparts}
              accSales={accSales}
              unlockRequests={unlockRequests}
              serviceNotes={serviceNotes}
              barangMasukList={barangMasukList}
            />
          )}

          {activeTab === 'stock' && (
            <StockAndBarangMasuk 
              products={products}
              barangMasukList={barangMasukList}
              onAddBarangMasuk={handleAddBarangMasuk}
              onEditBarangMasuk={handleEditBarangMasuk}
              onDeleteBarangMasuk={handleDeleteBarangMasuk}
              masterProducts={masterProducts}
            />
          )}

          {activeTab === 'master-catalog' && (
            <MasterProductCatalog 
              masterProducts={masterProducts}
              onAddMasterProduct={handleAddMasterProduct}
              onEditMasterProduct={handleEditMasterProduct}
              onDeleteMasterProduct={handleDeleteMasterProduct}
              barangMasukList={barangMasukList}
              barangKeluarList={barangKeluarList}
            />
          )}

          {activeTab === 'transactions' && (
            <TransaksiMasuk 
              products={products}
              transactions={transactions}
              mutations={bcaMutations}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'barang-keluar' && (
            <BarangKeluarList 
              products={products}
              barangKeluarList={barangKeluarList}
              onAddBarangKeluar={handleAddBarangKeluar}
              onDeleteBarangKeluar={handleDeleteBarangKeluar}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesList 
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'bca' && (
            <BcaMutationManager 
              mutations={bcaMutations}
              transactions={transactions}
              onAddMutations={handleAddMutations}
              onLinkMutationToTransaction={handleLinkMutationToTransaction}
              onUnlinkMutation={handleUnlinkMutation}
              onDeleteMutation={handleDeleteMutation}
              onSetMutationStatus={handleSetMutationStatus}
              onQuickCreateInvoice={(mut) => {
                setQuickSaleMutation(mut);
                setQuickSaleProdId('');
                setQuickSaleImei('');
              }}
            />
          )}

          {activeTab === 'acc-sp' && (
            <AccessoriesAndSpareparts
              accessories={accessories}
              spareparts={spareparts}
              accSales={accSales}
              onAddAccessory={handleAddAccessory}
              onEditAccessory={handleEditAccessory}
              onDeleteAccessory={handleDeleteAccessory}
              onAddAccSale={handleAddAccSale}
              onDeleteAccSale={handleDeleteAccSale}
            />
          )}

          {activeTab === 'unlock' && (
            <ImeiUnlockTracker
              unlockRequests={unlockRequests}
              onAddUnlockRequest={handleAddUnlockRequest}
              onUpdateUnlockStatus={handleUpdateUnlockStatus}
              onDeleteUnlockRequest={handleDeleteUnlockRequest}
            />
          )}

          {activeTab === 'services' && (
            <ServiceNotesManager
              serviceNotes={serviceNotes}
              onAddServiceNote={handleAddServiceNote}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onDeleteServiceNote={handleDeleteServiceNote}
              spareparts={spareparts}
              accSales={accSales}
              onAddSparepart={handleAddSparepart}
              onEditSparepart={handleEditSparepart}
              onDeleteSparepart={handleDeleteSparepart}
            />
          )}

          {activeTab === 'finance-report' && (
            <FinanceReport
              products={products}
              expenses={expenses}
              transactions={transactions}
              accessories={accessories}
              spareparts={spareparts}
              accSales={accSales}
              unlockRequests={unlockRequests}
              serviceNotes={serviceNotes}
              barangMasukList={barangMasukList}
            />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400" id="app-footer">
        <p>© 2026 JK PHONE. Semua Hak Dilindungi Pembukuan. Terintegrasi mutasi rekening BCA & AI parsing.</p>
      </footer>

      {/* QUICK SALE RECONCILIATION MODAL */}
      {quickSaleMutation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="quick-sale-modal">
          <form onSubmit={handleQuickSaleReconcileSubmit} className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-4 bg-amber-500 text-amber-950 flex justify-between items-center">
              <span className="font-bold text-xs tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> Jual Cepat via Mutasi BCA
              </span>
              <button
                id="btn-close-quick-sale"
                type="button"
                onClick={() => setQuickSaleMutation(null)}
                className="text-amber-950 hover:bg-amber-600/20 p-1 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-1 text-xs text-amber-900">
                <p>Membuat invoice penjualan lunas otomatis berdasarkan mutasi bank berikut:</p>
                <div className="font-bold font-mono text-amber-950 mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(quickSaleMutation.amount)}</div>
                <div className="italic text-amber-800">" {quickSaleMutation.description} "</div>
              </div>

              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Pilih HP yang Terjual</label>
                <select
                  id="quick-sale-product-select"
                  value={quickSaleProdId}
                  onChange={(e) => {
                    setQuickSaleProdId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    setQuickSaleImei(prod?.imeis[0] || '');
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">-- Pilih HP In Stock --</option>
                  {products.filter(p => p.stock > 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} {p.modelName} ({p.storage} • {p.color}) - Ready {p.stock} Unit
                    </option>
                  ))}
                </select>
              </div>

              {/* IMEI Select */}
              {quickSaleProdId && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Pilih IMEI Terjual</label>
                  <select
                    id="quick-sale-imei-select"
                    value={quickSaleImei}
                    onChange={(e) => setQuickSaleImei(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  >
                    {products.find(p => p.id === quickSaleProdId)?.imeis.map(imei => (
                      <option key={imei} value={imei}>{imei}</option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-normal flex items-start gap-1">
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                Sistem akan membuat invoice lunas dengan nominal di atas, meluncurkan data unit ini ke "Barang Keluar", dan langsung menandai Mutasi BCA ini sebagai Matched.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                id="btn-cancel-quick-sale-act"
                type="button"
                onClick={() => setQuickSaleMutation(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-quick-sale-act"
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                disabled={!quickSaleProdId || !quickSaleImei}
              >
                <Sparkles className="h-4 w-4" /> Proses Penjualan Lunas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
