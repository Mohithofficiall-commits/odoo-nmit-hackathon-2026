import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: string;
  check_in?: string | null;
  check_out?: string | null;
  employees?: {
    name?: string | null;
    employee_id?: string | null;
    department?: string | null;
  } | null;
}

const statusStyles: Record<string, string> = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-700',
  late: 'bg-amber-50 text-amber-700',
  leave: 'bg-blue-50 text-blue-700',
};

export default function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  async function fetchAttendance() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select(`
          id,
          employee_id,
          date,
          status,
          check_in,
          check_out,
          employees (
            name,
            employee_id,
            department
          )
        `)
        .eq('date', selectedDate)
        .order('check_in', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setRecords((data ?? []) as unknown as AttendanceRecord[]);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setError('Unable to load attendance records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter((record) => {
      const employee = record.employees;

      const matchesSearch =
        !query ||
        employee?.name?.toLowerCase().includes(query) ||
        employee?.employee_id?.toLowerCase().includes(query) ||
        employee?.department?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        record.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: records.length,
      present: records.filter(
        (record) => record.status?.toLowerCase() === 'present'
      ).length,
      absent: records.filter(
        (record) => record.status?.toLowerCase() === 'absent'
      ).length,
      late: records.filter(
        (record) => record.status?.toLowerCase() === 'late'
      ).length,
    };
  }, [records]);

  function formatTime(value?: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function exportCSV() {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Department',
      'Date',
      'Status',
      'Check In',
      'Check Out',
    ];

    const rows = filteredRecords.map((record) => [
      record.employees?.employee_id ?? record.employee_id,
      record.employees?.name ?? '',
      record.employees?.department ?? '',
      record.date,
      record.status,
      formatTime(record.check_in),
      formatTime(record.check_out),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-600" />

              <h1 className="text-2xl font-bold text-slate-900">
                Attendance Management
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Monitor and manage employee attendance.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Records"
            value={statistics.total}
            icon={<UserCheck className="h-5 w-5" />}
          />

          <StatCard
            title="Present"
            value={statistics.present}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />

          <StatCard
            title="Absent"
            value={statistics.absent}
            icon={<UserX className="h-5 w-5" />}
          />

          <StatCard
            title="Late"
            value={statistics.late}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeader>Employee</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Check In</TableHeader>
                  <TableHeader>Check Out</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const status =
                      record.status?.toLowerCase() ?? 'unknown';

                    return (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {record.employees?.name ?? 'Unknown Employee'}
                            </p>

                            <p className="text-xs text-slate-500">
                              {record.employees?.employee_id ??
                                record.employee_id}
                            </p>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {record.employees?.department ?? '—'}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {record.date}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatTime(record.check_in)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatTime(record.check_out)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              statusStyles[status] ??
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {record.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}