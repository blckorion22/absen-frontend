'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Users, Send } from 'lucide-react';

export default function WhatsAppMasalPage() {
  const [phonesInput, setPhonesInput] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMassMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phonesInput.trim() || !message.trim()) {
      toast.error('Daftar nomor HP dan pesan harus diisi');
      return;
    }

    const phones = phonesInput.split('\n').map(p => p.trim().replace(/\s/g, '')).filter(p => p.length > 0);
    
    if (phones.length === 0) {
      toast.error('Masukkan setidaknya satu nomor HP valid');
      return;
    }

    if (!confirm(`Yakin ingin mengirim pesan ke ${phones.length} nomor?`)) return;

    setSending(true);
    try {
      const response = await api.post('/communications/mass', {
        phones,
        message,
      });
      toast.success(response.data.message || 'Pesan massal berhasil diproses');
      setPhonesInput('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan massal');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">WhatsApp Massal</h1>
          <p className="page-subtitle">Kirim pesan WhatsApp ke banyak nomor sekaligus</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Form Pesan Massal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMassMessage} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Daftar No. HP Tujuan (Satu nomor per baris)</label>
              <textarea
                className="input-field min-h-[120px] resize-y font-mono"
                placeholder="081234567890&#10;089876543210&#10;+628111222333"
                value={phonesInput}
                onChange={(e) => setPhonesInput(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nomor tujuan dengan memisahkannya menggunakan baris baru (Enter).
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Pesan</label>
              <textarea
                className="input-field min-h-[160px] resize-y"
                placeholder="Tulis pesan yang akan dikirim..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              loading={sending}
              icon={<Send className="w-4 h-4" />}
              className="w-full"
            >
              Kirim Pesan ke Semua Nomor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
