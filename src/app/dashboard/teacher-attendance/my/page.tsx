'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { RefreshCw, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { TeacherAttendance } from '@/types';

export default function MyTeacherAttendancePage() {
  const [records, setRecords] = useState<TeacherAttendance[]>([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { month: Number(month), year: Number(year), per_page: 100 };
      const res = await apiService.teacherAttendance.my(params);
      setRecords(res.data.data?.data || res.data.data || []);
      if (res.data.summary) setSummary(res.data.summary);
    } catch {
      toast.error('Gagal memuat riwayat absensi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Absensi Saya</h1>
          <p className="page-subtitle">Riwayat kehadiran Anda</p>
        </div>
        <Button variant="secondary" onClick={() => { setRefreshing(true); fetchData(); }}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-slate-50 text-slate-600"><Calendar className="w-6 h-6" /></div>
          <div>
            <strong className="text-2xl font-bold text-gray-900">{summary.total}</strong>
            <span className="text-xs text-gray-500 block">Total Hari</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-50 text-green-600"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <strong className="text-2xl font-bold text-gray-900">{summary.present}</strong>
            <span className="text-xs text-gray-500 block">Hadir</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600"><Clock className="w-6 h-6" /></div>
          <div>
            <strong className="text-2xl font-bold text-gray-900">{summary.late}</strong>
            <span className="text-xs text-gray-500 block">Terlambat</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600"><XCircle className="w-6 h-6" /></div>
          <div>
            <strong className="text-2xl font-bold text-gray-900">{summary.absent}</strong>
            <span className="text-xs text-gray-500 block">Alpha</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Riwayat Bulanan</CardTitle>
            <div className="flex-1" />
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="input-field w-auto text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="input-field w-auto text-sm">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Tanggal</th>
                <th className="table-header-cell">Masuk</th>
                <th className="table-header-cell">Pulang</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Keterangan</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loading /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">Belum ada data absensi</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{r.date}</td>
                  <td className="table-cell">{r.check_in_time ? formatTime(r.check_in_time) : '-'}</td>
                  <td className="table-cell">{r.check_out_time ? formatTime(r.check_out_time) : '-'}</td>
                  <td className="table-cell">
                    <span className={`badge ${r.status === 'present' ? 'text-green-700 bg-green-50 border-green-200' : r.status === 'late' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                      {r.status === 'present' ? 'Hadir' : r.status === 'late' ? 'Terlambat' : 'Alpha'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
