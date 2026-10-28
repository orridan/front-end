import { describe, expect, it } from 'vitest';
import { pricing, type Interval } from '../content';
import { getAnnualSavingsPercent, getPrice } from './pricing';

const intervals: Interval[] = ['monthly', 'annual'];

describe('getPrice', () => {
  it('returns the placeholder monthly prices', () => {
    const org = getPrice('organisation', 'monthly');
    const twin = getPrice('twin', 'monthly');
    expect(org.kind === 'fixed' && org.perMonth).toBe(50);
    expect(twin.kind === 'fixed' && twin.perMonth).toBe(150);
    expect(org.kind === 'fixed' && org.billingLabel).toBe('Billed monthly.');
  });

  it('applies the 20% annual discount with the expected yearly totals', () => {
    const org = getPrice('organisation', 'annual');
    const twin = getPrice('twin', 'annual');
    if (org.kind !== 'fixed' || twin.kind !== 'fixed') throw new Error('expected fixed prices');
    expect(org.perMonth).toBe(40);
    expect(org.perYear).toBe(480);
    expect(org.amount).toBe(480);
    expect(org.fullLabel).toBe('$40 / month, billed $480 per year');
    expect(twin.perMonth).toBe(120);
    expect(twin.perYear).toBe(1440);
    expect(twin.fullLabel).toBe('$120 / month, billed $1,440 per year');
  });

  it('returns custom pricing for Enterprise in both intervals', () => {
    for (const interval of intervals) {
      const p = getPrice('enterprise', interval);
      expect(p.kind).toBe('custom');
      expect(p.fullLabel).toBe('Custom pricing');
    }
  });

  it('covers every plan in every interval, uses USD and is pure', () => {
    for (const plan of pricing.plans) {
      for (const interval of intervals) {
        const a = getPrice(plan.id, interval);
        const b = getPrice(plan.id, interval);
        expect(a).toEqual(b);
        if (a.kind === 'fixed') {
          expect(a.currency).toBe('USD');
          expect(a.perYear).toBeCloseTo(a.perMonth * 12, 5);
        }
      }
    }
  });

  it('computes the annual savings badge from the same prices', () => {
    expect(getAnnualSavingsPercent()).toBe(20);
  });

  it('throws on an unknown plan', () => {
    // @ts-expect-error testing a bad id
    expect(() => getPrice('nope', 'monthly')).toThrow();
  });
});
