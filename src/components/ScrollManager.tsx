import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { prepareAnchorScroll } from '../lib/anchorScroll';
import { ROUTE_CHANGE_EVENT } from '../lib/events';

function instantScrollTo(top: number) {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  html.style.scrollBehavior = prev;
}

function reduced(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

/**
 * Route change: jump to the top instantly. With a hash: wait for the target (it may live in a
 * lazy chunk), then scroll to it. Same-page hash links scroll smoothly. Browser scroll
 * restoration is disabled in index.html so it never fights this.
 */
export function ScrollManager() {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);

  useEffect(() => {
    const { pathname, hash } = location;
    const samePage = previousPath.current === pathname;
    const firstLoad = previousPath.current === null;
    previousPath.current = pathname;
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));

    if (!samePage && !firstLoad) {
      const main = document.getElementById('main');
      main?.focus({ preventScroll: true });
    }

    if (!hash) {
      // First load already starts at the top (scroll restoration is manual); forcing it again
      // would yank back a visitor who has already started scrolling the prerendered page.
      if (firstLoad) return;
      if (samePage) {
        window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
        return;
      }
      instantScrollTo(0);
      // Re-assert once after layout settles (lazy route chunks, scroll-linked libraries).
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => instantScrollTo(0));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      id = hash.slice(1);
    }
    if (!samePage) instantScrollTo(0);

    let frame = 0;
    let settleTimer = 0;
    const started = performance.now();
    const go = (smooth: boolean) => {
      const el = document.getElementById(id);
      if (!el) return false;
      if (smooth) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else {
        const top = el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
        instantScrollTo(Math.max(0, top));
      }
      return true;
    };
    let cancelled = false;
    const attempt = () => {
      if (document.getElementById(id)) {
        // Render offscreen sections for real first so the target position is exact.
        void prepareAnchorScroll().then(() => {
          if (cancelled) return;
          go(samePage && !reduced());
          if (!samePage) {
            // Late layout (fonts, lazy sections above) can shift the target: correct once.
            settleTimer = window.setTimeout(() => go(false), 350);
          }
        });
        return;
      }
      if (performance.now() - started < 5000) frame = requestAnimationFrame(attempt);
    };
    // Same-page jumps wait two frames so a closing overlay can release its scroll lock first
    // (switching overflow back on cancels an in-flight smooth scroll).
    if (samePage) frame = requestAnimationFrame(() => (frame = requestAnimationFrame(attempt)));
    else attempt();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
    // location.key changes on every navigation, including clicking the same hash again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return null;
}
