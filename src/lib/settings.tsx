'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from './api';

interface Settings {
  school_name: string;
  school_description: string;
  school_logo: string | null;
  school_address: string;
  school_email?: string;
  school_phone?: string;
  school_website?: string;
  school_motto?: string;
  jam_masuk?: string;
  jam_masuk_threshold?: string;
  jam_pulang?: string;
  jam_pulang_end?: string;
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  school_name: 'MTs Negeri 1 Jakarta',
  school_description: 'Sistem Absensi Siswa Digital Terintegrasi',
  school_logo: null,
  school_address: 'Jl. Pendidikan No. 1, Jakarta Selatan',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await apiService.settings.getPublic();
      if (res.data.data) {
        setSettings({ ...defaultSettings, ...res.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
