'use client';
import React from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText } from 'lucide-react';
export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Laporan Absensi Guru</h1>
        <p className="page-subtitle">Rekap absensi guru</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Laporan Absensi Guru</CardTitle></CardHeader>
        <div className="p-6 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Fitur akan segera tersedia</p>
        </div>
      </Card>
    </div>
  );
}
