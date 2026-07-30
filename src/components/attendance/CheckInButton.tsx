'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { LogIn, LogOut, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface CheckInButtonProps {
  studentId: number;
  studentName: string;
  token: string;
  onComplete?: () => void;
}

export default function CheckInButton({ studentId, studentName, token, onComplete }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    setResult(null);

    try {
      const api = (await import('@/lib/api')).apiService;
      const endpoint = action === 'check-in' ? api.attendance.checkIn : api.attendance.checkOut;
      const response = await endpoint({ student_id: studentId, qr_token: token });
      setResult({ success: true, message: response.data.message || `Berhasil ${action === 'check-in' ? 'Check In' : 'Check Out'}` });
      if (onComplete) onComplete();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setResult({
        success: false,
        message: axiosError.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        {result.success ? (
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        ) : (
          <XCircle className="w-12 h-12 text-red-500" />
        )}
        <p className={`text-sm font-medium ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
          {result.message}
        </p>
        <Button variant="secondary" size="sm" onClick={() => setResult(null)}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-semibold text-gray-900">
        {studentName}
      </p>
      <p className="text-sm text-gray-400">Pilih tindakan absensi:</p>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => handleAction('check-in')}
          disabled={loading}
          size="lg"
          icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
        >
          Check In
        </Button>
        <Button
          onClick={() => handleAction('check-out')}
          disabled={loading}
          size="lg"
          variant="secondary"
          icon={loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
        >
          Check Out
        </Button>
      </div>
    </div>
  );
}
