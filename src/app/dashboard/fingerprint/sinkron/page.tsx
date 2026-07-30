'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import Button from '@/components/ui/Button';
import { RefreshCw, Server, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FingerprintMachine {
  id: number;
  name: string;
  ip_address: string;
  location: string;
  last_sync: string;
  status: boolean;
}

export default function FingerprintSyncPage() {
  const [machines, setMachines] = useState<FingerprintMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await apiService.fingerprintMachines.list();
      setMachines(response.data.data || []);
    } catch {
      toast.error('Gagal memuat data mesin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSync = async (id: number) => {
    setSyncingId(id);
    try {
      const res = await apiService.fingerprintMachines.sync(id);
      toast.success(res.data.message || 'Sinkronisasi berhasil');
      fetchMachines();
    } catch {
      toast.error('Sinkronisasi gagal. Pastikan mesin terhubung.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div>
          <h1 className="page-title">Sinkronisasi Fingerprint</h1>
          <p className="page-subtitle">Tarik log kehadiran dari mesin fingerprint ke sistem</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Metode Absensi Aktif: QR Code</h4>
          <p className="text-sm mt-1">Sistem saat ini menggunakan QR Code sebagai metode utama absensi. Tombol sinkronisasi di bawah ini hanya untuk simulasi (mock) dan tidak mengubah status kehadiran siswa via QR.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Memuat data mesin...</div>
        ) : machines.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm">
            <Server className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Belum ada mesin fingerprint terdaftar.</p>
          </div>
        ) : (
          machines.map(machine => (
            <div key={machine.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${machine.status ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                    <p className="text-xs text-gray-500">{machine.ip_address}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${machine.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {machine.status ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-6 flex-1">
                <p>Lokasi: <span className="font-medium text-gray-900">{machine.location || '-'}</span></p>
                <p className="mt-1">Terakhir Sync: <span className="font-medium text-gray-900">{machine.last_sync ? new Date(machine.last_sync).toLocaleString('id-ID') : 'Belum pernah'}</span></p>
              </div>

              <Button 
                onClick={() => handleSync(machine.id)} 
                disabled={syncingId === machine.id}
                className="w-full flex justify-center items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncingId === machine.id ? 'animate-spin' : ''}`} />
                {syncingId === machine.id ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
