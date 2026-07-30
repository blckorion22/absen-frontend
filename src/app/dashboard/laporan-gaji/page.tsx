'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, FileText, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Salary, User } from '@/types';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LaporanGajiPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  const [formModal, setFormModal] = useState<{ open: boolean; data: Partial<Salary> | null }>({
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

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      
      const response = await apiService.salaries.list(params);
      const result = response.data;
      setSalaries(Array.isArray(result.data) ? result.data : result);
    } catch {
      toast.error('Gagal memuat data laporan gaji');
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  useEffect(() => {
    if (isAdmin) {
      apiService.users.list({ role: 'teacher' }).then(res => {
        const data = res.data;
        setTeachers(Array.isArray(data.data) ? data.data : data);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.data?.user_id || !formModal.data.month || !formModal.data.year) {
      toast.error('Harap lengkapi semua field yang wajib');
      return;
    }

    try {
      await apiService.salaries.create(formModal.data);
      toast.success('Gaji berhasil ditambahkan');
      setFormModal({ open: false, data: null });
      fetchSalaries();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.salaries.delete(deleteModal.id);
      toast.success('Gaji berhasil dihapus');
      setDeleteModal({ open: false, id: 0, name: '' });
      fetchSalaries();
    } catch {
      toast.error('Gagal menghapus gaji');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const months = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const columns = [
    { key: 'user', header: 'Guru', render: (item: Salary) => (
      <div className="font-medium text-gray-900">{item.user?.name || '-'}</div>
    )},
    { key: 'period', header: 'Periode', render: (item: Salary) => (
      <div>{months.find(m => m.value === item.month)?.label || item.month} {item.year}</div>
    )},
    { key: 'base', header: 'Gaji Pokok', render: (item: Salary) => (
      <div>{formatCurrency(Number(item.base_salary) || 0)}</div>
    )},
    { key: 'allowance', header: 'Tunjangan', render: (item: Salary) => (
      <div className="text-green-600">+{formatCurrency(Number(item.total_allowance) || 0)}</div>
    )},
    { key: 'deduction', header: 'Potongan', render: (item: Salary) => (
      <div className="text-red-600">-{formatCurrency(Number(item.total_deduction) || 0)}</div>
    )},
    { key: 'net', header: 'Gaji Bersih', render: (item: Salary) => (
      <div className="font-bold">{formatCurrency(Number(item.net_salary) || 0)}</div>
    )},
    { key: 'actions', header: 'Aksi', render: (item: Salary) => (
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/slip-gaji?id=${item.id}`}>
          <Button variant="ghost" size="sm" title="Lihat Slip">
            <FileText className="w-4 h-4 text-blue-600" />
          </Button>
        </Link>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, id: item.id, name: `Gaji ${item.user?.name} - ${item.month}/${item.year}` })}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Laporan Gaji Guru</h1>
          <p className="page-subtitle">Rekap gaji bulanan guru</p>
        </div>
        {isAdmin && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormModal({ open: true, data: { month: new Date().getMonth() + 1 + '', year: new Date().getFullYear().toString() } })}>
            Tambah Gaji
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="w-full sm:w-48">
          <Select
            id="filterMonth"
            placeholder="Semua Bulan"
            options={months}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Input
            id="filterYear"
            placeholder="Tahun..."
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={salaries}
          keyExtractor={(item: Salary) => item.id}
          isLoading={loading}
          emptyMessage="Tidak ada data gaji yang ditemukan"
          emptyIcon={<DollarSign className="empty-state-icon" />}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        title="Tambah Gaji Guru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            id="user_id"
            label="Pilih Guru"
            options={teachers.map(t => ({ value: t.id, label: t.name }))}
            value={formModal.data?.user_id?.toString() || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, user_id: Number(e.target.value) } })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="month"
              label="Bulan"
              options={months}
              value={formModal.data?.month?.toString().padStart(2, '0') || ''}
              onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, month: e.target.value } })}
              required
            />
            <Input
              id="year"
              label="Tahun"
              type="number"
              value={formModal.data?.year || ''}
              onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, year: e.target.value } })}
              required
            />
          </div>
          <Input
            id="base_salary"
            label="Gaji Pokok (Rp)"
            type="number"
            value={formModal.data?.base_salary || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, base_salary: Number(e.target.value) } })}
            required
            min="0"
          />
          <Input
            id="total_allowance"
            label="Total Tunjangan (Rp)"
            type="number"
            value={formModal.data?.total_allowance || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, total_allowance: Number(e.target.value) } })}
            required
            min="0"
          />
          <Input
            id="total_deduction"
            label="Total Potongan (Rp)"
            type="number"
            value={formModal.data?.total_deduction || ''}
            onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, total_deduction: Number(e.target.value) } })}
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
        title="Hapus Gaji"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              Apakah Anda yakin ingin menghapus data <strong>{deleteModal.name}</strong>?
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
