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
    mutationFn: async ({ entry, tipo }: { entry: RegistroPonto | null; tipo: TipoBatida }) => {
      const agora = new Date().toISOString();

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

export function useAtualizarRegistroPonto() {
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

export function useRemoverBatida() {
  const queryClient = useQueryClient();
  const { data: config } = useConfiguracoes();

  return useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: TipoBatida }) => {
      const { data, error } = await supabase
        .from('pontos')
        .update({ [tipo]: null })
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

export function useAtualizarBatida() {
  const queryClient = useQueryClient();
  const { data: config } = useConfiguracoes();

  return useMutation({
    mutationFn: async ({ id, tipo, horario }: { id: string; tipo: TipoBatida; horario: string }) => {
      const { data, error } = await supabase
        .from('pontos')
        .update({ [tipo]: horario })
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
