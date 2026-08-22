import { supabase } from '@/lib/supabase';

export async function logAuditEvent(
  action: string,
  targetEntity: string,
  targetId: string | null = null,
  details: Record<string, any> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([
      {
        actor_id: user?.id || null,
        action,
        target_entity: targetEntity,
        target_id: targetId,
        details,
      },
    ]);
  } catch (error) {
    console.error('Failed to record audit log event:', error);
  }
}
