'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { MessageSquare, Save, Send } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function SettingWA() {
  const [form, setForm] = useState({
    wa_provider: 'onesender',
    wa_onesender_url: '',
    wa_onesender_api_key: '',
    wa_onesender_template: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        const s = res.data.data || {};
        setForm({
          wa_provider: s.wa_provider || 'onesender',
          wa_onesender_url: s.wa_onesender_url || '',
          wa_onesender_api_key: s.wa_onesender_api_key || '',
          wa_onesender_template: s.wa_onesender_template || '',
        });
      })
      .catch(() => toast.error('Gagal memuat settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', form);
      toast.success('Pengaturan WA berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone) { toast.error('Masukkan nomor telepon'); return; }
    setTestSending(true);
    try {
      const res = await api.post('/whatsapp/test', {
        phone: testPhone,
        message: 'Ini adalah pesan uji coba dari Sistem Absensi. Terima kasih.',
      });
      if (res.data.success) {
        toast.success('Pesan uji berhasil dikirim!');
      } else {
        toast.error(res.data.message || 'Gagal mengirim');
      }
    } catch {
      toast.error('Gagal mengirim pesan uji');
    } finally {
      setTestSending(false);
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Setting WA API</h1>
        <p className="page-subtitle">Konfigurasi WhatsApp Gateway untuk notifikasi absensi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Konfigurasi One Sender</CardTitle></CardHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                value={form.wa_provider}
                onChange={(e) => setForm({ ...form, wa_provider: e.target.value })}
                className="input-field"
              >
                <option value="onesender">One Sender</option>
                <option value="fonnte">Fonnte</option>
                <option value="wati">WATI</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL / Endpoint</label>
              <input
                type="url"
                value={form.wa_onesender_url}
                onChange={(e) => setForm({ ...form, wa_onesender_url: e.target.value })}
                className="input-field"
                placeholder="https://app.onesender.net/api/v1/messages"
              />
              <p className="text-xs text-gray-400 mt-1">URL endpoint WhatsApp API (One Sender, Fonnte, atau vendor lain)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={form.wa_onesender_api_key}
                onChange={(e) => setForm({ ...form, wa_onesender_api_key: e.target.value })}
                className="input-field"
                placeholder="Masukkan API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Pesan (opsional)</label>
              <textarea
                value={form.wa_onesender_template}
                onChange={(e) => setForm({ ...form, wa_onesender_template: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Template pesan default. Biarkan kosong untuk menggunakan template bawaan."
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Uji Kirim WA</CardTitle></CardHeader>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600">Kirim pesan uji coba untuk memastikan konfigurasi berfungsi.</p>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="input-field"
                placeholder="Contoh: 08123456789"
              />
              <button
                onClick={handleTest}
                disabled={testSending}
                className="btn btn-secondary w-full"
              >
                <Send className="w-4 h-4" /> {testSending ? 'Mengirim...' : 'Kirim WA Test'}
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Panduan One Sender</CardTitle></CardHeader>
            <div className="p-4 text-sm text-gray-600 space-y-2">
              <p>One Sender adalah aplikasi WhatsApp Gateway yang bisa diinstal sendiri (self-hosted) atau menggunakan cloud.</p>
              <ol className="list-decimal ml-4 space-y-1 text-xs">
                <li>Daftar/instal One Sender</li>
                <li>Hubungkan nomor WhatsApp</li>
                <li>Dapatkan API Key dari dashboard</li>
                <li>Masukkan URL dan API Key di sini</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
