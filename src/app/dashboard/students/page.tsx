'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Eye, Search, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Student, ClassRoom, PaginatedResponse } from '@/types';
import { useAuth } from '@/lib/auth';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  });
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 10 };
      if (search.trim()) params.search = search;
      if (classFilter) params.class_id = classFilter;
      const response = await apiService.students.list(params);
      const result = response.data as PaginatedResponse<Student>;
      setStudents(result.data);
      setPagination({
        currentPage: result.meta.current_page,
        lastPage: result.meta.last_page,
        total: result.meta.total,
      });
    } catch {
      toast.error('Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  }, [search, classFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    apiService.classes.list({ per_page: 100 }).then((res) => {
      setClasses(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await apiService.students.delete(deleteModal.id);
      toast.success('Siswa berhasil dihapus');
      setDeleteModal({ open: false, id: 0, name: '' });
      fetchStudents(pagination.currentPage);
    } catch {
      toast.error('Gagal menghapus siswa');
    }
  };

  const columns = [
    { key: 'name', header: 'Nama', render: (item: Student) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <span className="text-emerald-700 font-semibold text-xs">{item.name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-400">{item.nis}</p>
        </div>
      </div>
    )},
    { key: 'gender', header: 'JK', render: (item: Student) => (
      <Badge status={item.gender === 'L' ? 'present' : 'excused'}>
        {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
      </Badge>
    )},
    { key: 'class_name', header: 'Kelas', render: (item: Student) => (
      <span className="text-sm">{item.class_room ? `${item.class_room.grade} - ${item.class_room.name}` : item.class_name || '-'}</span>
    )},
    { key: 'parent_name', header: 'Orang Tua' },
    { key: 'parent_phone', header: 'No. HP' },
    { key: 'actions', header: 'Aksi', render: (item: Student) => (
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/students/${item.id}`}>
          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
        </Link>
        {isAdmin && (
          <>
            <Link href={`/dashboard/students/${item.id}/edit`}>
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
          <h1 className="page-title">Siswa</h1>
          <p className="page-subtitle">Kelola data seluruh siswa</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/students/create">
            <Button icon={<Plus className="w-4 h-4" />}>Tambah Siswa</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="search"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            id="class_filter"
            placeholder="Semua Kelas"
            options={classes.map((c) => ({ value: c.id, label: `${c.grade} - ${c.name}` }))}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={students}
          keyExtractor={(item: Student) => item.id}
          isLoading={loading}
          emptyMessage="Tidak ada siswa yang ditemukan"
          emptyIcon={<Users className="empty-state-icon" />}
          pagination={{
            currentPage: pagination.currentPage,
            lastPage: pagination.lastPage,
            total: pagination.total,
            onPageChange: fetchStudents,
          }}
        />
      </div>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: 0, name: '' })}
        title="Hapus Siswa"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Apakah Anda yakin ingin menghapus <strong>{deleteModal.name}</strong>? Semua data absensi siswa ini juga akan dihapus.
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
