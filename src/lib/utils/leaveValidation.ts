import { LeaveBalance } from '@/lib/types';

export function calculateLeaveDays(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export function validateLeaveQuota(
  balance: LeaveBalance,
  leaveType: 'paid' | 'sick' | 'casual' | 'unpaid',
  requestedDays: number
): { isValid: boolean; message?: string } {
  if (leaveType === 'unpaid') {
    return { isValid: true };
  }

  if (leaveType === 'paid') {
    const remaining = balance.paid_leave_total - balance.paid_leave_used;
    if (requestedDays > remaining) {
      return { isValid: false, message: `Insufficient Paid Leave balance. Remaining: ${remaining} days.` };
    }
  }

  if (leaveType === 'sick') {
    const remaining = balance.sick_leave_total - balance.sick_leave_used;
    if (requestedDays > remaining) {
      return { isValid: false, message: `Insufficient Sick Leave balance. Remaining: ${remaining} days.` };
    }
  }

  if (leaveType === 'casual') {
    const remaining = balance.casual_leave_total - balance.casual_leave_used;
    if (requestedDays > remaining) {
      return { isValid: false, message: `Insufficient Casual Leave balance. Remaining: ${remaining} days.` };
    }
  }

  return { isValid: true };
}
