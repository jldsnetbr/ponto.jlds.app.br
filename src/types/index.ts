export interface Usuario {
  id: string;
  email: string;
  criado_em: string;
}

export interface ConfiguracoesUsuario {
  id: string;
  usuario_id: string;
  inicio_expediente: string;
  fim_expediente: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_trabalho: number[];
  notificacoes_ativas: boolean;
  notificacao_horario: string;
  jornada_minutos: number;
  tolerancia_minutos: number;
}

export interface RegistroPonto {
  id: string;
  usuario_id: string;
  data: string;
  entrada: string | null;
  saida_almoco: string | null;
  retorno_almoco: string | null;
  saida_final: string | null;
  total_minutos: number | null;
  saldo_minutos: number | null;
  observacao: string | null;
}

export interface Feriado {
  id: string;
  usuario_id: string | null;
  data: string;
  nome: string;
  nacional: boolean;
}

export type TipoBatida = 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida_final';

export const NOMES_BATIDA: Record<TipoBatida, string> = {
  entrada: 'Entrada',
  saida_almoco: 'Saída Almoço',
  retorno_almoco: 'Retorno Almoço',
  saida_final: 'Saída Final',
};