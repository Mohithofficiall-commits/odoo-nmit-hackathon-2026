import { supabase } from '@/lib/supabase';
import { LeaveBalance } from '@/lib/types';

export async function fetchLeaveBalance(employeeId: string): Promise<LeaveBalance | null> {
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to fetch leave balance:', error.message);
    return null;
  }
  return data;
}
