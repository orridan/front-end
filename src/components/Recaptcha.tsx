import { useEffect, useRef, useState, type RefObject } from 'react';
import { contact } from '../content';

type Grecaptcha = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    orridanRecaptchaLoaded?: () => void;
  }
}

const RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js?onload=orridanRecaptchaLoaded&render=explicit&hl=en';

let scriptPromise: Promise<void> | null = null;

/** Loads the reCAPTCHA script once per page (module-level promise, StrictMode safe). */
function loadRecaptcha(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      window.orridanRecaptchaLoaded = () => resolve();
      const s = document.createElement('script');
      s.src = RECAPTCHA_SRC;
      s.async = true;
      s.defer = true;
      s.onerror = () => {
        scriptPromise = null;
        s.remove();
        reject(new Error('recaptcha_load_failed'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Google reCAPTCHA v2 checkbox. The script loads only when `trigger` scrolls near the viewport.
 * `resetKey` changes after each submission because tokens are single-use.
 */
export function Recaptcha({
  siteKey,
  trigger,
  onToken,
  resetKey,
  describedBy,
}: {
  siteKey: string;
  trigger: RefObject<HTMLElement | null>;
  onToken: (token: string | null) => void;
  resetKey: number;
  describedBy?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const onTokenRef = useRef(onToken);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const target = trigger.current;
    if (!target) return;
    let cancelled = false;
    const start = () => {
      setState((s) => (s === 'idle' ? 'loading' : s));
      loadRecaptcha()
        .then(() => {
          if (cancelled || !boxRef.current || !window.grecaptcha) return;
          if (widgetId.current === null && boxRef.current.childElementCount === 0) {
            widgetId.current = window.grecaptcha.render(boxRef.current, {
              sitekey: siteKey,
              theme: 'dark',
              callback: (token: string) => onTokenRef.current(token),
              'expired-callback': () => onTokenRef.current(null),
              'error-callback': () => onTokenRef.current(null),
            });
          }
          setState('ready');
        })
        .catch(() => {
          if (!cancelled) setState('failed');
        });
    };
    if (typeof IntersectionObserver === 'undefined') {
      start();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(target);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [siteKey, trigger]);

  useEffect(() => {
    if (resetKey === 0) return;
    if (widgetId.current !== null && window.grecaptcha) window.grecaptcha.reset(widgetId.current);
    onTokenRef.current(null);
  }, [resetKey]);

  return (
    <div className="min-h-[78px]" aria-describedby={describedBy}>
      <div ref={boxRef} data-testid="recaptcha-box" />
      {state === 'loading' ? <p className="text-small text-muted">{contact.captchaLoading}</p> : null}
      {state === 'failed' ? (
        <p className="field-error" role="alert">
          {contact.captchaFailed}
        </p>
      ) : null}
    </div>
  );
}
