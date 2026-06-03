import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Holiday } from '@/types';

export function useHolidays() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['holidays', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .or(`user_id.eq.${user!.id},user_id.is.null`)
        .order('date');
      if (error) throw error;
      return data as Holiday[];
    },
    enabled: !!user,
  });
}

export function useAddHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (holiday: Pick<Holiday, 'date' | 'name'>) => {
      const { data, error } = await supabase
        .from('holidays')
        .insert({ ...holiday, is_national: false })
        .select()
        .single();
      if (error) throw error;
      return data as Holiday;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    },
  });
}
