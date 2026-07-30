'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import type { StudentFormData, ClassRoom } from '@/types';

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  onSubmit: (data: StudentFormData) => Promise<void>;
  isEditing?: boolean;
}

export default function StudentForm({ initialData, onSubmit, isEditing }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    nis: initialData?.nis || '',
    name: initialData?.name || '',
    gender: initialData?.gender || 'L',
    class_id: initialData?.class_id || 0,
    parent_name: initialData?.parent_name || '',
    parent_phone: initialData?.parent_phone || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
  });
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadClasses, setLoadClasses] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiService.classes.list({ per_page: 100 });
        setClasses(response.data.data || []);
      } catch {
        // ignore
      } finally {
        setLoadClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nis.trim()) newErrors.nis = 'NIS harus diisi';
    if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
    if (!formData.class_id) newErrors.class_id = 'Kelas harus dipilih';
    if (!formData.parent_name.trim()) newErrors.parent_name = 'Nama orang tua harus diisi';
    if (!formData.parent_phone.trim()) newErrors.parent_phone = 'No. HP orang tua harus diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof StudentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Siswa' : 'Tambah Siswa'}</h1>
          <p className="page-subtitle">{isEditing ? 'Perbarui data siswa' : 'Masukkan data siswa baru'}</p>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Data Siswa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="NIS"
            id="nis"
            placeholder="Masukkan NIS siswa"
            value={formData.nis}
            onChange={(e) => updateField('nis', e.target.value)}
            error={errors.nis}
          />
          <Input
            label="Nama Lengkap"
            id="name"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />
          <Select
            label="Jenis Kelamin"
            id="gender"
            options={[
              { value: 'L', label: 'Laki-laki' },
              { value: 'P', label: 'Perempuan' },
            ]}
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value)}
          />
          <Select
            label="Kelas"
            id="class_id"
            placeholder={loadClasses ? 'Memuat kelas...' : 'Pilih kelas'}
            options={classes.map((c) => ({ value: c.id, label: `${c.grade} - ${c.name}` }))}
            value={formData.class_id}
            onChange={(e) => updateField('class_id', e.target.value ? Number(e.target.value) : 0)}
            error={errors.class_id}
            disabled={loadClasses}
          />
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Data Orang Tua</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nama Orang Tua"
            id="parent_name"
            placeholder="Masukkan nama orang tua"
            value={formData.parent_name}
            onChange={(e) => updateField('parent_name', e.target.value)}
            error={errors.parent_name}
          />
          <Input
            label="No. HP Orang Tua"
            id="parent_phone"
            placeholder="085xxxxxx"
            value={formData.parent_phone}
            onChange={(e) => updateField('parent_phone', e.target.value)}
            error={errors.parent_phone}
          />
          <Input
            label="No. Telepon Siswa (opsional)"
            id="phone"
            placeholder="085xxxxxx"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Alamat</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Masukkan alamat lengkap"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
          {errors.address && <p className="form-error">{errors.address}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
          {isEditing ? 'Simpan Perubahan' : 'Tambah Siswa'}
        </Button>
        <Link href="/dashboard/students">
          <Button type="button" variant="secondary">Batal</Button>
        </Link>
      </div>
    </form>
  );
}
