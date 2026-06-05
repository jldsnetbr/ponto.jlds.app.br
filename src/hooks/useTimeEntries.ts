import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { calculateDay } from '@/lib/calculations';
import type { TimeEntry, PunchType, UserSettings } from '@/types';
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

export function usePunch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const today = dayjs().format('YYYY-MM-DD');

  return useMutation({
    mutationFn: async ({ entry, punchType }: { entry: TimeEntry | null; punchType: PunchType }) => {
      const now = new Date().toISOString();

      if (!entry) {
        const { data, error } = await supabase
          .from('time_entries')
          .insert({ user_id: user!.id, date: today, [punchType]: now })
          .select()
          .single();
        if (error) throw error;
        return data as TimeEntry;
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({ [punchType]: now })
        .eq('id', entry.id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      if (settings) {
        const { totalWorkedMinutes, balanceMinutes } = calculateDay(
          entry.entry_1 ? new Date(entry.entry_1) : null,
          entry.exit_1 ? new Date(entry.exit_1) : null,
          entry.entry_2 ? new Date(entry.entry_2) : null,
          entry.exit_2 ? new Date(entry.exit_2) : null,
          settings.daily_workload_minutes,
          settings.tolerance_minutes
        );

        supabase
          .from('time_entries')
          .update({ total_worked_minutes: totalWorkedMinutes, balance_minutes: balanceMinutes })
          .eq('id', entry.id);
      }

      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      recalculateAndInvalidate(entry, settings, queryClient);
    },
  });
}

function recalculateAndInvalidate(entry: TimeEntry, settings: UserSettings | undefined, queryClient: ReturnType<typeof useQueryClient>) {
  if (settings) {
    const { totalWorkedMinutes, balanceMinutes } = calculateDay(
      entry.entry_1 ? new Date(entry.entry_1) : null,
      entry.exit_1 ? new Date(entry.exit_1) : null,
      entry.entry_2 ? new Date(entry.entry_2) : null,
      entry.exit_2 ? new Date(entry.exit_2) : null,
      settings.daily_workload_minutes,
      settings.tolerance_minutes
    );

    supabase
      .from('time_entries')
      .update({ total_worked_minutes: totalWorkedMinutes, balance_minutes: balanceMinutes })
      .eq('id', entry.id);
  }

  queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
}

export function useDeletePunch() {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  return useMutation({
    mutationFn: async ({ id, punchType }: { id: string; punchType: PunchType }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ [punchType]: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      recalculateAndInvalidate(entry, settings, queryClient);
    },
  });
}

export function useUpdateSinglePunch() {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  return useMutation({
    mutationFn: async ({ id, punchType, time }: { id: string; punchType: PunchType; time: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ [punchType]: time })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: (entry) => {
      recalculateAndInvalidate(entry, settings, queryClient);
    },
  });
}
