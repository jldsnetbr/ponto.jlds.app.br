import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAutenticacao } from './useAutenticacao';
import type { ConfiguracoesUsuario } from '@/types';

export function useConfiguracoes() {
  const { usuario } = useAutenticacao();

  return useQuery({
    queryKey: ['configuracoes', usuario?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('usuario_id', usuario!.id)
        .single();
      if (error) throw error;
      return data as ConfiguracoesUsuario;
    },
    enabled: !!usuario,
  });
}

export function useAtualizarConfiguracoes() {
  const { usuario } = useAutenticacao();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<ConfiguracoesUsuario>) => {
      const { data, error } = await supabase
        .from('configuracoes')
        .update(updates)
        .eq('usuario_id', usuario!.id)
        .select()
        .single();
      if (error) throw error;
      return data as ConfiguracoesUsuario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
    },
  });
}