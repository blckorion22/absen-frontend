'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { ClassFormData, User } from '@/types';

const grades = [
  { value: '7', label: 'VII (7)' },
  { value: '8', label: 'VIII (8)' },
  { value: '9', label: 'IX (9)' },
];

const currentYear = new Date().getFullYear();
const academicYears = Array.from({ length: 3 }, (_, i) => {
  const start = currentYear - i;
  return { value: `${start}/${start + 1}`, label: `${start}/${start + 1}` };
});

export default function CreateClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    grade: '',
    academic_year: academicYears[0].value,
    teacher_id: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await apiService.users.list({ role: 'teacher', per_page: 100 });
        setTeachers(res.data.data.data || []);
      } catch (e) {
        toast.error('Gagal memuat daftar guru');
      }
    };
    fetchTeachers();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama kelas harus diisi';
    if (!formData.grade) newErrors.grade = 'Tingkat harus dipilih';
    if (!formData.academic_year) newErrors.academic_year = 'Tahun ajaran harus dipilih';
    if (!formData.teacher_id) newErrors.teacher_id = 'Wali kelas harus dipilih';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await apiService.classes.create(formData as unknown as Record<string, unknown>);
      toast.success('Kelas berhasil dibuat');
      router.push('/dashboard/classes');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ClassFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Tambah Kelas</h1>
          <p className="page-subtitle">Buat kelas baru untuk tahun ajaran berjalan</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kelas</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <Input
            label="Nama Kelas"
            id="name"
            placeholder="Contoh: A, B, Unggulan"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Tingkat"
              id="grade"
              placeholder="Pilih tingkat"
              options={grades}
              value={formData.grade}
              onChange={(e) => updateField('grade', e.target.value)}
              error={errors.grade}
            />
            <Select
              label="Tahun Ajaran"
              id="academic_year"
              options={academicYears}
              value={formData.academic_year}
              onChange={(e) => updateField('academic_year', e.target.value)}
              error={errors.academic_year}
            />
          </div>
          <Select
            label="Wali Kelas"
            id="teacher_id"
            placeholder="Pilih Wali Kelas"
            options={teachers.map(t => ({ value: t.id.toString(), label: t.name }))}
            value={formData.teacher_id ? formData.teacher_id.toString() : ''}
            onChange={(e) => updateField('teacher_id', Number(e.target.value))}
            error={errors.teacher_id}
          />
          <div className="form-group">
            <label htmlFor="description" className="form-label">Deskripsi (opsional)</label>
            <textarea
              id="description"
              className="input-field min-h-[100px] resize-none"
              placeholder="Catatan atau deskripsi tentang kelas ini"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
          Simpan
        </Button>
        <Link href="/dashboard/classes">
          <Button type="button" variant="secondary">Batal</Button>
        </Link>
      </div>
    </form>
  );
}
