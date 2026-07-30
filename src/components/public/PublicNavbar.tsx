'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/lib/settings';
import { cn } from '@/lib/utils';
import { QrCode, Users, LayoutDashboard, LogIn, School } from 'lucide-react';

export default function PublicNavbar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scan-qr/siswa', label: 'Scan QR Siswa', icon: QrCode },
    { href: '/scan-qr/guru', label: 'Scan QR Guru', icon: Users },
  ];

  return (
    <header className="public-topbar">
      <div className="public-topbar-inner">
        <Link href="/" className="public-brand">
          <img className="public-brand-logo" src="https://coesmed.unpar.ac.id/back/logo-mtsn-1-nganjuk.png" alt="Logo" />
          <span>
            <span className="public-brand-title">{settings.school_name || 'SISWA ABSENSI'}</span>
            <span className="public-brand-sub">DASHBOARD PUBLIK ABSENSI DIGITAL SEKOLAH</span>
          </span>
        </Link>

        <nav className="public-nav" aria-label="Navigasi dashboard publik">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn('public-nav-link', isActive && 'active')}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="public-actions">
          <Link href="/login" className="public-action manage">
            <LogIn className="w-4 h-4" />
            Masuk / Kelola
          </Link>
        </div>
      </div>
    </header>
  );
}
