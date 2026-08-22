import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, Button, Badge, Spinner, EmptyState, Avatar, Modal, Textarea } from '@/components/ui';
import type { LeaveWithProfile, LeaveStatus } from '@/lib/types';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  Wallet,
  Heart,
  CalendarOff,
  MessageSquare,
} from 'lucide-react';

const LEAVE_TYPE_ICON: Record<string, typeof Wallet> = {
  paid: Wallet,
  sick: Heart,
  unpaid: CalendarOff,
};

const STATUS_CONFIG: Record<LeaveStatus, { variant: 'success' | 'error' | 'warning' }> = {
  pending: { variant: 'warning' },
  approved: { variant: 'success' },
  rejected: { variant: 'error' },
};

export function AdminLeaveApproval() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<LeaveWithProfile[]>([]);
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all');
  const [actionLeave, setActionLeave] = useState<LeaveWithProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  async function loadLeaves() {
    setLoading(true);
    const { data } = await supabase
      .from('leave_requests')
      .select('*, profiles(full_name, employee_id, avatar_url)')
      .order('created_at', { ascending: false });
    setLeaves((data || []) as LeaveWithProfile[]);
    setLoading(false);
  }

  const filtered = filter === 'all' ? leaves : leaves.filter((l) => l.status === filter);

  function openAction(leave: LeaveWithProfile, type: 'approve' | 'reject') {
    setActionLeave(leave);
    setActionType(type);
    setAdminComment('');
  }

  async function handleAction() {
    if (!actionLeave) return;
    setSubmitting(true);
    const newStatus: LeaveStatus = actionType === 'approve' ? 'approved' : 'rejected';
    const { error } = await supabase
      .from('leave_requests')
      .update({ status: newStatus, admin_comment: adminComment || null })
      .eq('id', actionLeave.id);

    if (!error) {
      setLeaves(leaves.map((l) => l.id === actionLeave.id ? { ...l, status: newStatus, admin_comment: adminComment || null } : l));
      setActionLeave(null);
      setAdminComment('');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const stats = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave Approval</h1>
        <p className="text-slate-500 text-sm mt-1">Review and manage all leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock3 size={16} className="text-amber-500" /><p className="text-xs text-slate-500">Pending</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={16} className="text-emerald-500" /><p className="text-xs text-slate-500">Approved</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1"><XCircle size={16} className="text-rose-500" /><p className="text-xs text-slate-500">Rejected</p></div>
          <p className="text-xl font-bold text-slate-900">{stats.rejected}</p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Leave requests */}
      <Card>
        <CardHeader title="All Leave Requests" />
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={24} />} title="No leave requests" message="There are no leave requests matching this filter." />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((leave) => {
              const Icon = LEAVE_TYPE_ICON[leave.leave_type] || CalendarDays;
              const days = Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div key={leave.id} className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar name={leave.profiles?.full_name || 'User'} src={leave.profiles?.avatar_url} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{leave.profiles?.full_name}</p>
                        <Badge variant="neutral">{leave.profiles?.employee_id}</Badge>
                        <Badge variant={STATUS_CONFIG[leave.status].variant}>
                          {leave.status === 'pending' && <Clock3 size={12} />}
                          {leave.status === 'approved' && <CheckCircle2 size={12} />}
                          {leave.status === 'rejected' && <XCircle size={12} />}
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${leave.leave_type === 'paid' ? 'bg-blue-50 text-blue-600' : leave.leave_type === 'sick' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Icon size={12} />
                        </div>
                        <span className="text-xs text-slate-500 capitalize">{leave.leave_type} leave · {days} day{days > 1 ? 's' : ''}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {leave.remarks && <p className="text-xs text-slate-400 mt-1">"{leave.remarks}"</p>}
                      {leave.admin_comment && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <MessageSquare size={12} className="text-slate-400 mt-0.5" />
                          <p className="text-xs text-slate-500 italic">{leave.admin_comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {leave.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="success" onClick={() => openAction(leave, 'approve')}>
                        <CheckCircle2 size={16} /> Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openAction(leave, 'reject')}>
                        <XCircle size={16} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Action Modal */}
      <Modal open={!!actionLeave} onClose={() => setActionLeave(null)} title={actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}>
        {actionLeave && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={actionLeave.profiles?.full_name || 'User'} src={actionLeave.profiles?.avatar_url} size={36} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{actionLeave.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{actionLeave.leave_type} leave · {new Date(actionLeave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(actionLeave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              {actionLeave.remarks && <p className="text-xs text-slate-500 mt-2">Reason: "{actionLeave.remarks}"</p>}
            </div>
            <Textarea
              label="Admin Comment (optional)"
              value={adminComment}
              onChange={setAdminComment}
              placeholder={actionType === 'approve' ? 'Add a note for the employee...' : 'Reason for rejection...'}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setActionLeave(null)}>Cancel</Button>
              <Button variant={actionType === 'approve' ? 'success' : 'danger'} onClick={handleAction} disabled={submitting}>
                {submitting ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
