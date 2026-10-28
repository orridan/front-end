import { useEffect, type RefObject } from 'react';

/**
 * Footer wordmark fill: when the element nears the viewport, load the GSAP chunk on demand and
 * scrub a wipe (two opposing translateX transforms on [data-fill-mask] and [data-fill-inner]).
 * Without scripts, or with reduced motion, the wordmark simply shows filled.
 */
export function useFillOnScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let revert: (() => void) | null = null;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void import('./gsapMotion').then((m) => {
          if (!cancelled) revert = m.fillOnScroll(el);
        });
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      revert?.();
    };
  }, [ref]);
}
