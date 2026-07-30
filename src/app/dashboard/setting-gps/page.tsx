'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPin, Save } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function SettingGPS() {
  const [form, setForm] = useState({
    gps_latitude: '',
    gps_longitude: '',
    gps_radius: '100',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const s = res.data.data || {};
        setForm({
          gps_latitude: s.gps_latitude || '',
          gps_longitude: s.gps_longitude || '',
          gps_radius: s.gps_radius || '100',
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
      toast.success('Pengaturan GPS berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Setting GPS Absen</h1>
        <p className="page-subtitle">Atur titik koordinat dan radius sekolah untuk validasi lokasi absensi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Form Koordinat Sekolah</CardTitle></CardHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="text"
                  value={form.gps_latitude}
                  onChange={(e) => setForm({ ...form, gps_latitude: e.target.value })}
                  className="input-field"
                  placeholder="-6.257201"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="text"
                  value={form.gps_longitude}
                  onChange={(e) => setForm({ ...form, gps_longitude: e.target.value })}
                  className="input-field"
                  placeholder="106.903010"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meter)</label>
              <input
                type="number"
                value={form.gps_radius}
                onChange={(e) => setForm({ ...form, gps_radius: e.target.value })}
                className="input-field"
                placeholder="100"
                min="10"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Jarak maksimal siswa/guru dari titik koordinat sekolah untuk dianggap hadir</p>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informasi</CardTitle></CardHeader>
          <div className="p-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p>Koordinat digunakan untuk validasi lokasi saat siswa/guru melakukan absensi.</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
              <p>Radius menentukan seberapa jauh dari titik pusat sekolah absensi masih diterima.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-xs">
              <strong>Cara mendapatkan koordinat:</strong>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>Buka Google Maps</li>
                <li>Klik kanan lokasi sekolah</li>
                <li>Salin angka Latitude dan Longitude</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
