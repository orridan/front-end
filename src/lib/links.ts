import { stripeLinks, type Interval, type PlanId } from '../content';
import { readEnv } from '../env';
import { isRealUrl } from './placeholder';

export const recaptchaSiteKey = readEnv('VITE_RECAPTCHA_SITE_KEY');

/** A Stripe Payment Link is usable only if it is a real https URL on a Stripe domain. */
export function getStripeLink(plan: PlanId, interval: Interval): string | null {
  const href = stripeLinks[plan][interval];
  if (!isRealUrl(href)) return null;
  try {
    const host = new URL(href).hostname;
    return host === 'buy.stripe.com' || host.endsWith('.stripe.com') ? href : null;
  } catch {
    return null;
  }
}

export const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' } as const;
