'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { Megaphone, Send } from 'lucide-react';

export default function BroadcastAppWaliPage() {
  const [broadcastTarget, setBroadcastTarget] = useState('parents');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('Pesan broadcast harus diisi');
      return;
    }

    if (!confirm('Yakin ingin mengirim broadcast ini?')) return;

    setBroadcasting(true);
    try {
      const response = await api.post('/communications/broadcast', {
        target: broadcastTarget,
        message: broadcastMessage,
      });
      toast.success(response.data.message || 'Broadcast berhasil diproses');
      setBroadcastMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Broadcast App Wali</h1>
          <p className="page-subtitle">Kirim pesan massal otomatis ke orang tua atau guru</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            Broadcast Pengumuman
          </CardTitle>
          <p className="text-sm text-emerald-600/80 mt-1">
            Kirim pengumuman penting secara massal.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleBroadcast} className="space-y-5">
            <Select
              label="Target Penerima"
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              options={[
                { value: 'parents', label: 'Semua Orang Tua Siswa' },
                { value: 'teachers', label: 'Semua Guru / Pegawai' },
                { value: 'all', label: 'Semua Orang Tua dan Guru' }
              ]}
            />
            <div className="form-group">
              <label className="form-label">Pesan Pengumuman</label>
              <textarea
                className="input-field min-h-[200px] resize-none font-medium"
                placeholder="Ketik pengumuman di sini..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                * Pesan akan dikirim satu per satu ke setiap orang tua/guru dari target yang dipilih. Pastikan kouta/limit API mencukupi.
              </p>
            </div>
            <Button
              type="submit"
              loading={broadcasting}
              icon={<Send className="w-4 h-4" />}
              className="w-full"
            >
              Kirim Broadcast Sekarang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
