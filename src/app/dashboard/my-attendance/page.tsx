'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import StatusBadge from '@/components/attendance/StatusBadge';
import Loading from '@/components/ui/Loading';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Attendance, Student } from '@/types';

export default function MyAttendancePage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.attendance.myAttendance({ per_page: 30 });
        setStudent(res.data.data.student);
        setAttendance(res.data.data.attendances);
      } catch {
        toast.error('Gagal memuat riwayat absensi');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading text="Memuat riwayat absensi..." />;
  if (!student) return <div className="text-center py-16 text-gray-400">Data tidak ditemukan</div>;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Riwayat Absensi Saya</h1>
        <p className="page-subtitle">{student.name} (NIS: {student.nis}) - Kelas {student.class_room?.grade} {student.class_room?.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
          <p className="text-xs text-gray-400 mt-1">Hadir</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
          <p className="text-xs text-gray-400 mt-1">Terlambat</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-gray-400 mt-1">Alpha/Izin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Riwayat 30 Hari Terakhir
          </CardTitle>
        </CardHeader>
        {attendance.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Belum ada riwayat absensi
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(a.date, 'EEEE, dd MMMM yyyy')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {a.check_in ? (
                        <span className="text-xs text-gray-500">Masuk: {formatTime(a.check_in)}</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      {a.check_out && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">Pulang: {formatTime(a.check_out)}</span>
                        </>
                      )}
                      {a.note && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-amber-600">{a.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
