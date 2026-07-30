'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Send, MessageSquare } from 'lucide-react';

export default function TesAppWaliPage() {
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      toast.error('No. HP dan pesan harus diisi');
      return;
    }

    setSending(true);
    try {
      await api.post('/communications/test', {
        phone: phone.replace(/\s/g, ''),
        message,
      });
      toast.success('Pesan uji coba berhasil dikirim');
      setPhone('');
      setMessage('');
    } catch {
      toast.error('Gagal mengirim pesan uji coba');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Uji Coba App Wali</h1>
          <p className="page-subtitle">Kirim pesan uji coba ke nomor WhatsApp</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Form Uji Coba
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendTest} className="space-y-4">
            <Input
              label="No. HP Tujuan"
              id="phone"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="form-group">
              <label htmlFor="message" className="form-label">Pesan Uji Coba</label>
              <textarea
                id="message"
                className="input-field min-h-[120px] resize-none"
                placeholder="Tulis pesan uji coba yang akan dikirim..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              loading={sending}
              icon={<Send className="w-4 h-4" />}
            >
              Kirim Pesan Uji Coba
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
