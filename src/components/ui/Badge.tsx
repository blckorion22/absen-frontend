import React from 'react';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Badge({ status, className, children }: BadgeProps) {
  return (
    <span className={cn('badge', getStatusColor(status), className)}>
      {children || getStatusLabel(status)}
    </span>
  );
}
