'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/attendance/StatusBadge';
import StudentCard from '@/components/students/StudentCard';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Edit, Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Student, Attendance } from '@/types';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, attendanceRes] = await Promise.all([
          apiService.students.get(id),
          apiService.students.attendance(id, { per_page: 30 }),
        ]);
        setStudent(studentRes.data.data || studentRes.data);
        const attData = attendanceRes.data.data;
        setAttendance(attData?.attendances || (Array.isArray(attData) ? attData : []));
      } catch {
        toast.error('Gagal memuat data siswa');
        router.push('/dashboard/students');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) return <Loading text="Memuat data siswa..." />;
  if (!student) return <div className="text-center py-16 text-gray-400">Siswa tidak ditemukan</div>;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{student.name}</h1>
          <p className="page-subtitle">NIS. {student.nis}</p>
        </div>
        <Link href={`/dashboard/students/${id}/edit`}>
          <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <StudentCard student={student} />
        </div>

        <div className="lg:col-span-2 space-y-6">
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
              <p className="text-xs text-gray-400 mt-1">Alpha</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Riwayat Absensi (30 hari terakhir)
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
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
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
                          {a.check_in && (
                            <span className="text-xs text-gray-400">
                              Masuk: {formatTime(a.check_in)}
                            </span>
                          )}
                          {a.check_out && (
                            <span className="text-xs text-gray-400">
                              Pulang: {formatTime(a.check_out)}
                            </span>
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
      </div>
    </div>
  );
}
