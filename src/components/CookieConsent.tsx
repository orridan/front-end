import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { AnimatePresence, m } from 'framer-motion';
import { cookieConsent, routes } from '../content';
import { consentStore, makeConsent, type ConsentRecord } from '../lib/consent';
import { useFocusTrap, useScrollLock } from '../lib/hooks';
import { loadAnalytics } from '../lib/optionalScripts';
import { Icon } from './Icon';

function useConsent(): ConsentRecord | null {
  return useSyncExternalStore(consentStore.subscribe, consentStore.get, () => null);
}
function useDialogOpen(): boolean {
  return useSyncExternalStore(consentStore.subscribe, consentStore.isDialogOpen, () => false);
}

/** Loads optional scripts only after the matching category has been allowed. */
export function ConsentEffects() {
  const consent = useConsent();
  useEffect(() => {
    if (!consent) return;
    if (consent.categories.analytics) loadAnalytics();
  }, [consent]);
  return null;
}

function Switch({
  id,
  checked,
  locked,
  onChange,
  labelledBy,
  describedBy,
}: {
  id: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
  labelledBy: string;
  describedBy: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-disabled={locked || undefined}
      onClick={() => {
        if (!locked) onChange?.(!checked);
      }}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-pill border transition-colors ${
        checked ? 'bg-pink border-pink' : 'bg-navy border-blush/50'
      } ${locked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-6 w-6 rounded-pill transition-transform duration-200 ${checked ? 'bg-navy' : 'bg-blush'}`}
        style={{ transform: `translateX(${checked ? 26 : 4}px)` }}
      />
    </button>
  );
}

function PreferencesDialog({ consent, onClose }: { consent: ConsentRecord | null; onClose: () => void }) {
  const titleId = useId();
  const descId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [prefs, setPrefs] = useState(() => ({
    preferences: consent?.categories.preferences ?? false,
    analytics: consent?.categories.analytics ?? false,
  }));
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  function save() {
    consentStore.set(makeConsent(prefs));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-modal grid place-items-end sm:place-items-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-navy/80" aria-hidden="true" onClick={onClose} />
      <m.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="glass relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 !rounded-b-none sm:!rounded-card"
        style={{ backgroundColor: 'rgb(var(--c1-rgb) / 0.97)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="h-plain text-h3">
            {cookieConsent.dialogTitle}
          </h2>
          <button type="button" onClick={onClose} className="inline-grid place-items-center w-11 h-11 rounded-pill border hairline -mt-1" aria-label={cookieConsent.close}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <p id={descId} className="mt-2 text-muted">
          {cookieConsent.dialogText}
        </p>
        <ul className="mt-6 grid gap-3" role="list">
          {cookieConsent.categories.map((cat) => {
            const labelId = `${titleId}-${cat.id}-label`;
            const textId = `${titleId}-${cat.id}-text`;
            const checked = cat.locked ? true : prefs[cat.id as 'preferences' | 'analytics'];
            return (
              <li key={cat.id} className="rounded-lg2 border hairline p-4 flex items-start gap-4 justify-between">
                <div>
                  <p id={labelId} className="font-semibold">
                    {cat.title}
                    {cat.locked ? <span className="ml-2 eyebrow !text-[0.75rem]">{cookieConsent.alwaysOn}</span> : null}
                  </p>
                  <p id={textId} className="text-small text-muted mt-1">
                    {cat.text}
                  </p>
                </div>
                <Switch
                  id={`${titleId}-${cat.id}`}
                  checked={checked}
                  locked={cat.locked}
                  labelledBy={labelId}
                  describedBy={textId}
                  onChange={(v) => setPrefs((p) => ({ ...p, [cat.id]: v }))}
                />
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button type="button" className="btn btn-primary" onClick={save} data-testid="consent-save">
            {cookieConsent.save}
          </button>
        </div>
      </m.div>
    </div>
  );
}

export function CookieConsent() {
  const consent = useConsent();
  const dialogOpen = useDialogOpen();
  const bannerRef = useRef<HTMLDivElement>(null);
  const showBanner = consent === null && !dialogOpen;

  // Expose the banner height so the chat button can sit above it on small screens.
  useEffect(() => {
    const root = document.documentElement;
    const el = bannerRef.current;
    if (!showBanner || !el || typeof ResizeObserver === 'undefined') {
      root.style.setProperty('--consent-offset', '0px');
      return;
    }
    const ro = new ResizeObserver(() => root.style.setProperty('--consent-offset', `${Math.ceil(el.offsetHeight + 12)}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty('--consent-offset', '0px');
    };
  }, [showBanner]);

  const choose = (preferences: boolean, analytics: boolean) => consentStore.set(makeConsent({ preferences, analytics }));

  return createPortal(
    <>
      {showBanner ? (
        <div
          ref={bannerRef}
          role="region"
          aria-label={cookieConsent.title}
          data-testid="consent-banner"
          className="fixed z-consent bottom-0 inset-x-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[26rem] glass !rounded-b-none sm:!rounded-card p-5 sm:p-6"
          style={{ backgroundColor: 'rgb(var(--c1-rgb) / 0.96)' }}
        >
          <h2 className="h-plain text-[1.125rem] flex items-center gap-2">
            <Icon name="shield" size={20} className="text-pink" />
            {cookieConsent.title}
          </h2>
          <p className="mt-2 text-small text-muted">
            {cookieConsent.text}{' '}
            <Link to={routes.cookies} className="link">
              {cookieConsent.policyLink}
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => choose(true, true)}>
              {cookieConsent.acceptAll}
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => choose(false, false)}>
              {cookieConsent.rejectAll}
            </button>
            <button type="button" className="btn btn-ghost btn-sm col-span-2" onClick={() => consentStore.openPreferences()}>
              {cookieConsent.customise}
            </button>
          </div>
        </div>
      ) : null}
      <AnimatePresence>
        {dialogOpen ? <PreferencesDialog key="prefs" consent={consent} onClose={() => consentStore.closePreferences()} /> : null}
      </AnimatePresence>
    </>,
    document.body,
  );
}
