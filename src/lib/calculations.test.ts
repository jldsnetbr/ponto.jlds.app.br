import { describe, it, expect } from 'vitest';
import { calcularDia, proximoTipoBatida, calcularSaldoMensal, calcularJornada, calcularTempoDecorrido } from './calculations';
import { formatarMinutos } from './utils';
import dayjs from 'dayjs';

describe('calcularDia', () => {
  it('retorna 0 quando nenhuma batida existe', () => {
    const result = calcularDia(null, null, null, null, 480);
    expect(result.totalMinutos).toBe(0);
    expect(result.saldoMinutos).toBe(-480);
  });

  it('calcula apenas período da manhã', () => {
    const entrada = new Date('2026-06-03T08:00:00');
    const saidaAlmoco = new Date('2026-06-03T12:00:00');
    const result = calcularDia(entrada, saidaAlmoco, null, null, 480);
    expect(result.totalMinutos).toBe(240);
    expect(result.saldoMinutos).toBe(-240);
  });

  it('calcula jornada completa (manhã + tarde)', () => {
    const entrada = new Date('2026-06-03T08:00:00');
    const saidaAlmoco = new Date('2026-06-03T12:00:00');
    const retornoAlmoco = new Date('2026-06-03T13:00:00');
    const saidaFinal = new Date('2026-06-03T17:00:00');
    const result = calcularDia(entrada, saidaAlmoco, retornoAlmoco, saidaFinal, 480);
    expect(result.totalMinutos).toBe(480);
    expect(result.saldoMinutos).toBe(0);
  });

  it('calcula horas extras', () => {
    const entrada = new Date('2026-06-03T07:45:00');
    const saidaAlmoco = new Date('2026-06-03T12:00:00');
    const retornoAlmoco = new Date('2026-06-03T13:00:00');
    const saidaFinal = new Date('2026-06-03T18:00:00');
    const result = calcularDia(entrada, saidaAlmoco, retornoAlmoco, saidaFinal, 480);
    expect(result.totalMinutos).toBe(555);
    expect(result.saldoMinutos).toBe(75);
  });

  it('aplica tolerância - saldo dentro da tolerância vira 0', () => {
    const entrada = new Date('2026-06-03T08:03:00');
    const saidaAlmoco = new Date('2026-06-03T12:00:00');
    const retornoAlmoco = new Date('2026-06-03T13:00:00');
    const saidaFinal = new Date('2026-06-03T17:00:00');
    const result = calcularDia(entrada, saidaAlmoco, retornoAlmoco, saidaFinal, 480, 5);
    expect(result.totalMinutos).toBe(477);
    expect(result.saldoMinutos).toBe(0);
  });

  it('calcula corretamente com cruz de meia-noite', () => {
    const entrada = new Date('2026-06-03T22:00:00');
    const saidaAlmoco = new Date('2026-06-04T02:00:00');
    const retornoAlmoco = new Date('2026-06-04T02:30:00');
    const saidaFinal = new Date('2026-06-04T06:00:00');
    const result = calcularDia(entrada, saidaAlmoco, retornoAlmoco, saidaFinal, 480);
    expect(result.totalMinutos).toBe(450);
    expect(result.saldoMinutos).toBe(-30);
  });
});

describe('proximoTipoBatida', () => {
  it('retorna entrada quando nenhuma batida existe', () => {
    expect(proximoTipoBatida({ entrada: null, saida_almoco: null, retorno_almoco: null, saida_final: null })).toBe('entrada');
  });

  it('retorna saida_almoco quando entrada existe', () => {
    expect(proximoTipoBatida({ entrada: '2026-06-03T08:00:00', saida_almoco: null, retorno_almoco: null, saida_final: null })).toBe('saida_almoco');
  });

  it('retorna retorno_almoco quando entrada e saida_almoco existem', () => {
    expect(proximoTipoBatida({ entrada: 'x', saida_almoco: 'x', retorno_almoco: null, saida_final: null })).toBe('retorno_almoco');
  });

  it('retorna saida_final quando entrada, saida_almoco e retorno_almoco existem', () => {
    expect(proximoTipoBatida({ entrada: 'x', saida_almoco: 'x', retorno_almoco: 'x', saida_final: null })).toBe('saida_final');
  });

  it('retorna null quando todas batidas existem', () => {
    expect(proximoTipoBatida({ entrada: 'x', saida_almoco: 'x', retorno_almoco: 'x', saida_final: 'x' })).toBeNull();
  });
});

describe('calcularSaldoMensal', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calcularSaldoMensal([])).toBe(0);
  });

  it('soma saldos do mês', () => {
    const entries = [
      { saldo_minutos: 15 },
      { saldo_minutos: -30 },
      { saldo_minutos: 0 },
      { saldo_minutos: 45 },
    ];
    expect(calcularSaldoMensal(entries as any)).toBe(30);
  });

  it('ignora entradas sem saldo_minutos', () => {
    const entries = [
      { saldo_minutos: 15 },
      { saldo_minutos: null },
      { saldo_minutos: 10 },
    ];
    expect(calcularSaldoMensal(entries as any)).toBe(25);
  });
});

describe('formatarMinutos', () => {
  it('formata minutos positivos', () => {
    expect(formatarMinutos(75)).toBe('+1h 15min');
  });

  it('formata minutos negativos', () => {
    expect(formatarMinutos(-90)).toBe('-1h 30min');
  });

  it('formata zero', () => {
    expect(formatarMinutos(0)).toBe('+0h 00min');
  });

  it('formata apenas minutos', () => {
    expect(formatarMinutos(30)).toBe('+0h 30min');
  });

  it('formata horas exatas', () => {
    expect(formatarMinutos(480)).toBe('+8h 00min');
  });
});

describe('calcularJornada', () => {
  it('calcula 8h para jornada padrao (08:00-17:00 com 1h de almoco)', () => {
    expect(calcularJornada('08:00', '17:00', '12:00', '13:00')).toBe(480);
  });

  it('calcula 6h para jornada 08:00-14:00 sem almoco', () => {
    expect(calcularJornada('08:00', '14:00', '12:00', '12:00')).toBe(360);
  });

  it('calcula 4h para jornada 08:00-12:00', () => {
    expect(calcularJornada('08:00', '12:00', '12:00', '12:00')).toBe(240);
  });

  it('retorna 0 quando saido < entrada', () => {
    expect(calcularJornada('17:00', '08:00', '12:00', '13:00')).toBe(0);
  });
});
