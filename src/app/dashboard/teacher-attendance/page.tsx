'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { RefreshCw, Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { TeacherAttendance } from '@/types';

export default function TeacherAttendancePage() {
  const [records, setRecords] = useState<TeacherAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await apiService.teacherAttendance.list(params);
      setRecords(res.data.data?.data || res.data.data || []);
    } catch {
      toast.error('Gagal memuat data absensi guru');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const today = new Date().toISOString().split('T')[0];
  const summary = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Absensi Guru</h1>
          <p className="page-subtitle">Rekap kehadiran seluruh guru & karyawan</p>
        </div>
        <Button variant="secondary" onClick={() => { setRefreshing(true); fetchData(); }}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600"><Users className="w-6 h-6" /></div>
          <div>
            <strong className="text-2xl font-bold text-gray-900">{summary.total}</strong>
            <span className="text-xs text-gray-500 block">Total Absen Hari Ini</span>
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Riwayat Absensi Guru</CardTitle>
            <div className="flex-1" />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="input-field w-auto text-sm" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="input-field w-auto text-sm">
              <option value="">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="late">Terlambat</option>
              <option value="absent">Alpha</option>
            </select>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Nama</th>
                <th className="table-header-cell">Tanggal</th>
                <th className="table-header-cell">Masuk</th>
                <th className="table-header-cell">Pulang</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Keterangan</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loading /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Belum ada data absensi guru</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{r.user?.name || '-'}</td>
                  <td className="table-cell">{r.date}</td>
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
