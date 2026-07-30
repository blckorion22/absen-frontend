'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Route, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import type { TrackingStudent } from '@/types';

export default function TrackingSiswaPage() {
  const [tracking, setTracking] = useState<TrackingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search.trim()) params.search = search;
      const res = await api.get('/tracking/students', { params });
      const result = res.data as { data: TrackingStudent[] };
      setTracking(result.data || []);
    } catch {
      toast.error('Gagal memuat data tracking');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Tracking Map Siswa</h1>
          <p className="page-subtitle">Lokasi siswa saat absensi</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="search"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-600" />
            Data Lokasi Siswa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tracking.length === 0 ? (
            <div className="empty-state py-8">
              <MapPin className="empty-state-icon" />
              <p className="text-gray-500 text-sm">Belum ada data tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell w-12">No</th>
                    <th className="table-header-cell">NIS</th>
                    <th className="table-header-cell">Nama</th>
                    <th className="table-header-cell">Kelas</th>
                    <th className="table-header-cell">Lat</th>
                    <th className="table-header-cell">Lng</th>
                    <th className="table-header-cell">Waktu</th>
                    <th className="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {tracking.map((item, idx) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="table-cell text-gray-500">{idx + 1}</td>
                      <td className="table-cell font-mono text-sm">{item.student?.nis || '-'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="font-medium text-gray-900">{item.student?.name || '-'}</p>
                        </div>
                      </td>
                      <td className="table-cell text-sm">
                        {item.student?.class_room?.name || '-'}
                      </td>
                      <td className="table-cell font-mono text-xs text-gray-500">
                        {item.latitude || '-'}
                      </td>
                      <td className="table-cell font-mono text-xs text-gray-500">
                        {item.longitude || '-'}
                      </td>
                      <td className="table-cell text-sm">
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="table-cell">
                        <Badge status={item.status || 'pending'}>
                          {item.status === 'active' ? 'Aktif' : item.status || '-'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}