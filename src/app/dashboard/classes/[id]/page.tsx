'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/attendance/StatusBadge';
import Loading from '@/components/ui/Loading';
import { ArrowLeft, Edit, QrCode, Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ClassRoom, Student, Attendance, PaginatedResponse } from '@/types';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [classData, setClassData] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, studentRes, attendanceRes] = await Promise.all([
          apiService.classes.get(id),
          apiService.classes.students(id),
          apiService.attendance.today({ class_id: id }),
        ]);
        setClassData(classRes.data.data || classRes.data);
        const classDataPayload = studentRes.data.data || studentRes.data;
        setStudents(classDataPayload.students || []);
        setTodayAttendance(attendanceRes.data.data || []);
      } catch {
        toast.error('Gagal memuat data kelas');
        router.push('/dashboard/classes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) return <Loading text="Memuat data kelas..." />;
  if (!classData) return <div className="text-center py-16 text-gray-400">Kelas tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{classData.name}</h1>
          <p className="page-subtitle">Kelas {classData.grade} - {classData.academic_year}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/classes/${id}/edit`}>
            <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>Edit</Button>
          </Link>
          <Link href={`/dashboard/classes/${id}/qr`}>
            <Button variant="primary" size="sm" icon={<QrCode className="w-4 h-4" />}>QR Code</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kelas</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <GraduationCap className="w-4 h-4" />, label: 'Nama Kelas', value: classData.name },
                { icon: <BookOpen className="w-4 h-4" />, label: 'Tingkat', value: classData.grade },
                { icon: <Calendar className="w-4 h-4" />, label: 'Tahun Ajaran', value: classData.academic_year },
                { icon: <Users className="w-4 h-4" />, label: 'Wali Kelas', value: classData.teacher_name },
                { icon: <Users className="w-4 h-4" />, label: 'Jumlah Siswa', value: `${classData.student_count} Siswa` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {classData.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Deskripsi</p>
                <p className="text-sm text-gray-700">{classData.description}</p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Absensi Hari Ini</CardTitle>
            </CardHeader>
            {todayAttendance.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Belum ada absensi hari ini
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayAttendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.student_name}</p>
                      <p className="text-xs text-gray-400">{a.student_nis}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Daftar Siswa ({students.length})</CardTitle>
            </CardHeader>
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Belum ada siswa di kelas ini
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
                {students.map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/students/${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold text-xs">
                        {s.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.nis}</p>
                    </div>
                    <Badge status={s.gender === 'L' ? 'present' : 'excused'}>
                      {s.gender === 'L' ? 'L' : 'P'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
