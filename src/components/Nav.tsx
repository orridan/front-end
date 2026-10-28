import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, m } from 'framer-motion';
import { drawing, nav, routes, sectionMeta, site, type NavItem } from '../content';
import { useFocusTrap, useScrollLock, useScrollSpy } from '../lib/hooks';
import { ExternalLink, SectionLink } from './Links';
import { Logo } from './Logo';
import { Icon } from './Icon';

const spyIds = sectionMeta.map((s) => s.id).filter((id) => id !== 'top');

/** Tracks the condensed state of the capsule. */
function useScrollChrome() {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let upTravel = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Condense when scrolling down past the hero. Expand only after a deliberate upward scroll
      // (80px), so scroll anchoring and small jitter never make the capsule flicker.
      if (y < 160) {
        setCondensed(false);
        upTravel = 0;
      } else if (y > lastY) {
        upTravel = 0;
        if (y > lastY + 4) setCondensed(true);
      } else if (y < lastY) {
        upTravel += lastY - y;
        if (upTravel > 80) setCondensed(false);
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return condensed;
}

function DesktopLinks({ items, activeSection, pathname, hidden }: { items: NavItem[]; activeSection: string | null; pathname: string; hidden: boolean }) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Slide the pink indicator under the active link (DOM write, transform only).
  useLayoutEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;
    const active = list.querySelector<HTMLElement>('[aria-current]');
    if (!active) {
      bar.style.opacity = '0';
      return;
    }
    bar.style.opacity = '1';
    bar.style.transform = `translateX(${active.offsetLeft + 10}px) scaleX(${(active.offsetWidth - 20) / 100})`;
  }, [activeSection, pathname, items]);

  return (
    <ul
      ref={listRef}
      className={`relative items-center ${hidden ? 'hidden' : 'hidden lg:flex'}`}
      role="list"
    >
      {items.map((item) => {
        const active = item.sectionId ? pathname === routes.home && activeSection === item.sectionId : pathname === item.to;
        const cls = `relative inline-flex items-center min-h-[44px] px-3 text-[0.875rem] font-medium ${active ? 'text-light' : 'text-light/80 hover:text-light'}`;
        return (
          <li key={item.label}>
            {item.sectionId ? (
              <SectionLink sectionId={item.sectionId} className={cls} ariaCurrent={active ? 'location' : undefined}>
                {item.label}
              </SectionLink>
            ) : (
              <Link to={item.to ?? routes.home} className={cls} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            )}
          </li>
        );
      })}
      <span
        ref={barRef}
        aria-hidden="true"
        className="absolute left-0 bottom-1 w-[100px] h-[2px] bg-pink origin-left transition-[transform,opacity] duration-300 ease-out shadow-[0_0_8px_rgb(var(--c2-rgb))]"
        style={{ opacity: 0 }}
      />
    </ul>
  );
}

function Cta({ onProduct, onNavigate, block }: { onProduct: boolean; onNavigate?: () => void; block?: boolean }) {
  const cls = `btn btn-primary btn-sm shimmer !rounded-pill ${block ? 'w-full !min-h-[52px]' : ''}`;
  if (onProduct) {
    return (
      <ExternalLink href={site.dashboardUrl} className={cls} onClick={onNavigate}>
        {nav.productCta.label}
        <Icon name="external" size={16} />
      </ExternalLink>
    );
  }
  return (
    <Link to={nav.cta.to} className={cls} onClick={onNavigate}>
      {nav.cta.label}
      <Icon name="arrowRight" size={16} />
    </Link>
  );
}

/** Full-screen menu drawn as an asset tree: Facility > Line > Asset branches. */
function AssetTree({
  items,
  activeSection,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  activeSection: string | null;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="relative pl-1">
      <p className="flex items-center gap-3 mono text-[0.75rem] uppercase tracking-[0.14em] text-blush">
        <span className="stamp !py-1 !px-2 !text-[0.6875rem]">{drawing.menuTree.facility}</span>
        {drawing.menuTree.root}
      </p>
      <div className="ml-5 mt-3 border-l border-blush/40 pl-5">
        <p className="relative mono text-[0.75rem] uppercase tracking-[0.14em] text-blush/90">
          <span aria-hidden="true" className="absolute -left-5 top-1/2 w-4 h-px bg-blush/40" />
          <span className="stamp !py-1 !px-2 !text-[0.6875rem]">{drawing.menuTree.line}</span>
        </p>
        <ul className="ml-5 mt-2 border-l border-blush/40" role="list">
          {items.map((item, i) => {
            const active = item.sectionId ? pathname === routes.home && activeSection === item.sectionId : pathname === item.to;
            const cls = `flex items-center gap-4 min-h-[56px] py-2 pr-2 display text-[clamp(1.75rem,1.3rem+2vw,2.75rem)] ${active ? 'text-pink' : 'text-light'}`;
            return (
              <m.li
                key={item.label}
                className="relative pl-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i + 0.1, duration: 0.25 }}
              >
                <m.span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 w-5 h-px bg-pink origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.06 * i, duration: 0.25 }}
                />
                <span aria-hidden="true" className="absolute left-[1.1rem] -top-0 mono text-[0.625rem] text-blush/60 pt-1">
                  {drawing.menuTree.asset} {String(i + 1).padStart(2, '0')}
                </span>
                {item.sectionId ? (
                  <SectionLink sectionId={item.sectionId} className={cls} ariaCurrent={active ? 'location' : undefined} onClick={onNavigate}>
                    {item.label}
                  </SectionLink>
                ) : (
                  <Link to={item.to ?? routes.home} className={cls} aria-current={active ? 'page' : undefined} onClick={onNavigate}>
                    {item.label}
                  </Link>
                )}
              </m.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function Nav() {
  const { pathname, key } = useLocation();
  const onHome = pathname === routes.home;
  const onProduct = pathname === routes.product;
  const items = onProduct ? nav.productLinks : nav.homeLinks;
  const activeSection = useScrollSpy(spyIds, onHome);
  const condensed = useScrollChrome();

  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  // Close on route change, including hash changes.
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    if (open) setOpen(false);
  }

  useFocusTrap(menuRef, open, close, closeRef, toggleRef);
  useScrollLock(open);

  // The menu is portalled to <body> (backdrop-filter on the capsule would trap position: fixed).
  // Everything outside the open menu is hidden from screen readers.
  useEffect(() => {
    if (!open) return;
    const targets = ['site-header', 'main', 'site-footer'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    targets.forEach((el) => el.setAttribute('aria-hidden', 'true'));
    return () => targets.forEach((el) => el.removeAttribute('aria-hidden'));
  }, [open]);

  const activeIndex = onHome ? Math.max(0, sectionMeta.findIndex((s) => s.id === (activeSection ?? 'top'))) : -1;
  const sheetLabel = onHome
    ? `${String(activeIndex + 1).padStart(2, '0')} / ${sectionMeta[activeIndex].label}`
    : onProduct
      ? drawing.labels.productSheet
      : null;

  return (
    <header id="site-header" className="fixed top-3 sm:top-4 inset-x-0 z-nav pointer-events-none">
      <div className="container-site relative flex justify-center">
        {sheetLabel ? (
          <p className="hidden xl:flex absolute left-[var(--gutter)] top-1/2 -translate-y-1/2 items-center gap-2 capsule rounded-pill px-3 py-1.5 mono text-[0.6875rem] uppercase tracking-[0.14em] text-blush" aria-hidden="true" data-testid="sheet-label">
            <span className="w-6 h-px bg-pink" />
            {sheetLabel}
          </p>
        ) : null}
        <nav aria-label="Primary" className="capsule pointer-events-auto rounded-pill flex items-center gap-1 h-14 pl-1.5 pr-1.5 max-w-full">
          <Link to={routes.home} className="inline-flex items-center h-11 rounded-pill pl-4 pr-3 shrink-0" aria-label={nav.homeAria}>
            <Logo variant="light" height={20} className="max-w-none" />
          </Link>

          {!condensed ? <span className="hidden lg:block w-px h-6 bg-blush/25" aria-hidden="true" /> : null}
          <DesktopLinks items={items} activeSection={activeSection} pathname={pathname} hidden={condensed} />

          <div className={`hidden lg:block ${condensed ? 'lg:hidden' : ''}`}>
            <Cta onProduct={onProduct} />
          </div>
          <button
            ref={toggleRef}
            type="button"
            className={`inline-flex items-center gap-2 h-11 px-4 rounded-pill border border-blush/40 mono text-[0.75rem] uppercase tracking-[0.14em] text-light ${condensed ? '' : 'lg:hidden'}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={nav.menuOpen}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={18} />
            <span aria-hidden="true">{drawing.menuLabel}</span>
          </button>
        </nav>
      </div>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <m.div
              key="menu"
              ref={menuRef}
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label={nav.menuTitle}
              tabIndex={-1}
              className="fixed inset-0 z-overlay drawing atmosphere flex flex-col dynamic-height"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container-site flex items-center justify-between pt-4" style={{ minHeight: 'var(--nav-h)' }}>
                <Link to={routes.home} onClick={close} className="inline-flex" aria-label={nav.homeAria}>
                  <Logo variant="light" height={28} />
                </Link>
                <button
                  ref={closeRef}
                  type="button"
                  className="inline-flex items-center gap-2 h-11 px-4 rounded-pill border border-blush/40 mono text-[0.75rem] uppercase tracking-[0.14em]"
                  aria-label={nav.menuClose}
                  onClick={close}
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
              <div className="container-site flex-1 overflow-y-auto pt-6 pb-10 grid gap-10 content-start lg:grid-cols-[1fr_auto] lg:items-end">
                <AssetTree items={items} activeSection={activeSection} pathname={pathname} onNavigate={close} />
                <div className="lg:min-w-[16rem]">
                  <Cta onProduct={onProduct} onNavigate={close} block />
                </div>
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
}
