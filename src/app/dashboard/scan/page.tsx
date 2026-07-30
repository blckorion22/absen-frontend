'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { apiService } from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';

export default function StudentScanPage() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {}).finally(() => {
              scannerRef.current?.clear();
            });
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {}
      }
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    setSuccess(null);
    setError(null);
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // When QR is scanned successfully
            if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop().catch(() => {}).finally(() => {
                scannerRef.current?.clear();
              });
            }
            setScanning(false);
            handleScannedResult(decodedText);
          },
          (error) => {
            // ignoring continuous errors
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Gagal mengakses kamera. Pastikan Anda telah memberikan izin kamera.");
        setScanning(false);
      }
    }, 100);
  };

  const handleScannedResult = async (url: string) => {
    try {
      // Extract token from URL (e.g. https://.../scan/TOKEN_STRING)
      const parts = url.split('/scan/');
      if (parts.length < 2) {
        throw new Error('QR Code tidak valid untuk absensi sekolah ini.');
      }
      const token = parts[1].replace('/', '');

      // Get location
      toast.loading('Mendapatkan lokasi...', { id: 'gps' });
      const pos = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolokasi tidak didukung browser ini.'));
        } else {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            (err) => reject(new Error(`Akses lokasi ditolak/gagal: ${err.message}. Pastikan GPS aktif.`)),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      });
      toast.dismiss('gps');
      toast.loading('Memproses absensi...', { id: 'absen' });

      // Call API
      const response = await apiService.attendance.checkIn({
        qr_token: token,
        student_id: user?.student_id as number,
        latitude: pos.latitude,
        longitude: pos.longitude
      });
      
      toast.dismiss('absen');
      setSuccess(response.data.message || 'Absen berhasil!');
      toast.success('Absensi berhasil direkam!');
    } catch (err: any) {
      toast.dismiss('gps');
      toast.dismiss('absen');
      const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat absensi';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="page-title">Scan QR Absen</h1>
        <p className="page-subtitle">Arahkan kamera ke QR Code kelas. Kehadiran akan otomatis tercatat sesuai akun Anda.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {!scanning && !success && !error && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10" />
              </div>
              <p className="text-gray-500 mb-6 text-sm">
                Sistem akan otomatis mendeteksi identitas Anda. Pastikan Anda berada di area sekolah (radius 50m) dan GPS aktif.
              </p>
              <Button onClick={startScanner} className="w-full">
                Mulai Scan QR
              </Button>
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-emerald-500"></div>
              <Button variant="secondary" onClick={() => {
                if (scannerRef.current && scannerRef.current.isScanning) {
                  scannerRef.current.stop().catch(() => {}).finally(() => {
                    scannerRef.current?.clear();
                  });
                } else if (scannerRef.current) {
                  scannerRef.current.clear();
                }
                setScanning(false);
              }} className="w-full">
                Batal
              </Button>
            </div>
          )}

          {success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Berhasil!</h3>
              <p className="text-gray-500 mb-6">{success}</p>
              <Button onClick={() => setSuccess(null)} className="w-full">
                Scan Lagi
              </Button>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gagal</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={() => setError(null)} className="w-full">
                Coba Lagi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
