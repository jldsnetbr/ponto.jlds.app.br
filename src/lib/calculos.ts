import dayjs from 'dayjs';
import { supabase } from '@/lib/supabase';
import type { TipoBatida, RegistroPonto, ConfiguracoesUsuario } from '@/types';

const TOLERANCIA = 5;

export function calcularDia(
  entrada: string | null,
  saidaAlmoco: string | null,
  retornoAlmoco: string | null,
  saidaFinal: string | null,
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

  const { error } = await supabase
    .from('pontos')
    .update({ total_minutos: totalMinutos, saldo_minutos: saldoMinutos })
    .eq('id', entry.id);

  if (error) throw error;
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

const diasSemanaMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function detectarAusencias(
  entries: RegistroPonto[],
  anoMes: string,
  diasTrabalho: number[]
): string[] {
  const inicio = dayjs(anoMes, 'YYYY-MM').startOf('month');
  const fim = dayjs(anoMes, 'YYYY-MM').endOf('month');
  const hoje = dayjs().startOf('day');
  const datasComRegistro = new Set(entries.map((e) => e.data));
  const ausencias: string[] = [];

  let atual = inicio;
  while (atual.isBefore(fim) || atual.isSame(fim, 'day')) {
    if (atual.isBefore(hoje) && diasTrabalho.includes(atual.day())) {
      const dataStr = atual.format('YYYY-MM-DD');
      if (!datasComRegistro.has(dataStr)) {
        ausencias.push(dataStr);
      }
    }
    atual = atual.add(1, 'day');
  }

  return ausencias;
}

export function verificarExcedente(
  totalMinutos: number,
  jornadaMinutos: number
): { excedente: boolean; minutos: number; percentual: number | null } {
  const excedente = totalMinutos > jornadaMinutos;
  if (!excedente) return { excedente: false, minutos: 0, percentual: null };

  const minutos = totalMinutos - jornadaMinutos;
  const percentual = minutos <= 120 ? 50 : 100;
  return { excedente: true, minutos, percentual };
}

export function calcularDSR(heMinutos: number, diasUteisMes: number): number {
  if (heMinutos <= 0 || diasUteisMes <= 0) return 0;
  return Math.floor((heMinutos * diasUteisMes) / 6);
}

export function gerarCSV(entries: RegistroPonto[]): string {
  const cabecalho = 'Data,Dia Semana,Entrada,Saída Almoço,Retorno Almoço,Saída Final,Total,Saldo,Observação';
  const linhas = entries.map((e) => {
    const data = dayjs(e.data);
    return [
      e.data,
      diasSemanaMap[data.day()],
      e.entrada ? dayjs(e.entrada).format('HH:mm') : '',
      e.saida_almoco ? dayjs(e.saida_almoco).format('HH:mm') : '',
      e.retorno_almoco ? dayjs(e.retorno_almoco).format('HH:mm') : '',
      e.saida_final ? dayjs(e.saida_final).format('HH:mm') : '',
      e.total_minutos ?? '',
      e.saldo_minutos ?? '',
      (e.observacao || '').replace(/,/g, ';'),
    ].join(',');
  });
  return [cabecalho, ...linhas].join('\n');
}

export function downloadCSV(conteudo: string, nomeArquivo: string) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}
