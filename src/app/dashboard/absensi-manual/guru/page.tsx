'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AbsensiManualGuru() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users', { params: { per_page: 500 } })
      .then((res) => setUsers(res.data.data?.data || res.data.data || []))
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toast.error('Pilih guru'); return; }
    try {
      setSubmitting(true);
      await api.post('/teacher-attendance/manual-checkin', {
        user_id: selectedId,
        status,
        notes: notes || undefined,
      });
      toast.success('Absensi berhasil dicatat');
      setSelectedId(null);
      setNotes('');
      setStatus('present');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal melakukan absensi');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Absensi Manual Guru</h1>
        <p className="page-subtitle">Catat kehadiran guru secara manual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pilih Guru / Karyawan</CardTitle>
          </CardHeader>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Tidak ada data</p>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedId === u.id
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <span className="font-medium">{u.name}</span>
                    <span className="text-gray-400 ml-2">({u.email})</span>
                    <span className="badge badge-info ml-2 text-xs">{u.role}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Absensi</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terpilih</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 min-h-[2.5rem]">
                {selectedId
                  ? users.find((u) => u.id === selectedId)?.name || '-'
                  : 'Belum dipilih'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field"
              >
                <option value="present">Hadir</option>
                <option value="late">Terlambat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Opsional..."
              />
            </div>
            <button
              type="submit"
              disabled={!selectedId || submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Absensi'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
