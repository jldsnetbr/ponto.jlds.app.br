import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { recalculateAndSave } from '@/lib/recalculateDay';
import type { TimeEntry, PunchType } from '@/types';
import dayjs from 'dayjs';

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
    onSuccess: async (entry) => {
      try {
        await recalculateAndSave(entry, settings);
      } catch (err) {
        console.error(err);
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
    onSuccess: async (entry) => {
      try {
        await recalculateAndSave(entry, settings);
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
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
    onSuccess: async (entry) => {
      try {
        await recalculateAndSave(entry, settings);
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
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
    onSuccess: async (entry) => {
      try {
        await recalculateAndSave(entry, settings);
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    },
  });
}
