import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  subtitle?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorClasses = {
  emerald: {
    bg: 'from-emerald-500 to-emerald-700',
    light: 'bg-emerald-50 text-emerald-600',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50 text-amber-600',
  },
  red: {
    bg: 'from-red-500 to-red-700',
    light: 'bg-red-50 text-red-600',
  },
  blue: {
    bg: 'from-blue-500 to-blue-700',
    light: 'bg-blue-50 text-blue-600',
  },
  purple: {
    bg: 'from-purple-500 to-purple-700',
    light: 'bg-purple-50 text-purple-600',
  },
};

export default function StatsCard({ title, value, icon, color, subtitle, trend }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors.light)}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          {trend.isUp ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={cn('text-sm font-medium', trend.isUp ? 'text-emerald-600' : 'text-red-600')}>
            {trend.value}%
          </span>
          <span className="text-xs text-gray-400">dari kemarin</span>
        </div>
      )}

      <div
        className={cn(
          'absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity',
          `bg-gradient-to-br ${colors.bg}`
        )}
      />
    </div>
  );
}
