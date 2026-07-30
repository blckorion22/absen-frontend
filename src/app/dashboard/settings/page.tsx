'use client';

import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';
import { useSettings } from '@/lib/settings';
import { apiService } from '@/lib/api';
import { User, Shield, Bell, Save, Lock, School } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { settings, refreshSettings } = useSettings();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const [schoolSettings, setSchoolSettings] = useState({
    school_name: settings.school_name || '',
    school_description: settings.school_description || '',
    school_address: settings.school_address || '',
    school_email: settings.school_email || '',
    school_phone: settings.school_phone || '',
    school_website: settings.school_website || '',
    school_motto: settings.school_motto || '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingSchool, setSavingSchool] = useState(false);

  const [timeSettings, setTimeSettings] = useState({
    jam_masuk: settings.jam_masuk || '05:00',
    jam_masuk_threshold: settings.jam_masuk_threshold || '06:45',
    jam_pulang: settings.jam_pulang || '14:00',
    jam_pulang_end: settings.jam_pulang_end || '23:00',
  });
  const [savingTime, setSavingTime] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (user) {
        updateUser({ ...user, name: profile.name, email: profile.email });
      }
      toast.success('Profil berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchool(true);
    try {
      const formData = new FormData();
      formData.append('school_name', schoolSettings.school_name);
      formData.append('school_description', schoolSettings.school_description);
      formData.append('school_address', schoolSettings.school_address);
      formData.append('school_email', schoolSettings.school_email);
      formData.append('school_phone', schoolSettings.school_phone);
      formData.append('school_website', schoolSettings.school_website);
      formData.append('school_motto', schoolSettings.school_motto);
      if (logoFile) {
        formData.append('school_logo', logoFile);
      }
      
      await apiService.settings.update(formData);
      await refreshSettings();
      toast.success('Pengaturan sekolah berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui pengaturan sekolah');
    } finally {
      setSavingSchool(false);
    }
  };

  const handleSaveTimeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTime(true);
    try {
      const formData = new FormData();
      formData.append('jam_masuk', timeSettings.jam_masuk);
      formData.append('jam_masuk_threshold', timeSettings.jam_masuk_threshold);
      formData.append('jam_pulang', timeSettings.jam_pulang);
      formData.append('jam_pulang_end', timeSettings.jam_pulang_end);
      
      await apiService.settings.update(formData);
      await refreshSettings();
      toast.success('Pengaturan jam absensi berhasil diperbarui');
    } catch (err) {
      toast.error('Gagal memperbarui pengaturan jam absensi');
    } finally {
      setSavingTime(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-subtitle">Kelola pengaturan akun dan preferensi sekolah</p>
      </div>

      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-emerald-600" />
              Profil Sekolah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSchoolSettings} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
                  {logoFile ? (
                    <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                  ) : settings.school_logo ? (
                    <img src={settings.school_logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <School className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Logo Sekolah</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Sekolah"
                  id="school_name"
                  value={schoolSettings.school_name}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, school_name: e.target.value })}
                />
                <Input
                  label="Motto Sekolah (Footer)"
                  id="school_motto"
                  value={schoolSettings.school_motto}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, school_motto: e.target.value })}
                />
              </div>
              <Input
                label="Alamat Lengkap"
                id="school_address"
                value={schoolSettings.school_address}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, school_address: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Email"
                  id="school_email"
                  type="email"
                  value={schoolSettings.school_email}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, school_email: e.target.value })}
                />
                <Input
                  label="Nomor Telepon"
                  id="school_phone"
                  value={schoolSettings.school_phone}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, school_phone: e.target.value })}
                />
                <Input
                  label="Website Lengkap"
                  id="school_website"
                  value={schoolSettings.school_website}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, school_website: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={savingSchool} icon={<Save className="w-4 h-4" />}>
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(user?.role === 'admin' || user?.role === 'teacher') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Pengaturan Jam Absensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveTimeSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Jam Buka Absen Pagi (Mulai Hadir)"
                  id="jam_masuk"
                  type="time"
                  value={timeSettings.jam_masuk}
                  onChange={(e) => setTimeSettings({ ...timeSettings, jam_masuk: e.target.value })}
                />
                <Input
                  label="Batas Jam Hadir (Lewat = Terlambat)"
                  id="jam_masuk_threshold"
                  type="time"
                  value={timeSettings.jam_masuk_threshold}
                  onChange={(e) => setTimeSettings({ ...timeSettings, jam_masuk_threshold: e.target.value })}
                />
                <Input
                  label="Jam Buka Absen Pulang (Mulai Pulang)"
                  id="jam_pulang"
                  type="time"
                  value={timeSettings.jam_pulang}
                  onChange={(e) => setTimeSettings({ ...timeSettings, jam_pulang: e.target.value })}
                />
                <Input
                  label="Batas Akhir Absen Pulang (Tutup)"
                  id="jam_pulang_end"
                  type="time"
                  value={timeSettings.jam_pulang_end}
                  onChange={(e) => setTimeSettings({ ...timeSettings, jam_pulang_end: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={savingTime} icon={<Save className="w-4 h-4" />}>
                  Simpan Jam Absensi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Profil Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-2xl">
                  {user?.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Email"
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Nomor Telepon"
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                Simpan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
