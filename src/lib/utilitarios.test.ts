import { describe, it, expect } from 'vitest';
import { formatarMinutos, cn } from './utilitarios';

describe('formatarMinutos', () => {
  it('formata minutos positivos', () => {
    expect(formatarMinutos(480)).toBe('+8h 00min');
  });

  it('formata minutos negativos', () => {
    expect(formatarMinutos(-30)).toBe('-0h 30min');
  });

  it('formata zero', () => {
    expect(formatarMinutos(0)).toBe('0h 00min');
  });
});

describe('cn', () => {
  it('junta classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filtra falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});