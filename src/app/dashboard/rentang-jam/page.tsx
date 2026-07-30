'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, Save } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function RentangJam() {
  const [form, setForm] = useState({
    jam_masuk: '05:00',
    jam_masuk_threshold: '06:45',
    jam_pulang: '14:00',
    jam_pulang_end: '23:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const s = res.data.data || {};
        setForm({
          jam_masuk: s.jam_masuk || '05:00',
          jam_masuk_threshold: s.jam_masuk_threshold || '06:45',
          jam_pulang: s.jam_pulang || '14:00',
          jam_pulang_end: s.jam_pulang_end || '23:00',
        });
      })
      .catch(() => toast.error('Gagal memuat settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', form);
      toast.success('Rentang jam berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  const fields = [
    { key: 'jam_masuk', label: 'Jam Mulai Masuk (Tepat Waktu)' },
    { key: 'jam_masuk_threshold', label: 'Batas Hadir Tepat Waktu (Setelah ini = Terlambat)' },
    { key: 'jam_pulang', label: 'Jam Mulai Pulang (Check-out)' },
    { key: 'jam_pulang_end', label: 'Batas Akhir Scan Pulang' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Rentang Jam Absensi</h1>
        <p className="page-subtitle">Atur jam masuk dan pulang untuk operasional absen siswa</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Pengaturan Waktu Absensi Kiosk</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                <input
                  type="time"
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="input-field max-w-xs"
                  required
                />
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-6">
            <h3 className="font-bold text-emerald-800 mb-3">Penjelasan Logika Sistem:</h3>
            <ul className="list-disc list-inside text-sm text-emerald-900 space-y-2">
              <li>Siswa absen antara <strong>{form.jam_masuk} s.d {form.jam_masuk_threshold}</strong> akan dianggap <strong>Hadir Tepat Waktu</strong>.</li>
              <li>Siswa absen setelah <strong>{form.jam_masuk_threshold}</strong> sampai dengan <strong>{form.jam_pulang}</strong> akan dianggap <strong>Terlambat</strong>.</li>
              <li>Siswa absen mulai <strong>{form.jam_pulang} s.d {form.jam_pulang_end}</strong> akan dianggap <strong>Pulang</strong> (Check-out).</li>
              <li>Pesan WhatsApp otomatis disesuaikan dengan kondisi Tepat Waktu, Terlambat, atau Pulang.</li>
            </ul>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </Card>
    </div>
  );
}
