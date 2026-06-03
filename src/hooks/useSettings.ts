import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { UserSettings } from '@/types';

export function useSettings() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    enabled: !!user,
  });

  return query;
}

export function useUpdateSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data as UserSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return mutation;
}
