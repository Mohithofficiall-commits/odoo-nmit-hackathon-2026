import { supabase } from '../supabase';

/**
 * Dashboard Service
 * Centralizes dashboard-related Supabase queries.
 */

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
}

export interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
}

/**
 * Get dashboard statistics.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  const [
    employeesResult,
    attendanceResult,
    leavesResult,
  ] = await Promise.all([
    supabase
      .from('employees')
      .select('id', { count: 'exact', head: true }),

    supabase
      .from('attendance')
      .select('status')
      .eq('date', today),

    supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  if (employeesResult.error) {
    throw employeesResult.error;
  }

  if (attendanceResult.error) {
    throw attendanceResult.error;
  }

  if (leavesResult.error) {
    throw leavesResult.error;
  }

  const attendance = attendanceResult.data ?? [];

  const presentToday = attendance.filter(
    (record) =>
      record.status?.toLowerCase() === 'present'
  ).length;

  const absentToday = attendance.filter(
    (record) =>
      record.status?.toLowerCase() === 'absent'
  ).length;

  return {
    totalEmployees: employeesResult.count ?? 0,
    presentToday,
    absentToday,
    pendingLeaves: leavesResult.count ?? 0,
  };
}

/**
 * Get attendance summary for a date range.
 */
export async function getAttendanceSummary(
  startDate: string,
  endDate: string
): Promise<AttendanceSummary[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('date, status')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  const grouped = new Map<string, AttendanceSummary>();

  for (const record of data ?? []) {
    if (!grouped.has(record.date)) {
      grouped.set(record.date, {
        date: record.date,
        present: 0,
        absent: 0,
        late: 0,
      });
    }

    const summary = grouped.get(record.date)!;
    const status = record.status?.toLowerCase();

    if (status === 'present') {
      summary.present++;
    } else if (status === 'absent') {
      summary.absent++;
    } else if (status === 'late') {
      summary.late++;
    }
  }

  return Array.from(grouped.values());
}

/**
 * Get recent announcements.
 */
export async function getRecentAnnouncements(limit = 5) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Get pending leave requests.
 */
export async function getPendingLeaveRequests(limit = 10) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Get employees.
 */
export async function getEmployees(limit = 50) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Get current user's profile.
 */
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}