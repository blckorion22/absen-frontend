'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { TrendingUp, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import type { GradePromotion, PaginatedResponse } from '@/types';

export default function KenaikanKelasPage() {
  const [data, setData] = useState<GradePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Record<string, number[]>>({});
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grade-promotions');
      const result = res.data as { data: GradePromotion[] };
      setData(result.data);
      const groups: Record<string, boolean> = {};
      const ids: Record<string, number[]> = {};
      result.data.forEach((item) => {
        const grade = item.from_grade || item.student?.class_room?.grade || 'VII';
        if (!groups[grade]) groups[grade] = true;
        if (!ids[grade]) ids[grade] = [];
      });
      setExpandedGrades(groups);
      setSelectedIds(ids);
    } catch {
      toast.error('Gagal memuat data kenaikan kelas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedByGrade: Record<string, GradePromotion[]> = {};
  data.forEach((item) => {
    const grade = item.from_grade || item.student?.class_room?.grade || 'VII';
    if (!groupedByGrade[grade]) groupedByGrade[grade] = [];
    groupedByGrade[grade].push(item);
  });

  const gradeOrder = ['VII', 'VIII', 'IX'];
  const targetGrade: Record<string, string> = { VII: 'VIII', VIII: 'IX', IX: 'Lulus' };

  const toggleSelect = (grade: string, id: number) => {
    setSelectedIds((prev) => {
      const current = [...(prev[grade] || [])];
      const idx = current.indexOf(id);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(id);
      return { ...prev, [grade]: current };
    });
  };

  const toggleSelectAll = (grade: string, items: GradePromotion[]) => {
    const allIds = items.map((i) => i.id);
    const current = selectedIds[grade] || [];
    const allSelected = allIds.every((id) => current.includes(id));
    setSelectedIds((prev) => ({
      ...prev,
      [grade]: allSelected ? [] : allIds,
    }));
  };

  const handlePromote = async (grade: string) => {
    const ids = selectedIds[grade] || [];
    if (ids.length === 0) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }
    try {
      await api.post('/grade-promotions/promote', {
        student_ids: ids,
        target_grade: targetGrade[grade],
      });
      toast.success(`${ids.length} siswa berhasil dinaikkan ke kelas ${targetGrade[grade]}`);
      setSelectedIds((prev) => ({ ...prev, [grade]: [] }));
      fetchData();
    } catch {
      toast.error('Gagal memproses kenaikan kelas');
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Kenaikan Kelas</h1>
          <p className="page-subtitle">Proses kenaikan kelas siswa</p>
        </div>
      </div>

      {Object.keys(groupedByGrade).length === 0 ? (
        <Card>
          <CardHeader><CardTitle>Kenaikan Kelas</CardTitle></CardHeader>
          <div className="p-6 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada data kenaikan kelas</p>
          </div>
        </Card>
      ) : (
        gradeOrder.filter((g) => groupedByGrade[g]).map((grade) => {
          const items = groupedByGrade[grade];
          const selected = selectedIds[grade] || [];
          const allSelected = items.length > 0 && items.every((i) => selected.includes(i.id));
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSelectAll(grade, items)}
                    icon={allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  >
                    {allSelected ? 'Unselect All' : 'Select All'}
                  </Button>
                  <Button size="sm" onClick={() => handlePromote(grade)}>
                    Naikkan ke Kelas {targetGrade[grade]}
                  </Button>
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
                            <button
                              onClick={() => toggleSelect(grade, item.id)}
                              className="p-1"
                            >
                              {selected.includes(item.id) ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </td>
                          <td className="table-cell text-gray-500">{idx + 1}</td>
                          <td className="table-cell font-mono text-sm">{item.student?.nis || '-'}</td>
                          <td className="table-cell font-medium">{item.student?.name || '-'}</td>
                          <td className="table-cell">{item.student?.class_room?.name || item.from_grade || '-'}</td>
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