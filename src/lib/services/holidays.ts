import { supabase } from '@/lib/supabase';
import { Holiday } from '@/lib/types';

export async function fetchHolidays(): Promise<Holiday[]> {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .order('holiday_date', { ascending: true });

  if (error) {
    console.warn('Failed to fetch holidays:', error.message);
    return [];
  }
  return data || [];
}
