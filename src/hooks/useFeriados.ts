import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAutenticacao } from './useAutenticacao';
import type { Feriado } from '@/types';

export function useFeriados() {
  const { usuario } = useAutenticacao();

  return useQuery({
    queryKey: ['feriados', usuario?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feriados')
        .select('*')
        .or(`usuario_id.eq.${usuario!.id},usuario_id.is.null`)
        .order('data');
      if (error) throw error;
      return data as Feriado[];
    },
    enabled: !!usuario,
  });
}

export function useAdicionarFeriado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feriado: Pick<Feriado, 'data' | 'nome'>) => {
      const { data, error } = await supabase
        .from('feriados')
        .insert({ ...feriado, nacional: false })
        .select()
        .single();
      if (error) throw error;
      return data as Feriado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
    },
  });
}

export function useRemoverFeriado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feriados').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feriados'] });
    },
  });
}