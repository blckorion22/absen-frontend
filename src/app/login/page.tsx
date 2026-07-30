'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { Mail, Lock, Eye, EyeOff, LayoutGrid, CheckCircle2, ShieldCheck, Activity, BellRing, Users, MapPin, Phone, BookOpen, ArrowRight, HeadphonesIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { settings } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logging, setLogging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f4]">
        <div className="w-10 h-10 rounded-full animate-spin border-4 border-[#004326] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email / NIS harus diisi';
    if (!password) newErrors.password = 'Password harus diisi';
    else if (password.length < 3) newErrors.password = 'Password minimal 3 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLogging(true);
    try {
      const loginEmail = email.includes('@') ? email : `${email}@student.com`;
      await login({ email: loginEmail, password });
      toast.success('Berhasil masuk!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Email/NIS atau password salah');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <header className="bg-white border-b-[3px] border-[#d7a23a] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex-shrink-0">
            {settings.school_logo ? (
              <img src={settings.school_logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-[#004326] rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[#0d47a1] font-black text-lg leading-none tracking-tight">ABSENSI</span>
            <span className="text-[#0d47a1] font-bold text-[11px] leading-tight mt-0.5 uppercase">
              {settings.school_name || "MA AS-SYAFI'IYAH 02"}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-gray-500 font-semibold text-sm cursor-not-allowed">
          <LayoutGrid className="w-4 h-4" />
          Dashboard
        </div>

        <div>
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
            <Lock className="w-4 h-4" />
            Login
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] relative">
        
        {/* RIGHT BACKGROUND DECORATION */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#e8f3ec] to-transparent -z-10 opacity-70 pointer-events-none" />

        {/* LEFT SECTION (HERO) */}
        <div className="flex flex-col pt-12 pb-20 px-6 md:px-12 lg:px-16 relative z-10">
          
          <div className="max-w-2xl">
            <h2 className="text-gray-500 text-xl md:text-2xl font-semibold mb-1">Selamat Datang di</h2>
            <h1 className="text-[#004326] text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2">
              SISTEM ABSENSI
            </h1>
            <h3 className="text-[#d7a23a] text-2xl md:text-3xl font-black uppercase tracking-wider mb-6">
              {settings.school_name || "MA AS-SYAFI'IYAH 02"}
            </h3>
            
            <p className="text-gray-600 leading-relaxed mb-10 max-w-lg">
              {settings.school_description || "Sistem absensi digital modern dan terintegrasi untuk kemudahan monitoring kehadiran siswa secara realtime dan akurat."}
            </p>

            {/* FEATURE ICONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: ShieldCheck, title: "Aman & Akurat", sub: "Teknologi biometrik dan QR Code" },
                { icon: Activity, title: "Realtime", sub: "Data absensi langsung terupdate" },
                { icon: CheckCircle2, title: "Terintegrasi", sub: "Sistem terhubung dan terkelola" },
                { icon: BellRing, title: "Notifikasi", sub: "Informasi cepat untuk siswa & ortu" }
              ].map((ft, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#edf4f0] flex items-center justify-center text-[#004326]">
                    <ft.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">{ft.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">{ft.sub}</p>
                </div>
              ))}
            </div>

            {/* STATS BAR */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-[#edf4f0] p-2 rounded-lg text-[#004326]"><Users className="w-5 h-5" /></div>
                <div>
                  <div className="font-black text-gray-800">1.200+</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Siswa Aktif</div>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#edf4f0] p-2 rounded-lg text-[#004326]"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <div className="font-black text-gray-800">80+</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Guru & Staff</div>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#edf4f0] p-2 rounded-lg text-[#004326]"><Activity className="w-5 h-5" /></div>
                <div>
                  <div className="font-black text-gray-800">Realtime</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Update Absensi</div>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100 hidden md:block"></div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#edf4f0] p-2 rounded-lg text-[#004326]"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <div className="font-black text-gray-800">100%</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Aman & Terpercaya</div>
                </div>
              </div>
            </div>
          </div>

          {/* BACKGROUND DECORATIVE IMAGE (Using a subtle background placeholder) */}
          <div className="absolute right-[-10%] bottom-10 w-[500px] h-[400px] bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center rounded-3xl shadow-2xl opacity-10 hidden xl:block mix-blend-multiply" />
        </div>

        {/* RIGHT SECTION (LOGIN CARD) */}
        <div className="flex items-center justify-center p-6 md:p-12 relative z-20">
          <div className="bg-white w-full max-w-[420px] rounded-[2rem] shadow-[0_20px_60px_rgba(0,67,38,0.1)] p-8 md:p-10 border border-gray-50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4">
                {settings.school_logo ? (
                  <img src={settings.school_logo} alt="Logo" className="w-full h-full object-contain filter drop-shadow-md" />
                ) : (
                  <div className="w-full h-full bg-[#004326] rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-[#004326]">Masuk ke Sistem Absensi</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Gunakan email dan password untuk masuk!</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors(p => ({...p, email: ''})) }}
                    placeholder="nama@sekolah.com atau NIS"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#fefce8] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#d7a23a] transition-all outline-none"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors(p => ({...p, password: ''})) }}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-[#fefce8] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#d7a23a] transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#004326] focus:ring-[#004326]" />
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-800 transition">Ingat saya</span>
                </label>
                <a href="#" className="text-xs font-bold text-[#004326] hover:text-[#002b1a] transition">Lupa password?</a>
              </div>

              <button
                type="submit"
                disabled={logging}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(46,125,50,0.3)] hover:shadow-[0_4px_10px_rgba(46,125,50,0.4)] disabled:opacity-70 mt-2"
              >
                {logging ? 'Memproses...' : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
              <HeadphonesIcon className="w-4 h-4" />
              <span>Hubungi admin untuk reset password</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#003c25] border-t-[4px] border-[#d7a23a] text-white py-8 px-6 md:px-12 relative z-50">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 flex-shrink-0">
              {settings.school_logo ? (
                <img src={settings.school_logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <BookOpen className="w-6 h-6 text-[#003c25]" />
              )}
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider">{settings.school_name || "MA AS-SYAFI'IYAH 02"}</h4>
              <p className="text-[11px] text-emerald-200/80 mt-1 leading-snug max-w-[200px]">
                {settings.school_description || "Membentuk Generasi Qur'ani, Berakhlak Mulia, Berprestasi dan Mandiri."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-emerald-100/90 font-medium md:items-center">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#d7a23a]" />
              <span>{settings.school_address || "Jl. Raya Jatiwaringin No.8, Pondok Gede"}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d7a23a]" />
                <span>(021) 84951234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d7a23a]" />
                <span>info@sekolah.sch.id</span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right text-[11px] text-emerald-200/70 space-y-1 font-medium">
            <p>© {new Date().getFullYear()} {settings.school_name || "MA As-Syafi'iyah 02"}</p>
            <p>All rights reserved.</p>
            <p>Powered by <strong className="text-[#d7a23a] font-bold">SiberVox</strong></p>
          </div>

        </div>
      </footer>
    </div>
  );
}
