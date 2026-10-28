/**
 * GSAP + ScrollTrigger, imported only by below-the-fold chunks so the hero stays light.
 * Every use runs inside gsap.context() and is reverted on cleanup (StrictMode safe).
 * Content is never hidden before GSAP runs, so if this chunk fails everything stays visible.
 */
import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ROUTE_CHANGE_EVENT } from './events';

gsap.registerPlugin(ScrollTrigger);

/**
 * Refresh without restoring a remembered scroll position. ScrollTrigger otherwise restores the
 * position it recorded earlier, which snaps a visitor who has just started scrolling back to it.
 */
function safeRefresh() {
  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh();
}

let wired = false;
function wireGlobalRefresh() {
  if (wired || typeof window === 'undefined') return;
  wired = true;
  const refresh = () => requestAnimationFrame(safeRefresh);
  document.fonts?.ready.then(refresh).catch(() => undefined);
  window.addEventListener(ROUTE_CHANGE_EVENT, () => {
    // ScrollTrigger remembers the old page's scroll position and would restore it after a
    // refresh. The ScrollManager owns scrolling on navigation, so forget it.
    ScrollTrigger.clearScrollMemory('manual');
    refresh();
  });
  window.addEventListener('load', refresh, { once: true });
}

function reducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

/** Runs `setup` inside a gsap.context scoped to `scope`, unless reduced motion is requested. */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (root: HTMLElement) => void) {
  useEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion()) return;
    wireGlobalRefresh();
    // Set up after the browser is idle: keeps measurement work out of the first-load long tasks.
    let ctx: gsap.Context | null = null;
    const run = () => {
      ctx = gsap.context(() => setup(root), root);
      safeRefresh();
    };
    const handle = window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 600 }) : window.setTimeout(run, 200);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      ctx?.revert();
    };
    // setup is defined inline by callers and only needs to run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}

/** Staggered reveal for [data-reveal] children. Items already on screen stay as they are. */
export function revealChildren(root: HTMLElement) {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92,
  );
  if (!items.length) return;
  // Opacity only (never visibility) so unrevealed items stay in the keyboard tab order.
  gsap.set(items, { opacity: 0, y: 24 });
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        overwrite: true,
        // Hand transforms back to CSS so hover lift keeps working.
        clearProps: 'transform,opacity',
      }),
  });
}

/** Count-up for [data-count] elements. The final value is in the DOM from the start. */
export function countUp(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || el.getBoundingClientRect().top < window.innerHeight) return;
    const state = { value: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          value: target,
          duration: 1.1,
          ease: 'power1.out',
          onUpdate: () => {
            el.textContent = String(Math.round(state.value));
          },
        }),
    });
  });
}

/** Draws [data-connector] lines (scaleY or scaleX) as `trigger` scrolls through the viewport. */
export function drawConnectors(root: HTMLElement, trigger: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-connector]').forEach((line) => {
    const axis = line.dataset.connector === 'x' ? 'scaleX' : 'scaleY';
    gsap.fromTo(
      line,
      { [axis]: 0 },
      {
        [axis]: 1,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
      },
    );
  });
}

/** Dimension lines ([data-measure]) measure out from zero as they scroll into view. */
export function measureLines(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-measure]').forEach((line) => {
    if (line.getBoundingClientRect().top < window.innerHeight) return;
    const axis = line.dataset.measure === 'y' ? 'scaleY' : 'scaleX';
    gsap.fromTo(
      line,
      { [axis]: 0 },
      { [axis]: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: line, start: 'top 92%', once: true }, clearProps: 'transform' },
    );
  });
}

/** Scrubbed wipe for the footer wordmark. Returns a revert function. */
export function fillOnScroll(el: HTMLElement): () => void {
  wireGlobalRefresh();
  const mask = el.querySelector<HTMLElement>('[data-fill-mask]');
  const inner = el.querySelector<HTMLElement>('[data-fill-inner]');
  if (!mask || !inner) return () => undefined;
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 85%', scrub: 0.5 } });
    tl.fromTo(mask, { xPercent: -100 }, { xPercent: 0, ease: 'none' }, 0).fromTo(inner, { xPercent: 100 }, { xPercent: 0, ease: 'none' }, 0);
  }, el);
  return () => ctx.revert();
}
