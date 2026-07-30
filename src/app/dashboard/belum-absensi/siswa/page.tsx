'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface Student {
  id: number;
  nis: string;
  name: string;
  classRoom?: { id: number; name: string };
}

export default function BelumAbsenSiswa() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/unchecked-students');
      setStudents(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckin = async (studentId: number) => {
    try {
      setCheckingIn(studentId);
      await api.post('/attendance/manual-checkin', {
        student_id: studentId,
        status: 'present',
      });
      toast.success('Absensi berhasil');
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch {
      toast.error('Gagal melakukan absensi');
    } finally {
      setCheckingIn(null);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Belum Absen Siswa</h1>
        <p className="page-subtitle">
          {students.length} siswa belum melakukan absensi hari ini
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>Daftar Siswa Belum Absen</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table-admin">
            <thead>
              <tr>
                <th className="w-12 text-center">No</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th className="text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state py-12">
                      {students.length === 0 ? (
                        <>
                          <CheckCircle className="empty-state-icon text-emerald-400" />
                          <p className="text-gray-500 text-sm">Semua siswa sudah melakukan absensi</p>
                          <p className="text-gray-400 text-xs mt-1">Tidak ada siswa yang perlu diabsen</p>
                        </>
                      ) : (
                        <>
                          <Search className="empty-state-icon" />
                          <p className="text-gray-500 text-sm">Tidak ada hasil yang cocok</p>
                          <p className="text-gray-400 text-xs mt-1">Coba ubah kata kunci pencarian</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <tr key={student.id}>
                    <td className="text-gray-400 text-center">{i + 1}</td>
                    <td className="font-mono text-sm text-gray-500">{student.nis}</td>
                    <td className="font-medium text-gray-900">{student.name}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {student.classRoom?.name || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleCheckin(student.id)}
                        disabled={checkingIn === student.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {checkingIn === student.id ? (
                          <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Hadirkan
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
