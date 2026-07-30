'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/attendance/StatusBadge';
import Loading from '@/components/ui/Loading';
import { Download, FileText, Search, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Attendance, ClassRoom, AttendanceReport } from '@/types';

export default function ReportPage() {
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    start_date: weekAgo,
    end_date: today,
    class_id: '',
    status: '',
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filters.start_date) params.date_from = filters.start_date;
      if (filters.end_date) params.date_to = filters.end_date;
      if (filters.class_id) params.class_room_id = filters.class_id;
      if (filters.status) params.status = filters.status;
      const response = await apiService.attendance.report(params);
      setReport(response.data.data || response.data);
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    apiService.classes.list({ per_page: 100 }).then((res) => {
      setClasses(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.class_id) params.append('class_id', filters.class_id);
    if (filters.status) params.append('status', filters.status);
    
    window.open('/dashboard/attendance/report/print?' + params.toString(), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Laporan Absensi</h1>
          <p className="page-subtitle">Filter dan export data absensi</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExport}
          icon={<Download className="w-4 h-4" />}
        >
          Cetak Laporan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Dari Tanggal"
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
            />
            <Input
              label="Sampai Tanggal"
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
            />
            <Select
              label="Kelas"
              id="class_id"
              placeholder="Semua Kelas"
              options={classes.map((c) => ({ value: c.id, label: `${c.grade} - ${c.name}` }))}
              value={filters.class_id}
              onChange={(e) => setFilters((p) => ({ ...p, class_id: e.target.value }))}
            />
            <Select
              label="Status"
              id="status"
              placeholder="Semua Status"
              options={[
                { value: 'present', label: 'Hadir' },
                { value: 'late', label: 'Terlambat' },
                { value: 'absent', label: 'Alpha' },
                { value: 'excused', label: 'Izin' },
              ]}
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Loading text="Memuat laporan..." />
      ) : report ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900">{report.summary.total}</p>
              <p className="text-xs text-gray-400 mt-1">Total</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-emerald-600">{report.summary.present}</p>
              <p className="text-xs text-gray-400 mt-1">Hadir</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-amber-600">{report.summary.late}</p>
              <p className="text-xs text-gray-400 mt-1">Terlambat</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-red-600">{report.summary.absent}</p>
              <p className="text-xs text-gray-400 mt-1">Alpha</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-blue-600">{report.summary.excused}</p>
              <p className="text-xs text-gray-400 mt-1">Izin</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${report.summary.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {report.summary.percentage}% Kehadiran
              </span>
            </div>
          </div>

          <Card className="p-0">
            {report.data.length === 0 ? (
              <div className="empty-state py-12">
                <FileText className="empty-state-icon" />
                <p className="text-gray-500 text-sm">Tidak ada data untuk periode ini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Tanggal</div>
                  <div className="col-span-3">Nama</div>
                  <div className="col-span-2">Kelas</div>
                  <div className="col-span-2">Jam</div>
                  <div className="col-span-2">Status</div>
                </div>
                {report.data.map((a) => (
                  <div
                    key={a.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3 text-sm text-gray-700">
                      {formatDate(a.date, 'dd/MM/yyyy')}
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900">{a.student_name}</p>
                      <p className="text-xs text-gray-400">{a.student_nis}</p>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">{a.class_name}</div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {a.check_in ? formatTime(a.check_in) : '-'}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <div className="empty-state py-16">
          <AlertCircle className="empty-state-icon" />
          <p className="text-gray-500 text-sm">Terjadi kesalahan saat memuat laporan</p>
        </div>
      )}
    </div>
  );
}
