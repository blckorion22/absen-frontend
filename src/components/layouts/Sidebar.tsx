'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ClipboardCheck, Users, BookOpen, Megaphone,
  Calendar, Gavel, Settings, MessageSquare, ChevronLeft, ChevronDown, ChevronRight,
  Clock, Bell, Shield, School, FileText, AlertCircle, PenTool,
  GraduationCap, UserPlus, MapPin, Smartphone, History, Route,
  Award, TrendingUp, GitCompare, Archive, DollarSign, Scissors,
  Briefcase, Trash2, QrCode, Home
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: 'ABSENSI',
    items: [
      { href: '/dashboard/riwayat-absensi/siswa', label: 'Riwayat Absensi Siswa', icon: Clock },
      { href: '/dashboard/riwayat-absensi/guru', label: 'Riwayat Absensi Guru', icon: Clock },
      { href: '/dashboard/belum-absensi/siswa', label: 'Siswa Belum Absensi', icon: AlertCircle },
      { href: '/dashboard/belum-absensi/guru', label: 'Guru Belum Absensi', icon: AlertCircle },
      { href: '/dashboard/absensi-manual/siswa', label: 'Absensi Manual Siswa', icon: ClipboardCheck },
      { href: '/dashboard/absensi-manual/guru', label: 'Absensi Manual Guru', icon: ClipboardCheck },
    ],
  },
  {
    label: 'MASTER DATA',
    items: [
      { href: '/dashboard/id-cards', label: 'Cetak ID Card & QR', icon: QrCode },
      { href: '/dashboard/students', label: 'Data Siswa', icon: Users },
      { href: '/dashboard/users', label: 'Data Guru & Karyawan', icon: UserPlus },
      { href: '/dashboard/tingkat-kelas', label: 'Tingkat Kelas', icon: GraduationCap },
      { href: '/dashboard/classes', label: 'Data Kelas', icon: School },
      { href: '/dashboard/data-rombel', label: 'Data Rombel', icon: BookOpen },
      { href: '/dashboard/tahun-ajaran', label: 'Tahun Ajaran', icon: Calendar },
      { href: '/dashboard/subjects', label: 'Mata Pelajaran', icon: BookOpen },
      { href: '/dashboard/timetables', label: 'Jadwal KBM', icon: Calendar },
      { href: '/dashboard/jabatan', label: 'Jabatan & Tunjangan', icon: Award },
      { href: '/dashboard/potongan', label: 'Data Potongan', icon: Scissors },
    ],
  },
  {
    label: 'AKADEMIK SISWA',
    items: [
      { href: '/dashboard/kenaikan-kelas', label: 'Kenaikan Kelas', icon: TrendingUp },
      { href: '/dashboard/kelulusan', label: 'Kelulusan', icon: GraduationCap },
      { href: '/dashboard/mutasi/masuk', label: 'Mutasi Masuk', icon: UserPlus },
      { href: '/dashboard/mutasi/keluar', label: 'Mutasi Keluar', icon: GitCompare },
      { href: '/dashboard/alumni', label: 'Alumni', icon: Archive },
      { href: '/dashboard/arsip-mutasi', label: 'Arsip Mutasi', icon: Archive },
      { href: '/dashboard/tracking-siswa', label: 'Tracking Map Siswa', icon: MapPin },
      { href: '/dashboard/setting-gps', label: 'Setting GPS Absen Siswa', icon: MapPin },
    ],
  },
  {
    label: 'PENGATURAN ABSENSI',
    items: [
      { href: '/dashboard/rentang-jam', label: 'Rentang Jam Absensi', icon: Clock },
      { href: '/dashboard/hapus-kehadiran', label: 'Hapus Data Kehadiran', icon: Trash2 },
    ],
  },
  {
    label: 'MESIN FINGERPRINT',
    items: [
      { href: '/dashboard/fingerprint/mesin', label: 'Data Mesin', icon: Settings },
      { href: '/dashboard/fingerprint/sinkron', label: 'Sinkronisasi', icon: RefreshCw },
    ],
  },
  {
    label: 'NOTIFIKASI & INTEGRASI',
    items: [
      { href: '/dashboard/setting-app-wali', label: 'Setting App Wali', icon: MessageSquare },
      { href: '/dashboard/tes-app-wali', label: 'Tes Kirim App Wali', icon: Megaphone },
      { href: '/dashboard/broadcast-app-wali', label: 'Broadcast App Wali', icon: Megaphone },
      { href: '/dashboard/setting-wa-api', label: 'Setting WA API', icon: Smartphone },
      { href: '/dashboard/whatsapp', label: 'Tes Kirim WA', icon: Smartphone },
      { href: '/dashboard/whatsapp-masal', label: 'Kirim WA Masal', icon: Bell },
    ],
  },
  {
    label: 'USER & PENGATURAN',
    items: [
      { href: '/dashboard/users', label: 'Data User', icon: Shield },
      { href: '/dashboard/users/create', label: 'Tambah User', icon: UserPlus },
      { href: '/dashboard/settings', label: 'Pengaturan Sekolah', icon: Settings },
    ],
  },
  {
    label: 'LAPORAN',
    items: [
      { href: '/dashboard/attendance/report', label: 'Laporan Absensi Siswa', icon: FileText },
      { href: '/dashboard/laporan-absensi-guru', label: 'Laporan Absensi Guru', icon: FileText },
      { href: '/dashboard/laporan-gaji', label: 'Laporan Gaji Guru', icon: DollarSign },
      { href: '/dashboard/slip-gaji', label: 'Slip Gaji Guru', icon: DollarSign },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    label: 'KEHADIRAN',
    items: [
      { href: '/dashboard/absensi-hari-ini', label: 'Absensi Hari Ini', icon: ClipboardCheck },
      { href: '/dashboard/attendance', label: 'Absensi Siswa', icon: ClipboardCheck },
      { href: '/dashboard/teacher-attendance', label: 'Absensi Guru', icon: Users },
      { href: '/dashboard/riwayat-absensi/guru', label: 'Riwayat Absensi Saya', icon: History },
      { href: '/dashboard/absensi-manual/siswa', label: 'Absensi Manual', icon: PenTool },
    ],
  },
  {
    label: 'DATA MASTER',
    items: [
      { href: '/dashboard/students', label: 'Daftar Siswa', icon: Users },
      { href: '/dashboard/classes', label: 'Data Kelas', icon: School },
      { href: '/dashboard/subjects', label: 'Mata Pelajaran', icon: BookOpen },
      { href: '/dashboard/timetables', label: 'Jadwal Mengajar', icon: Clock },
    ],
  },
  {
    label: 'INFORMASI',
    items: [
      { href: '/dashboard/announcements', label: 'Pengumuman', icon: Megaphone },
      { href: '/dashboard/calendar', label: 'Kalender Akademik', icon: Calendar },
    ],
  },
  {
    label: 'LAPORAN',
    items: [
      { href: '/dashboard/attendance/report', label: 'Laporan Absensi', icon: FileText },
    ],
  },
];

const studentNavItems = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/dashboard/scan', label: 'Scan QR Absen', icon: ClipboardCheck },
  { href: '/dashboard/my-attendance', label: 'Riwayat Absensi', icon: History },
  { href: '/dashboard/permission', label: 'Ajukan Izin/Sakit', icon: PenTool },
  { href: '/dashboard/timetables', label: 'Jadwal Pelajaran', icon: BookOpen },
];

function RefreshCw(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { settings } = useSettings();

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const groups: Record<string, boolean> = {};
    if (!isStudent && !isTeacher) {
      adminNavGroups.forEach((g) => {
        groups[g.label] = true; // By default expanded all according to screenshot or keep state
      });
    } else if (isTeacher) {
      teacherNavGroups.forEach((g) => {
        groups[g.label] = true;
      });
    }
    return groups;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#05281a] text-slate-300">
      
      {/* Brand area (hidden or adjust as needed, we'll keep it minimal) */}
      <div className="flex items-center gap-3 px-5 py-5 mb-2">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 p-1">
          <img src="https://coesmed.unpar.ac.id/back/logo-mtsn-1-nganjuk.png" alt="Logo MTsN 1 Nganjuk" className="w-full h-full object-contain rounded-full bg-white p-1" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-sm truncate">{settings.school_name || "MTs Negeri 1 Jakarta"}</h2>
            <p className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider truncate">Sistem Absensi Digital</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar">
        
        {/* DASHBOARD HIGHLIGHTED BUTTON */}
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border border-[#f3c768]/40 bg-white/5 hover:bg-white/10 transition-colors mb-6",
            isActive('/dashboard') && "border-[#f3c768] bg-[#f3c768]/10"
          )}
        >
          <span className="text-sm font-black text-white tracking-widest">DASHBOARD</span>
          <Home className="w-4 h-4 text-[#f3c768]" />
        </Link>

        {isStudent ? (
          <div className="space-y-1">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-emerald-400" : "text-slate-400")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ) : (
          (isTeacher ? teacherNavGroups : adminNavGroups).map((group, groupIdx) => (
            <div key={group.label} className={cn(groupIdx > 0 && "pt-4 border-t border-white/5")}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 mb-2 group outline-none"
                >
                  <span className="text-[11px] font-black text-[#f3c768] uppercase tracking-wider">{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-[#f3c768] transition-transform duration-200',
                      !expandedGroups[group.label] && 'rotate-180' // Using down as expanded, up as collapsed for this theme
                    )}
                  />
                </button>
              )}
              
              {(!collapsed && expandedGroups[group.label] || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.href) && item.href !== '/dashboard'; // skip highlighting if href matches dashboard
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                          active
                            ? 'bg-white/10 text-white'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white',
                          collapsed && 'justify-center px-2'
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <ItemIcon className={cn("w-4 h-4 flex-shrink-0", active ? "text-emerald-400" : "text-slate-400")} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}

        {/* QUOTE AT THE BOTTOM */}
        {!collapsed && !isStudent && (
          <div className="mt-8 mb-4 p-4 rounded-xl border border-[#f3c768]/50 bg-gradient-to-b from-[#f3c768]/10 to-transparent">
            <div className="text-[#f3c768] text-3xl leading-none font-serif mb-1">"</div>
            <p className="text-white/90 text-xs leading-relaxed font-medium">
              Disiplin hari ini,<br/>prestasi esok hari.
            </p>
            <p className="text-[#f3c768] text-[11px] font-black mt-3">
              {settings.school_name || "NAMA SEKOLAH"}
            </p>
          </div>
        )}
      </nav>

      <div className={cn('p-4 border-t border-white/5', collapsed && 'flex justify-center')}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors hidden lg:flex"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="text-xs font-bold uppercase tracking-wider">Tutup Sidebar</span>}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>

      <aside
        className={cn(
          'hidden lg:flex flex-col transition-all duration-300 border-r border-[#083a27]',
          collapsed ? 'w-16' : 'w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
