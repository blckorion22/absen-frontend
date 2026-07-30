'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/attendance/StatusBadge';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { RefreshCw, Clock, ClipboardCheck, AlertCircle } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Attendance, ClassRoom } from '@/types';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      const params: Record<string, string | number> = {};
      if (classFilter) params.class_room_id = classFilter;
      const response = await apiService.attendance.today(params);
      setAttendance(response.data.data || []);
    } catch {
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    apiService.classes.list({ per_page: 100 }).then((res) => {
      setClasses(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  if (loading) return <Loading text="Memuat data absensi..." />;

  const summary = {
    present: attendance.filter((a) => a.status === 'present').length,
    late: attendance.filter((a) => a.status === 'late').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    excused: attendance.filter((a) => a.status === 'excused').length,
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Absensi Hari Ini</h1>
          <p className="page-subtitle">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
          <p className="text-xs text-gray-400 mt-1">Hadir</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
          <p className="text-xs text-gray-400 mt-1">Terlambat</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
          <p className="text-xs text-gray-400 mt-1">Alpha</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
          <p className="text-xs text-gray-400 mt-1">Izin</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-full sm:w-48">
          <Select
            id="class_filter"
            placeholder="Semua Kelas"
            options={classes.map((c) => ({ value: c.id, label: `${c.grade} - ${c.name}` }))}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-400">
          {attendance.length} siswa
        </span>
      </div>

      <Card className="p-0">
        {attendance.length === 0 ? (
          <div className="empty-state py-12">
            <ClipboardCheck className="empty-state-icon" />
            <p className="text-gray-500 text-sm">Belum ada data absensi hari ini</p>
            <p className="text-gray-400 text-xs mt-1">Siswa dapat melakukan scan QR Code untuk absensi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Nama</div>
              <div className="col-span-2">NIS</div>
              <div className="col-span-2">Kelas</div>
              <div className="col-span-2">Waktu</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Keterangan</div>
            </div>
            {attendance.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900">{a.student_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{a.student_nis}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{a.class_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-emerald-600">
                    {a.check_in ? formatTime(a.check_in) : '-'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {a.check_out ? formatTime(a.check_out) : '-'}
                  </p>
                </div>
                <div className="col-span-1">
                  <StatusBadge status={a.status} />
                </div>
                <div className="col-span-2 text-right">
                  {a.note && <p className="text-xs text-gray-600 truncate">{a.note}</p>}
                  {a.evidence_path && (
                    <a
                      href={a.evidence_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Lihat Surat/Bukti
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
