import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useConfiguracoes } from './useSettings';
import { recalcularESalvar } from '@/lib/recalculateDay';
import type { RegistroPonto, TipoBatida } from '@/types';
import dayjs from 'dayjs';

export function useBaterPonto() {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();
  const { data: config } = useConfiguracoes();
  const hoje = dayjs().format('YYYY-MM-DD');

  return useMutation({
    mutationFn: async ({ entry, tipo, horario }: { entry: RegistroPonto | null; tipo: TipoBatida; horario?: string }) => {
      const agora = horario || new Date().toISOString();

      if (!entry) {
        const { data, error } = await supabase
          .from('pontos')
          .insert({ usuario_id: usuario!.id, data: hoje, [tipo]: agora })
          .select()
          .single();
        if (error) throw error;
        return data as RegistroPonto;
      }

      const { data, error } = await supabase
        .from('pontos')
        .update({ [tipo]: agora })
        .eq('id', entry.id)
        .select()
        .single();
      if (error) throw error;
      return data as RegistroPonto;
    },
    onSuccess: async (entry) => {
      try {
        await recalcularESalvar(entry, config);
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
    },
  });
}

export function useAlterarPonto() {
  const queryClient = useQueryClient();
  const { data: config } = useConfiguracoes();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RegistroPonto> }) => {
      const { data, error } = await supabase
        .from('pontos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as RegistroPonto;
    },
    onSuccess: async (entry) => {
      try {
        await recalcularESalvar(entry, config);
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
    },
  });
}
