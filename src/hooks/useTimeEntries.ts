import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { TimeEntry } from '@/types';
import dayjs from 'dayjs';

export function useTimeEntries(yearMonth?: string) {
  const { user } = useAuth();

  const startDate = yearMonth
    ? dayjs(yearMonth, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
    : undefined;
  const endDate = yearMonth
    ? dayjs(yearMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
    : undefined;

  return useQuery({
    queryKey: ['timeEntries', user?.id, yearMonth],
    queryFn: async () => {
      let q = supabase.from('time_entries').select('*').order('date');
      if (startDate) q = q.gte('date', startDate);
      if (endDate) q = q.lte('date', endDate);
      const { data, error } = await q;
      if (error) throw error;
      return data as TimeEntry[];
    },
    enabled: !!user,
  });
}

export function useTodayEntry() {
  const { user } = useAuth();
  const today = dayjs().format('YYYY-MM-DD');

  return useQuery({
    queryKey: ['timeEntries', user?.id, 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data as TimeEntry | null;
    },
    enabled: !!user,
  });
}
