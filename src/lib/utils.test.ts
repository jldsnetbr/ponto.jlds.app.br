import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('junta classes básicas', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filtra valores falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('');
  });

  it('retorna string vazia com todos falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
