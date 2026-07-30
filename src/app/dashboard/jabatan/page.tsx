'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Briefcase, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Position, PaginatedResponse } from '@/types';
import { useAuth } from '@/lib/auth';

export default function JabatanPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [formModal, setFormModal] = useState<{ open: boolean; data: Partial<Position> | null }>({
    open: false,
    data: null,
  });
  
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: '',
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.positions.list();
      const result = response.data;
      // Assuming it might return paginated or direct array based on backend
      setPositions(Array.isArray(result.data) ? result.data : result);
    } catch {
      toast.error('Gagal memuat data jabatan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.data?.name || formModal.data.allowance === undefined) {
      toast.error('Harap lengkapi semua field');
      return;
    }

    try {
      if (formModal.data.id) {
        await apiService.positions.update(formModal.data.id, formModal.data);
        toast.success('Jabatan berhasil diperbarui');
      } else {
        await apiService.positions.create(formModal.data);
        toast.success('Jabatan berhasil ditambahkan');
      }
      setFormModal({ open: false, data: null });
      fetchPositions();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.positions.delete(deleteModal.id);
      toast.success('Jabatan berhasil dihapus');
      setDeleteModal({ open: false, id: 0, name: '' });
      fetchPositions();
    } catch {
      toast.error('Gagal menghapus jabatan');
    }
  };

  const filteredPositions = positions.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    { key: 'name', header: 'Nama Jabatan', render: (item: Position) => (
      <div className="font-medium text-gray-900">{item.name}</div>
    )},
    { key: 'allowance', header: 'Tunjangan', render: (item: Position) => (
      <div>{formatCurrency(Number(item.allowance) || 0)}</div>
    )},
    { key: 'actions', header: 'Aksi', render: (item: Position) => (
      <div className="flex items-center gap-1">
        {isAdmin && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setFormModal({ open: true, data: item })}>
              <Edit className="w-4 h-4" />
            </Button>
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
          <h1 className="page-title">Jabatan & Tunjangan</h1>
          <p className="page-subtitle">Kelola jabatan dan tunjangan guru</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormModal({ open: true, data: {} })}>
            Tambah Jabatan
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            id="search"
            placeholder="Cari nama jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={filteredPositions}
          keyExtractor={(item: Position) => item.id}
          isLoading={loading}
          emptyMessage="Tidak ada jabatan yang ditemukan"
          emptyIcon={<Briefcase className="empty-state-icon" />}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        title={formModal.data?.id ? 'Edit Jabatan' : 'Tambah Jabatan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Nama Jabatan"
            value={formModal.data?.name || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, name: e.target.value } })}
            required
          />
          <Input
            id="allowance"
            label="Nominal Tunjangan (Rp)"
            type="number"
            value={formModal.data?.allowance || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, allowance: Number(e.target.value) } })}
            required
            min="0"
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setFormModal({ open: false, data: null })}>
              Batal
            </Button>
            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: 0, name: '' })}
        title="Hapus Jabatan"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Apakah Anda yakin ingin menghapus <strong>{deleteModal.name}</strong>?
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
