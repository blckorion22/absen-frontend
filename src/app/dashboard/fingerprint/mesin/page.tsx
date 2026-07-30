'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Settings, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FingerprintMachine {
  id: number;
  name: string;
  ip_address: string;
  port: number;
  location: string;
  status: boolean;
  last_sync: string;
}

export default function FingerprintMachinePage() {
  const [machines, setMachines] = useState<FingerprintMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<FingerprintMachine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ip_address: '',
    port: 4370,
    location: '',
    status: true,
  });

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await apiService.fingerprintMachines.list();
      setMachines(response.data.data || []);
    } catch {
      toast.error('Gagal memuat data mesin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMachine) {
        await apiService.fingerprintMachines.update(editingMachine.id, formData);
        toast.success('Mesin berhasil diupdate');
      } else {
        await apiService.fingerprintMachines.create(formData);
        toast.success('Mesin berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchMachines();
    } catch {
      toast.error('Gagal menyimpan data mesin');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus mesin ini?')) {
      try {
        await apiService.fingerprintMachines.delete(id);
        toast.success('Mesin berhasil dihapus');
        fetchMachines();
      } catch {
        toast.error('Gagal menghapus mesin');
      }
    }
  };

  const columns = [
    { key: 'name', header: 'Nama Mesin' },
    { key: 'ip_address', header: 'IP Address' },
    { key: 'port', header: 'Port' },
    { key: 'location', header: 'Lokasi' },
    { key: 'status', header: 'Status', render: (item: FingerprintMachine) => (
      <Badge status={item.status ? 'present' : 'absent'}>
        {item.status ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    { key: 'last_sync', header: 'Terakhir Sinkron', render: (item: FingerprintMachine) => item.last_sync ? new Date(item.last_sync).toLocaleString('id-ID') : '-' },
    { key: 'actions', header: 'Aksi', render: (item: FingerprintMachine) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditingMachine(item);
            setFormData({
              name: item.name,
              ip_address: item.ip_address,
              port: item.port,
              location: item.location,
              status: item.status,
            });
            setModalOpen(true);
          }}
        >
          <Edit className="w-4 h-4 text-blue-500" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Data Mesin Fingerprint</h1>
          <p className="page-subtitle">Kelola perangkat mesin absensi biometrik</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
          setEditingMachine(null);
          setFormData({ name: '', ip_address: '', port: 4370, location: '', status: true });
          setModalOpen(true);
        }}>
          Tambah Mesin
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Informasi Penting</h4>
          <p className="text-sm mt-1">Sistem ini menggunakan QR Code sebagai metode utama absensi. Mesin fingerprint dapat ditambahkan dan disinkronisasi, tetapi tidak akan menggantikan alur QR Code yang ada.</p>
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={machines}
          keyExtractor={(item: FingerprintMachine) => item.id}
          isLoading={loading}
          emptyMessage="Belum ada mesin fingerprint"
          emptyIcon={<Settings className="empty-state-icon" />}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMachine ? 'Edit Mesin' : 'Tambah Mesin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mesin</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.ip_address}
              onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.port}
              onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
            <input
              type="text"
              className="input w-full"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Aktif</label>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
