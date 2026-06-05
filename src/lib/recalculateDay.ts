import { supabase } from './supabase';
import { calcularDia } from './calculations';
import type { RegistroPonto, ConfiguracoesUsuario } from '@/types';

export async function recalcularESalvar(entry: RegistroPonto, config: ConfiguracoesUsuario | undefined): Promise<void> {
  if (!config) return;

  const { totalMinutos, saldoMinutos } = calcularDia(
    entry.entrada ? new Date(entry.entrada) : null,
    entry.saida_almoco ? new Date(entry.saida_almoco) : null,
    entry.retorno_almoco ? new Date(entry.retorno_almoco) : null,
    entry.saida_final ? new Date(entry.saida_final) : null,
    config.jornada_minutos,
    config.tolerancia_minutos
  );

  const { error } = await supabase
    .from('pontos')
    .update({ total_minutos: totalMinutos, saldo_minutos: saldoMinutos })
    .eq('id', entry.id);

  if (error) {
    console.error('Erro ao recalcular saldo:', error.message);
    throw new Error('Erro ao recalcular saldo do dia');
  }
}
