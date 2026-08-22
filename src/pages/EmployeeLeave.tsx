import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Modal,
  Select,
  Textarea,
  Input,
} from '@/components/ui';

import type {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
} from '@/lib/types';

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

/* =========================================================
   LEAVE TYPE ICONS
========================================================= */

const LEAVE_TYPE_ICON: Record<
  LeaveType,
  typeof Wallet
> = {
  paid: Wallet,
  sick: Heart,
  unpaid: CalendarOff,
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG: Record<
  LeaveStatus,
  {
    variant: 'success' | 'error' | 'warning';
  }
> = {
  pending: {
    variant: 'warning',
  },
  approved: {
    variant: 'success',
  },
  rejected: {
    variant: 'error',
  },
};

/* =========================================================
   HELPER - CALCULATE DAYS
========================================================= */

function calculateDays(
  startDate: string,
  endDate: string
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const difference =
    end.getTime() - start.getTime();

  return (
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

/* =========================================================
   EMPLOYEE LEAVE PAGE
========================================================= */

export function EmployeeLeave() {
  const { profile } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [leaves, setLeaves] =
    useState<LeaveRequest[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [filter, setFilter] =
    useState<'all' | LeaveStatus>('all');

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [leaveType, setLeaveType] =
    useState<LeaveType>('paid');

  const [startDate, setStartDate] =
    useState('');

  const [endDate, setEndDate] =
    useState('');

  const [remarks, setRemarks] =
    useState('');

  /* =======================================================
     LOAD LEAVES
  ======================================================= */

  useEffect(() => {
    if (profile) {
      loadLeaves();
    }
  }, [profile]);

  async function loadLeaves() {
    if (!profile) return;

    setLoading(true);

    const { data, error } =
      await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', profile.id)
        .order('created_at', {
          ascending: false,
        });

    if (error) {
      console.error(
        'Error loading leaves:',
        error
      );

      setLeaves([]);
    } else {
      setLeaves(
        (data || []) as LeaveRequest[]
      );
    }

    setLoading(false);
  }

  /* =======================================================
     SUBMIT LEAVE
  ======================================================= */

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setError(null);

    if (!profile) {
      setError(
        'User profile not found.'
      );
      return;
    }

    /* Validate dates */

    if (!startDate || !endDate) {
      setError(
        'Please select start and end dates.'
      );
      return;
    }

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
      setError(
        'End date cannot be before start date.'
      );
      return;
    }

    /* Calculate requested days */

    const requestedDays =
      calculateDays(
        startDate,
        endDate
      );

    if (requestedDays <= 0) {
      setError(
        'Invalid leave dates.'
      );
      return;
    }

    setSubmitting(true);

    const { error: insertError } =
      await supabase
        .from('leave_requests')
        .insert({
          employee_id: profile.id,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          remarks: remarks.trim(),
          status: 'pending',
        });

    setSubmitting(false);

    if (insertError) {
      console.error(
        'Leave submission error:',
        insertError
      );

      setError(
        insertError.message ||
          'Failed to submit leave request.'
      );

      return;
    }

    /* Reset form */

    setShowModal(false);

    setLeaveType('paid');
    setStartDate('');
    setEndDate('');
    setRemarks('');
    setError(null);

    /* Reload leaves */

    await loadLeaves();
  }

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filtered =
    filter === 'all'
      ? leaves
      : leaves.filter(
          (leave) =>
            leave.status === filter
        );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = {
    total: leaves.length,

    pending: leaves.filter(
      (leave) =>
        leave.status === 'pending'
    ).length,

    approved: leaves.filter(
      (leave) =>
        leave.status === 'approved'
    ).length,

    rejected: leaves.filter(
      (leave) =>
        leave.status === 'rejected'
    ).length,
  };

  /* =======================================================
     APPROVED LEAVE DAYS BY TYPE

     IMPORTANT:
     This counts actual days.

     Example:
     Jan 1 → Jan 5 = 5 days

     NOT just 1 request.
  ======================================================= */

  const approvedDaysByType = (
    type: LeaveType
  ) => {
    return leaves
      .filter(
        (leave) =>
          leave.leave_type === type &&
          leave.status === 'approved'
      )
      .reduce(
        (total, leave) => {
          const days =
            calculateDays(
              leave.start_date,
              leave.end_date
            );

          return total + days;
        },
        0
      );
  };

  /* =======================================================
     LEAVE BALANCE
  ======================================================= */

  const balances = [
    {
      type: 'paid' as LeaveType,
      total: 20,
      used: approvedDaysByType('paid'),
      label: 'Paid Leave',
    },

    {
      type: 'sick' as LeaveType,
      total: 12,
      used: approvedDaysByType('sick'),
      label: 'Sick Leave',
    },

    {
      type: 'unpaid' as LeaveType,
      total: 5,
      used: approvedDaysByType('unpaid'),
      label: 'Unpaid Leave',
    },
  ];

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leave Management
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Apply for and track your leave requests
          </p>
        </div>

        <Button
          onClick={() => {
            setError(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} />

          Apply for Leave
        </Button>
      </div>

      {/* ===================================================
          LEAVE BALANCE
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {balances.map((balance) => {

          const Icon =
            LEAVE_TYPE_ICON[
              balance.type
            ];

          const remaining = Math.max(
            balance.total -
              balance.used,
            0
          );

          const percentage =
            Math.min(
              (balance.used /
                balance.total) *
                100,
              100
            );

          return (
            <Card
              key={balance.type}
              className="p-5"
            >

              {/* Icon */}

              <div className="flex items-center justify-between mb-3">

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    balance.type === 'paid'
                      ? 'bg-blue-50 text-blue-600'
                      : balance.type === 'sick'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={20} />
                </div>

                <span className="text-xs text-slate-400">
                  Annual
                </span>

              </div>

              {/* Remaining */}

              <p className="text-2xl font-bold text-slate-900">
                {remaining}
              </p>

              <p className="text-sm text-slate-500">
                {balance.label} remaining
              </p>

              {/* Progress */}

              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full ${
                    balance.type === 'paid'
                      ? 'bg-blue-500'
                      : balance.type === 'sick'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <p className="text-xs text-slate-400 mt-1.5">
                {balance.used} used /{' '}
                {balance.total} total
              </p>

            </Card>
          );
        })}

      </div>

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="grid grid-cols-3 gap-4">

        {/* Pending */}

        <Card className="p-4">

          <div className="flex items-center gap-2 mb-1">

            <Clock3
              size={16}
              className="text-amber-500"
            />

            <p className="text-xs text-slate-500">
              Pending
            </p>

          </div>

          <p className="text-xl font-bold text-slate-900">
            {stats.pending}
          </p>

        </Card>

        {/* Approved */}

        <Card className="p-4">

          <div className="flex items-center gap-2 mb-1">

            <CheckCircle2
              size={16}
              className="text-emerald-500"
            />

            <p className="text-xs text-slate-500">
              Approved
            </p>

          </div>

          <p className="text-xl font-bold text-slate-900">
            {stats.approved}
          </p>

        </Card>

        {/* Rejected */}

        <Card className="p-4">

          <div className="flex items-center gap-2 mb-1">

            <XCircle
              size={16}
              className="text-rose-500"
            />

            <p className="text-xs text-slate-500">
              Rejected
            </p>

          </div>

          <p className="text-xl font-bold text-slate-900">
            {stats.rejected}
          </p>

        </Card>

      </div>

      {/* ===================================================
          FILTER TABS
      =================================================== */}

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-0.5 w-fit">

        {(
          [
            'all',
            'pending',
            'approved',
            'rejected',
          ] as const
        ).map((status) => (

          <button
            key={status}
            type="button"
            onClick={() =>
              setFilter(status)
            }
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              filter === status
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {status}
          </button>

        ))}

      </div>

      {/* ===================================================
          LEAVE REQUEST LIST
      =================================================== */}

      <Card>

        <CardHeader
          title="Leave Requests"
        />

        {filtered.length === 0 ? (

          <EmptyState
            icon={
              <CalendarDays size={24} />
            }
            title="No leave requests"
            message="You haven't submitted any leave requests yet. Click 'Apply for Leave' to get started."
            action={
              <Button
                size="sm"
                onClick={() =>
                  setShowModal(true)
                }
              >
                <Plus size={16} />

                Apply for Leave
              </Button>
            }
          />

        ) : (

          <div className="divide-y divide-slate-100">

            {filtered.map((leave) => {

              const Icon =
                LEAVE_TYPE_ICON[
                  leave.leave_type
                ];

              const days =
                calculateDays(
                  leave.start_date,
                  leave.end_date
                );

              return (

                <div
                  key={leave.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >

                  {/* Leave information */}

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        leave.leave_type ===
                        'paid'
                          ? 'bg-blue-50 text-blue-600'
                          : leave.leave_type ===
                            'sick'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-900 capitalize">
                        {leave.leave_type}{' '}
                        Leave
                      </p>

                      <p className="text-xs text-slate-500">

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

                        {' · '}

                        {days} day
                        {days !== 1
                          ? 's'
                          : ''}

                      </p>

                      {/* Employee remark */}

                      {leave.remarks && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {leave.remarks}
                        </p>
                      )}

                      {/* HR comment */}

                      {leave.admin_comment && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          HR: "
                          {
                            leave.admin_comment
                          }
                          "
                        </p>
                      )}

                    </div>

                  </div>

                  {/* Status */}

                  <Badge
                    variant={
                      STATUS_CONFIG[
                        leave.status
                      ].variant
                    }
                  >

                    {leave.status ===
                      'pending' && (
                      <Clock3 size={12} />
                    )}

                    {leave.status ===
                      'approved' && (
                      <CheckCircle2
                        size={12}
                      />
                    )}

                    {leave.status ===
                      'rejected' && (
                      <XCircle size={12} />
                    )}

                    {leave.status}

                  </Badge>

                </div>

              );
            })}

          </div>

        )}

      </Card>

      {/* ===================================================
          APPLY LEAVE MODAL
      =================================================== */}

      <Modal
        open={showModal}
        onClose={() => {
          if (!submitting) {
            setShowModal(false);
            setError(null);
          }
        }}
        title="Apply for Leave"
      >

        {/* Error */}

        {error && (

          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {error}
          </div>

        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Leave Type */}

          <Select
            label="Leave Type"
            value={leaveType}
            onChange={(value) =>
              setLeaveType(
                value as LeaveType
              )
            }
            required
            options={[
              {
                value: 'paid',
                label: 'Paid Leave',
              },
              {
                value: 'sick',
                label: 'Sick Leave',
              },
              {
                value: 'unpaid',
                label: 'Unpaid Leave',
              },
            ]}
          />

          {/* Dates */}

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

          {/* Remarks */}

          <Textarea
            label="Remarks"
            value={remarks}
            onChange={setRemarks}
            placeholder="Reason for leave (optional)"
            rows={3}
          />

          {/* Buttons */}

          <div className="flex gap-2 justify-end">

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!submitting) {
                  setShowModal(false);
                  setError(null);
                }
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Request'}
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}
