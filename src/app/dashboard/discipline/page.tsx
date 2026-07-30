'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiService } from '@/lib/api';
import { Gavel, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DisciplinePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', point_deduction: 0, type: 'minor' });

  const fetchRules = async () => {
    try {
      const res = await apiService.get('/discipline-rules');
      setRules(res.data.data);
    } catch {
      toast.error('Gagal memuat aturan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/discipline-rules', formData);
      toast.success('Aturan ditambahkan');
      setShowForm(false);
      fetchRules();
    } catch {
      toast.error('Gagal menambahkan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus aturan ini?')) return;
    try {
      await apiService.delete(`/discipline-rules/${id}`);
      toast.success('Dihapus');
      fetchRules();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Poin Tata Tertib</h1>
          <p className="page-subtitle">Aturan pelanggaran dan pengurangan poin siswa</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={<Plus className="w-4 h-4" />}>
          Tambah Aturan
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Aturan Pelanggaran Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Bentuk Pelanggaran"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Poin Dikurangi"
                  type="number"
                  value={formData.point_deduction.toString()}
                  onChange={(e) => setFormData({ ...formData, point_deduction: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                <Button type="submit">Simpan Aturan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-8">Memuat data...</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Pelanggaran</th>
                  <th className="px-6 py-4 text-center">Poin Kurang</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data aturan.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule, index) => (
                    <tr key={rule.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{rule.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-bold">
                          -{rule.point_deduction}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
