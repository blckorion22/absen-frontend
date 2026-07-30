import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(date: string | Date, pattern: string = 'dd MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: id });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm', { locale: id });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: id });
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: id });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('62')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10, 13)}`;
  }
  if (cleaned.startsWith('0')) {
    return `+62 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    present: 'bg-green-100 text-green-800 border-green-200',
    late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    absent: 'bg-red-100 text-red-800 border-red-200',
    excused: 'bg-blue-100 text-blue-800 border-blue-200',
    sent: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    present: 'Hadir',
    late: 'Terlambat',
    absent: 'Alpha',
    excused: 'Izin',
    sent: 'Terkirim',
    failed: 'Gagal',
    pending: 'Menunggu',
  };
  return labels[status] || status;
}

export function cn(...classes: (string | boolean | number | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function classOptions(classes: { id: number; name: string; grade: string }[]) {
  return classes.map((c) => ({
    value: c.id,
    label: `${c.grade} - ${c.name}`,
  }));
}
