import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Smartphone, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Keyboard, 
  RefreshCw, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface ImeiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedValue: string) => void;
  onScanMultipleSuccess?: (scannedValues: string[]) => void;
  mode: 'single' | 'multiple';
  title?: string;
  placeholder?: string;
}

export default function ImeiScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  onScanMultipleSuccess,
  mode = 'single',
  title = 'Scan IMEI HP',
  placeholder = 'Arahkan kamera ke barcode IMEI atau ketik manual...'
}: ImeiScannerModalProps) {
  
  const [activeTab, setActiveTab] = useState<'kamera' | 'manual'>('kamera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedQueue, setScannedQueue] = useState<string[]>([]);
  const [manualInputValue, setManualInputValue] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanningStatus, setScanningStatus] = useState<'idle' | 'success' | 'duplicate'>('idle');
  const [lastScannedCode, setLastScannedCode] = useState('');

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Play beep sound helper
  const playBeep = (freq = 800, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context beep failed", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCameraError(null);
      setScannedQueue([]);
      setManualInputValue('');
      setScanningStatus('idle');
      setLastScannedCode('');
      // Open with camera by default
      setActiveTab('kamera');
      setIsCameraActive(true);
    } else {
      setIsCameraActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const elementId = 'imei-camera-viewfinder';
    
    if (isCameraActive && activeTab === 'kamera' && isOpen) {
      setCameraError(null);
      
      // Delay slightly to ensure element exists in DOM
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5Qrcode(elementId);
          html5QrcodeRef.current = scanner;
          
          scanner.start(
            { facingMode: 'environment' }, // Default to back camera
            {
              fps: 15,
              qrbox: (width, height) => ({
                width: Math.min(width * 0.85, 300),
                height: 100
              }),
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleCodeScanned(decodedText.trim());
            },
            () => {
              // Frame scan error (ignored, continuous searching)
            }
          ).catch((err: any) => {
            console.error('Html5Qrcode start error:', err);
            setCameraError(
              'Gagal membuka kamera belakang. Silakan pastikan izin kamera aktif, atau gunakan Tab "Input Manual" di atas.'
            );
          });
        } catch (e: any) {
          console.error('Html5Qrcode init error:', e);
          setCameraError('Gagal menginisialisasi kamera. Gunakan "Input Manual" untuk melanjutkan.');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isCameraActive, activeTab, isOpen]);

  const stopCamera = () => {
    if (html5QrcodeRef.current) {
      if (html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop()
          .then(() => {
            console.log('Kamera dihentikan secara aman.');
          })
          .catch(err => console.error('Error stopping camera:', err));
      }
      html5QrcodeRef.current = null;
    }
  };

  const handleCodeScanned = (code: string) => {
    // Prevent rapid double scan of same code (debounce 1.5 seconds)
    const now = Date.now();
    if (code === lastScannedCode && now - lastScannedTimeRef.current < 1500) {
      return;
    }

    lastScannedTimeRef.current = now;
    setLastScannedCode(code);

    if (mode === 'single') {
      playBeep(900, 0.18);
      setScanningStatus('success');
      setTimeout(() => {
        onScanSuccess(code);
        onClose();
      }, 500);
    } else {
      // Multiple scan queue
      if (scannedQueue.includes(code)) {
        // Already scanned in this queue
        playBeep(400, 0.3); // low error pitch
        setScanningStatus('duplicate');
        setTimeout(() => setScanningStatus('idle'), 1200);
      } else {
        playBeep(900, 0.12);
        setScanningStatus('success');
        setScannedQueue(prev => [code, ...prev]);
        setTimeout(() => setScanningStatus('idle'), 1000);
      }
    }
  };

  // Manual Submission handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = manualInputValue.trim();
    if (!cleanCode) return;

    if (mode === 'single') {
      onScanSuccess(cleanCode);
      onClose();
    } else {
      if (scannedQueue.includes(cleanCode)) {
        alert('IMEI sudah ada di dalam antrean!');
      } else {
        setScannedQueue(prev => [cleanCode, ...prev]);
        setManualInputValue('');
        playBeep(900, 0.1);
      }
    }
  };

  // Submit multiple scanned queue
  const handleApplyMultiple = () => {
    if (scannedQueue.length === 0) {
      alert('Antrean scan masih kosong!');
      return;
    }
    if (onScanMultipleSuccess) {
      onScanMultipleSuccess(scannedQueue);
    }
    onClose();
  };

  const handleRemoveFromQueue = (index: number) => {
    setScannedQueue(prev => prev.filter((_, i) => i !== index));
    playBeep(500, 0.08);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="imei-scanner-modal-overlay">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 animate-pulse" />
            <h3 className="font-extrabold text-sm tracking-wide uppercase">{title} ({mode === 'single' ? 'Scan Tunggal' : 'Scan Banyak'})</h3>
          </div>
          <div className="flex items-center gap-1">
            {/* Toggle sound button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              title={soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            >
              {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex bg-slate-100 border-b border-slate-200 p-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('kamera')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'kamera'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="h-4 w-4" /> Scan Kamera
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Keyboard className="h-4 w-4" /> Input Manual
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between">
          
          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'kamera' && (
            <div className="space-y-4 flex flex-col items-center flex-1">
              {/* Camera Viewport Container */}
              <div className="relative w-full aspect-square max-w-[260px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex flex-col items-center justify-center">
                
                {/* Real Video Element managed by html5-qrcode */}
                <div id="imei-camera-viewfinder" className="absolute inset-0 w-full h-full" />

                {/* Loading Viewport Placeholder */}
                {(!cameraError && isCameraActive) && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    
                    {/* Viewfinder Bracket Target overlay */}
                    <div className="border-2 border-dashed border-indigo-400 w-4/5 h-20 rounded-xl flex items-center justify-center animate-pulse">
                      <span className="text-[10px] text-indigo-300 font-mono tracking-widest bg-slate-900/80 px-2 py-0.5 rounded">
                        TEMPATKAN BARCODE / IMEI DISINI
                      </span>
                    </div>

                    {/* Laser Scanner animation effect */}
                    <div className="absolute top-1/2 left-[10%] w-[80%] h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce" />
                  </div>
                )}

                {/* Camera Failure screen */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/95 p-4 flex flex-col items-center justify-center text-center space-y-3 z-10">
                    <AlertCircle className="h-10 w-10 text-rose-500 animate-bounce" />
                    <p className="text-xs text-rose-200 leading-relaxed px-2 font-semibold">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraActive(false);
                        setTimeout(() => setIsCameraActive(true), 150);
                      }}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Ulangi Kamera
                    </button>
                  </div>
                )}
              </div>

              {/* Scanning state banners */}
              {scanningStatus === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 w-full justify-center animate-pulse">
                  <Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" />
                  Berhasil Scan: <span className="font-mono">{lastScannedCode}</span>
                </div>
              )}

              {scanningStatus === 'duplicate' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 w-full justify-center animate-pulse">
                  <AlertCircle className="h-4 w-4 bg-amber-500 text-white rounded-full p-0.5" />
                  Gagal: IMEI Sudah Scan!
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center leading-normal">
                {placeholder}
              </p>
            </div>
          )}

          {/* TAB 2: MANUAL INPUT FALLBACK */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 flex-1 flex flex-col justify-start">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">KETIK IMEI MANUAL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 358901234567891"
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    className="flex-1 p-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition"
                  >
                    Tambah
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Gunakan tab ini apabila kemasan HP tidak memiliki barcode, atau barcode kotor/cacat tidak terbaca kamera.
              </p>
            </form>
          )}

          {/* MULTI-SCAN QUEUE SECTION */}
          {mode === 'multiple' && (
            <div className="border-t border-slate-100 pt-4 mt-2" id="scanned-queue-container">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold text-slate-500">DAFTAR ANTREAN SCAN HP ({scannedQueue.length})</span>
                {scannedQueue.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bersihkan semua antrean scan?')) setScannedQueue([]);
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {scannedQueue.length === 0 ? (
                <div className="bg-slate-50 text-center py-6 text-slate-400 rounded-xl text-xs border border-dashed border-slate-200">
                  Belum ada IMEI yang berhasil di-scan
                </div>
              ) : (
                <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100 border border-slate-200/60 rounded-xl bg-slate-50">
                  {scannedQueue.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 hover:bg-white text-xs">
                      <span className="font-mono font-bold text-slate-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromQueue(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
          >
            Tutup
          </button>
          
          {mode === 'multiple' && (
            <button
              type="button"
              onClick={handleApplyMultiple}
              disabled={scannedQueue.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:bg-indigo-300 cursor-pointer"
            >
              <Check className="h-4 w-4" /> Impor {scannedQueue.length} IMEI Ter-scan
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
