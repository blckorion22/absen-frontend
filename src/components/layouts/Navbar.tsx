'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="dash-topbar">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--cream)] text-[var(--muted)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: '#19a957', boxShadow: '0 0 0 4px rgba(25,169,87,.12)' }} />
        <span className="text-sm text-[var(--muted)] font-semibold">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="notif-bell">
          <Bell className="w-5 h-5" />
          <span className="notif-dot" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--cream)] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--cream)] flex items-center justify-center border border-[var(--line)]">
              <span className="font-semibold text-sm" style={{ color: 'var(--green)' }}>
                {user ? getInitials(user.name) : '?'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{user?.name || 'User'}</p>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{user?.role || 'User'}</p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-[var(--line)] py-2 animate-scale-in">
              <div className="px-4 py-3 border-b border-[var(--line)]">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
              </div>
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--cream)] transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                <User className="w-4 h-4" />
                Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
