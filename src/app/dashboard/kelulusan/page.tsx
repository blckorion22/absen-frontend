'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Award, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Graduation } from '@/types';

export default function KelulusanPage() {
  const [data, setData] = useState<Graduation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/graduations');
      const result = res.data as { data: Graduation[] };
      setData(result.data);
      const groups: Record<string, boolean> = {};
      result.data.forEach((item) => {
        const grade = item.student?.class_room?.grade || 'IX';
        if (!groups[grade]) groups[grade] = true;
      });
      setExpandedGrades(groups);
    } catch {
      toast.error('Gagal memuat data kelulusan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedByGrade: Record<string, Graduation[]> = {};
  data.forEach((item) => {
    const grade = item.student?.class_room?.grade || 'IX';
    if (!groupedByGrade[grade]) groupedByGrade[grade] = [];
    groupedByGrade[grade].push(item);
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (items: Graduation[]) => {
    const allIds = items.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const handleGraduate = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }
    try {
      await api.post('/graduations/graduate', { student_ids: selectedIds });
      toast.success(`${selectedIds.length} siswa berhasil diluluskan`);
      setSelectedIds([]);
      fetchData();
    } catch {
      toast.error('Gagal memproses kelulusan');
    }
  };

  if (loading) return <LoadingOverlay />;

  const allItems = Object.values(groupedByGrade).flat();
  const allSelected = allItems.length > 0 && allItems.every((i) => selectedIds.includes(i.id));

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Kelulusan</h1>
          <p className="page-subtitle">Proses kelulusan siswa</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSelectAll(allItems)}
            icon={allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          >
            {allSelected ? 'Unselect All' : 'Select All'}
          </Button>
          <Button onClick={handleGraduate} icon={<Award className="w-4 h-4" />}>
            Luluskan ({selectedIds.length})
          </Button>
        </div>
      </div>

      {Object.keys(groupedByGrade).length === 0 ? (
        <Card>
          <CardHeader><CardTitle>Kelulusan</CardTitle></CardHeader>
          <div className="p-6 text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada data siswa yang siap diluluskan</p>
          </div>
        </Card>
      ) : (
        Object.entries(groupedByGrade).map(([grade, items]) => {
          const isExpanded = expandedGrades[grade] !== false;
          return (
            <Card key={grade}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedGrades((prev) => ({ ...prev, [grade]: !prev[grade] }))}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <CardTitle>Kelas {grade}</CardTitle>
                  <span className="text-sm text-gray-500">({items.length} siswa)</span>
                </div>
              </CardHeader>
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell w-10"></th>
                        <th className="table-header-cell w-12">No</th>
                        <th className="table-header-cell">NIS</th>
                        <th className="table-header-cell">Nama</th>
                        <th className="table-header-cell">Kelas</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="transition-colors hover:bg-gray-50">
                          <td className="table-cell">
                            <button onClick={() => toggleSelect(item.id)} className="p-1">
                              {selectedIds.includes(item.id) ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="table-cell text-gray-500">{idx + 1}</td>
                          <td className="table-cell font-mono text-sm">{item.student?.nis || '-'}</td>
                          <td className="table-cell font-medium">{item.student?.name || '-'}</td>
                          <td className="table-cell">{item.student?.class_room?.name || grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}