'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import { Plus, Pencil, Trash2, RefreshCw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Subject } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', code: '' });

  const fetchData = useCallback(async () => {
    try {
      const res = await apiService.subjects.list();
      setSubjects(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data mata pelajaran');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '' });
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error('Nama dan kode harus diisi'); return; }
    try {
      if (editing) {
        await apiService.subjects.update(editing.id, form);
        toast.success('Mata pelajaran diperbarui');
      } else {
        await apiService.subjects.create(form);
        toast.success('Mata pelajaran ditambahkan');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus mata pelajaran ini?')) return;
    try {
      await apiService.subjects.delete(id);
      toast.success('Mata pelajaran dihapus');
      fetchData();
    } catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Mata Pelajaran</h1>
          <p className="page-subtitle">Kelola daftar mata pelajaran sekolah</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchData}><RefreshCw className="w-4 h-4" /> Refresh</Button>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Tambah Mapel</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Mata Pelajaran</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Kode</th>
                <th className="table-header-cell">Nama Mata Pelajaran</th>
                <th className="table-header-cell">Aksi</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-12"><Loading /></td></tr>
              ) : subjects.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-12 text-gray-500">Belum ada mata pelajaran</td></tr>
              ) : subjects.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-cell"><span className="badge text-blue-700 bg-blue-50 border-blue-200">{s.code}</span></td>
                  <td className="table-cell font-medium">{s.name}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Kode Mapel</label>
            <input className="input-field" placeholder="Contoh: MTK-01" value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })} disabled={!!editing} />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Mata Pelajaran</label>
            <input className="input-field" placeholder="Contoh: Matematika" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
