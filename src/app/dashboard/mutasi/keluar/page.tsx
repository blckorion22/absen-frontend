'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { UserMinus, Search, Calendar, Building2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Mutation, PaginatedResponse, Student } from '@/types';

export default function MutasiKeluarPage() {
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [toSchool, setToSchool] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMutations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mutations', { params: { type: 'out', per_page: 50 } });
      const result = res.data as { data: Mutation[] };
      setMutations(result.data || []);
    } catch {
      toast.error('Gagal memuat data mutasi');
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (q: string) => {
    if (!q.trim()) {
      setStudents([]);
      return;
    }
    try {
      const res = await api.get('/students', { params: { search: q, per_page: 10 } });
      const result = res.data as PaginatedResponse<Student>;
      setStudents(result.data || []);
      setShowStudentDropdown(true);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchMutations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchStudents(studentSearch), 300);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }
    if (!date || !reason) {
      toast.error('Tanggal dan alasan harus diisi');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/mutations', {
        student_id: selectedStudent.id,
        type: 'out',
        date,
        to_school: toSchool,
        reason,
        notes,
      });
      toast.success('Mutasi keluar berhasil ditambahkan');
      setSelectedStudent(null);
      setStudentSearch('');
      setToSchool('');
      setReason('');
      setNotes('');
      fetchMutations();
    } catch {
      toast.error('Gagal menambahkan mutasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Mutasi Keluar</h1>
          <p className="page-subtitle">Data siswa mutasi keluar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-emerald-600" />
              Tambah Mutasi Keluar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group relative">
                <label className="form-label">Cari Siswa</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    id="student_search"
                    className="input-field pl-11"
                    placeholder="Cari nama atau NIS..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onFocus={() => students.length > 0 && setShowStudentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                  />
                </div>
                {selectedStudent && (
                  <p className="text-sm text-emerald-600 mt-1">
                    Dipilih: {selectedStudent.name} ({selectedStudent.nis})
                  </p>
                )}
                {showStudentDropdown && students.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {students.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors"
                        onClick={() => {
                          setSelectedStudent(s);
                          setStudentSearch(`${s.name} (${s.nis})`);
                          setShowStudentDropdown(false);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-gray-400 ml-2">{s.nis}</span>
                        {s.class_room && (
                          <span className="text-gray-400 ml-2">- {s.class_room.name}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Tanggal Mutasi"
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                icon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Sekolah Tujuan"
                id="to_school"
                placeholder="Nama sekolah tujuan"
                value={toSchool}
                onChange={(e) => setToSchool(e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
              />

              <div className="form-group">
                <label htmlFor="reason" className="form-label">Alasan Mutasi</label>
                <textarea
                  id="reason"
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Alasan mutasi keluar"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">Keterangan</label>
                <textarea
                  id="notes"
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Keterangan tambahan (opsional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button type="submit" loading={submitting} icon={<UserMinus className="w-4 h-4" />}>
                Simpan Mutasi Keluar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Riwayat Mutasi Keluar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mutations.length === 0 ? (
              <div className="empty-state py-8">
                <UserMinus className="empty-state-icon" />
                <p className="text-gray-500 text-sm">Belum ada data mutasi keluar</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {mutations.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{m.student?.name || '-'}</p>
                      <span className="text-xs text-gray-400">{m.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">NIS: {m.student?.nis || '-'}</p>
                    {m.to_school && (
                      <p className="text-xs text-gray-500">Tujuan: {m.to_school}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{m.reason}</p>
                    {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}