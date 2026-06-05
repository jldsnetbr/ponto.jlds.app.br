import { pgTable, uuid, varchar, timestamp, time, date, jsonb, boolean, integer, text } from 'drizzle-orm/pg-core';

export const configuracoes = pgTable('configuracoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id').unique().notNull(),
  inicioExpediente: time('inicio_expediente').default('08:00:00').notNull(),
  fimExpediente: time('fim_expediente').default('17:00:00').notNull(),
  almocoInicio: time('almoco_inicio').default('12:00:00').notNull(),
  almocoFim: time('almoco_fim').default('13:00:00').notNull(),
  diasTrabalho: jsonb('dias_trabalho').default([1, 2, 3, 4, 5]).notNull(),
  notificacoesAtivas: boolean('notificacoes_ativas').default(false).notNull(),
  notificacaoHorario: time('notificacao_horario').default('07:30:00').notNull(),
  jornadaMinutos: integer('jornada_minutos').default(480).notNull(),
  toleranciaMinutos: integer('tolerancia_minutos').default(5).notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});

export const pontos = pgTable('pontos', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id').notNull(),
  data: date('data').notNull(),
  entrada: timestamp('entrada', { withTimezone: true }),
  saidaAlmoco: timestamp('saida_almoco', { withTimezone: true }),
  retornoAlmoco: timestamp('retorno_almoco', { withTimezone: true }),
  saidaFinal: timestamp('saida_final', { withTimezone: true }),
  totalMinutos: integer('total_minutos'),
  saldoMinutos: integer('saldo_minutos'),
  observacao: text('observacao'),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});

export const feriados = pgTable('feriados', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: uuid('usuario_id'),
  data: date('data').notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  nacional: boolean('nacional').default(false).notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});
