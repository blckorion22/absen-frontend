'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { ClipboardCheck, Users, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function AbsensiHariIni() {
  const [studentData, setStudentData] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/today', { params: { per_page: 10 } }),
      api.get('/teacher-attendance/today'),
    ])
      .then(([sRes, tRes]) => {
        setStudentData(sRes.data.data);
        setTeacherData(tRes.data.data);
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingOverlay />;

  const sSummary = studentData?.summary || {};
  const tSummary = teacherData?.data?.summary || {};
  const sRecords = studentData?.records || studentData?.data || [];
  const tRecords = teacherData?.data?.records || [];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { present: 'badge-success', late: 'badge-warning', absent: 'badge-danger', excused: 'badge-info', sick: 'badge-info' };
    const label: Record<string, string> = { present: 'Hadir', late: 'Terlambat', absent: 'Absen', excused: 'Izin', sick: 'Sakit' };
    return <span className={`badge ${map[status] || ''}`}>{label[status] || status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Absensi Hari Ini</h1>
        <p className="page-subtitle">Pantau kehadiran siswa dan guru secara real-time</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
          <div><strong className="text-2xl font-bold">{sSummary.present || 0}</strong><span className="text-xs text-gray-500">Siswa Hadir</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange-50 text-orange-600"><AlertTriangle className="w-6 h-6" /></div>
          <div><strong className="text-2xl font-bold">{sSummary.late || 0}</strong><span className="text-xs text-gray-500">Siswa Terlambat</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-50 text-green-600"><Users className="w-6 h-6" /></div>
          <div><strong className="text-2xl font-bold">{tSummary.present || 0}</strong><span className="text-xs text-gray-500">Guru Hadir</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600"><XCircle className="w-6 h-6" /></div>
          <div><strong className="text-2xl font-bold">{tSummary.absent || 0}</strong><span className="text-xs text-gray-500">Guru Tidak Hadir</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Siswa Hari Ini</CardTitle>
              <span className="text-sm text-gray-500">Total: {sSummary.total || 0}</span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>NIS</th>
                  <th>Nama</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sRecords.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Belum ada data</td></tr>
                ) : (
                  sRecords.slice(0, 15).map((r: any) => (
                    <tr key={r.id}>
                      <td className="text-sm">{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="font-mono text-sm">{r.student?.nis || '-'}</td>
                      <td className="font-medium">{r.student?.name || '-'}</td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Guru Hari Ini</CardTitle>
              <span className="text-sm text-gray-500">Total: {tSummary.total_teachers || 0}</span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Nama</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tRecords.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-gray-400">Belum ada data</td></tr>
                ) : (
                  tRecords.slice(0, 15).map((r: any) => (
                    <tr key={r.id}>
                      <td className="text-sm">{r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="font-medium">{r.user?.name || '-'}</td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
