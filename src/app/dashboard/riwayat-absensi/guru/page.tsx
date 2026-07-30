'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface TeacherAttendanceRecord {
  id: number;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  user: { id: number; name: string; email: string; role: string };
}

export default function RiwayatAbsensiGuru() {
  const [data, setData] = useState<TeacherAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { per_page: '100' };
      if (dateFrom) params.start_date = dateFrom;
      if (dateTo) params.end_date = dateTo;
      const res = await api.get('/teacher-attendance/report', { params });
      setData(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(
    (r) =>
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      present: 'badge-success',
      late: 'badge-warning',
      absent: 'badge-danger',
    };
    const label: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Absen',
    };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{label[status] || status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Riwayat Absensi Guru</h1>
        <p className="page-subtitle">Lihat riwayat kehadiran guru & karyawan</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Filter & Pencarian</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field text-sm py-1.5 w-40"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field text-sm py-1.5 w-40"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari guru..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border rounded-lg text-sm w-48 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table-admin">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="text-gray-500">{i + 1}</td>
                    <td className="text-sm">{new Date(r.date).toLocaleDateString('id-ID')}</td>
                    <td className="font-medium">{r.user?.name || '-'}</td>
                    <td className="text-sm text-gray-500">{r.user?.email || '-'}</td>
                    <td>
                      <span className="badge badge-info">{r.user?.role || '-'}</span>
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td className="text-sm">
                      {r.check_in_time
                        ? new Date(r.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="text-sm">
                      {r.check_out_time
                        ? new Date(r.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="text-sm text-gray-500 max-w-[150px] truncate">{r.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
