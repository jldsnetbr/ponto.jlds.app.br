import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { RegistroPonto } from '@/types';
import dayjs from 'dayjs';

export function useRegistrosPonto(anoMes?: string) {
  const { usuario } = useAuth();

  const inicio = anoMes
    ? dayjs(anoMes, 'YYYY-MM').startOf('month').format('YYYY-MM-DD')
    : undefined;
  const fim = anoMes
    ? dayjs(anoMes, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
    : undefined;

  return useQuery({
    queryKey: ['pontos', usuario?.id, anoMes],
    queryFn: async () => {
      let q = supabase.from('pontos').select('*').order('data');
      if (inicio) q = q.gte('data', inicio);
      if (fim) q = q.lte('data', fim);
      const { data, error } = await q;
      if (error) throw error;
      return data as RegistroPonto[];
    },
    enabled: !!usuario,
  });
}

export function useRegistroHoje() {
  const { usuario } = useAuth();
  const hoje = dayjs().format('YYYY-MM-DD');

  return useQuery({
    queryKey: ['pontos', usuario?.id, 'hoje'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontos')
        .select('*')
        .eq('data', hoje)
        .maybeSingle();
      if (error) throw error;
      return data as RegistroPonto | null;
    },
    enabled: !!usuario,
  });
}
