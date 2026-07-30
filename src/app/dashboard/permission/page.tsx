'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { UploadCloud, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PermissionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'excused',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [evidence, setEvidence] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.notes) return toast.error('Keterangan harus diisi');
    if (!evidence) return toast.error('Foto/Surat bukti harus diupload');

    setLoading(true);
    try {
      const data = new FormData();
      data.append('status', formData.status);
      data.append('date', formData.date);
      data.append('notes', formData.notes);
      data.append('evidence', evidence);

      await apiService.attendance.submitPermission(data);
      toast.success('Pengajuan Izin/Sakit berhasil dikirim!');
      setFormData({ ...formData, notes: '' });
      setEvidence(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="page-title">Pengajuan Izin / Sakit</h1>
        <p className="page-subtitle">Upload surat keterangan dari dokter atau wali murid</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Formulir Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Tanggal"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <Select
                label="Status Pengajuan"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'excused', label: 'Izin / Sakit' },
                  { value: 'absent', label: 'Lainnya (Alpha)' }
                ]}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Keterangan Lengkap</label>
              <textarea
                className="input min-h-[100px] resize-y"
                placeholder="Contoh: Sakit demam, periksa ke dokter (surat terlampir)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Upload Surat/Foto Bukti</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                    >
                      <span>Pilih file gambar</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => setEvidence(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
              </div>
              {evidence && (
                <div className="mt-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="truncate flex-1">{evidence.name}</span>
                  <button type="button" onClick={() => setEvidence(null)} className="text-red-500 ml-2">Hapus</button>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" loading={loading}>
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
