import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Badge, Spinner, EmptyState, Avatar, Input, Select } from '@/components/ui';
import type { AttendanceWithProfile, AttendanceStatus } from '@/lib/types';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
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

export function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceWithProfile[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    loadData();
  }, [selectedDate, view]);

  async function loadData() {
    setLoading(true);
    let query = supabase
      .from('attendance')
      .select('*, profiles(full_name, employee_id)')
      .order('date', { ascending: false });

    if (view === 'daily') {
      query = query.eq('date', selectedDate);
    } else {
      const date = new Date(selectedDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      query = query.gte('date', weekStart.toISOString().slice(0, 10)).lte('date', weekEnd.toISOString().slice(0, 10));
    }

    const { data } = await query;
    setRecords((data || []) as AttendanceWithProfile[]);
    setLoading(false);
  }

  const filtered = records.filter((r) => {
    const matchesSearch = !search ||
      r.profiles?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.employee_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    present: records.filter((r) => r.status === 'present' || r.status === 'half_day').length,
    absent: records.filter((r) => r.status === 'absent').length,
    leave: records.filter((r) => r.status === 'leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.work_hours || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all employee attendance</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
          <button onClick={() => setView('daily')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'daily' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>Daily</button>
          <button onClick={() => setView('weekly')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'weekly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>Weekly</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={16} className="text-emerald-500" /><p className="text-xs text-slate-500">Present</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.present}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><XCircle size={16} className="text-rose-500" /><p className="text-xs text-slate-500">Absent</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.absent}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><CalendarDays size={16} className="text-blue-500" /><p className="text-xs text-slate-500">On Leave</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.leave}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-violet-500" /><p className="text-xs text-slate-500">Total Hours</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.totalHours.toFixed(1)}h</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input value={search} onChange={setSearch} placeholder="Search by name or ID..." icon={<Search size={18} />} />
        </div>
        <div className="sm:w-48">
          <Input label="" type="date" value={selectedDate} onChange={setSelectedDate} />
        </div>
        <div className="sm:w-40">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
            options={[
              { value: 'present', label: 'Present' },
              { value: 'absent', label: 'Absent' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'leave', label: 'On Leave' },
              { value: 'weekend', label: 'Weekend' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader title={view === 'daily' ? `Attendance for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : `Week of ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`} />
        {filtered.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={24} />} title="No attendance records" message="No attendance records found for the selected date and filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Employee</th>
                  {view === 'weekly' && <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Date</th>}
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Check In</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Check Out</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Hours</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.profiles?.full_name || 'User'} size={32} />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.profiles?.full_name}</p>
                          <p className="text-xs text-slate-500">{r.profiles?.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    {view === 'weekly' && (
                      <td className="px-6 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                        {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    )}
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                      {r.work_hours > 0 ? `${r.work_hours}h` : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={STATUS_CONFIG[r.status].variant}>
                        {r.status === 'present' && <CheckCircle2 size={12} />}
                        {r.status === 'absent' && <XCircle size={12} />}
                        {r.status === 'half_day' && <Clock size={12} />}
                        {r.status === 'leave' && <CalendarDays size={12} />}
                        {STATUS_CONFIG[r.status].label}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
