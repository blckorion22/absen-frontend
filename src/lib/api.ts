import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Add header to bypass localtunnel reminder screen
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response) {
      const { status, data } = error.response;

        if (status === 401) {
        if (typeof window !== 'undefined') {
          const isPublicPage = window.location.pathname === '/' || window.location.pathname.startsWith('/scan-qr/');
          if (!isPublicPage) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
        }
      }

      if (status === 422 && data?.errors) {
        const messages = Object.values(data.errors).flat();
        messages.forEach((msg) => toast.error(msg));
      }

      if (status === 500) {
        toast.error(data?.message || 'Terjadi kesalahan server. Silakan coba lagi.');
      }
    } else if (error.request) {
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    }

    return Promise.reject(error);
  }
);

export default api;

export const apiService = {
  get: (url: string, config?: any) => api.get(url, config),
  post: (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: (url: string, config?: any) => api.delete(url, config),
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
  },
  classes: {
    list: (params?: Record<string, string | number>) =>
      api.get('/classes', { params }),
    get: (id: number) => api.get(`/classes/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/classes', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/classes/${id}`, data),
    delete: (id: number) => api.delete(`/classes/${id}`),
    students: (id: number) => api.get(`/classes/${id}`),
    qrCode: (id: number) => api.get(`/qr/generate/${id}`),
    regenerateQr: (id: number) => api.post(`/qr/regenerate/${id}`),
  },
  students: {
    list: (params?: Record<string, string | number>) =>
      api.get('/students', { params }),
    get: (id: number) => api.get(`/students/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/students', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/students/${id}`, data),
    delete: (id: number) => api.delete(`/students/${id}`),
    attendance: (id: number, params?: Record<string, string | number>) =>
      api.get(`/attendance/student/${id}`, { params }),
  },
  users: {
    list: (params?: Record<string, string | number>) =>
      api.get('/users', { params }),
    get: (id: number) => api.get(`/users/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/users', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
  },
  attendance: {
    today: (params?: Record<string, string | number>) =>
      api.get('/attendance/today', { params }),
    checkIn: (data: { student_id: number; qr_token?: string; latitude?: number; longitude?: number }) =>
      api.post('/attendance/check-in', data),
    checkOut: (data: { student_id: number; qr_token?: string; latitude?: number; longitude?: number }) =>
      api.post('/attendance/check-out', data),
    report: (params?: Record<string, string | number>) =>
      api.get('/attendance/report', { params }),
    myAttendance: (params?: Record<string, string | number>) =>
      api.get('/attendance/my-attendance', { params }),
    submitPermission: (data: FormData) =>
      api.post('/attendance/permission', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },
  dashboard: {
    stats: () => api.get('/dashboard/stats'),
    todayAttendance: () => api.get('/dashboard/today-attendance'),
    weeklyReport: () => api.get('/dashboard/weekly-report'),
    monthlyReport: () => api.get('/dashboard/monthly-report'),
  },
  settings: {
    get: () => api.get('/settings'),
    getPublic: () => api.get('/public/settings'),
    update: (data: FormData) =>
      api.post('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },
  whatsapp: {
    logs: (params?: Record<string, string | number>) =>
      api.get('/whatsapp/logs', { params }),
    send: (data: { phone: string; message: string }) =>
      api.post('/whatsapp/test', data),
    broadcast: (data: { target: string; message: string }) =>
      api.post('/whatsapp/broadcast', data),
  },
  subjects: {
    list: (params?: Record<string, string | number>) =>
      api.get('/subjects', { params }),
    get: (id: number) => api.get(`/subjects/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/subjects', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/subjects/${id}`, data),
    delete: (id: number) => api.delete(`/subjects/${id}`),
  },
  teacherAttendance: {
    list: (params?: Record<string, string | number>) =>
      api.get('/teacher-attendance', { params }),
    my: (params?: Record<string, string | number>) =>
      api.get('/teacher-attendance/my', { params }),
    today: () => api.get('/teacher-attendance/today'),
    report: (params?: Record<string, string | number>) =>
      api.get('/teacher-attendance/report', { params }),
    show: (id: number) => api.get(`/teacher-attendance/${id}`),
  },
  scan: {
    validate: (token: string) =>
      api.get(`/qr/scan/${token}`),
    studentInfo: (token: string) =>
      api.get(`/qr/students/${token}`),
  },
  positions: {
    list: (params?: Record<string, string | number>) =>
      api.get('/positions', { params }),
    get: (id: number) => api.get(`/positions/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/positions', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/positions/${id}`, data),
    delete: (id: number) => api.delete(`/positions/${id}`),
  },
  deductions: {
    list: (params?: Record<string, string | number>) =>
      api.get('/deductions', { params }),
    get: (id: number) => api.get(`/deductions/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/deductions', data),
    update: (id: number, data: Record<string, unknown>) =>
      api.put(`/deductions/${id}`, data),
    delete: (id: number) => api.delete(`/deductions/${id}`),
  },
  salaries: {
    list: (params?: Record<string, string | number>) =>
      api.get('/salaries', { params }),
    get: (id: number) => api.get(`/salaries/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post('/salaries', data),
    delete: (id: number) => api.delete(`/salaries/${id}`),
    generateSlip: (id: number) => api.get(`/salaries/${id}/slip`),
  },
  mutations: {
    list: (params?: Record<string, string | number>) => api.get('/mutations', { params }),
    create: (data: Record<string, unknown>) => api.post('/mutations', data),
  },
  gradePromotions: {
    list: (params?: Record<string, string | number>) => api.get('/grade-promotions', { params }),
    promote: (data: Record<string, unknown>) => api.post('/grade-promotions', data),
  },
  graduations: {
    list: (params?: Record<string, string | number>) => api.get('/graduations', { params }),
    graduate: (data: Record<string, unknown>) => api.post('/graduations', data),
  },
  alumni: {
    list: (params?: Record<string, string | number>) => api.get('/alumni', { params }),
  },
  fingerprintMachines: {
    list: (params?: Record<string, string | number>) => api.get('/fingerprint-machines', { params }),
    get: (id: number) => api.get(`/fingerprint-machines/${id}`),
    create: (data: Record<string, unknown>) => api.post('/fingerprint-machines', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/fingerprint-machines/${id}`, data),
    delete: (id: number) => api.delete(`/fingerprint-machines/${id}`),
    sync: (id: number) => api.post(`/fingerprint-machines/${id}/sync`),
  },
};
