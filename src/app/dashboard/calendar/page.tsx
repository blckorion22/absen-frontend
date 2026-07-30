'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiService } from '@/lib/api';
import { Calendar as CalendarIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', name: '', description: '', type: 'event', is_holiday: false });

  const fetchEvents = async () => {
    try {
      const res = await apiService.get('/academic-calendars');
      setEvents(res.data.data);
    } catch {
      toast.error('Gagal memuat kalender');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/academic-calendars', formData);
      toast.success('Disimpan');
      setShowForm(false);
      fetchEvents();
    } catch {
      toast.error('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus acara ini?')) return;
    try {
      await apiService.delete(`/academic-calendars/${id}`);
      toast.success('Dihapus');
      fetchEvents();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Kalender Akademik</h1>
          <p className="page-subtitle">Atur hari libur & kegiatan sekolah</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={<Plus className="w-4 h-4" />}>
          Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle>Jadwal Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tanggal"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Nama Kegiatan/Libur"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Keterangan (Opsional)</label>
                <textarea
                  className="input min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="is_holiday"
                  checked={formData.is_holiday}
                  onChange={(e) => setFormData({ ...formData, is_holiday: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="is_holiday" className="text-sm font-medium text-gray-700">
                  Tandai sebagai Hari Libur Resmi (Bot Absen akan mati)
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-8">Memuat data...</div>
      ) : events.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Kalender kosong.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((item) => (
            <Card key={item.id} className={item.is_holiday ? "border-red-200 bg-red-50/30" : ""}>
              <CardContent className="p-4 relative flex items-start gap-3">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.is_holiday ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <span className="font-bold text-lg">{new Date(item.date).getDate()}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 pr-6">{item.name}</h3>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {new Date(item.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </p>
                  {item.is_holiday && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                      <AlertCircle className="w-3 h-3" /> Libur
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
