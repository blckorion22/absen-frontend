'use client';

import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiService } from '@/lib/api';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimetablesPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    class_room_id: '', 
    subject_id: '', 
    day_of_week: 'Senin', 
    start_time: '07:00', 
    end_time: '08:30', 
    teacher_name: '' 
  });

  const fetchData = async () => {
    try {
      const [subs, cls, tts] = await Promise.all([
        apiService.get('/subjects'),
        apiService.classes.list({ per_page: 100 }),
        apiService.get('/timetables')
      ]);
      setSubjects(subs.data.data);
      setClasses(cls.data.data);
      setTimetables(tts.data.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.post('/timetables', formData);
      toast.success('Jadwal ditambahkan');
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Gagal menambahkan jadwal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await apiService.delete(`/timetables/${id}`);
      toast.success('Dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Jadwal Pelajaran</h1>
          <p className="page-subtitle">Atur jadwal pelajaran setiap kelas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={<Plus className="w-4 h-4" />}>
          Buat Jadwal
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Kelas</label>
                  <select
                    className="input"
                    value={formData.class_room_id}
                    onChange={(e) => setFormData({ ...formData, class_room_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kelas...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Mata Pelajaran (Harus Dibuat via API dulu)</label>
                  <select
                    className="input"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Mapel...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Hari</label>
                  <select
                    className="input"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    required
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Input
                  label="Jam Mulai"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
                <Input
                  label="Jam Selesai"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Nama Guru Pengajar (Opsional)"
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                <Button type="submit">Simpan Jadwal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-8">Memuat data...</div>
      ) : timetables.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada jadwal pelajaran yang diatur.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Hari / Jam</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Mata Pelajaran</th>
                  <th className="px-6 py-4">Guru</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timetables.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="block">{item.day_of_week}</span>
                      <span className="text-xs text-gray-500">{item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</span>
                    </td>
                    <td className="px-6 py-4">{item.class_room?.grade} - {item.class_room?.name}</td>
                    <td className="px-6 py-4">{item.subject?.name}</td>
                    <td className="px-6 py-4">{item.teacher_name || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
