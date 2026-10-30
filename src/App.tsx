import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { LazyMotion, MotionConfig, m } from 'framer-motion';
import { nav, routes } from './content';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { ScrollManager } from './components/ScrollManager';
import { CookieConsent, ConsentEffects } from './components/CookieConsent';
import { loadLiveChat } from './lib/optionalScripts';
import { Loading } from './components/Loading';
import { usePrefersReducedMotion } from './lib/hooks';
import Home from './pages/Home';
// Product is tiny and is a hero CTA target, so it ships with the main bundle (no layout shift).
import Product from './pages/Product';

import { BelowFold, CheckoutSuccess, Cookies, NotFound, Privacy, Terms } from './lazyRoutes';

const loadMotionFeatures = () => import('./lib/motionFeatures').then((mod) => mod.default);

/** Pink spotlight that follows the pointer on .spotlight cards. Fine pointers only. */
function useSpotlight() {
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null;
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
    };
  }, []);
}

export default function App() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  useSpotlight();
  // Signals that the live app has replaced the prerendered markup (used by tests and focus restore).
  useEffect(() => {
    window.__orridanRestoreFocus?.();
    document.documentElement.setAttribute('data-ready', '');
    // Most links lead back to landing page sections: fetch that chunk while the browser is idle.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => {
      void BelowFold.preload();
      loadLiveChat();
    });
    return () => cancel(handle);
  }, []);
  // The route fade applies to navigations only, never to the first paint (keeps LCP fast).
  // React Router gives the initial location the key 'default'.
  const fade = !reduced && location.key !== 'default';

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user" transition={reduced ? { duration: 0 } : undefined}>
        <a href="#main" className="skip-link">
          {nav.skipLink}
        </a>
        <ScrollManager />
        <ConsentEffects />
        <Nav />
        <m.main
          id="main"
          tabIndex={-1}
          key={location.pathname}
          className="outline-none"
          initial={fade ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: fade ? 0.2 : 0, ease: 'easeOut' }}
        >
          <Suspense fallback={<Loading />}>
            <Routes location={location}>
              <Route path={routes.home} element={<Home />} />
              <Route path={routes.product} element={<Product />} />
              <Route path={routes.privacy} element={<Privacy />} />
              <Route path={routes.terms} element={<Terms />} />
              <Route path={routes.cookies} element={<Cookies />} />
              <Route path={routes.checkoutSuccess} element={<CheckoutSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </m.main>
        <Footer />
        <CookieConsent />
      </MotionConfig>
    </LazyMotion>
  );
}
