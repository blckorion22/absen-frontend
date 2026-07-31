'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { apiService } from '@/lib/api';
import type { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, Loader2, Clock, User, AlertCircle, RefreshCw, BarChart2, ShieldAlert, ChevronDown, Check, Camera, Lightbulb, UserCheck, UserX, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanQRGuruPage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({ total: 29, masuk: 0, tidakMasuk: 29 });
  const [history, setHistory] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameraError, setCameraError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'reader';

  const loadStats = useCallback(async () => {
    try {
      const res = await apiService.get('/public/stats');
      const data = res.data.data;
      setStats({
        total: data.total_teachers || 29,
        masuk: data.teacher_present_today || 0,
        tidakMasuk: data.teacher_absent_today || 0
      });
      // Filter recent activities to only include teachers
      const teacherHistory = (data.recent_activities || []).filter((a: any) => a.id.startsWith('t_'));
      setHistory(teacherHistory);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCameras = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
        setCameraError(false);
      } else {
        setCameraError(true);
      }
    } catch (err) {
      setCameraError(true);
    }
  };

  useEffect(() => {
    getCameras();
    return () => {
      if (html5QrCode.current && html5QrCode.current.isScanning) {
        html5QrCode.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async (cameraId: string) => {
    const { Html5Qrcode } = await import('html5-qrcode');
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      await html5QrCode.current.stop();
    }
    html5QrCode.current = new Html5Qrcode(scannerRegionId);
    
    try {
      await html5QrCode.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.777778, // 16:9
        },
        (decodedText) => {
          if (html5QrCode.current && html5QrCode.current.isScanning) {
            html5QrCode.current.pause();
          }
          processScan(decodedText);
        },
        (errorMessage) => {}
      );
      setCameraActive(true);
      setCameraError(false);
    } catch (err) {
      setCameraError(true);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (selectedCamera) {
      startScanning(selectedCamera);
    }
  }, [selectedCamera]);

  const getLocation = async () => {
    if (!navigator.geolocation) return null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 8000, maximumAge: 0,
        });
      });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch {
      return null;
    }
  };

  const processScan = async (code: string) => {
    setLoading(true);
    try {
      const coords = await getLocation();
      const payload: any = { qr_code: code.trim() };
      if (coords) {
        payload.latitude = coords.latitude;
        payload.longitude = coords.longitude;
      }
      const response = await apiService.post('/public/scan-guru', payload);
      const data = response.data;
      setResult({ success: true, message: data.message || 'Absensi berhasil!', data: data.data });
      toast.success(data.message || 'Absensi berhasil!');
      setManualCode('');
      loadStats();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setResult(null);
        if (html5QrCode.current) {
          try {
            html5QrCode.current.resume();
          } catch (e) {
            console.log("Already scanning or cannot resume", e);
          }
        }
      }, 4000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (html5QrCode.current && html5QrCode.current.isScanning) {
       html5QrCode.current.pause();
    }
    await processScan(manualCode);
  };

  const total = stats.total || 1;
  const pMasuk = Math.round((stats.masuk / total) * 100);
  const pTidakMasuk = Math.round((stats.tidakMasuk / total) * 100);

  // Mock History is now dynamic

  return (
    <div className="min-h-screen bg-[#f8faf8] font-sans pb-10 flex flex-col">
      <PublicNavbar />
      
      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
                <Clock className="w-4 h-4 text-[#004326]" />
                <span className="font-extrabold text-[11px] text-[#004326] tracking-wider uppercase">Waktu & Panduan</span>
              </div>
              <div className="p-6 text-center border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
                <div className="text-4xl md:text-5xl font-black text-[#002f5c] tracking-tight font-mono h-[48px] md:h-[60px] flex items-center justify-center">
                  {isMounted ? currentTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.') : '--.--.--'}
                </div>
                <div className="text-[13px] font-bold text-gray-800 mt-2 h-[20px]">
                  {isMounted ? currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Memuat...'}
                </div>
              </div>
              <div className="p-4">
                <div className="bg-[#f0fcf5] border border-[#dcfce7] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#166534] text-[11px] mb-2 uppercase">Panduan Absensi Fleksibel</h4>
                      <ul className="space-y-1.5 text-[11px] text-[#166534] font-bold list-disc pl-3">
                        <li>Scan pertama = Masuk</li>
                        <li>Scan kedua = Pulang</li>
                        <li>Jeda scan masuk dan pulang 1 jam</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATISTIK */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
                <BarChart2 className="w-4 h-4 text-[#004326]" />
                <span className="font-extrabold text-[11px] text-[#004326] tracking-wider uppercase">STATISTIK HARI INI</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0fcf5] border border-[#dcfce7]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#16a34a] flex items-center justify-center shadow-sm">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-[#166534] uppercase tracking-wider">Masuk</div>
                      <div className="text-xl font-black text-[#14532d]">{stats.masuk} <span className="text-[11px] font-bold">Orang</span></div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-[#16a34a] text-[10px] font-black">{pMasuk}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fffbef] border border-[#fef3c7]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-[#d97706] flex items-center justify-center shadow-sm">
                      <UserX className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-[#92400e] uppercase tracking-wider">Tidak Masuk</div>
                      <div className="text-xl font-black text-[#78350f]">{stats.tidakMasuk} <span className="text-[11px] font-bold">Orang</span></div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-[#d97706] text-[10px] font-black">{pTidakMasuk}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* MIDDLE COLUMN - SCANNER */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <ScanIcon className="w-4 h-4 text-[#004326]" />
                  <span className="font-extrabold text-[11px] text-[#004326] tracking-wider">ABSENSI QR CODE GURU & KARYAWAN</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cameraError ? 'bg-red-500' : cameraActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-[10px] font-bold ${cameraError ? 'text-red-500' : cameraActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {cameraError ? 'Kamera tidak bisa dibuka' : cameraActive ? 'Kamera Aktif' : 'Memeriksa kamera...'}
                  </span>
                </div>
              </div>

              <div className="p-6 pb-4">
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Pilih Kamera</label>
                  <div className="relative">
                    <select 
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#004326]/20 focus:border-[#004326] transition-all"
                    >
                      {cameras.length === 0 ? (
                        <option value="">Memeriksa kamera...</option>
                      ) : (
                        cameras.map(c => <option key={c.id} value={c.id}>{c.label || `Kamera ${c.id}`}</option>)
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-[#0a1118] border-2 border-gray-100 aspect-video flex items-center justify-center">
                  <div id={scannerRegionId} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                  
                  {cameraActive && !loading && !result && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      <div className="absolute w-[60%] h-[60%]">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                      </div>
                      <div className="absolute left-[15%] right-[15%] h-0.5 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scanLine_2s_ease-in-out_infinite]" />
                      <div className="absolute bottom-6 text-white text-[11px] font-bold tracking-widest uppercase opacity-70">
                        Arahkan QR Code ke kamera dengan jelas
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <Loader2 className="w-10 h-10 text-green-400 animate-spin mb-3" />
                      <span className="text-white font-bold text-sm">Memproses...</span>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
                      <ShieldAlert className="w-12 h-12 text-red-500/50 mb-3" />
                      <span className="text-sm font-bold">Kamera tidak dapat diakses</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Scan QR Code atau masukkan Kode"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004326]/20 focus:border-[#004326]"
                    autoFocus
                  />
                  <button type="submit" disabled={loading} className="bg-[#005e36] hover:bg-[#004326] text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-70 whitespace-nowrap">
                    Proses
                  </button>
                </form>

                {cameraError && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 flex gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-green-800 font-bold text-[11px] leading-relaxed">
                      Kamera tidak bisa dibuka. Klik Izin kamera di browser, atau masukkan kode manual lalu Proses.
                    </p>
                  </div>
                )}
                
                {result && (
                  <div className="mt-6 border border-gray-100 rounded-2xl p-4 bg-gray-50/50 min-h-[140px] flex items-center justify-center">
                    <div className="w-full flex gap-6 items-center">
                      <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0 relative overflow-hidden">
                        {result.success ? (
                          result.data?.photo ? (
                            <img src={result.data.photo} alt="Photo" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-gray-300" />
                          )
                        ) : (
                          <XCircle className="w-10 h-10 text-red-400" />
                        )}
                        {result.success && (
                          <div className="absolute bottom-[-4px] right-[-4px] bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Nama Guru</div>
                          <div className="font-black text-gray-800">{result.data?.nama || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Waktu Absensi</div>
                          <div className="font-black text-gray-800">{result.data?.waktu || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Kode</div>
                          <div className="font-black text-gray-800">{result.data?.kode || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Status</div>
                          <div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black ${
                              result.data?.tipe === 'masuk' ? 'bg-green-100 text-green-800' :
                              result.data?.tipe === 'pulang' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {result.data?.tipe === 'masuk' ? 'Masuk' : result.data?.tipe === 'pulang' ? 'Pulang' : result.data?.tipe || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Keterangan / Pesan</div>
                          <div className={`text-xs font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - RIWAYAT */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#004326]" />
                  <span className="font-extrabold text-[11px] text-[#004326] tracking-wider uppercase">RIWAYAT ABSENSI HARI INI</span>
                </div>
                <button onClick={loadStats} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-50 flex items-center justify-center text-[10px] font-extrabold tracking-wider text-gray-800 bg-gray-50/30">
                {isMounted ? currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '...'}
              </div>

              {/* Header Tabel */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 bg-white text-[9px] font-extrabold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2 text-center">FOTO</div>
                <div className="col-span-4">NAMA</div>
                <div className="col-span-2 text-center">TANGGAL</div>
                <div className="col-span-2 text-center">MASUK</div>
                <div className="col-span-2 text-center">PULANG</div>
              </div>

              {/* Data List */}
              <div className="flex flex-col max-h-[500px] overflow-y-auto">
                {history.length > 0 ? history.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-2 flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${item.name}&background=e2e8f0&color=475569`} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="text-[10px] font-black text-gray-800 leading-tight mb-1 uppercase line-clamp-1">{item.name}</div>
                      <div className="text-[9px] font-bold text-gray-400 line-clamp-1">{item.role}</div>
                    </div>
                    <div className="col-span-2 text-center text-[10px] font-extrabold text-gray-600">
                      {isMounted ? currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                    </div>
                    <div className="col-span-2 text-center">
                      {item.check_in ? (
                        <>
                          <div className={`text-[10px] font-black ${item.status === 'Terlambat' ? 'text-amber-500' : 'text-[#16a34a]'}`}>{item.check_in}</div>
                          <div className={`text-[9px] font-extrabold mt-0.5 uppercase ${item.status === 'Terlambat' ? 'text-amber-500' : 'text-[#16a34a]'}`}>{item.status === 'Terlambat' ? 'Telat' : 'Masuk'}</div>
                        </>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {item.check_out ? (
                        <>
                          <div className="text-[10px] font-black text-[#2563eb]">{item.check_out}</div>
                          <div className="text-[9px] font-extrabold text-[#2563eb] mt-0.5 uppercase">Pulang</div>
                        </>
                      ) : (
                        <>
                          <div className="text-[10px] font-black text-red-500">-</div>
                          <div className="text-[9px] font-extrabold text-red-500 mt-0.5 uppercase">Belum Pulang</div>
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Belum ada riwayat hari ini
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER BAR */}
      <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] mt-auto relative z-20">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]"></div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Status Sistem</div>
                <div className="text-[11px] font-black text-green-700">Sistem berjalan normal</div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Camera className="w-4 h-4 text-[#004326]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Kamera</div>
                  <div className="text-[11px] font-black text-gray-800">{cameraActive ? 'Kamera Aktif' : 'Kamera tidak bisa dibuka'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <ScanIcon className="w-4 h-4 text-[#004326]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Metode</div>
                  <div className="text-[11px] font-black text-gray-800">QR Code</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Terakhir Update</div>
                <div className="text-[11px] font-black text-blue-800">{isMounted ? currentTime.toLocaleString('id-ID') : 'Memuat...'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanLine {
          0% { top: 15%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
        #reader { border: none !important; }
        #reader video { object-fit: cover; }
        #reader__dashboard_section_csr, #reader__dashboard_section_swaplink { display: none !important; }
        #reader__header_message { display: none !important; }
      `}} />
    </div>
  );
}

function ScanIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 12h8"/></svg>
  );
}
