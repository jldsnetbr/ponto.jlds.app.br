import { describe, it, expect, vi } from 'vitest';
import { calcularDia, proximoTipoBatida, calcularSaldoMensal, calcularJornada, calcularTempoDecorrido } from './calculos';

describe('calcularDia', () => {
  it('calcula total e saldo corretamente', () => {
    const entrada = '2024-01-01T08:00:00';
    const saidaAlmoco = '2024-01-01T12:00:00';
    const retornoAlmoco = '2024-01-01T13:00:00';
    const saidaFinal = '2024-01-01T17:00:00';
    const jornada = 480;

    const result = calcularDia(entrada, saidaAlmoco, retornoAlmoco, saidaFinal, jornada);
    expect(result.totalMinutos).toBe(480);
    expect(result.saldoMinutos).toBe(0);
  });

  it('aplica tolerancia de 5 minutos', () => {
    const result = calcularDia('2024-01-01T08:00:00', '2024-01-01T12:00:00', '2024-01-01T13:00:00', '2024-01-01T17:03:00', 480);
    expect(result.saldoMinutos).toBe(0);
  });
});

describe('proximoTipoBatida', () => {
  it('retorna entrada quando vazio', () => {
    expect(proximoTipoBatida({ entrada: null, saida_almoco: null, retorno_almoco: null, saida_final: null })).toBe('entrada');
  });
  it('retorna null quando completo', () => {
    expect(proximoTipoBatida({ entrada: '08:00', saida_almoco: '12:00', retorno_almoco: '13:00', saida_final: '17:00' })).toBeNull();
  });
});

describe('calcularSaldoMensal', () => {
  it('soma saldos', () => {
    expect(calcularSaldoMensal([{ saldo_minutos: 30 }, { saldo_minutos: -10 }])).toBe(20);
  });
});

describe('calcularJornada', () => {
  it('calcula jornada descontando almoco', () => {
    expect(calcularJornada('08:00', '18:00', '12:00', '13:00')).toBe(540);
  });
});

describe('calcularTempoDecorrido', () => {
  it('retorna 0 se sem entry', () => {
    const agora = new Date('2024-01-01T17:00:00');
    vi.setSystemTime(agora);
    expect(calcularTempoDecorrido(null, agora as any)).toBe(0);
  });
});