'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';

export default function SettingAppWaliPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [provider, setProvider] = useState('fonnte');
  const [apiKey, setApiKey] = useState('');
  const [sender, setSender] = useState('');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/communications/settings');
        if (response.data?.data) {
          setProvider(response.data.data.provider || 'fonnte');
          setApiKey(response.data.data.api_key || '');
          setSender(response.data.data.sender || '');
        }
      } catch {
        toast.error('Gagal memuat pengaturan App Wali');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/communications/settings', {
        provider,
        api_key: apiKey,
        sender,
      });
      toast.success('Pengaturan App Wali berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Pengaturan App Wali</h1>
          <p className="page-subtitle">Konfigurasi penyedia layanan WhatsApp untuk notifikasi orang tua</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Konfigurasi API
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Memuat pengaturan...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Provider WhatsApp</label>
                <select
                  className="input-field"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="fonnte">Fonnte</option>
                  <option value="wati">WATI</option>
                  <option value="custom">Custom API</option>
                </select>
              </div>
              
              <Input
                label="API Key / Token"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key / Token"
              />
              
              <Input
                label="Sender / Nomor Pengirim"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Contoh: 081234567890 (Jika diperlukan)"
              />
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
