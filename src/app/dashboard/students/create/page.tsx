'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import StudentForm from '@/components/students/StudentForm';
import toast from 'react-hot-toast';
import type { StudentFormData } from '@/types';

export default function CreateStudentPage() {
  const router = useRouter();

  const handleSubmit = async (data: StudentFormData) => {
    try {
      await apiService.students.create(data as unknown as Record<string, unknown>);
      toast.success('Siswa berhasil ditambahkan');
      router.push('/dashboard/students');
    } catch {
      // handled by interceptor
    }
  };

  return <StudentForm onSubmit={handleSubmit} />;
}
