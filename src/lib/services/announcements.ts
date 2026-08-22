import { supabase } from '@/lib/supabase';
import { Announcement } from '@/lib/types';

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAnnouncement(title: string, content: string, category = 'general', isPinned = false) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        title,
        content,
        category,
        is_pinned: isPinned,
        author_id: user?.id || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
