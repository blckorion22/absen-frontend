'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { GraduationCap, Search, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Alumni } from '@/types';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (search.trim()) params.search = search;
      const res = await api.get('/alumni', { params });
      const result = res.data as { data: Alumni[] };
      setAlumni(result.data || []);
    } catch {
      toast.error('Gagal memuat data alumni');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Alumni</h1>
          <p className="page-subtitle">Data alumni sekolah</p>
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
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Data Alumni
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alumni.length === 0 ? (
            <div className="empty-state py-8">
              <GraduationCap className="empty-state-icon" />
              <p className="text-gray-500 text-sm">Belum ada data alumni</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell w-12">No</th>
                    <th className="table-header-cell">NIS</th>
                    <th className="table-header-cell">Nama</th>
                    <th className="table-header-cell">Kelas (Angkatan)</th>
                    <th className="table-header-cell">Tanggal Lulus</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {alumni.map((item, idx) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="table-cell text-gray-500">{idx + 1}</td>
                      <td className="table-cell font-mono text-sm">{item.student?.nis || '-'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-xs">
                              {(item.student?.name || 'A').charAt(0)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{item.student?.name || '-'}</p>
                        </div>
                      </td>
                      <td className="table-cell">{item.graduation_year || '-'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          {item.graduation_date || item.created_at ? (
                            new Date(item.graduation_date || item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })
                          ) : '-'}
                        </div>
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