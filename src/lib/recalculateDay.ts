import { calcularDia } from './calculos';
import type { RegistroPonto, ConfiguracoesUsuario } from '@/types';

export async function recalcularESalvar(
  entry: RegistroPonto,
  config: ConfiguracoesUsuario | undefined
): Promise<void> {
  if (!config) return;

  const { totalMinutos, saldoMinutos } = calcularDia(
    entry.entrada,
    entry.saida_almoco,
    entry.retorno_almoco,
    entry.saida_final,
    config.jornada_minutos
  );

  const { supabase } = await import('@/lib/supabase');
  await supabase
    .from('pontos')
    .update({ total_minutos: totalMinutos, saldo_minutos: saldoMinutos })
    .eq('id', entry.id);
}