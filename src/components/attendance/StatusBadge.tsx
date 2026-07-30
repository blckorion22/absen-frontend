'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import type { AttendanceStatus } from '@/types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: {
    label: 'Hadir',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Check className="w-3.5 h-3.5" />,
  },
  late: {
    label: 'Terlambat',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  absent: {
    label: 'Alpha',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <X className="w-3.5 h-3.5" />,
  },
  excused: {
    label: 'Izin',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

export default function StatusBadge({ status, className, showIcon = true, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.color,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
