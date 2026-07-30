'use client';

import React from 'react';
import { formatTime } from '@/lib/utils';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { LogIn, LogOut, UserPlus, Edit, Activity, AlertCircle } from 'lucide-react';
import type { Activity as ActivityType } from '@/types';

interface RecentActivityProps {
  data: ActivityType[];
  isLoading?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
  check_in: <LogIn className="w-4 h-4 text-emerald-600" />,
  check_out: <LogOut className="w-4 h-4 text-blue-600" />,
  added: <UserPlus className="w-4 h-4 text-purple-600" />,
  updated: <Edit className="w-4 h-4 text-amber-600" />,
};

const activityBg: Record<string, string> = {
  check_in: 'bg-emerald-50',
  check_out: 'bg-blue-50',
  added: 'bg-purple-50',
  updated: 'bg-amber-50',
};

export default function RecentActivity({ data, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="skeleton w-8 h-8 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-48" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>

      {data.length === 0 ? (
        <div className="empty-state py-8">
          <Activity className="empty-state-icon" />
          <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl ${activityBg[item.type] || 'bg-gray-50'} flex items-center justify-center flex-shrink-0`}>
                {activityIcons[item.type] || <Activity className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{item.student_name}</span>{' '}
                  {item.description}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
