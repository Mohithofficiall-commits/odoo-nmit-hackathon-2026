import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Badge, Spinner, Avatar } from '@/components/ui';
import type { LeaveWithProfile } from '@/lib/types';
import {
  Users,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock3,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Percent,
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveWithProfile[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<
    { date: string; present: number; absent: number; leave: number }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);

    const [empRes, attRes, leavesRes] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }),

      supabase
        .from('attendance')
        .select('status')
        .eq('date', today),

      supabase
        .from('leave_requests')
        .select(
          '*, profiles(full_name, employee_id, avatar_url)'
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    setTotalEmployees(empRes.count || 0);

    const todayStatuses = (attRes.data || []).map(
      (a: { status: string }) => a.status
    );

    setPresentToday(
      todayStatuses.filter(
        (s) => s === 'present' || s === 'half_day'
      ).length
    );

    setAbsentToday(
      todayStatuses.filter((s) => s === 'absent').length
    );

    setOnLeaveToday(
      todayStatuses.filter((s) => s === 'leave').length
    );

    setPendingLeaves(
      (leavesRes.data || []) as LeaveWithProfile[]
    );

    // Weekly attendance summary
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const { data: weekAtt } = await supabase
      .from('attendance')
      .select('date, status')
      .gte('date', weekAgo.toISOString().slice(0, 10))
      .order('date', { ascending: true });

    if (weekAtt) {
      const byDate: Record<
        string,
        { present: number; absent: number; leave: number }
      > = {};

      for (const a of weekAtt as {
        date: string;
        status: string;
      }[]) {
        if (!byDate[a.date]) {
          byDate[a.date] = {
            present: 0,
            absent: 0,
            leave: 0,
          };
        }

        if (
          a.status === 'present' ||
          a.status === 'half_day'
        ) {
          byDate[a.date].present++;
        } else if (a.status === 'absent') {
          byDate[a.date].absent++;
        } else if (a.status === 'leave') {
          byDate[a.date].leave++;
        }
      }

      setWeeklyAttendance(
        Object.entries(byDate).map(([date, v]) => ({
          date,
          ...v,
        }))
      );
    }

    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const totalToday =
    presentToday + absentToday + onLeaveToday;

  const attendancePercentage =
    totalEmployees > 0
      ? Math.round((presentToday / totalEmployees) * 100)
      : 0;

  const maxAttendance = Math.max(
    ...weeklyAttendance.map(
      (d) => d.present + d.absent + d.leave
    ),
    1
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Last updated:{' '}
            {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'animate-spin' : ''}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Total Employees */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {totalEmployees}
          </p>

          <p className="text-sm text-slate-500">
            Total Employees
          </p>
        </Card>

        {/* Present */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {presentToday}
          </p>

          <p className="text-sm text-slate-500">
            Present Today
          </p>
        </Card>

        {/* Absent */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {absentToday}
          </p>

          <p className="text-sm text-slate-500">
            Absent Today
          </p>
        </Card>

        {/* Leave */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {onLeaveToday}
          </p>

          <p className="text-sm text-slate-500">
            On Leave Today
          </p>
        </Card>

        {/* Attendance Percentage - NEW */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Percent size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {attendancePercentage}%
          </p>

          <p className="text-sm text-slate-500">
            Attendance Rate
          </p>
        </Card>

      </div>

      {/* Today's Summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-900">
              Today's Attendance
            </h2>

            <p className="text-xs text-slate-500">
              {totalToday} attendance records
            </p>
          </div>

          <TrendingUp
            size={20}
            className="text-emerald-500"
          />
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">

          {totalEmployees > 0 && (
            <>
              <div
                className="bg-emerald-500"
                style={{
                  width: `${(presentToday / totalEmployees) * 100}%`,
                }}
              />

              <div
                className="bg-rose-400"
                style={{
                  width: `${(absentToday / totalEmployees) * 100}%`,
                }}
              />

              <div
                className="bg-blue-400"
                style={{
                  width: `${(onLeaveToday / totalEmployees) * 100}%`,
                }}
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-5 mt-3">

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-slate-500">
              Present ({presentToday})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-400" />
            <span className="text-xs text-slate-500">
              Absent ({absentToday})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span className="text-xs text-slate-500">
              Leave ({onLeaveToday})
            </span>
          </div>

        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly attendance chart */}
        <Card>
          <CardHeader
            title="Weekly Attendance"
            subtitle="Last 7 days overview"
          />

          <div className="p-6">

            {weeklyAttendance.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No data available
              </p>
            ) : (
              <div className="space-y-3">

                {weeklyAttendance.map((d) => {

                  const total =
                    d.present +
                    d.absent +
                    d.leave;

                  const width =
                    (total / maxAttendance) * 100;

                  return (
                    <div key={d.date}>

                      <div className="flex items-center justify-between mb-1">

                        <span className="text-xs text-slate-500">
                          {new Date(d.date).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>

                        <span className="text-xs font-medium text-slate-700">
                          {total} records
                        </span>

                      </div>

                      <div
                        className="h-6 bg-slate-100 rounded-md overflow-hidden flex"
                        style={{
                          width: `${Math.max(width, 5)}%`,
                        }}
                      >

                        <div
                          className="bg-emerald-500"
                          style={{
                            width: `${(d.present / total) * 100}%`,
                          }}
                        />

                        <div
                          className="bg-rose-400"
                          style={{
                            width: `${(d.absent / total) * 100}%`,
                          }}
                        />

                        <div
                          className="bg-blue-400"
                          style={{
                            width: `${(d.leave / total) * 100}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

                <div className="flex gap-4 pt-2">

                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="text-xs text-slate-500">
                      Present
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-rose-400" />
                    <span className="text-xs text-slate-500">
                      Absent
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-400" />
                    <span className="text-xs text-slate-500">
                      Leave
                    </span>
                  </div>

                </div>

              </div>
            )}

          </div>
        </Card>

        {/* Pending leave requests */}
        <Card>

          <CardHeader
            title="Pending Leave Requests"
            subtitle={`${pendingLeaves.length} awaiting approval`}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate('/admin/leaves')
                }
              >
                View all
              </Button>
            }
          />

          {pendingLeaves.length === 0 ? (

            <div className="p-6 text-center">

              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                <CheckCircle2 size={24} />
              </div>

              <p className="text-sm text-slate-500">
                All caught up! No pending requests.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {pendingLeaves.map((leave) => (

                <div
                  key={leave.id}
                  className="px-6 py-4 flex items-center justify-between"
                >

                  <div className="flex items-center gap-3">

                    <Avatar
                      name={
                        leave.profiles?.full_name ||
                        'User'
                      }
                      src={
                        leave.profiles?.avatar_url
                      }
                      size={36}
                    />

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        {leave.profiles?.full_name}
                      </p>

                      <p className="text-xs text-slate-500 capitalize">

                        {leave.leave_type} ·{' '}

                        {new Date(
                          leave.start_date
                        ).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}

                        {' — '}

                        {new Date(
                          leave.end_date
                        ).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}

                      </p>

                    </div>

                  </div>

                  <Badge variant="warning">
                    <Clock3 size={12} />
                    Pending
                  </Badge>

                </div>

              ))}

            </div>

          )}

        </Card>

      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <button
          onClick={() =>
            navigate('/employees')
          }
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
        >

          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Users size={20} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Manage Employees
            </p>

            <p className="text-xs text-slate-500">
              View and edit profiles
            </p>
          </div>

          <ArrowRight
            size={16}
            className="text-slate-400"
          />

        </button>

        <button
          onClick={() =>
            navigate('/admin/attendance')
          }
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
        >

          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Attendance
            </p>

            <p className="text-xs text-slate-500">
              View all records
            </p>
          </div>

          <ArrowRight
            size={16}
            className="text-slate-400"
          />

        </button>

        <button
          onClick={() =>
            navigate('/admin/payroll')
          }
          className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-400 transition-colors text-left"
        >

          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Payroll
            </p>

            <p className="text-xs text-slate-500">
              Manage salaries
            </p>
          </div>

          <ArrowRight
            size={16}
            className="text-slate-400"
          />

        </button>

      </div>

    </div>
  );
}
