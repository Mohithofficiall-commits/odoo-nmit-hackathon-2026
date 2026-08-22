import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Spinner,
  EmptyState,
} from '@/components/ui';
import type { Attendance, LeaveRequest, Payroll } from '@/lib/types';
import {
  Clock,
  CalendarCheck,
  CalendarDays,
  Wallet,
  LogIn,
  LogOut as LogOutIcon,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock3,
} from 'lucide-react';

export function EmployeeDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] =
    useState<Attendance | null>(null);
  const [weekAttendance, setWeekAttendance] = useState<Attendance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);

      const weekAgoDate = weekAgo.toISOString().slice(0, 10);

      const [
        todayRes,
        weekRes,
        leavesRes,
        payrollRes,
      ] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', profile.id)
          .eq('date', today)
          .maybeSingle(),

        supabase
          .from('attendance')
          .select('*')
          .eq('employee_id', profile.id)
          .gte('date', weekAgoDate)
          .order('date', { ascending: false }),

        supabase
          .from('leave_requests')
          .select('*')
          .eq('employee_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('payroll')
          .select('*')
          .eq('employee_id', profile.id)
          .order('payroll_month', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (todayRes.error) {
        console.error('Failed to load today attendance:', todayRes.error);
      }

      if (weekRes.error) {
        console.error('Failed to load weekly attendance:', weekRes.error);
      }

      if (leavesRes.error) {
        console.error('Failed to load leave requests:', leavesRes.error);
      }

      if (payrollRes.error) {
        console.error('Failed to load payroll:', payrollRes.error);
      }

      setTodayAttendance(todayRes.data as Attendance | null);
      setWeekAttendance((weekRes.data ?? []) as Attendance[]);
      setRecentLeaves((leavesRes.data ?? []) as LeaveRequest[]);
      setPayroll(payrollRes.data as Payroll | null);
    } catch (error) {
      console.error('Error loading employee dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!profile || actionLoading) return;

    setActionLoading(true);

    try {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          employee_id: profile.id,
          date: today,
          check_in: now.toISOString(),
          status: 'present',
          work_hours: 0,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Check-in failed:', error);
        return;
      }

      if (data) {
        setTodayAttendance(data as Attendance);
      }
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    if (!todayAttendance || actionLoading) return;

    setActionLoading(true);

    try {
      const now = new Date();

      if (!todayAttendance.check_in) {
        console.error('Cannot check out without a check-in time.');
        return;
      }

      const checkInTime = new Date(todayAttendance.check_in);

      const hours =
        (now.getTime() - checkInTime.getTime()) /
        (1000 * 60 * 60);

      const roundedHours = Math.round(hours * 100) / 100;

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString(),
          work_hours: roundedHours,
        })
        .eq('id', todayAttendance.id)
        .select('*')
        .single();

      if (error) {
        console.error('Check-out failed:', error);
        return;
      }

      if (data) {
        setTodayAttendance(data as Attendance);
      }
    } catch (error) {
      console.error('Check-out error:', error);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const isCheckedIn = !!todayAttendance?.check_in;
  const isCheckedOut = !!todayAttendance?.check_out;

  const presentDays = weekAttendance.filter(
    (attendance) =>
      attendance.status === 'present' ||
      attendance.status === 'half_day'
  ).length;

  const totalWorkHours = weekAttendance.reduce(
    (sum, attendance) => sum + (attendance.work_hours || 0),
    0
  );

  const leaveStats = {
    pending: recentLeaves.filter(
      (leave) => leave.status === 'pending'
    ).length,

    approved: recentLeaves.filter(
      (leave) => leave.status === 'approved'
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          {today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Attendance Action Card */}
      <Card className="overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isCheckedIn
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Clock size={28} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Today's Attendance
              </h3>

              {isWeekend ? (
                <p className="text-sm text-slate-500">
                  Weekend — no attendance required
                </p>
              ) : isCheckedOut ? (
                <p className="text-sm text-slate-500">
                  Checked in at{' '}
                  {new Date(
                    todayAttendance!.check_in!
                  ).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  Checked out at{' '}
                  {new Date(
                    todayAttendance!.check_out!
                  ).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : isCheckedIn ? (
                <p className="text-sm text-slate-500">
                  Checked in at{' '}
                  {new Date(
                    todayAttendance!.check_in!
                  ).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  You haven't checked in yet today
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {!isWeekend && !isCheckedIn && (
              <Button
                onClick={handleCheckIn}
                disabled={actionLoading}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <LogIn size={18} />
                Check In
              </Button>
            )}

            {!isWeekend && isCheckedIn && !isCheckedOut && (
              <Button
                onClick={handleCheckOut}
                disabled={actionLoading}
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
              >
                <LogOutIcon size={18} />
                Check Out
              </Button>
            )}

            {isCheckedOut && (
              <Badge variant="success">
                <CheckCircle2 size={14} />
                Day complete
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Present Days */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {presentDays}
          </p>

          <p className="text-sm text-slate-500">
            Days present this week
          </p>
        </Card>

        {/* Work Hours */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {totalWorkHours.toFixed(1)}h
          </p>

          <p className="text-sm text-slate-500">
            Working hours this week
          </p>
        </Card>

        {/* Pending Leaves */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock3 size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {leaveStats.pending}
          </p>

          <p className="text-sm text-slate-500">
            Pending leave requests
          </p>
        </Card>

        {/* Salary */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {payroll
              ? `$${payroll.net_salary.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                })}`
              : '—'}
          </p>

          <p className="text-sm text-slate-500">
            Monthly net salary
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Apply Leave */}
          <button
            onClick={() => navigate('/leave')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Plus size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Apply for Leave
              </p>

              <p className="text-xs text-slate-500">
                Submit a new request
              </p>
            </div>
          </button>

          {/* View Attendance */}
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                View Attendance
              </p>

              <p className="text-xs text-slate-500">
                Check your history
              </p>
            </div>
          </button>

          {/* View Payroll */}
          <button
            onClick={() => navigate('/payroll')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                View Payroll
              </p>

              <p className="text-xs text-slate-500">
                Salary details
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader
          title="Recent Leave Requests"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leave')}
            >
              View all
            </Button>
          }
        />

        {recentLeaves.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title="No leave requests yet"
            message="When you apply for leave, your requests will appear here."
            action={
              <Button
                size="sm"
                onClick={() => navigate('/leave')}
              >
                Apply for leave
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeaves.map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      leave.leave_type === 'paid'
                        ? 'bg-blue-50 text-blue-600'
                        : leave.leave_type === 'sick'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {leave.leave_type === 'paid' ? (
                      <Wallet size={16} />
                    ) : leave.leave_type === 'sick' ? (
                      <XCircle size={16} />
                    ) : (
                      <CalendarDays size={16} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {leave.leave_type} leave
                    </p>

                    <p className="text-xs text-slate-500">
                      {new Date(
                        leave.start_date
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      —{' '}
                      {new Date(
                        leave.end_date
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    leave.status === 'approved'
                      ? 'success'
                      : leave.status === 'rejected'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {leave.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}