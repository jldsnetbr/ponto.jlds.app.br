import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAutenticacao } from './useAutenticacao';
import type { Local } from '@/types';

export function useLocais() {
  const { usuario } = useAutenticacao();

  return useQuery({
    queryKey: ['locais', usuario?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locais')
        .select('*')
        .eq('usuario_id', usuario!.id)
        .order('nome');
      if (error) throw error;
      return data as Local[];
    },
    enabled: !!usuario,
  });
}

export function useAdicionarLocal() {
  const { usuario } = useAutenticacao();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nome, cor }: { nome: string; cor: string }) => {
      const { data, error } = await supabase
        .from('locais')
        .insert({ usuario_id: usuario!.id, nome, cor })
        .select()
        .single();
      if (error) throw error;
      return data as Local;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}

export function useAtualizarLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Local> }) => {
      const { data, error } = await supabase
        .from('locais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Local;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}

export function useRemoverLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locais')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}
