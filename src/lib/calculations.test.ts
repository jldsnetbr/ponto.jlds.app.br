import { describe, it, expect } from 'vitest';
import { calculateDay, getNextPunchType, calculateMonthlyBalance } from './calculations';
import { formatMinutes } from './utils';

describe('calculateDay', () => {
  it('retorna 0 quando nenhuma batida existe', () => {
    const result = calculateDay(null, null, null, null, 480);
    expect(result.totalWorkedMinutes).toBe(0);
    expect(result.balanceMinutes).toBe(-480);
  });

  it('calcula apenas período da manhã', () => {
    const entry1 = new Date('2026-06-03T08:00:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const result = calculateDay(entry1, exit1, null, null, 480);
    expect(result.totalWorkedMinutes).toBe(240);
    expect(result.balanceMinutes).toBe(-240);
  });

  it('calcula jornada completa (manhã + tarde)', () => {
    const entry1 = new Date('2026-06-03T08:00:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T17:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(480);
    expect(result.balanceMinutes).toBe(0);
  });

  it('calcula horas extras', () => {
    const entry1 = new Date('2026-06-03T07:45:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T18:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(555);
    expect(result.balanceMinutes).toBe(75);
  });

  it('aplica tolerância - saldo dentro da tolerância vira 0', () => {
    const entry1 = new Date('2026-06-03T08:03:00');
    const exit1 = new Date('2026-06-03T12:00:00');
    const entry2 = new Date('2026-06-03T13:00:00');
    const exit2 = new Date('2026-06-03T17:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480, 5);
    expect(result.totalWorkedMinutes).toBe(477);
    expect(result.balanceMinutes).toBe(0);
  });

  it('calcula corretamente com cruz de meia-noite (ambos períodos)', () => {
    const entry1 = new Date('2026-06-03T22:00:00');
    const exit1 = new Date('2026-06-04T02:00:00');
    const entry2 = new Date('2026-06-04T02:30:00');
    const exit2 = new Date('2026-06-04T06:00:00');
    const result = calculateDay(entry1, exit1, entry2, exit2, 480);
    expect(result.totalWorkedMinutes).toBe(450);
    expect(result.balanceMinutes).toBe(-30);
  });
});

describe('getNextPunchType', () => {
  it('retorna entry_1 quando nenhuma batida existe', () => {
    expect(getNextPunchType({ entry_1: null, exit_1: null, entry_2: null, exit_2: null })).toBe('entry_1');
  });

  it('retorna exit_1 quando entry_1 existe', () => {
    expect(getNextPunchType({ entry_1: '2026-06-03T08:00:00', exit_1: null, entry_2: null, exit_2: null })).toBe('exit_1');
  });

  it('retorna entry_2 quando entry_1 e exit_1 existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: null, exit_2: null })).toBe('entry_2');
  });

  it('retorna exit_2 quando entry_1, exit_1 e entry_2 existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: 'x', exit_2: null })).toBe('exit_2');
  });

  it('retorna null quando todas batidas existem', () => {
    expect(getNextPunchType({ entry_1: 'x', exit_1: 'x', entry_2: 'x', exit_2: 'x' })).toBeNull();
  });
});

describe('calculateMonthlyBalance', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calculateMonthlyBalance([])).toBe(0);
  });

  it('soma saldos do mês', () => {
    const entries = [
      { balance_minutes: 15 },
      { balance_minutes: -30 },
      { balance_minutes: 0 },
      { balance_minutes: 45 },
    ];
    expect(calculateMonthlyBalance(entries as any)).toBe(30);
  });

  it('ignora entradas sem balance_minutes', () => {
    const entries = [
      { balance_minutes: 15 },
      { balance_minutes: null },
      { balance_minutes: 10 },
    ];
    expect(calculateMonthlyBalance(entries as any)).toBe(25);
  });
});

describe('formatMinutes', () => {
  it('formata minutos positivos', () => {
    expect(formatMinutes(75)).toBe('+1h 15min');
  });

  it('formata minutos negativos', () => {
    expect(formatMinutes(-90)).toBe('-1h 30min');
  });

  it('formata zero', () => {
    expect(formatMinutes(0)).toBe('+0h 00min');
  });

  it('formata apenas minutos', () => {
    expect(formatMinutes(30)).toBe('+0h 30min');
  });

  it('formata horas exatas', () => {
    expect(formatMinutes(480)).toBe('+8h 00min');
  });
});
