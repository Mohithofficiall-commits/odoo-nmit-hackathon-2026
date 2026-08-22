import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Badge, Spinner, EmptyState } from '@/components/ui';
import type { Attendance, AttendanceStatus } from '@/lib/types';
import {
  LogIn,
  LogOut as LogOutIcon,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }> = {
  present: { label: 'Present', variant: 'success' },
  absent: { label: 'Absent', variant: 'error' },
  half_day: { label: 'Half Day', variant: 'warning' },
  leave: { label: 'On Leave', variant: 'info' },
  weekend: { label: 'Weekend', variant: 'neutral' },
};

export function EmployeeAttendance() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
    const today = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', profile!.id)
      .gte('date', twoWeeksAgo.toISOString().slice(0, 10))
      .order('date', { ascending: false });

    const allRecords = (data || []) as Attendance[];
    setRecords(allRecords);
    setTodayRecord(allRecords.find((r) => r.date === today) || null);
    setLoading(false);
  }

  async function handleCheckIn() {
    setActionLoading(true);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const { data } = await supabase
      .from('attendance')
      .insert({
        employee_id: profile!.id,
        date: today,
        check_in: now.toISOString(),
        status: 'present',
        work_hours: 0,
      })
      .select('*')
      .single();
    if (data) {
      setTodayRecord(data as Attendance);
      setRecords([data as Attendance, ...records]);
    }
    setActionLoading(false);
  }

  async function handleCheckOut() {
    if (!todayRecord) return;
    setActionLoading(true);
    const now = new Date();
    const checkInTime = new Date(todayRecord.check_in!);
    const hours = Math.round(((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100;

    const { data } = await supabase
      .from('attendance')
      .update({ check_out: now.toISOString(), work_hours: hours })
      .eq('id', todayRecord.id)
      .select('*')
      .single();

    if (data) {
      setTodayRecord(data as Attendance);
      setRecords(records.map((r) => (r.id === data.id ? data as Attendance : r)));
    }
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const isCheckedIn = !!todayRecord?.check_in;
  const isCheckedOut = !!todayRecord?.check_out;

  const stats = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    halfDay: records.filter((r) => r.status === 'half_day').length,
    leave: records.filter((r) => r.status === 'leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.work_hours || 0), 0),
  };

  const dailyRecords = view === 'daily' ? records.slice(0, 14) : records;
  const weeklyData = getWeeklyData(records);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track your check-in and check-out</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            onClick={() => setView('daily')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Check-in / Check-out card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isCheckedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Today's Status</h3>
              {isWeekend ? (
                <p className="text-sm text-slate-500">Weekend — no attendance required</p>
              ) : isCheckedOut ? (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>In: {new Date(todayRecord!.check_in!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>Out: {new Date(todayRecord!.check_out!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>· {todayRecord!.work_hours}h</span>
                </div>
              ) : isCheckedIn ? (
                <p className="text-sm text-slate-500">
                  Checked in at {new Date(todayRecord!.check_in!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              ) : (
                <p className="text-sm text-slate-500">Not checked in yet</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isWeekend && !isCheckedIn && (
              <Button onClick={handleCheckIn} disabled={actionLoading} size="lg" className="flex-1 sm:flex-none">
                <LogIn size={18} /> Check In
              </Button>
            )}
            {!isWeekend && isCheckedIn && !isCheckedOut && (
              <Button onClick={handleCheckOut} disabled={actionLoading} variant="secondary" size="lg" className="flex-1 sm:flex-none">
                <LogOutIcon size={18} /> Check Out
              </Button>
            )}
            {isCheckedOut && <Badge variant="success"><CheckCircle2 size={14} /> Complete</Badge>}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs text-slate-500">Present</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.present}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-rose-500" />
            <p className="text-xs text-slate-500">Absent</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.absent}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-500" />
            <p className="text-xs text-slate-500">Half Day</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.halfDay}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-blue-500" />
            <p className="text-xs text-slate-500">On Leave</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.leave}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-violet-500" />
            <p className="text-xs text-slate-500">Total Hours</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.totalHours.toFixed(1)}h</p>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader title={view === 'daily' ? 'Daily Attendance History' : 'Weekly Summary'} />
        {dailyRecords.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={24} />} title="No attendance records" message="Your attendance history will appear here once you start checking in." />
        ) : view === 'daily' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Day</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Check In</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Check Out</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Hours</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dailyRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-sm text-slate-900">
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">
                      {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {r.work_hours > 0 ? `${r.work_hours}h` : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={STATUS_CONFIG[r.status].variant}>{STATUS_CONFIG[r.status].label}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {weeklyData.map((week) => (
              <div key={week.weekStart} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Week of {week.weekStart}
                  </p>
                  <Badge variant="neutral">{week.totalHours.toFixed(1)}h total</Badge>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {week.days.map((day) => (
                    <div key={day.date} className="text-center">
                      <p className="text-xs text-slate-400 mb-1">{day.dayName}</p>
                      <div className={`h-12 rounded-md flex items-center justify-center text-xs font-medium ${
                        day.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        day.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                        day.status === 'half_day' ? 'bg-amber-100 text-amber-700' :
                        day.status === 'leave' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {day.hours > 0 ? `${day.hours}h` : day.status === 'absent' ? 'A' : day.status === 'leave' ? 'L' : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getWeeklyData(records: Attendance[]) {
  const grouped: Record<string, Attendance[]> = {};
  for (const r of records) {
    const date = new Date(r.date);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    const key = weekStart.toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  return Object.entries(grouped)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([weekStart, recs]) => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const rec = recs.find((r) => r.date === dateStr);
        return {
          date: dateStr,
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          status: rec?.status || 'weekend' as AttendanceStatus,
          hours: rec?.work_hours || 0,
        };
      });
      return {
        weekStart: new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        days,
        totalHours: recs.reduce((s, r) => s + (r.work_hours || 0), 0),
      };
    });
}
