'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/api';
import { useSettings } from '@/lib/settings';
import { formatDate, formatTime } from '@/lib/utils';
import type { AttendanceReport, ClassRoom } from '@/types';

import { Suspense } from 'react';

function PrintReportContent() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('Semua Kelas');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const params: Record<string, string | number> = {};
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const classId = searchParams.get('class_id');
        const status = searchParams.get('status');

        if (startDate) params.date_from = startDate;
        if (endDate) params.date_to = endDate;
        if (classId) params.class_room_id = classId;
        if (status) params.status = status;
        
        // Fetch class name if a specific class is selected
        if (classId) {
          try {
            const classesRes = await apiService.classes.list({ per_page: 100 });
            const selectedClass = classesRes.data.data.find((c: ClassRoom) => c.id.toString() === classId);
            if (selectedClass) {
              setClassName(`${selectedClass.grade} - ${selectedClass.name}`);
            }
          } catch (e) {
             console.error(e);
          }
        }

        // Fetch without pagination for print (set per_page high)
        params.per_page = 1000;
        
        const response = await apiService.attendance.report(params);
        setReport(response.data.data || response.data);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [searchParams]);

  useEffect(() => {
    if (!loading && report) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, report]);

  if (loading) {
    return <div className="p-8 text-center">Menyiapkan laporan untuk dicetak...</div>;
  }

  if (!report) {
    return <div className="p-8 text-center text-red-600">Gagal memuat data laporan.</div>;
  }

  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-5xl mx-auto print:p-0 print:m-0">
      {/* Kop Surat */}
      <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
          {settings.school_logo ? (
            <img src={settings.school_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">LOGO</div>
          )}
        </div>
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl font-bold uppercase tracking-wide">{settings.school_name || 'MTs Negeri 1 Jakarta'}</h1>
          <p className="text-sm mt-1">{settings.school_description || 'Sistem Absensi Siswa Digital Terintegrasi'}</p>
          <p className="text-xs mt-1">{settings.school_address || 'Jl. Pendidikan No. 1, Jakarta Selatan'}</p>
        </div>
        <div className="w-24 h-24 flex-shrink-0"></div> {/* Spacer for centering */}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold underline decoration-2 underline-offset-4">LAPORAN KEHADIRAN SISWA</h2>
        <p className="text-sm mt-2">
          Periode: {startDate ? formatDate(startDate) : '-'} s.d. {endDate ? formatDate(endDate) : '-'}
        </p>
        <p className="text-sm">Kelas: {className}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
        <div className="border border-black p-2 text-center">
          <span className="font-bold block text-lg">{report.summary?.present || 0}</span>
          Hadir
        </div>
        <div className="border border-black p-2 text-center">
          <span className="font-bold block text-lg">{report.summary?.late || 0}</span>
          Terlambat
        </div>
        <div className="border border-black p-2 text-center">
          <span className="font-bold block text-lg">{report.summary?.absent || 0}</span>
          Alpha
        </div>
        <div className="border border-black p-2 text-center">
          <span className="font-bold block text-lg">{report.summary?.excused || 0}</span>
          Izin/Sakit
        </div>
      </div>

      <table className="w-full text-sm border-collapse border border-black text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 w-10 text-center">No</th>
            <th className="border border-black px-2 py-2 w-28">Tanggal</th>
            <th className="border border-black px-2 py-2">Nama Siswa</th>
            <th className="border border-black px-2 py-2 w-24">NIS</th>
            <th className="border border-black px-2 py-2 w-24">Kelas</th>
            <th className="border border-black px-2 py-2 w-24 text-center">Status</th>
            <th className="border border-black px-2 py-2 w-20 text-center">Masuk</th>
            <th className="border border-black px-2 py-2 w-20 text-center">Pulang</th>
            <th className="border border-black px-2 py-2">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {report.data?.map((a, i) => (
            <tr key={a.id} className="print:break-inside-avoid">
              <td className="border border-black px-2 py-1 text-center">{i + 1}</td>
              <td className="border border-black px-2 py-1">{formatDate(a.date)}</td>
              <td className="border border-black px-2 py-1">{a.student_name}</td>
              <td className="border border-black px-2 py-1">{a.student_nis}</td>
              <td className="border border-black px-2 py-1">{a.class_name}</td>
              <td className="border border-black px-2 py-1 text-center">
                {a.status === 'present' ? 'Hadir' : 
                 a.status === 'late' ? 'Terlambat' : 
                 a.status === 'absent' ? 'Alpha' : 'Izin'}
              </td>
              <td className="border border-black px-2 py-1 text-center">{a.check_in ? formatTime(a.check_in) : '-'}</td>
              <td className="border border-black px-2 py-1 text-center">{a.check_out ? formatTime(a.check_out) : '-'}</td>
              <td className="border border-black px-2 py-1">{a.note || '-'}</td>
            </tr>
          ))}
          {(!report.data || report.data.length === 0) && (
            <tr>
              <td colSpan={9} className="border border-black px-2 py-4 text-center text-gray-500">
                Tidak ada data absensi pada periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-12 flex justify-end">
        <div className="text-center w-48">
          <p className="mb-16">Mengetahui,</p>
          <p className="font-bold border-b border-black inline-block px-4">Kepala Sekolah / Wali Kelas</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <PrintReportContent />
    </Suspense>
  );
}
