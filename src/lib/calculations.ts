import dayjs from 'dayjs';
import type { TipoBatida } from '@/types';

const TOLERANCIA = 5;

export function calcularDia(
  entrada: Date | null,
  saidaAlmoco: Date | null,
  retornoAlmoco: Date | null,
  saidaFinal: Date | null,
  jornadaMinutos: number
): { totalMinutos: number; saldoMinutos: number } {
  const periodo1 = (entrada && saidaAlmoco)
    ? dayjs(saidaAlmoco).diff(dayjs(entrada), 'minute')
    : 0;

  const periodo2 = (retornoAlmoco && saidaFinal)
    ? dayjs(saidaFinal).diff(dayjs(retornoAlmoco), 'minute')
    : 0;

  const totalMinutos = periodo1 + periodo2;
  let saldoMinutos = totalMinutos - jornadaMinutos;

  if (Math.abs(saldoMinutos) <= TOLERANCIA) {
    saldoMinutos = 0;
  }

  return { totalMinutos, saldoMinutos };
}

export function proximoTipoBatida(entry: {
  entrada: string | null;
  saida_almoco: string | null;
  retorno_almoco: string | null;
  saida_final: string | null;
}): TipoBatida | null {
  if (!entry.entrada) return 'entrada';
  if (!entry.saida_almoco) return 'saida_almoco';
  if (!entry.retorno_almoco) return 'retorno_almoco';
  if (!entry.saida_final) return 'saida_final';
  return null;
}

export function calcularSaldoMensal(entries: { saldo_minutos: number | null }[]): number {
  return entries.reduce((sum, entry) => {
    return sum + (entry.saldo_minutos || 0);
  }, 0);
}

export function calcularTempoDecorrido(
  entry: { entrada: string | null; saida_almoco: string | null; retorno_almoco: string | null; saida_final: string | null } | null,
  agora: dayjs.Dayjs
): number {
  if (!entry) return 0;

  let total = 0;
  const e1 = entry.entrada ? dayjs(entry.entrada) : null;
  const x1 = entry.saida_almoco ? dayjs(entry.saida_almoco) : null;
  const e2 = entry.retorno_almoco ? dayjs(entry.retorno_almoco) : null;
  const x2 = entry.saida_final ? dayjs(entry.saida_final) : null;

  if (e1 && x1) total += x1.diff(e1, 'minute');
  else if (e1) total += agora.diff(e1, 'minute');

  if (e2 && x2) total += x2.diff(e2, 'minute');
  else if (e2) total += agora.diff(e2, 'minute');

  return total;
}

export function calcularJornada(
  inicioExpediente: string,
  fimExpediente: string,
  almocoInicio: string,
  almocoFim: string
): number {
  const inicio = dayjs(`2000-01-01T${inicioExpediente}`);
  const fim = dayjs(`2000-01-01T${fimExpediente}`);
  const almocoI = dayjs(`2000-01-01T${almocoInicio}`);
  const almocoF = dayjs(`2000-01-01T${almocoFim}`);
  return Math.max(0, fim.diff(inicio, 'minute') - almocoF.diff(almocoI, 'minute'));
}
