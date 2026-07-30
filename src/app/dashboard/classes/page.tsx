'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Plus, Edit, Trash2, QrCode, Eye, GraduationCap, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ClassRoom, PaginatedResponse } from '@/types';
import { useAuth } from '@/lib/auth';

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  });
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchClasses = async (page = 1) => {
    setLoading(true);
    try {
      const response = await apiService.classes.list({ page, per_page: 10 });
      const result = response.data as PaginatedResponse<ClassRoom>;
      setClasses(result.data);
      setPagination({
        currentPage: result.meta.current_page,
        lastPage: result.meta.last_page,
        total: result.meta.total,
      });
    } catch {
      toast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async () => {
    try {
      await apiService.classes.delete(deleteModal.id);
      toast.success('Kelas berhasil dihapus');
      setDeleteModal({ open: false, id: 0, name: '' });
      fetchClasses(pagination.currentPage);
    } catch {
      toast.error('Gagal menghapus kelas');
    }
  };

  const columns = [
    { key: 'name', header: 'Nama Kelas', render: (item: ClassRoom) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-400">Kelas {item.grade}</p>
        </div>
      </div>
    )},
    { key: 'grade', header: 'Tingkat' },
    { key: 'academic_year', header: 'Tahun Ajaran' },
    { key: 'teacher_name', header: 'Wali Kelas' },
    { key: 'student_count', header: 'Jumlah Siswa', render: (item: ClassRoom) => (
      <Badge status={item.student_count > 0 ? 'present' : 'pending'}>{item.student_count} Siswa</Badge>
    )},
    { key: 'actions', header: 'Aksi', render: (item: ClassRoom) => (
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/classes/${item.id}`}>
          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
        </Link>
        <Link href={`/dashboard/classes/${item.id}/qr`}>
          <Button variant="ghost" size="sm"><QrCode className="w-4 h-4" /></Button>
        </Link>
        {isAdmin && (
          <>
            <Link href={`/dashboard/classes/${item.id}/edit`}>
              <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal({ open: true, id: item.id, name: item.name })}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Kelas</h1>
          <p className="page-subtitle">Kelola data kelas dan wali kelas</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/classes/create">
            <Button icon={<Plus className="w-4 h-4" />}>Tambah Kelas</Button>
          </Link>
        )}
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={classes}
          keyExtractor={(item: ClassRoom) => item.id}
          isLoading={loading}
          emptyMessage="Belum ada kelas. Tambahkan kelas baru untuk memulai."
          emptyIcon={<GraduationCap className="empty-state-icon" />}
          pagination={{
            currentPage: pagination.currentPage,
            lastPage: pagination.lastPage,
            total: pagination.total,
            onPageChange: fetchClasses,
          }}
        />
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: 0, name: '' })}
        title="Hapus Kelas"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteModal.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: 0, name: '' })}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
