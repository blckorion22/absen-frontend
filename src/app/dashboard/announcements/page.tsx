'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiService } from '@/lib/api';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchAnnouncements = async () => {
    try {
      const res = await apiService.get('/announcements');
      setAnnouncements(res.data.data);
    } catch {
      toast.error('Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/announcements', formData);
      toast.success('Pengumuman ditambahkan');
      setShowForm(false);
      setFormData({ title: '', content: '' });
      fetchAnnouncements();
    } catch {
      toast.error('Gagal menambahkan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await apiService.delete(`/announcements/${id}`);
      toast.success('Dihapus');
      fetchAnnouncements();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Papan Pengumuman</h1>
          <p className="page-subtitle">Kelola pengumuman untuk siswa</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={<Plus className="w-4 h-4" />}>
          Tambah Pengumuman
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Buat Pengumuman Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Judul Pengumuman"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Isi Pengumuman</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                <Button type="submit">Terbitkan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-8">Memuat data...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada pengumuman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 relative">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 pr-8">{item.title}</h3>
                    <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
