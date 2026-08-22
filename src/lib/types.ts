export type UserRole = 'admin' | 'employee';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  employee_id: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  profile_id: string | null;
  employee_id: string;
  department: string | null;
  designation: string | null;
  employment_type: string | null;
  join_date: string | null;
  status: string;
  manager: string | null;
  work_location: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'weekend';

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  work_hours: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  remarks: string | null;
  admin_comment: string | null;
  status: LeaveStatus;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  base_salary: number;
  hra: number;
  da: number;
  transport_allowance: number;
  medical_allowance: number;
  tax_deduction: number;
  provident_fund: number;
  net_salary: number;
  payroll_month: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveWithProfile extends LeaveRequest {
  profiles: { full_name: string; employee_id: string | null; avatar_url: string | null } | null;
}

export interface AttendanceWithProfile extends Attendance {
  profiles: { full_name: string; employee_id: string | null } | null;
}

export interface EmployeeWithProfile extends Employee {
  profiles: { full_name: string; email: string; phone: string | null; address: string | null; avatar_url: string | null; role: string } | null;
}

export interface PayrollWithProfile extends Payroll {
  profiles: { full_name: string; employee_id: string | null; avatar_url: string | null } | null;
  employees: { department: string | null; designation: string | null } | null;
}
