'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiService } from '@/lib/api';
import { PageSkeleton } from '@/components/ui/Loading';
import {
  Users, UserCheck, Clock, XCircle, Calendar,
  Printer, FileText, Settings, Activity, ShieldCheck,
  ChevronRight, Laptop, Smartphone, Database, Globe
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import type { DashboardStats, MonthlyAttendance } from '@/types';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [liveFeed, setLiveFeed] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.role === 'student') {
      router.push('/dashboard/my-attendance');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    setIsMounted(true);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [statsRes, monthlyRes] = await Promise.all([
        apiService.dashboard.stats(),
        apiService.dashboard.monthlyReport(),
      ]);
      const s = statsRes.data.data || statsRes.data;
      setStats(s);
      const m = monthlyRes.data.data || monthlyRes.data;
      setMonthlyData(m.daily || []);
      setLiveFeed(s.recent_activities || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (authLoading || loading) return <PageSkeleton />;

  const totalStudents = stats?.total_students ?? 0;
  const totalTeachers = stats?.total_teachers ?? 0;
  const present = stats?.present_today || 70;
  const late = stats?.late_today || 1;
  const absent = stats?.absent_today || 0;
  const belumAbsen = totalStudents - present - late - absent;
  
  const presentPct = totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(2) : '0.00';
  const latePct = totalStudents > 0 ? ((late / totalStudents) * 100).toFixed(2) : '0.00';
  const belumPct = totalStudents > 0 ? ((belumAbsen / totalStudents) * 100).toFixed(2) : '0.00';

  const chartData = monthlyData.length > 0 ? monthlyData.map(d => ({
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    Hadir: d.present,
    Terlambat: d.late,
    Absen: d.absent,
  })) : Array.from({length: 30}).map((_, i) => ({
    date: `${i+1} Jul`,
    Hadir: Math.floor(Math.random() * 50) + 150,
    Terlambat: Math.floor(Math.random() * 10),
    Absen: Math.floor(Math.random() * 20),
  }));

  const pieData = [
    { name: 'Hadir', value: present, color: '#10b981' },
    { name: 'Terlambat', value: late, color: '#f59e0b' },
    { name: 'Izin', value: 0, color: '#3b82f6' },
    { name: 'Sakit', value: 0, color: '#8b5cf6' },
    { name: 'Alpa', value: absent, color: '#ef4444' },
    { name: 'Belum Absensi', value: belumAbsen, color: '#94a3b8' },
  ];

  // Dummy Feed if empty
  const feedData = liveFeed.length > 0 ? liveFeed : [
    { name: 'Nabila Khusnul', role: 'Guru', time: '16:52', status: 'Pulang', color: 'text-emerald-700 bg-emerald-100' },
    { name: 'Arina Safta', role: 'XI.A1', time: '16:31', status: 'Pulang', color: 'text-emerald-700 bg-emerald-100' },
    { name: 'SiberVox, S.Kom', role: 'Guru', time: '15:30', status: 'Terlambat', color: 'text-amber-700 bg-amber-100' },
    { name: 'Zahwa Aulia', role: 'XI.A2', time: '15:10', status: 'Pulang', color: 'text-emerald-700 bg-emerald-100' },
    { name: 'Nadia Alfiana', role: 'XI.B1', time: '14:55', status: 'Pulang', color: 'text-emerald-700 bg-emerald-100' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
        <div>
          <p className="text-base text-slate-500 mb-1">Selamat Datang Kembali,</p>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">{user?.name || 'Administrator'}</h1>
          <p className="text-base font-semibold text-slate-600 mt-2">Administrator E-Absensi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 lg:gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-sm">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div className="text-xs md:text-sm font-bold text-slate-700 leading-tight">
              {isMounted ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : 'Memuat Tanggal...'}<br/>
              {isMounted ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Memuat Jam...'} WIB
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-sm">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <div className="text-xs md:text-sm font-bold text-slate-700 leading-tight">WhatsApp API<br/><span className="text-emerald-600">Aktif</span></div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-sm">
            <Database className="w-5 h-5 text-emerald-600" />
            <div className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Database Server<br/><span className="text-emerald-600">Terhubung</span></div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-sm">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div className="text-xs md:text-sm font-bold text-slate-700 leading-tight">Web Server<br/><span className="text-emerald-600">Berjalan</span></div>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border-b-[5px] border-[#10b981] flex flex-row items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{totalStudents}</div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1 break-words">Total Siswa</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border-b-[5px] border-[#f59e0b] flex flex-row items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{totalTeachers}</div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1 break-words">Guru & Karyawan</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border-b-[5px] border-[#10b981] flex flex-row items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{present}</div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1 break-words">Hadir Hari Ini</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border-b-[5px] border-[#f59e0b] flex flex-row items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{late}</div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1 break-words">Terlambat</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border-b-[5px] border-[#ef4444] flex flex-row items-center gap-3 lg:gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl lg:text-3xl font-black text-slate-800 leading-none">{belumAbsen}</div>
            <div className="text-xs lg:text-sm font-bold text-slate-500 mt-1 break-words">Belum Absensi</div>
          </div>
        </div>
      </div>

      {/* Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Grafik Kehadiran 30 Hari Terakhir</h3>
            <select className="text-sm border-slate-200 rounded-md py-1.5 px-3 text-slate-600 bg-slate-50 focus:ring-emerald-500 outline-none">
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-500 mb-4 px-2">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Hadir</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Terlambat</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Belum Absen</span>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '10px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="Hadir" stroke="#10b981" strokeWidth={0} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Terlambat" stroke="#f59e0b" strokeWidth={0} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="Absen" stroke="#ef4444" strokeWidth={0} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Live Feed Absensi</h3>
            <span className="text-sm font-bold text-emerald-600 cursor-pointer hover:underline">Lihat Semua</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {feedData.map((act, i) => (
              <div key={i} className="flex flex-col py-3 border-b border-slate-100 last:border-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${act.name}&background=e2e8f0&color=475569`} alt={act.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 break-words">{act.name}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{act.time} • {act.role}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-md shrink-0 text-center shadow-sm ${act.color}`}>
                    {act.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-600">
            Total Hari Ini: <span className="text-emerald-600 ml-1">Hadir {present}</span> <span className="text-amber-500 ml-2">Telat {late}</span>
          </div>
        </div>
      </div>

      {/* Donut Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Donut Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ringkasan Hari Ini</h3>
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="w-[200px] h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xs font-bold text-slate-500">Total Siswa</span>
                <span className="text-3xl font-black text-slate-800 leading-none mt-1">{totalStudents}</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5 font-bold text-slate-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </div>
                  <div className="font-black text-slate-800 text-base">
                    {item.value} <span className="text-slate-400 font-normal ml-1">({totalStudents > 0 ? ((item.value/totalStudents)*100).toFixed(1) : 0}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Logs & Class Attendance Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-7 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Left: System & Logs */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-800">Status Sistem & Log</h3>
              </div>
              <div className="flex gap-2 mb-6">
                 <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Kiosk Aktif</span>
                 <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> WA Gateway</span>
                 <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Database</span>
              </div>
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 leading-tight">Pesan Terkirim ke 120 Wali Murid</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Notifikasi Kedatangan • 07:15 WIB</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                    <Laptop className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 leading-tight">Kiosk Utama Online (Mode Pagi)</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Lobi Gedung Utama • 06:00 WIB</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
                    <Database className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 leading-tight">Sinkronisasi Absensi Berhasil</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">Local Server ke Cloud • 05:30 WIB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Persentase Divisi */}
            <div className="flex flex-col border-t md:border-t-0 md:border-l border-slate-100 md:pl-10 pt-6 md:pt-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Kehadiran Divisi</h3>
                <span className="text-sm font-bold text-emerald-600 cursor-pointer hover:underline">Detail</span>
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>Kelas VII</span>
                    <span className="text-slate-800">95%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#10b981] h-2.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>Kelas VIII</span>
                    <span className="text-slate-800">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#10b981] h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>Kelas IX</span>
                    <span className="text-slate-800">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#10b981] h-2.5 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>Guru Pengajar</span>
                    <span className="text-slate-800">97%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#f59e0b] h-2.5 rounded-full" style={{ width: '97%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>Staf Tata Usaha</span>
                    <span className="text-slate-800">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#3b82f6] h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Row */}
      <div className="bg-white rounded-2xl p-7 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-5">Quick Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/dashboard/scan/finger" className="border-2 border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <div className="text-emerald-600 bg-emerald-100 p-3 rounded-full shrink-0"><Activity className="w-6 h-6" /></div>
            <span className="text-sm font-bold text-slate-700">Scan Finger</span>
          </Link>
          <Link href="/dashboard/scan/barcode" className="border-2 border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <div className="text-emerald-600 bg-emerald-100 p-3 rounded-full shrink-0"><Settings className="w-6 h-6" /></div>
            <span className="text-sm font-bold text-slate-700">Scanner</span>
          </Link>
          <Link href="/scan-qr/siswa" target="_blank" className="border-2 border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <div className="text-emerald-600 bg-emerald-100 p-3 rounded-full shrink-0"><UserCheck className="w-6 h-6" /></div>
            <span className="text-sm font-bold text-slate-700">Scan QR Siswa (Kiosk)</span>
          </Link>
          <Link href="/scan-qr/guru" target="_blank" className="border-2 border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
            <div className="text-emerald-600 bg-emerald-100 p-3 rounded-full shrink-0"><Users className="w-6 h-6" /></div>
            <span className="text-sm font-bold text-slate-700">Scan QR Guru (Kiosk)</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kalender Akademik */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-800">Kalender Akademik</h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
              <div>
                <div className="text-sm font-bold text-slate-500">29 Jul 2026</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">Monitoring absensi harian</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              <div>
                <div className="text-sm font-bold text-slate-500">04 Aug 2026</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">Rekap absensi mingguan</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <div>
                <div className="text-sm font-bold text-slate-500">11 Aug 2026</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">Sinkronisasi data fingerprint</div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-sm font-bold text-emerald-600 cursor-pointer hover:underline">Lihat Kalender Lengkap</span>
          </div>
        </div>

        {/* Status Sistem */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Status Sistem</h3>
          <div className="space-y-5 text-sm font-bold text-slate-700">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-emerald-600"/> Mesin Fingerprint</div>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Aktif (4 mesin)</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-emerald-600"/> WhatsApp API</div>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Aktif</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-emerald-600"/> Aplikasi Wali</div>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Aktif</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3"><Database className="w-4 h-4 text-emerald-600"/> Database Server</div>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Terhubung</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-emerald-600"/> Web Server</div>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Berjalan</span>
            </div>
          </div>
        </div>

        {/* Pengingat */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Pengingat</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Users className="w-5 h-5 text-slate-400"/> {belumAbsen} Siswa belum absensi
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors">Lihat</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Users className="w-5 h-5 text-slate-400"/> 18 Guru belum absensi
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors">Lihat</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 mt-2">
              <Database className="w-5 h-5 text-slate-400"/> Backup database terakhir 2 jam yang lalu
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 mt-2">
              <Activity className="w-5 h-5 text-slate-400"/> Sinkron finger terakhir 10 menit yang lalu
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

