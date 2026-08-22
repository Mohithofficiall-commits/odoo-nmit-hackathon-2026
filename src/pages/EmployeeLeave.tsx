import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Badge, Spinner, EmptyState, Modal, Select, Textarea, Input } from '@/components/ui';
import type { LeaveRequest, LeaveType, LeaveStatus } from '@/lib/types';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock3,
  Wallet,
  Heart,
  CalendarOff,
} from 'lucide-react';

const LEAVE_TYPE_ICON: Record<LeaveType, typeof Wallet> = {
  paid: Wallet,
  sick: Heart,
  unpaid: CalendarOff,
};

const STATUS_CONFIG: Record<LeaveStatus, { variant: 'success' | 'error' | 'warning' }> = {
  pending: { variant: 'warning' },
  approved: { variant: 'success' },
  rejected: { variant: 'error' },
};

export function EmployeeLeave() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all');

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (profile) loadLeaves();
  }, [profile]);

  async function loadLeaves() {
    setLoading(true);
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', profile!.id)
      .order('created_at', { ascending: false });
    setLeaves((data || []) as LeaveRequest[]);
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('leave_requests').insert({
      employee_id: profile!.id,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      remarks,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setShowModal(false);
      setLeaveType('paid');
      setStartDate('');
      setEndDate('');
      setRemarks('');
      await loadLeaves();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const filtered = filter === 'all' ? leaves : leaves.filter((l) => l.status === filter);
  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  // Leave balance (simplified: 20 paid, 12 sick, 5 unpaid per year, minus approved)
  const approvedByType = (type: LeaveType) => leaves.filter((l) => l.leave_type === type && l.status === 'approved').length;
  const balances = [
    { type: 'paid' as LeaveType, total: 20, used: approvedByType('paid'), label: 'Paid Leave' },
    { type: 'sick' as LeaveType, total: 12, used: approvedByType('sick'), label: 'Sick Leave' },
    { type: 'unpaid' as LeaveType, total: 5, used: approvedByType('unpaid'), label: 'Unpaid Leave' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="text-slate-500 text-sm mt-1">Apply for and track your leave requests</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} /> Apply for Leave
        </Button>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b) => {
          const Icon = LEAVE_TYPE_ICON[b.type];
          return (
            <Card key={b.type} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  b.type === 'paid' ? 'bg-blue-50 text-blue-600' :
                  b.type === 'sick' ? 'bg-rose-50 text-rose-600' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs text-slate-400">Annual</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{b.total - b.used}</p>
              <p className="text-sm text-slate-500">{b.label} remaining</p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  b.type === 'paid' ? 'bg-blue-500' :
                  b.type === 'sick' ? 'bg-rose-500' :
                  'bg-slate-400'
                }`} style={{ width: `${(b.used / b.total) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{b.used} used / {b.total} total</p>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 size={16} className="text-amber-500" />
            <p className="text-xs text-slate-500">Pending</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs text-slate-500">Approved</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-rose-500" />
            <p className="text-xs text-slate-500">Rejected</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.rejected}</p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leave list */}
      <Card>
        <CardHeader title="Leave Requests" />
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title="No leave requests"
            message="You haven't submitted any leave requests yet. Click 'Apply for Leave' to get started."
            action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={16} /> Apply for Leave</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((leave) => {
              const Icon = LEAVE_TYPE_ICON[leave.leave_type];
              const days = Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div key={leave.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      leave.leave_type === 'paid' ? 'bg-blue-50 text-blue-600' :
                      leave.leave_type === 'sick' ? 'bg-rose-50 text-rose-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 capitalize">{leave.leave_type} Leave</p>
                      <p className="text-xs text-slate-500">
                        {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {days} day{days > 1 ? 's' : ''}
                      </p>
                      {leave.remarks && <p className="text-xs text-slate-400 mt-0.5">{leave.remarks}</p>}
                      {leave.admin_comment && (
                        <p className="text-xs text-slate-500 mt-1 italic">HR: "{leave.admin_comment}"</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={STATUS_CONFIG[leave.status].variant}>
                    {leave.status === 'pending' && <Clock3 size={12} />}
                    {leave.status === 'approved' && <CheckCircle2 size={12} />}
                    {leave.status === 'rejected' && <XCircle size={12} />}
                    {leave.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Apply for Leave">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            value={leaveType}
            onChange={(v) => setLeaveType(v as LeaveType)}
            required
            options={[
              { value: 'paid', label: 'Paid Leave' },
              { value: 'sick', label: 'Sick Leave' },
              { value: 'unpaid', label: 'Unpaid Leave' },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={setStartDate}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={setEndDate}
              required
            />
          </div>
          <Textarea
            label="Remarks"
            value={remarks}
            onChange={setRemarks}
            placeholder="Reason for leave (optional)"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
