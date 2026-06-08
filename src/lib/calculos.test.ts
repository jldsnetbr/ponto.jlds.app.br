import { describe, it, expect, vi } from 'vitest';
import { calcularDia, proximoTipoBatida, calcularSaldoMensal, calcularJornada, calcularTempoDecorrido, detectarAusencias, verificarExcedente, calcularDSR, gerarCSV } from './calculos';
import type { RegistroPonto } from '@/types';

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

describe('detectarAusencias', () => {
  it('retorna dias sem registro', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00'));

    const entries: RegistroPonto[] = [
      { id: '1', usuario_id: 'u1', data: '2026-06-01', entrada: '08:00', saida_almoco: '12:00', retorno_almoco: '13:00', saida_final: '17:00', total_minutos: 480, saldo_minutos: 0, dsr_minutos: 0, observacao: null, local_id: null },
    ];
    const ausencias = detectarAusencias(entries, '2026-06', [1, 2, 3, 4, 5]);
    expect(ausencias).toContain('2026-06-02');
    expect(ausencias).toContain('2026-06-03');
    expect(ausencias).not.toContain('2026-06-01');
    expect(ausencias).not.toContain('2026-06-10');

    vi.useRealTimers();
  });

  it('ignora dias que ainda nao passaram', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00'));

    const ausencias = detectarAusencias([], '2026-06', [1, 2, 3, 4, 5]);
    expect(ausencias).not.toContain('2026-06-10');
    expect(ausencias).not.toContain('2026-06-11');

    vi.useRealTimers();
  });
});

describe('verificarExcedente', () => {
  it('retorna false quando dentro da jornada', () => {
    expect(verificarExcedente(480, 480)).toEqual({ excedente: false, minutos: 0, percentual: null });
  });

  it('retorna 50% para ate 2h extras', () => {
    expect(verificarExcedente(540, 480)).toEqual({ excedente: true, minutos: 60, percentual: 50 });
  });

  it('retorna 100% para mais de 2h extras', () => {
    expect(verificarExcedente(620, 480)).toEqual({ excedente: true, minutos: 140, percentual: 100 });
  });
});

describe('calcularDSR', () => {
  it('calcula DSR corretamente', () => {
    expect(calcularDSR(120, 22)).toBe(440);
  });

  it('retorna 0 se sem horas extras', () => {
    expect(calcularDSR(0, 22)).toBe(0);
  });
});

describe('gerarCSV', () => {
  it('gera CSV com cabecalho e linha', () => {
    const entries: RegistroPonto[] = [
      { id: '1', usuario_id: 'u1', data: '2026-06-01', entrada: '2026-06-01T08:00:00', saida_almoco: '2026-06-01T12:00:00', retorno_almoco: '2026-06-01T13:00:00', saida_final: '2026-06-01T17:00:00', total_minutos: 480, saldo_minutos: 0, dsr_minutos: 0, observacao: 'teste', local_id: null },
    ];
    const csv = gerarCSV(entries);
    expect(csv).toContain('Data,Dia Semana');
    expect(csv).toContain('2026-06-01,Seg,08:00,12:00,13:00,17:00,480,0,teste');
  });
});
