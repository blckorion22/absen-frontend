'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import StudentForm from '@/components/students/StudentForm';
import Loading from '@/components/ui/Loading';
import toast from 'react-hot-toast';
import type { StudentFormData, Student } from '@/types';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [initialData, setInitialData] = useState<Partial<StudentFormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await apiService.students.get(id);
        const s: Student = response.data.data || response.data;
        setInitialData({
          nis: s.nis,
          name: s.name,
          gender: s.gender,
          class_id: s.class_id,
          parent_name: s.parent_name,
          parent_phone: s.parent_phone,
          address: s.address,
          phone: s.phone || '',
        });
      } catch {
        toast.error('Gagal memuat data siswa');
        router.push('/dashboard/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, router]);

  const handleSubmit = async (data: StudentFormData) => {
    try {
      await apiService.students.update(id, data as unknown as Record<string, unknown>);
      toast.success('Data siswa berhasil diperbarui');
      router.push(`/dashboard/students/${id}`);
    } catch {
      // handled by interceptor
    }
  };

  if (loading) return <Loading text="Memuat data siswa..." />;

  return (
    <StudentForm
      initialData={initialData || undefined}
      onSubmit={handleSubmit}
      isEditing
    />
  );
}
