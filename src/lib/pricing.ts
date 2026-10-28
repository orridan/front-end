import { pricing, type Interval, type PlanId } from '../content';

export type Price =
  | {
      kind: 'fixed';
      plan: PlanId;
      interval: Interval;
      /** What the customer pays per billing period. */
      amount: number;
      /** Effective monthly amount, used for the big number on cards. */
      perMonth: number;
      /** Total per year. */
      perYear: number;
      currency: string;
      /** "$40" */
      perMonthLabel: string;
      /** "billed $480 per year" or "billed monthly" */
      billingLabel: string;
      /** "$40 / month, billed $480 per year" */
      fullLabel: string;
    }
  | { kind: 'custom'; plan: PlanId; interval: Interval; label: string; fullLabel: string };

export function formatMoney(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const text = new Intl.NumberFormat('en-US', { minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2, maximumFractionDigits: 2 }).format(rounded);
  return `${pricing.currencySymbol}${text}`;
}

/** The single source for every price shown on the site. Pure: same input, same output. */
export function getPrice(planId: PlanId, interval: Interval): Price {
  const plan = pricing.plans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  if (plan.monthly === null) {
    return { kind: 'custom', plan: planId, interval, label: pricing.customPrice, fullLabel: pricing.customPrice };
  }
  const perMonth = interval === 'annual' ? Math.round(plan.monthly * (1 - pricing.annualDiscount) * 100) / 100 : plan.monthly;
  const perYear = Math.round(perMonth * 12 * 100) / 100;
  const amount = interval === 'annual' ? perYear : perMonth;
  const perMonthLabel = formatMoney(perMonth);
  const billingLabel =
    interval === 'annual' ? pricing.billedAnnually.replace('{total}', formatMoney(perYear)) : pricing.billedMonthly;
  return {
    kind: 'fixed',
    plan: planId,
    interval,
    amount,
    perMonth,
    perYear,
    currency: pricing.currency,
    perMonthLabel,
    billingLabel,
    // Monthly: "$50 / month" (the card shows "Billed monthly." separately). Annual keeps the total.
    fullLabel: interval === 'annual' ? `${perMonthLabel} ${pricing.perMonth}, ${billingLabel}` : `${perMonthLabel} ${pricing.perMonth}`,
  };
}

/** Percentage saved by paying annually, as a whole number (lowest across paid plans). */
export function getAnnualSavingsPercent(): number {
  const percents = pricing.plans
    .filter((p) => p.monthly !== null)
    .map((p) => {
      const m = getPrice(p.id, 'monthly');
      const a = getPrice(p.id, 'annual');
      if (m.kind !== 'fixed' || a.kind !== 'fixed') return 0;
      return Math.round((1 - a.perYear / (m.perMonth * 12)) * 100);
    });
  return percents.length ? Math.min(...percents) : 0;
}
