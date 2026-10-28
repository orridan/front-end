import { StrictMode, startTransition } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { preloadRoute } from './lazyRoutes';
import './styles/index.css';

const INTRO_MS = 1200;

declare global {
  interface Window {
    __orridanRestoreFocus?: () => void;
  }
}
const container = document.getElementById('root');

if (container) {
  // Built pages ship prerendered markup (scripts/postbuild.ts). React renders fresh rather than
  // hydrating (no hydration mismatch errors), and the static markup stays visible until then.
  const prerendered = container.firstElementChild !== null;
  const app = (
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  // Remember what the visitor focused on the static markup so focus survives the swap.
  const focusKey = (el: Element | null): string | null => {
    if (!(el instanceof HTMLElement) || el === document.body) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;
    const testId = el.getAttribute('data-testid');
    if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
    const href = el.getAttribute('href');
    if (href) return `${el.tagName.toLowerCase()}[href="${CSS.escape(href)}"]`;
    return null;
  };
  window.__orridanRestoreFocus = () => {
    const key = focusKey(lastFocused);
    document.removeEventListener('focusin', onFocusIn);
    if (!key || (document.activeElement && document.activeElement !== document.body)) return;
    document.querySelector<HTMLElement>(key)?.focus({ preventScroll: true });
  };
  let lastFocused: Element | null = null;
  const onFocusIn = (e: FocusEvent) => {
    lastFocused = e.target as Element;
  };
  if (prerendered) document.addEventListener('focusin', onFocusIn);

  // Prerendered pages swap inside a transition so React can time-slice the render (short tasks).
  // Chunks are preloaded first, so nothing suspends and the static markup stays until the commit.
  const mount = () => {
    const root = createRoot(container);
    if (prerendered) startTransition(() => root.render(app));
    else root.render(app);
  };

  if (!prerendered) {
    mount();
  } else {
    // Load this route's chunks first, and let the intro finish on the static markup, then swap
    // in one commit (no suspense fallback, no intro replay).
    const html = document.documentElement;
    const introLeft = html.classList.contains('intro-play') ? Math.max(0, INTRO_MS - performance.now()) : 0;
    const introDone = new Promise((resolve) => window.setTimeout(resolve, introLeft));
    void Promise.all([preloadRoute(window.location.pathname), introDone]).then(() => {
      html.classList.remove('intro-play');
      mount();
    });
  }
}
