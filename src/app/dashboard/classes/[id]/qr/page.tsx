'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import QRCodeDisplay from '@/components/attendance/QRCodeDisplay';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { ArrowLeft, Smartphone, Camera, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ClassRoom } from '@/types';

export default function QRCodePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [classData, setClassData] = useState<ClassRoom | null>(null);
  const [qrToken, setQrToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, qrRes] = await Promise.all([
        apiService.classes.get(id),
        apiService.classes.qrCode(id),
      ]);
      setClassData(classRes.data.data || classRes.data);
      setQrToken(qrRes.data.data?.qr?.token || qrRes.data?.qr?.token || '');
    } catch {
      toast.error('Gagal memuat data');
      router.push('/dashboard/classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, router]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await apiService.classes.regenerateQr(id);
      setQrToken(response.data.data?.token || response.data?.token || '');
      toast.success('QR Code berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui QR Code');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <Loading text="Memuat data QR Code..." />;
  if (!classData) return null;

  const qrValue = `${window.location.origin}/scan/${qrToken}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/classes/${id}`} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">QR Code Absensi</h1>
          <p className="page-subtitle">
            Kelas {classData.name} - {classData.grade} ({classData.academic_year})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-start justify-center">
          <Card className="w-full max-w-md">
            <QRCodeDisplay
              value={qrValue}
              size={240}
              title={`Kelas ${classData.name}`}
              onRefresh={handleRegenerate}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                Petunjuk Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tempel QR Code</p>
                  <p className="text-xs text-gray-400">Tempelkan QR Code ini di pintu masuk kelas atau bagikan kepada siswa</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scan QR Code</p>
                  <p className="text-xs text-gray-400">Siswa scan QR Code menggunakan kamera HP mereka</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Masukkan NIS</p>
                  <p className="text-xs text-gray-400">Siswa memasukkan NIS untuk melakukan check-in atau check-out</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-sm">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Konfirmasi Absensi</p>
                  <p className="text-xs text-gray-400">Sistem akan mencatat kehadiran secara otomatis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Info QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-emerald-600">Aktif</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Kelas</span>
                <span className="text-sm font-medium text-gray-900">{classData.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Tautan</span>
                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{qrValue}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
