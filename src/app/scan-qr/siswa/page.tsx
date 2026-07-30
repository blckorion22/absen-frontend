'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import { apiService } from '@/lib/api';
import type { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle, XCircle, Loader2, Clock, User, BookOpen, AlertCircle, RefreshCw, BarChart2, ShieldAlert, ChevronDown, Check, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanQRSiswaPage() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameraError, setCameraError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  
  const [manualNis, setManualNis] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'reader';

  const [timeConfig, setTimeConfig] = useState({
    jam_masuk: '05:00',
    jam_masuk_threshold: '06:45',
    jam_pulang: '14:00',
    jam_pulang_end: '23:00'
  });

  const loadSettings = useCallback(async () => {
    try {
      const res = await apiService.settings.getPublic();
      if (res.data?.data) {
        setTimeConfig({
          jam_masuk: res.data.data.jam_masuk || '05:00',
          jam_masuk_threshold: res.data.data.jam_masuk_threshold || '06:45',
          jam_pulang: res.data.data.jam_pulang || '14:00',
          jam_pulang_end: res.data.data.jam_pulang_end || '23:00',
        });
      }
    } catch {}
  }, []);

  // Waktu & Jadwal
  const jamMasuk = `${timeConfig.jam_masuk}-${timeConfig.jam_masuk_threshold}`;
  const jamPulang = `${timeConfig.jam_pulang}-${timeConfig.jam_pulang_end}`;

  const loadStats = useCallback(async () => {
    try {
      const res = await apiService.get('/public/stats');
      const data = res.data.data || res.data;
      setStats({
        total: data.total_students || 0,
        present: data.present_today || 0,
        late: data.late_today || 0,
        absent: data.absent_today || 0,
      });
      setRecentActivities(data.recent_activities || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadSettings();
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats, loadSettings]);

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
          // Pause scanning while processing
          if (html5QrCode.current && html5QrCode.current.isScanning) {
            html5QrCode.current.pause();
          }
          processScan(decodedText);
        },
        (errorMessage) => {
          // parse errors are ignored normally
        }
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
      const response = await apiService.post('/public/scan-siswa', payload);
      const data = response.data;
      setResult({ success: true, message: data.message || 'Absensi berhasil!', data: data.data });
      toast.success(data.message || 'Absensi berhasil!');
      setManualNis('');
      loadStats();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
      // Resume scanner after 3 seconds so they can read result
      setTimeout(() => {
        setResult(null);
        if (html5QrCode.current && html5QrCode.current.getState() === 2) { // 2 = PAUSED
          html5QrCode.current.resume();
        }
      }, 4000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNis.trim()) return;
    if (html5QrCode.current && html5QrCode.current.isScanning) {
       html5QrCode.current.pause();
    }
    await processScan(manualNis);
  };

  const total = stats.total || 1; // Prevent div by 0
  const present = stats.present + stats.late;
  const belum = stats.total - present;

  return (
    <div className="min-h-screen bg-[#f8faf8] font-sans pb-10 flex flex-col">
      <PublicNavbar />
      
      <main className="w-full max-w-[1500px] mx-auto px-4 md:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN - WAKTU & STATISTIK */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* WAKTU & JADWAL */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
                <Clock className="w-4 h-4 text-[#004326]" />
                <span className="font-extrabold text-[11px] text-[#004326] tracking-wider">WAKTU & JADWAL</span>
              </div>
              <div className="p-6 text-center border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
                <div className="text-4xl md:text-5xl font-black text-[#004326] tracking-tight font-mono h-[48px] md:h-[60px] flex items-center justify-center">
                  {isMounted ? currentTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.') : '--.--.--'}
                </div>
                <div className="text-[13px] font-bold text-gray-800 mt-2 h-[20px]">
                  {isMounted ? currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Memuat...'}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jam Masuk</div>
                      <div className="text-sm font-black text-gray-800">{jamMasuk}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-green-100 text-green-800 text-[10px] font-black uppercase">Berjalan</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Jam Pulang</div>
                      <div className="text-sm font-black text-gray-800">{jamPulang}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase whitespace-nowrap">Belum dimulai</span>
                </div>
              </div>
            </div>

            {/* STATISTIK HARI INI */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
                <BarChart2 className="w-4 h-4 text-[#004326]" />
                <span className="font-extrabold text-[11px] text-[#004326] tracking-wider">STATISTIK HARI INI</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-500">Sudah Absensi</div>
                      <div className="text-xl font-black text-gray-800">{present}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-black">{Math.round((present/total)*100)}%</span>
                </div>
                
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-500">Belum Absensi</div>
                      <div className="text-xl font-black text-gray-800">{belum}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black">{Math.round((belum/total)*100)}%</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-500">Terlambat</div>
                      <div className="text-xl font-black text-gray-800">{stats.late}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black">{Math.round((stats.late/total)*100)}%</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-extrabold text-gray-800">Total Siswa</span>
                  <span className="text-[13px] font-black text-[#004326]">{stats.total}</span>
                </div>
              </div>
            </div>

          </div>

          {/* MIDDLE COLUMN - SCANNER */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <ScanIcon className="w-4 h-4 text-[#004326]" />
                  <span className="font-extrabold text-[11px] text-[#004326] tracking-wider">SCAN QR CODE SISwa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cameraError ? 'bg-red-500' : cameraActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className={`text-[10px] font-bold ${cameraError ? 'text-red-500' : cameraActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {cameraError ? 'Kamera tidak bisa dibuka' : cameraActive ? 'Kamera Aktif' : 'Memeriksa kamera...'}
                  </span>
                </div>
              </div>

              <div className="p-6 pb-4">
                {/* Camera Selector */}
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

                {/* Video Area */}
                <div className="relative rounded-2xl overflow-hidden bg-[#0a1118] border-2 border-gray-100 aspect-video flex items-center justify-center">
                  <div id={scannerRegionId} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                  
                  {/* Decorative Scanner Overlay */}
                  {cameraActive && !loading && !result && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                      {/* Brackets */}
                      <div className="absolute w-[60%] h-[60%]">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                      </div>
                      {/* Scanning Line */}
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

                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={manualNis}
                    onChange={(e) => setManualNis(e.target.value)}
                    placeholder="Scan QR Code atau masukkan NIS Siswa"
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004326]/20 focus:border-[#004326]"
                    autoFocus
                  />
                  <button type="submit" disabled={loading} className="bg-[#005e36] hover:bg-[#004326] text-white px-8 py-3 rounded-lg text-sm font-bold shadow-md transition-colors disabled:opacity-70 whitespace-nowrap">
                    Proses
                  </button>
                </form>

                {/* Scan Result Area */}
                <div className="mt-6 border border-gray-100 rounded-2xl p-4 bg-gray-50/50 min-h-[140px] flex items-center justify-center">
                  {!result ? (
                    <div className="text-center text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-semibold">Hasil scan akan muncul di sini</p>
                    </div>
                  ) : (
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
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Nama Siswa</div>
                          <div className="font-black text-gray-800">{result.data?.nama || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Waktu Absensi</div>
                          <div className="font-black text-gray-800">{result.data?.waktu || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">NIS</div>
                          <div className="font-black text-gray-800">{result.data?.nis || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Status</div>
                          <div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-black ${
                              result.data?.status === 'present' ? 'bg-green-100 text-green-800' :
                              result.data?.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {result.data?.status === 'present' ? 'Hadir' : result.data?.status === 'late' ? 'Terlambat' : result.data?.status || 'Belum Absen'}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[10px] font-bold text-gray-500 mb-0.5">Keterangan / Pesan</div>
                          <div className={`text-xs font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 flex gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-green-800 font-medium text-xs leading-relaxed">
                      Kamera tidak bisa dibuka. Klik ikon kamera di address bar lalu Allow, atau input NIS manual dan klik Proses.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - RIWAYAT */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-[600px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#004326]" />
                  <span className="font-extrabold text-[11px] text-[#004326] tracking-wider">RIWAYAT ABSENSI HARI INI</span>
                </div>
                <button onClick={loadStats} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                {recentActivities.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="max-w-[200px]">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <CheckCircle className="w-8 h-8 text-gray-300" />
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">Belum ada aktivitas absensi hari ini</h4>
                      <p className="text-[11px] text-gray-400">Riwayat absensi siswa akan ditampilkan di sini.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {recentActivities.map((act, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-500 w-12 shrink-0">{act.time}</span>
                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${act.name}&background=e2e8f0&color=475569`} alt={act.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{act.name}</div>
                          <div className="text-xs text-slate-500">{act.role}</div>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 ${act.color}`}>
                          {act.status}
                        </div>
                      </div>
                    ))}
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
                <div className="text-[11px] font-black text-emerald-800">{isMounted ? currentTime.toLocaleString('id-ID') : 'Memuat...'}</div>
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
        /* Hide html5-qrcode extra elements */
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
