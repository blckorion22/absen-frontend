export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'teacher' | 'staff' | 'student';
  student_id?: number;
}

export interface ClassRoom {
  id: number;
  name: string;
  grade: string;
  academic_year: string;
  teacher_name: string;
  teacher_id: number;
  description?: string;
  student_count: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  class_id: number;
  class_name?: string;
  class_room?: {
    id: number;
    name: string;
    grade: string;
  };
  parent_name: string;
  parent_phone: string;
  address: string;
  phone?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface Attendance {
  id: number;
  student_id: number;
  student_name: string;
  student_nis: string;
  class_id: number;
  class_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  note?: string;
  evidence_path?: string | null;
  student?: Student;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_students: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  excused_today?: number;
  checked_in_today?: number;
  checked_out_today?: number;
  present_percentage?: number;
  total_classes: number;
  date?: string;
  weekly_data: WeeklyAttendance[];
  recent_activities: Activity[];
}

export interface WeeklyAttendance {
  date: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
}

export interface MonthlyAttendance {
  date: string;
  day_name: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
}

export interface Activity {
  id: number;
  type: 'check_in' | 'check_out' | 'added' | 'updated';
  description: string;
  student_name: string;
  time: string;
}

export interface AttendanceReport {
  summary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    percentage: number;
  };
  data: Attendance[];
}

export interface WhatsAppLog {
  id: number;
  phone: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  student_name?: string;
  sent_at: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherAttendance {
  id: number;
  user_id: number;
  user?: User;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'present' | 'late' | 'absent';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ClassFormData {
  name: string;
  grade: string;
  academic_year: string;
  teacher_id: number;
  description?: string;
}

export interface StudentFormData {
  nis: string;
  name: string;
  gender: 'L' | 'P';
  class_id: number;
  parent_name: string;
  parent_phone: string;
  address: string;
  phone?: string;
}

export interface GradePromotion {
  id: number;
  student_id: number;
  student: Student;
  from_grade: string;
  to_grade: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Graduation {
  id: number;
  student_id: number;
  student: Student;
  graduation_year: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Mutation {
  id: number;
  student_id: number;
  student: Student;
  type: 'in' | 'out';
  date: string;
  from_school?: string;
  to_school?: string;
  reason: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Alumni {
  id: number;
  student_id: number;
  student: Student;
  graduation_year: string;
  graduation_date: string;
  created_at: string;
}

export interface TrackingStudent {
  id: number;
  student_id: number;
  student: Student;
  latitude: string;
  longitude: string;
  timestamp: string;
  status: string;
}

export interface Position {
  id: number;
  name: string;
  allowance: number;
  created_at: string;
  updated_at: string;
}

export interface Deduction {
  id: number;
  name: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface Salary {
  id: number;
  user_id: number;
  user?: User;
  month: string;
  year: string;
  base_salary: number;
  total_allowance: number;
  total_deduction: number;
  net_salary: number;
  created_at: string;
  updated_at: string;
}

