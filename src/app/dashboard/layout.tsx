'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  if (pathname.includes('/print')) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
