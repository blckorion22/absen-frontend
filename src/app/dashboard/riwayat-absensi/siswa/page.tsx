'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Download, Search, ClipboardList } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface AttendanceRecord {
  id: number;
  student_id: number;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  notes: string | null;
  student: { id: number; nis: string; name: string; classRoom?: { name: string } };
}

const statusStyle: Record<string, { badge: string; label: string }> = {
  present: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Hadir' },
  late: { badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Terlambat' },
  absent: { badge: 'bg-red-50 text-red-700 border-red-200', label: 'Absen' },
  excused: { badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Izin' },
  sick: { badge: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Sakit' },
};

export default function RiwayatAbsensiSiswa() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { per_page: '100' };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/attendance/report', { params });
      setData(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(
    (r: any) =>
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.student_nis || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Riwayat Absensi Siswa</h1>
        <p className="page-subtitle">Lihat dan cari riwayat kehadiran siswa</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Filter & Pencarian</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-field text-sm py-1.5 w-40"
                />
              </div>
              <span className="text-gray-300">—</span>
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
                  placeholder="Cari siswa..."
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
                <th className="w-12 text-center">No</th>
                <th>Tanggal</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th className="text-center">Status</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="flex items-center justify-center py-12 text-gray-400">
                      <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state py-12">
                      <ClipboardList className="empty-state-icon" />
                      <p className="text-gray-500 text-sm">Tidak ada data absensi</p>
                      <p className="text-gray-400 text-xs mt-1">Coba ubah filter tanggal atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r: any, i) => {
                  const st = statusStyle[r.status] || { badge: 'bg-gray-50 text-gray-700 border-gray-200', label: r.status };
                  return (
                    <tr key={r.id}>
                      <td className="text-gray-400 text-center">{i + 1}</td>
                      <td className="text-sm font-medium text-gray-900">
                        {new Date(r.created_at).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="font-mono text-sm text-gray-500">{r.student_nis || '-'}</td>
                      <td className="font-medium text-gray-900">{r.student_name || '-'}</td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {r.class_name || '-'}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="text-sm">
                        {r.check_in ? (
                          <span className="font-medium text-emerald-600">
                            {new Date(r.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="text-sm">
                        {r.check_out ? (
                          <span className="font-medium text-orange-600">
                            {new Date(r.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="text-sm text-gray-500 max-w-[160px] truncate" title={r.note || ''}>
                        {r.note || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {data.length} data
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                H: {data.filter((d) => d.status === 'present').length}
                {' | '}T: {data.filter((d) => d.status === 'late').length}
                {' | '}A: {data.filter((d) => d.status === 'absent').length}
                {' | '}I: {data.filter((d) => d.status === 'excused' || d.status === 'sick').length}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
