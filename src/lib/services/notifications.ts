import { supabase } from '@/lib/supabase';

export function subscribeToLeaveUpdates(onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel('leave-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leave_requests' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
