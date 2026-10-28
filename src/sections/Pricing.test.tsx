/**
 * Pricing consistency: renders the real Pricing section in both intervals and fails if any
 * two places (cards, comparison table, badge, checkout labels) show different numbers for
 * the same plan. Runs as part of `npm run build`.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { pricing, type Interval } from '../content';
import { getPrice } from '../lib/pricing';
import { Pricing } from './Pricing';

afterEach(cleanup);

function renderPricing() {
  return render(
    <MemoryRouter>
      <Pricing />
    </MemoryRouter>,
  );
}

function assertConsistent(container: HTMLElement, interval: Interval) {
  for (const plan of pricing.plans) {
    const expected = getPrice(plan.id, interval);
    const cardValues = Array.from(container.querySelectorAll<HTMLElement>(`[data-price-plan="${plan.id}"]`)).map((el) => el.dataset.priceValue);
    const tableValues = Array.from(container.querySelectorAll<HTMLElement>(`[data-table-price="${plan.id}"]`)).map((el) => el.dataset.priceValue);
    const all = [...cardValues, ...tableValues];
    expect(all.length).toBeGreaterThanOrEqual(2);
    const want = expected.kind === 'fixed' ? String(expected.perMonth) : 'custom';
    for (const v of all) expect(v).toBe(want);

    const table = container.querySelector(`[data-table-price="${plan.id}"]`);
    expect(table?.textContent).toBe(expected.fullLabel);
    if (expected.kind === 'fixed') {
      const card = container.querySelector(`[data-price-plan="${plan.id}"]`);
      expect(card?.textContent).toBe(expected.perMonthLabel);
      expect(container.querySelector(`[data-price-billing="${plan.id}"]`)?.textContent).toBe(expected.billingLabel);
      // Checkout labels (screen reader text on the sandbox link) use the same getPrice output.
      const cta = container.querySelector(`[data-testid="plan-cta-${plan.id}"]`);
      if (cta?.tagName === 'A') expect(cta.textContent).toContain(expected.fullLabel);
    }
  }
}

describe('Pricing section consistency', () => {
  it('shows the same monthly numbers everywhere', () => {
    const { container } = renderPricing();
    assertConsistent(container, 'monthly');
    expect(container.textContent).toContain('$50');
    expect(container.textContent).toContain('$150');
  });

  it('offers monthly billing only: no annual switch, savings badge or test-card note', () => {
    const { container, queryByTestId } = renderPricing();
    expect(queryByTestId('interval-switch')).toBeNull();
    expect(queryByTestId('savings-badge')).toBeNull();
    expect(container.textContent).not.toContain('per year');
    expect(container.textContent).not.toContain('4242 4242');
    expect(queryByTestId('sandbox-badge')?.textContent).toBe(pricing.sandbox.badge);
  });

  it('disables checkout with a clear label when a payment link is missing', () => {
    const { getByTestId } = renderPricing();
    for (const plan of pricing.plans.filter((p) => p.monthly !== null)) {
      const cta = getByTestId(`plan-cta-${plan.id}`);
      if (cta.tagName === 'BUTTON') {
        expect(cta.hasAttribute('disabled')).toBe(true);
        expect(cta.textContent).toBe(pricing.sandbox.notConfigured);
      } else {
        expect(cta.getAttribute('href')).toMatch(/^https:\/\/buy\.stripe\.com\//);
        expect(cta.getAttribute('target')).toBe('_blank');
        expect(cta.getAttribute('rel')).toBe('noopener noreferrer');
      }
    }
  });
});
