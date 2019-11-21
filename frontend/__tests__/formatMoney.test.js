import formatMoney from '../lib/formatMoney';
import { format } from 'date-fns';

describe('format money function', () => {
  it('should work with fractional dollars', () => {
    expect(formatMoney(1)).toBe('$0.01');
    expect(formatMoney(10)).toBe('$0.10');
    expect(formatMoney(9)).toBe('$0.09');
    expect(formatMoney(40)).toBe('$0.40');
  });

  it('should leave cents off for whole dollars', () => {
    expect(formatMoney(100)).toBe('$1');
    expect(formatMoney(900)).toBe('$9');
    expect(formatMoney(0)).toBe('$0');
    expect(formatMoney(50000000)).toBe('$500,000');
  });

  it('should work with whole dollars and fractional dollars', () => {
    expect(formatMoney(5012)).toBe('$50.12');
    expect(formatMoney(101)).toBe('$1.01');
    expect(formatMoney(110)).toBe('$1.10');
  })
})