'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiService } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { School, Smartphone, CheckCircle, XCircle, Loader2, Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Student } from '@/types';

export default function ScanPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<'select' | 'confirm' | 'result' | 'loading'>('select');
  const [nis, setNis] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; type?: 'check-in' | 'check-out' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiService.scan.studentInfo(token);
        const data = response.data.data || response.data || [];
        setStudents(data);
        setFilteredStudents(data);
      } catch {
        toast.error('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  useEffect(() => {
    // Auto-select if authenticated as student
    if (isAuthenticated && user?.role === 'student' && user.student_id && students.length > 0) {
      const matchedStudent = students.find((s: Student) => Number(s.id) === Number(user.student_id));
      if (matchedStudent && !selectedStudent) {
        setSelectedStudent(matchedStudent);
        setStep('confirm');
      }
    }
  }, [isAuthenticated, user, students, selectedStudent]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.nis.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setStep('confirm');
  };

  const handleNisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) {
      toast.error('Masukkan NIS');
      return;
    }

    const student = students.find((s) => s.nis === nis.trim());
    if (student) {
      setSelectedStudent(student);
      setStep('confirm');
    } else {
      toast.error('NIS tidak ditemukan');
    }
  };

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokasi tidak didukung browser ini.'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(new Error(`Akses lokasi ditolak/gagal: ${err.message} (Kode: ${err.code}). Pastikan GPS aktif dan izinkan browser mengakses lokasi.`)),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    if (!selectedStudent) return;
    setActionLoading(true);
    setStep('loading');

    try {
      let coords;
      try {
        coords = await getLocation();
      } catch (locErr: any) {
        setResult({
          success: false,
          message: locErr.message,
        });
        setStep('result');
        setActionLoading(false);
        return;
      }

      const endpoint = action === 'check-in' ? apiService.attendance.checkIn : apiService.attendance.checkOut;
      const response = await endpoint({ 
        student_id: selectedStudent.id, 
        qr_token: token,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      setResult({
        success: true,
        message: response.data.message || `Berhasil ${action === 'check-in' ? 'Check In' : 'Check Out'}`,
        type: action,
      });
      setStep('result');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message: axiosError.response?.data?.message || 'Terjadi kesalahan',
      });
      setStep('result');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setNis('');
    setSelectedStudent(null);
    setResult(null);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-emerald-100 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="gradient-primary px-6 py-8 text-center relative">
          <div className="bg-islamic-overlay absolute inset-0" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 border border-white/20">
              <School className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Absensi Siswa</h1>
            <p className="text-emerald-100 text-sm mt-1">MTs Negeri 1 Jakarta</p>
          </div>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Pilih Siswa</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Masukkan NIS atau cari nama siswa
                </p>
              </div>

              <form onSubmit={handleNisSubmit} className="space-y-3">
                <Input
                  id="nis"
                  placeholder="Masukkan NIS"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
                <Button type="submit" className="w-full" size="lg" icon={<UserCheck className="w-4 h-4" />}>
                  Cari & Lanjutkan
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">atau pilih dari daftar</span>
                </div>
              </div>

              <div>
                <Input
                  id="search"
                  placeholder="Cari nama siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">Siswa tidak ditemukan</p>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-700 font-semibold text-sm">
                          {s.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">NIS. {s.nis}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 'confirm' && selectedStudent && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-700 font-bold text-xl">
                    {selectedStudent.name.charAt(0)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-sm text-gray-400">NIS. {selectedStudent.nis}</p>
                {selectedStudent.class_room && (
                  <p className="text-xs text-gray-400 mt-1">{selectedStudent.class_room.grade} - {selectedStudent.class_room.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleAction('check-in')}
                  loading={actionLoading}
                  size="lg"
                  className="w-full"
                  icon={<UserCheck className="w-5 h-5" />}
                >
                  Check In - Masuk
                </Button>
                <Button
                  onClick={() => handleAction('check-out')}
                  loading={actionLoading}
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  Check Out - Pulang
                </Button>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full"
                >
                  Batal / Pilih Siswa Lain
                </Button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-gray-500 text-sm">Memproses absensi...</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="flex flex-col items-center gap-4 py-6 animate-scale-in">
              {result.success ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-emerald-600">Berhasil!</h2>
                    <p className="text-gray-500 text-sm mt-1">{result.message}</p>
                    {result.type && (
                      <p className="text-emerald-600 font-medium text-sm mt-2">
                        {result.type === 'check-in' ? '✓ Check In' : '✓ Check Out'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600">Gagal</h2>
                    <p className="text-gray-500 text-sm mt-1">{result.message}</p>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 w-full mt-4">
                <Button onClick={handleReset} className="w-full" size="lg">
                  Absensi Lagi
                </Button>
                <p className="text-center text-xs text-gray-400">
                  Terima kasih telah menggunakan absensi digital
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
