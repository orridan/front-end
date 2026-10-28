import type { FaqItem } from '../content';
import { fill } from './placeholder';
import { getPrice } from './pricing';

/** Fills price tokens in FAQ answers from getPrice(), so the FAQ always matches the pricing section. */
export function faqAnswer(item: Pick<FaqItem, 'answer'>): string {
  const label = (plan: 'organisation' | 'twin') => {
    const p = getPrice(plan, 'monthly');
    return p.kind === 'fixed' ? p.perMonthLabel : p.label;
  };
  return fill(item.answer, { organisationPrice: label('organisation'), twinPrice: label('twin') });
}
