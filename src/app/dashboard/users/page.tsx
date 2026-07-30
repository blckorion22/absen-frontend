'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, Edit, Trash2, Users, AlertCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
};

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  });
  const [formModal, setFormModal] = useState<{ open: boolean; data?: User }>({ open: false });
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
  });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 10 };
      if (search.trim()) params.search = search;
      const res = await apiService.users.list(params);
      setUsers(res.data.data.data);
      setPagination({
        currentPage: res.data.data.current_page,
        lastPage: res.data.data.last_page,
        total: res.data.data.total,
      });
    } catch {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  const handleDelete = async () => {
    try {
      await apiService.users.delete(deleteModal.id);
      toast.success('Pengguna berhasil dihapus');
      setDeleteModal({ open: false, id: 0, name: '' });
      fetchUsers(pagination.currentPage);
    } catch {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formModal.data) {
        await apiService.users.update(formModal.data.id, formData);
        toast.success('Pengguna berhasil diperbarui');
      } else {
        await apiService.users.create(formData);
        toast.success('Pengguna berhasil ditambahkan');
      }
      setFormModal({ open: false });
      fetchUsers(pagination.currentPage);
    } catch {
      // Error handled by interceptor
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', password: '', role: 'teacher', phone: '' });
    setFormModal({ open: true });
  };

  const openEditModal = (u: User) => {
    setFormData({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setFormModal({ open: true, data: u });
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const columns = [
    { key: 'name', header: 'Nama', render: (item: User) => (
      <div className="font-medium text-gray-900">{item.name}</div>
    )},
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (item: User) => (
      <Badge status={item.role === 'admin' ? 'excused' : 'present'}>
        {item.role === 'admin' ? 'Admin' : 'Guru'}
      </Badge>
    )},
    { key: 'phone', header: 'No. HP', render: (item: User) => item.phone || '-' },
    { key: 'actions', header: 'Aksi', render: (item: User) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteModal({ open: true, id: item.id, name: item.name })}
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Guru & Admin</h1>
          <p className="page-subtitle">Kelola akun guru dan staf admin</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>Tambah Pengguna</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="search"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="Tidak ada pengguna yang ditemukan"
          emptyIcon={<Users className="empty-state-icon" />}
          pagination={{
            currentPage: pagination.currentPage,
            lastPage: pagination.lastPage,
            total: pagination.total,
            onPageChange: fetchUsers,
          }}
        />
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: 0, name: '' })}
        title="Hapus Pengguna"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Apakah Anda yakin ingin menghapus <strong>{deleteModal.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
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

      {/* Form Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false })}
        title={formModal.data ? "Edit Pengguna" : "Tambah Pengguna"}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="name"
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Select
            id="role"
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'teacher', label: 'Guru / Wali Kelas' },
              { value: 'admin', label: 'Admin Utama' },
            ]}
          />
          <Input
            id="phone"
            label="No. HP"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            id="password"
            label={formModal.data ? "Password Baru (Opsional)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!formModal.data}
          />
          
          <div className="flex gap-3 justify-end mt-6">
            <Button type="button" variant="secondary" onClick={() => setFormModal({ open: false })}>
              Batal
            </Button>
            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
