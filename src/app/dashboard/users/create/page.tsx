'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { UserPlus, Save, ArrowLeft } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error('Semua field harus diisi');
      return;
    }

    if (password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users', {
        name,
        email,
        password,
        role,
      });
      toast.success('Pengguna berhasil ditambahkan');
      router.push('/dashboard/users');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali
          </Button>
          <div>
            <h1 className="page-title">Tambah Pengguna Baru</h1>
            <p className="page-subtitle">Buat akun admin atau guru baru</p>
          </div>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Data Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
            />
            
            <Input
              label="Alamat Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sekolah.com"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
            />
            
            <Select
              label="Peran / Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'teacher', label: 'Guru' },
                { value: 'admin', label: 'Admin' }
              ]}
              required
            />
            
            <div className="pt-4 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                loading={submitting} 
                icon={<Save className="w-4 h-4" />}
              >
                Simpan Pengguna
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
