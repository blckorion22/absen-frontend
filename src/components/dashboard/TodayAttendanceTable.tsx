'use client';

import React from 'react';
import { formatTime } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, AlertCircle } from 'lucide-react';
import type { Attendance } from '@/types';

interface TodayAttendanceTableProps {
  data: Attendance[];
  isLoading?: boolean;
}

export default function TodayAttendanceTable({ data, isLoading }: TodayAttendanceTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Absensi Hari Ini</CardTitle>
        <span className="text-xs text-gray-400">{data.length} siswa</span>
      </CardHeader>

      {data.length === 0 ? (
        <div className="empty-state py-8">
          <AlertCircle className="empty-state-icon" />
          <p className="text-gray-500 text-sm">Belum ada data absensi hari ini</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-hide">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.student_name}
                </p>
                <p className="text-xs text-gray-400">
                  {item.check_in ? formatTime(item.check_in) : '-'} | {item.student_nis}
                </p>
              </div>
              <Badge status={item.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
