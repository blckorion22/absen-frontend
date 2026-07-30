'use client';

import React, { useState, useEffect, useRef } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Printer, Search, Download, School } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useSettings } from '@/lib/settings';

interface Student {
  id: number;
  nis: string;
  name: string;
  class_room?: { id: number; name: string; grade: string };
  photo?: string;
  gender?: string;
}

interface Guru {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

export default function IDCards() {
  const [type, setType] = useState<'siswa' | 'guru'>('siswa');
  const [students, setStudents] = useState<Student[]>([]);
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string; grade: string }[]>([]);
  const [classId, setClassId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    Promise.all([
      api.get('/classes', { params: { per_page: 200 } }),
      api.get('/students', { params: { per_page: 500 } }),
      api.get('/users', { params: { per_page: 500 } }),
    ])
      .then(([cRes, sRes, uRes]) => {
        const cls = cRes.data.data?.data || cRes.data.data || [];
        setClasses(cls);
        const studs = sRes.data.data?.data || sRes.data.data || [];
        setStudents(studs);
        
        const users = uRes.data.data?.data || uRes.data.data || [];
        // Filter guru and admin
        const teachers = users.filter((u: any) => u.role === 'teacher' || u.role === 'admin');
        setGurus(teachers);
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter((s) => {
    if (classId && s.class_room?.id !== classId) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.nis.includes(search)) return false;
    return true;
  });

  const filteredGurus = gurus.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const genderLabel = (g?: string) => {
    if (g === 'L') return 'Laki-Laki';
    if (g === 'P') return 'Perempuan';
    return '-';
  };

  const StudentCardItem = ({ s }: { s: Student }) => (
    <div className="student-card-print">
      <div className="student-card">
        <div className="card-gold-bar" />
        <div className="card-header">
          <div className="card-logo-wrap">
            <img src={settings.school_logo || "/logo.svg"} alt="Logo" className="card-logo" />
          </div>
          <div className="card-header-text">
            <span className="card-school">{settings.school_name || 'NAMA SEKOLAH'}</span>
            <span className="card-title">KARTU PELAJAR</span>
          </div>
        </div>
        <div className="card-body">
          <div className="card-photo-col">
            {s.photo ? (
              <img src={s.photo} alt={s.name} className="card-photo" />
            ) : (
              <div className="card-photo-placeholder">
                {s.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="card-info-col">
            <div className="card-info-row">
              <span className="card-info-label">Nama</span>
              <span className="card-info-value">{s.name}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label">NIS</span>
              <span className="card-info-value">{s.nis}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label">Kelas</span>
              <span className="card-info-value">{s.class_room?.name || '-'}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label">JK</span>
              <span className="card-info-value">{genderLabel(s.gender)}</span>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="card-footer-text">
            <span>{settings.school_name || 'NAMA SEKOLAH'}</span>
            <span>{settings.school_address || 'Alamat Sekolah'}</span>
          </div>
          <div className="card-qr">
            <QRCodeCanvas value={s.nis} size={56} level="M" />
            <span className="card-qr-nis">{s.nis}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const GuruCardItem = ({ g }: { g: Guru }) => (
    <div className="student-card-print">
      <div className="student-card" style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="card-gold-bar" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)' }} />
        <div className="card-header">
          <div className="card-logo-wrap">
            <img src={settings.school_logo || "/logo.svg"} alt="Logo" className="card-logo" />
          </div>
          <div className="card-header-text">
            <span className="card-school" style={{ color: '#93c5fd' }}>{settings.school_name || 'NAMA SEKOLAH'}</span>
            <span className="card-title">KARTU PEGAWAI</span>
          </div>
        </div>
        <div className="card-body">
          <div className="card-photo-col">
            {g.avatar ? (
              <img src={g.avatar} alt={g.name} className="card-photo" style={{ borderColor: 'rgba(96,165,250,0.5)' }} />
            ) : (
              <div className="card-photo-placeholder" style={{ borderColor: 'rgba(96,165,250,0.3)' }}>
                {g.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="card-info-col">
            <div className="card-info-row">
              <span className="card-info-label" style={{ color: '#93c5fd' }}>Nama</span>
              <span className="card-info-value">{g.name}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label" style={{ color: '#93c5fd' }}>Email / QR Code</span>
              <span className="card-info-value">{g.email}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label" style={{ color: '#93c5fd' }}>Peran</span>
              <span className="card-info-value" style={{ textTransform: 'capitalize' }}>{g.role}</span>
            </div>
            <div className="card-info-row">
              <span className="card-info-label" style={{ color: '#93c5fd' }}>Telepon</span>
              <span className="card-info-value">{g.phone || '-'}</span>
            </div>
          </div>
        </div>
        <div className="card-footer" style={{ borderTopColor: 'rgba(96,165,250,0.2)' }}>
          <div className="card-footer-text">
            <span style={{ color: '#93c5fd' }}>{settings.school_name || 'NAMA SEKOLAH'}</span>
            <span>{settings.school_address || 'Alamat Sekolah'}</span>
          </div>
          <div className="card-qr">
            <QRCodeCanvas value={g.email} size={56} level="M" />
            <span className="card-qr-nis" style={{ fontSize: '5px' }}>{g.email}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="print-hide">
        <h1 className="page-title">Cetak ID Card</h1>
        <p className="page-subtitle">Pilih Siswa atau Guru & Karyawan untuk mencetak kartu identitas dengan QR Code</p>
      </div>

      <div className="print-hide">
        <div className="flex gap-2 mb-4 border-b border-gray-200 pb-2">
          <button
            onClick={() => setType('siswa')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
              type === 'siswa'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            Siswa
          </button>
          <button
            onClick={() => setType('guru')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
              type === 'guru'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            Guru & Karyawan
          </button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Filter {type === 'siswa' ? 'Siswa' : 'Guru'}</CardTitle>
              <button onClick={handlePrint} className="btn btn-primary">
                <Printer className="w-4 h-4" /> Cetak ID Card
              </button>
            </div>
          </CardHeader>
          <div className="p-4 flex flex-wrap gap-3">
            {type === 'siswa' && (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : '')}
                className="input-field w-48"
              >
                <option value="">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>
            )}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={type === 'siswa' ? 'Cari nama atau NIS...' : 'Cari nama atau Email...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-sm text-gray-500 self-center">
              {type === 'siswa' ? filteredStudents.length : filteredGurus.length} data
            </span>
          </div>
        </Card>
      </div>

      <div ref={printRef} className="id-cards-grid">
        {type === 'siswa' ? (
          filteredStudents.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-gray-400">Tidak ada data siswa</div>
            </Card>
          ) : (
            filteredStudents.map((s) => <StudentCardItem key={s.id} s={s} />)
          )
        ) : (
          filteredGurus.length === 0 ? (
            <Card>
              <div className="p-8 text-center text-gray-400">Tidak ada data guru/karyawan</div>
            </Card>
          ) : (
            filteredGurus.map((g) => <GuruCardItem key={g.id} g={g} />)
          )
        )}
      </div>

      <style jsx global>{`
        .id-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .student-card-print {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .student-card {
          position: relative;
          background: linear-gradient(145deg, #003c25 0%, #002b1a 100%);
          border-radius: 14px;
          padding: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
          aspect-ratio: 1.586;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(215,162,58,0.3);
        }

        .card-gold-bar {
          height: 4px;
          background: linear-gradient(90deg, #d7a23a, #f3c768, #d7a23a);
          flex-shrink: 0;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px 6px;
          flex-shrink: 0;
        }

        .card-logo-wrap {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .card-header-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .card-school {
          color: #d7a23a;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          line-height: 1.2;
        }

        .card-title {
          color: rgba(255,255,255,0.9);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .card-body {
          flex: 1;
          display: flex;
          gap: 12px;
          padding: 6px 14px 8px;
          min-height: 0;
        }

        .card-photo-col {
          width: 80px;
          min-height: 0;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .card-photo {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid rgba(215,162,58,0.5);
        }

        .card-photo-placeholder {
          width: 100%;
          aspect-ratio: 3/4;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          border: 2px solid rgba(215,162,58,0.3);
          color: rgba(255,255,255,0.6);
          font-size: 26px;
          font-weight: 900;
        }

        .card-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
          min-width: 0;
        }

        .card-info-row {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 1px 0;
        }

        .card-info-label {
          font-size: 7px;
          font-weight: 800;
          color: rgba(215,162,58,0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-info-value {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 14px 10px;
          border-top: 1px solid rgba(215,162,58,0.2);
          flex-shrink: 0;
        }

        .card-footer-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .card-footer-text span:first-child {
          font-size: 8px;
          font-weight: 800;
          color: #d7a23a;
          text-transform: uppercase;
        }

        .card-footer-text span:last-child {
          font-size: 7px;
          color: rgba(255,255,255,0.5);
        }

        .card-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .card-qr canvas {
          display: block;
          border-radius: 4px;
          background: #fff;
          padding: 3px;
        }

        .card-qr-nis {
          font-size: 7px;
          color: rgba(255,255,255,0.6);
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        @media print {
          .print-hide, aside, header, nav { display: none !important; }
          body, html { background: #fff !important; margin: 0; padding: 0; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          .max-w-7xl { max-width: none !important; margin: 0 !important; }
          .min-h-screen { min-height: 0 !important; background: none !important; }
          @page { size: A4; margin: 10mm; }

          .id-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8mm;
            padding: 0;
          }

          .student-card {
            box-shadow: none;
            border: 1px solid #ccc;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
