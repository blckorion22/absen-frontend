'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { Send, MessageSquare, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { WhatsAppLog, ClassRoom } from '@/types';

export default function WhatsAppPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'logs' | 'broadcast'>('logs');
  
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Test Message State
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Broadcast State
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await apiService.whatsapp.logs({ per_page: 20 });
      setLogs(response.data.data || []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await apiService.classes.list({ per_page: 100 });
      setClasses(response.data.data || []);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    if (user?.role === 'admin') {
      fetchClasses();
    }
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs, fetchClasses, user?.role]);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      toast.error('No. HP dan pesan harus diisi');
      return;
    }

    setSending(true);
    try {
      await apiService.whatsapp.send({
        phone: phone.replace(/\s/g, ''),
        message,
      });
      toast.success('Pesan uji coba berhasil dikirim');
      setPhone('');
      setMessage('');
      fetchLogs();
    } catch {
      toast.error('Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('Pesan broadcast harus diisi');
      return;
    }

    if (!confirm('Yakin ingin mengirim broadcast ini ke orang tua siswa?')) return;

    setBroadcasting(true);
    try {
      const response = await apiService.whatsapp.broadcast({
        target: broadcastTarget,
        message: broadcastMessage,
      });
      toast.success(response.data.message || 'Broadcast berhasil diproses');
      setBroadcastMessage('');
      fetchLogs();
      setActiveTab('logs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">WhatsApp</h1>
          <p className="page-subtitle">Kirim pesan dan lihat log pengiriman</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <div className="bg-white rounded-lg p-1 border shadow-sm flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('logs')}
              >
                Log & Uji Coba
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'broadcast' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('broadcast')}
              >
                <Megaphone className="w-4 h-4" />
                Broadcast
              </button>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={fetchLogs}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {activeTab === 'broadcast' && user?.role === 'admin' ? (
        <Card className="max-w-3xl mx-auto border-emerald-100 shadow-emerald-100/50">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              Broadcast Pengumuman
            </CardTitle>
            <p className="text-sm text-emerald-600/80 mt-1">
              Kirim pesan massal otomatis ke nomor WhatsApp orang tua siswa.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleBroadcast} className="space-y-5">
              <Select
                label="Target Penerima"
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Orang Tua Siswa (Seluruh Sekolah)' },
                  ...classes.map(c => ({ value: c.id.toString(), label: `Kelas ${c.grade} - ${c.name}` }))
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
                  * Pesan akan dikirim satu per satu ke setiap orang tua dari target yang dipilih. Pastikan kouta/limit Fonnte mencukupi.
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Uji Coba Kirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTest} className="space-y-4">
                <Input
                  label="No. HP"
                  id="phone"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="form-group">
                  <label htmlFor="message" className="form-label">Pesan</label>
                  <textarea
                    id="message"
                    className="input-field min-h-[120px] resize-none"
                    placeholder="Tulis pesan yang akan dikirim..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  loading={sending}
                  icon={<Send className="w-4 h-4" />}
                >
                  Kirim Pesan
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Log Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loading text="Memuat log..." />
              ) : logs.length === 0 ? (
                <div className="empty-state py-8">
                  <MessageSquare className="empty-state-icon" />
                  <p className="text-gray-500 text-sm">Belum ada riwayat pengiriman</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="mt-0.5">{statusIcon(log.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{log.phone}</span>
                          <Badge status={log.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{log.message}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {formatDateTime(log.sent_at)}
                          </span>
                        </div>
                        {log.error && (
                          <p className="text-xs text-red-500 mt-1">Error: {log.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
