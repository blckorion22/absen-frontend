'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Printer, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Salary } from '@/types';

interface SlipData {
  slip_no: string;
  date: string;
  salary: Salary;
}

export default function SlipGajiPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const [slipData, setSlipData] = useState<SlipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSlip = useCallback(async (id: number) => {
    setLoading(true);
    setError(false);
    try {
      const response = await apiService.salaries.generateSlip(id);
      const result = response.data;
      setSlipData(result.data);
    } catch {
      setError(true);
      toast.error('Gagal memuat data slip gaji');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (idParam) {
      fetchSlip(Number(idParam));
    } else {
      setLoading(false);
    }
  }, [idParam, fetchSlip]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const months = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
    { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const getMonthName = (monthStr: string) => {
    return months.find(m => m.value === monthStr.toString().padStart(2, '0'))?.label || monthStr;
  };

  if (!idParam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Slip Gaji Guru</h1>
          <p className="page-subtitle">Cetak slip gaji guru</p>
        </div>
        <Card>
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Silakan pilih data gaji dari Laporan Gaji untuk melihat slip.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center">Memuat data...</div>;
  }

  if (error || !slipData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Slip Gaji Guru</h1>
          <p className="page-subtitle">Cetak slip gaji guru</p>
        </div>
        <Card>
          <div className="p-6 text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
            <p>Gagal memuat slip gaji. Data tidak ditemukan.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="section-header print:hidden">
        <div>
          <h1 className="page-title">Slip Gaji Guru</h1>
          <p className="page-subtitle">Cetak slip gaji guru</p>
        </div>
        <Button icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
          Cetak Slip
        </Button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">SLIP GAJI GURU</h1>
          <p className="text-gray-600 mt-1">MTs Student Attendance System</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-500 w-32">No. Slip</td>
                  <td className="py-1 font-medium">: {slipData.slip_no}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500 w-32">Tanggal</td>
                  <td className="py-1 font-medium">: {new Date(slipData.date).toLocaleDateString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-500 w-32">Nama Pegawai</td>
                  <td className="py-1 font-medium">: {slipData.salary.user?.name || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500 w-32">Periode</td>
                  <td className="py-1 font-medium">: {getMonthName(slipData.salary.month)} {slipData.salary.year}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200">Rincian Penghasilan</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2">Gaji Pokok</td>
                <td className="py-2 text-right">{formatCurrency(Number(slipData.salary.base_salary))}</td>
              </tr>
              <tr>
                <td className="py-2">Total Tunjangan</td>
                <td className="py-2 text-right">{formatCurrency(Number(slipData.salary.total_allowance))}</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="py-3 px-2">Total Penghasilan (A)</td>
                <td className="py-3 px-2 text-right">{formatCurrency(Number(slipData.salary.base_salary) + Number(slipData.salary.total_allowance))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200">Rincian Potongan</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-2">Total Potongan</td>
                <td className="py-2 text-right">{formatCurrency(Number(slipData.salary.total_deduction))}</td>
              </tr>
              <tr className="font-semibold bg-gray-50">
                <td className="py-3 px-2">Total Potongan (B)</td>
                <td className="py-3 px-2 text-right">{formatCurrency(Number(slipData.salary.total_deduction))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-gray-800 pt-4 mb-16">
          <table className="w-full text-lg">
            <tbody>
              <tr className="font-bold">
                <td>PENERIMAAN BERSIH (A - B)</td>
                <td className="text-right">{formatCurrency(Number(slipData.salary.net_salary))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between text-sm mt-12 text-center">
          <div className="w-48">
            <p className="mb-16">Penerima,</p>
            <p className="font-bold underline">{slipData.salary.user?.name || '_____________________'}</p>
          </div>
          <div className="w-48">
            <p className="mb-16">Mengetahui,</p>
            <p className="font-bold underline">_____________________</p>
          </div>
        </div>
        
        {/* Style for printing */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:space-y-0 > * + * {
              margin-top: 0 !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:border-none {
              border: none !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .bg-white.p-8 {
              visibility: visible;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .bg-white.p-8 * {
              visibility: visible;
            }
          }
        `}} />
      </div>
    </div>
  );
}
