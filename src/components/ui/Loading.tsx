import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div
      className={cn(
        'border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

export default function Loading({ size = 'md', text, className, fullPage }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          {text && <p className="text-gray-500 text-sm animate-pulse">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <Spinner size={size} />
      {text && <p className="mt-4 text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 skeleton w-48" />
      <div className="h-4 skeleton w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
