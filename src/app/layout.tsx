import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { SettingsProvider } from '@/lib/settings';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'SISWA ABSENSI - MTs Negeri 1 Jakarta',
  description: 'Sistem Absensi Siswa MTs Negeri 1 Jakarta - Aplikasi pencatatan kehadiran siswa berbasis digital',
  keywords: ['absensi', 'siswa', 'MTs', 'sekolah', 'kehadiran', 'digital'],
  authors: [{ name: 'MTs Negeri 1 Jakarta' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'SISWA ABSENSI - MTs Negeri 1 Jakarta',
    description: 'Sistem Absensi Siswa Berbasis Digital',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={inter.className}>
        <SettingsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
