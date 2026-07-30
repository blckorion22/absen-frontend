'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Archive, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Mutation } from '@/types';

export default function ArsipMutasiPage() {
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchMutations = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 100 };
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/mutations', { params });
      const result = res.data as { data: Mutation[] };
      setMutations(result.data || []);
    } catch {
      toast.error('Gagal memuat data mutasi');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchMutations();
  }, [fetchMutations]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Arsip Mutasi</h1>
          <p className="page-subtitle">Arsip data mutasi siswa</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <Select
            id="type_filter"
            placeholder="Semua Tipe"
            options={[
              { value: 'in', label: 'Mutasi Masuk' },
              { value: 'out', label: 'Mutasi Keluar' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-600" />
            Arsip Mutasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mutations.length === 0 ? (
            <div className="empty-state py-8">
              <Archive className="empty-state-icon" />
              <p className="text-gray-500 text-sm">Belum ada data mutasi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell w-12">No</th>
                    <th className="table-header-cell">Tanggal</th>
                    <th className="table-header-cell">NIS</th>
                    <th className="table-header-cell">Nama Siswa</th>
                    <th className="table-header-cell">Tipe</th>
                    <th className="table-header-cell">Asal/Tujuan</th>
                    <th className="table-header-cell">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {mutations.map((m, idx) => (
                    <tr key={m.id} className="transition-colors hover:bg-gray-50">
                      <td className="table-cell text-gray-500">{idx + 1}</td>
                      <td className="table-cell text-sm">{m.date || '-'}</td>
                      <td className="table-cell font-mono text-sm">{m.student?.nis || '-'}</td>
                      <td className="table-cell font-medium">{m.student?.name || '-'}</td>
                      <td className="table-cell">
                        <Badge status={m.type === 'in' ? 'present' : 'absent'}>
                          <span className="flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3" />
                            {m.type === 'in' ? 'Masuk' : 'Keluar'}
                          </span>
                        </Badge>
                      </td>
                      <td className="table-cell text-sm">{m.from_school || m.to_school || '-'}</td>
                      <td className="table-cell text-sm text-gray-500 max-w-[200px] truncate">
                        {m.notes || '-'}
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