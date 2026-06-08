export const ROTAS = {
  PONTO: '/ponto',
  BANCO: '/banco',
  HISTORICO: '/historico',
  CONFIGURACOES: '/configuracoes',
  LOGIN: '/login',
} as const;

export type Rota = typeof ROTAS[keyof typeof ROTAS];

export function construirHistoricoComDia(data: string): string {
  return `${ROTAS.HISTORICO}?dia=${data}`;
}