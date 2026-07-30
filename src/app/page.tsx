'use client';

import React, { useEffect, useState } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import Link from 'next/link';
import './public-theme.css';

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const slides = [
    'https://coesmed.unpar.ac.id/back/dashboard-hero-building.jpeg',
    'https://coesmed.unpar.ac.id/back/01.png',
    'https://coesmed.unpar.ac.id/back/02.png',
  ];

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/public/stats`);
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    
    fetchStats();
    const statsTimer = setInterval(fetchStats, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5200);
    return () => clearInterval(sliderTimer);
  }, [slides.length]);

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css" />

      <div className="page-bg-custom">
        <PublicNavbar />

        <main className="dashboard-page">
          {/* Hero Section */}
          <section className="hero-new">
            <div className="hero-photo-new" aria-hidden="true">
              {slides.map((src, idx) => (
                <img key={idx} className={`hero-slide ${idx === currentSlide ? 'active' : ''}`} src={src} alt="" loading={idx === 0 ? "eager" : "lazy"} decoding="async" />
              ))}
            </div>
            <div className="hero-content-new">
              <span className="live-badge-new"><span></span> Absensi Realtime</span>
              <h1 className="hero-title-new">Pantau seluruh aktivitas kehadiran siswa, guru, dan notifikasi harian secara <span className="accent">real-time</span> melalui satu pintu informasi terintegrasi.</h1>
              <p className="hero-desc-new">Dashboard publik ini menampilkan pembaruan absensi langsung dari sistem fingerprint, QR, dan proses notifikasi WhatsApp dan App Wali yang sedang aktif.</p>
            </div>
            <div className="hero-dots" aria-label="Pilih gambar gedung">
              {slides.map((_, idx) => (
                <button key={idx} type="button" className={idx === currentSlide ? 'active' : ''} onClick={() => setCurrentSlide(idx)} aria-label={`Tampilkan slide ${idx + 1}`}></button>
              ))}
            </div>
          </section>

          {/* Hero Metrics */}
          <section className="hero-metrics" aria-label="Informasi sistem">
            <article className="hero-metric">
              <div className="metric-art"><i className="bi bi-bank2"></i></div>
              <div><div className="metric-label">Sekolah</div><div className="metric-value">{stats?.school_name || "MTs Negeri 1 Jakarta"}</div><div className="metric-note">Terhubung ke dashboard publik sekolah</div></div>
            </article>
            <article className="hero-metric">
              <div className="metric-art"><i className="bi bi-clock-history"></i></div>
              <div><div className="metric-label">Refresh Otomatis</div><div className="metric-value">15 detik</div><div className="metric-note">Live monitor lebih halus dan tidak membebani</div></div>
            </article>
            <article className="hero-metric">
              <div className="metric-art"><i className="bi bi-shield-check"></i></div>
              <div>
                <div className="metric-label">Status Data</div>
                <div className="metric-value">Data tersinkron</div>
                <div className="metric-note">Pembaruan terakhir<br/><strong>{currentTime ? currentTime.toLocaleTimeString('id-ID') + ' WIB' : 'Menunggu data'}</strong></div>
              </div>
            </article>
          </section>

          {/* Info Grid (4 columns) */}
          <section className="info-grid-new" aria-label="Informasi cepat">
            <article className="info-box-new">
              <h3 className="info-box-title"><i className="bi bi-clock-history"></i> Jam Absensi Hari Ini</h3>
              <div className="schedule-mini">
                <div><i className="bi bi-clock"></i><span>Jam Masuk</span><strong>{stats?.schedule?.jam_masuk || '05:00-06:45'}</strong></div>
                <div><i className="bi bi-clock"></i><span>Jam Pulang</span><strong>{stats?.schedule?.jam_pulang || '14:00-23:00'}</strong></div>
              </div>
            </article>
            <article className="info-box-new">
              <h3 className="info-box-title"><i className="bi bi-bell-fill"></i> Notifikasi Terbaru</h3>
              <div className="notif-list">
                {stats?.recent_activities?.slice(0, 5).map((act: any, i: number) => (
                  <div key={i} className="notif-item">
                    <i className="bi bi-bell"></i>
                    <div>
                      <strong>Absensi {act.status}</strong>
                      <span>{act.name} ({act.role}) melakukan absensi pada pukul {act.time}. Notifikasi terkirim.</span>
                    </div>
                    <b className="notif-time">{act.time}</b>
                  </div>
                ))}
                {!stats?.recent_activities?.length && (
                  <div className="notif-item text-center text-gray-400 py-4"><small>Belum ada aktivitas hari ini</small></div>
                )}
              </div>
            </article>
            <article className="info-box-new">
              <h3 className="info-box-title"><i className="bi bi-grid-1x2-fill"></i> Ringkasan Cepat</h3>
              <div className="quick-grid">
                <div className="quick-item"><i className="bi bi-people"></i><div><span>Total Siswa</span><strong>{stats?.total_students || 0}</strong><small>Terdaftar aktif</small></div></div>
                <div className="quick-item"><i className="bi bi-person-badge"></i><div><span>Total Guru</span><strong>{stats?.total_teachers || 0}</strong><small>Terdaftar aktif</small></div></div>
                <div className="quick-item"><i className="bi bi-clock"></i><div><span>Terlambat</span><strong>{stats?.late_today || 0}</strong><small>Perlu perhatian</small></div></div>
                <div className="quick-item"><i className="bi bi-qr-code-scan"></i><div><span>Scan Kiosk</span><strong>{stats ? Math.round(((stats.present_today + stats.late_today) / (stats.total_students || 1)) * 100) : 0}%</strong><small>Tingkat utilisasi</small></div></div>
                <div className="quick-item"><i className="bi bi-whatsapp"></i><div><span>WA Terkirim</span><strong>{stats ? (stats.present_today + stats.late_today) : 0}</strong><small>Hari ini</small></div></div>
                <div className="quick-item"><i className="bi bi-person-check"></i><div><span>Sistem Aktif</span><strong>100%</strong><small>Layanan normal</small></div></div>
              </div>
            </article>
            <article className="info-box-new contact">
              <h3 className="info-box-title"><i className="bi bi-chat-dots"></i> Hubungi Kami</h3>
              <div className="contact-list">
                <div className="contact-item"><i className="bi bi-geo-alt"></i><div><strong>Alamat</strong><span>{stats?.school_address || 'Jl. Raya Jatiwaringin, RT.008/RW.009, Jaticempaka, Kec. Pd. Gede, Kota Bks, Jawa Barat 13620'}</span></div></div>
                <div className="contact-item"><i className="bi bi-telephone"></i><div><strong>Telepon</strong><span>{stats?.school_phone || '(021) 8491 3427'}</span></div></div>
                <div className="contact-item"><i className="bi bi-envelope"></i><div><strong>Email</strong><span>{stats?.school_email || 'info@mtsn1jakarta.sch.id'}</span></div></div>
                <div className="contact-item"><i className="bi bi-globe"></i><div><strong>Website</strong><span>{stats?.school_website || 'www.mtsn1jakarta.sch.id'}</span></div></div>
              </div>
            </article>
          </section>
        </main>

        <footer className="public-footer">
          <div className="public-footer-bar">
            <div className="public-footer-safe">
              <img className="public-footer-logo" src="https://coesmed.unpar.ac.id/back/logo-mtsn-1-nganjuk.png" alt="Logo Sekolah" />
              <div><strong>Sistem Absensi Aman & Terpercaya</strong><span>Data tersimpan aman dan terproteksi</span></div>
            </div>
            <div className="public-footer-copy">
              &copy; 2026 {stats?.school_name || "MTs Negeri 1 Jakarta"}. All rights reserved.<br />
              <em>{stats?.school_motto || "Berakhlak Mulia, Berprestasi, dan Berwawasan Global"}</em>
            </div>
            <div className="public-footer-integrations">
              <strong>Terintegrasi dengan</strong>
              <div className="public-footer-tags">
                <span><i className="bi bi-fingerprint"></i> Fingerprint</span>
                <span><i className="bi bi-qr-code"></i> QR Code</span>
                <span><i className="bi bi-whatsapp"></i> WhatsApp</span>
                <span><i className="bi bi-people-fill"></i> App Wali</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
