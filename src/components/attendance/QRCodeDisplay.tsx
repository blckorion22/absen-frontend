'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/ui/Button';
import { Download, RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  onRefresh?: () => void;
}

export default function QRCodeDisplay({ value, size = 256, title, onRefresh }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const png = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-absensi-${title || 'class'}.png`;
      link.href = png;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('QR Code berhasil diunduh');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Tautan berhasil disalin');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">Scan QR Code untuk absensi</p>
        </div>
      )}

      <div className="relative bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <QRCodeSVG
          id="qr-code"
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#059669"
          level="H"
          includeMargin
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-[8px]">MTs</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={downloadQR} icon={<Download className="w-4 h-4" />}>
          Download
        </Button>
        <Button variant="secondary" size="sm" onClick={copyLink} icon={copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}>
          {copied ? 'Tersalin' : 'Salin Tautan'}
        </Button>
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh} icon={<RefreshCw className="w-4 h-4" />}>
            Regenerate
          </Button>
        )}
      </div>
    </div>
  );
}
