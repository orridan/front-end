import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('inert') && el.getClientRects().length > 0,
  );
}

/**
 * Traps Tab focus inside `ref` while active, closes on Escape and restores focus to the
 * element that was focused before opening. StrictMode safe: all listeners are removed on cleanup.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
  /** Where focus goes on close. Needed because Safari does not focus buttons on click. */
  returnFocus?: RefObject<HTMLElement | null>,
) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const focused = document.activeElement as HTMLElement | null;
    const previous = returnFocus?.current ?? (focused && focused !== document.body ? focused : null);
    const frame = requestAnimationFrame(() => {
      const target = initialFocus?.current ?? focusables(root)[0] ?? root;
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables(root);
      if (items.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      // Move focus manually so every browser follows the same order. Safari skips links on
      // Tab by default, which would otherwise let focus escape the dialog.
      event.preventDefault();
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? items[index <= 0 ? items.length - 1 : index - 1]
        : items[index === -1 || index === items.length - 1 ? 0 : index + 1];
      next.focus();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus, returnFocus]);
}

/** Locks page scroll while active, restoring the previous inline styles afterwards. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.overflow, body: body.style.overflow, pad: body.style.paddingRight };
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.paddingRight = prev.pad;
    };
  }, [active]);
}

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
    const mql = window.matchMedia(query);
    if (mql.addEventListener) {
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    }
    // Safari < 14 fallback
    mql.addListener(callback);
    return () => mql.removeListener(callback);
  };
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Scroll-spy: returns the id of the last section whose top has passed 40% of the viewport, or
 * null while the hero (id "top") is still in charge. Computed on scroll frames, so a fast jump
 * always resolves to the right section. Sections that mount later are found on the next frame.
 */
export function useScrollSpy(ids: string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    if (!enabled) return;
    const wanted = key.split('|');
    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const id of wanted) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Late layout (lazy sections, fonts) can move sections without a scroll event.
    const interval = window.setInterval(schedule, 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, key]);

  return enabled ? active : null;
}

/**
 * Pauses CSS animations inside the element while it is off screen or the tab is hidden, by
 * toggling a data-paused attribute (see the [data-paused] rules in index.css).
 */
export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const apply = () => {
      if (visible && document.visibilityState === 'visible') el.removeAttribute('data-paused');
      else el.setAttribute('data-paused', '');
    };
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            apply();
          })
        : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', apply);
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', apply);
      el.removeAttribute('data-paused');
    };
  }, [ref]);
}
