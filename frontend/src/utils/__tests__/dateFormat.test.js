import { describe, it, expect } from 'vitest';
import { formatData, formatDataISO } from '../dateFormat';

describe('dateFormat', () => {
  it('formatuje datę do dd.MM.yyyy', () => {
    expect(formatData('2026-01-15')).toBe('15.01.2026');
  });

  it('zwraca "-" dla pustej daty', () => {
    expect(formatData(null)).toBe('-');
    expect(formatData(undefined)).toBe('-');
  });

  it('zwraca "-" dla nieprawidłowej daty', () => {
    expect(formatData('nie-data')).toBe('-');
  });

  it('formatDataISO zwraca yyyy-MM-dd', () => {
    expect(formatDataISO('2026-01-15T10:00:00Z')).toBe('2026-01-15');
    expect(formatDataISO(null)).toBe('');
  });
});
