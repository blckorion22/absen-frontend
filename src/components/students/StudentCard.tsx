'use client';

import React from 'react';
import { formatDate, getInitials, formatPhone } from '@/lib/utils';
import { Mail, Phone, MapPin, GraduationCap, BookOpen } from 'lucide-react';
import type { Student } from '@/types';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="card overflow-hidden">
      <div className="gradient-primary px-6 py-8 -mx-6 -mt-6 mb-0 relative">
        <div className="bg-islamic-overlay" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{getInitials(student.name)}</span>
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-emerald-100 text-sm">NIS. {student.nis}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Kelas</p>
            <p className="text-gray-900 font-medium">{student.class_name || '-'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Jenis Kelamin</p>
            <p className="text-gray-900 font-medium">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">No. HP Orang Tua</p>
            <p className="text-gray-900 font-medium">{formatPhone(student.parent_phone)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">Alamat</p>
            <p className="text-gray-900 font-medium">{student.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Terdaftar sejak {formatDate(student.created_at)}
        </p>
      </div>
    </div>
  );
}
