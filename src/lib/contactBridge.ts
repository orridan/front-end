/**
 * Lets any button (pricing, FAQ, banners) jump to the contact form with a subject prefilled.
 * The form may mount later (lazy chunk), so the last request is kept until it is consumed.
 */
import { sectionIds } from '../content';
import { prepareAnchorScroll } from './anchorScroll';

const EVENT = 'orridan:contact-prefill';
let pending: string | null = null;

export function requestContact(subject: string, navigate: (to: string) => void): void {
  pending = subject;
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: subject }));
  const target = document.getElementById(sectionIds.contact);
  if (window.location.pathname === '/' && target) {
    if (window.location.hash !== `#${sectionIds.contact}`) {
      window.history.replaceState(window.history.state, '', `#${sectionIds.contact}`);
    }
    void prepareAnchorScroll().then(() =>
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }),
    );
  } else {
    navigate(`/#${sectionIds.contact}`);
  }
}

/** Read without clearing, safe to call from a state initializer. */
export function peekPendingSubject(): string | null {
  return pending;
}

export function consumePendingSubject(): string | null {
  const value = pending;
  pending = null;
  return value;
}

export function onContactPrefill(handler: (subject: string) => void): () => void {
  const listener = (event: Event) => {
    pending = null;
    handler((event as CustomEvent<string>).detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
