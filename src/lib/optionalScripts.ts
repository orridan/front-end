/**
 * Optional, consent-gated loaders. Nothing in here may run before the visitor allows the
 * matching category. Live chat is the exception: it loads for everyone.
 */
import { site } from '../content';

type ChatwootApi = { toggle: (state?: 'open' | 'close') => void };

declare global {
  interface Window {
    __orridanOptional?: { analytics?: boolean; chat?: string };
    chatwootSettings?: Record<string, unknown>;
    chatwootSDK?: { run: (config: { websiteToken: string; baseUrl: string }) => void };
    $chatwoot?: ChatwootApi;
  }
}

let analyticsLoaded = false;
let chatLoaded = false;

/** Runs only when the Analytics category is on. Add the provider's script here. */
export function loadAnalytics(): void {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  window.__orridanOptional = { ...window.__orridanOptional, analytics: true };
  // Example for a future provider:
  // const s = document.createElement('script'); s.src = 'https://analytics.example/script.js'; s.defer = true;
  // document.head.appendChild(s);
}

/** Chatwoot live chat. Loads for every visitor once the app has started (not consent-gated, at the client's request). */
export function loadLiveChat(): void {
  const { baseUrl, websiteToken } = site.chatwoot;
  if (chatLoaded || !websiteToken) return;
  chatLoaded = true;
  window.chatwootSettings = { position: 'right', type: 'standard', launcherTitle: '' };
  const script = document.createElement('script');
  script.src = `${baseUrl}/packs/js/sdk.js`;
  script.async = true;
  script.onload = () => window.chatwootSDK?.run({ websiteToken, baseUrl });
  document.head.appendChild(script);
}

/** Opens the chat window. Returns false while the widget has not loaded yet. */
export function openLiveChat(): boolean {
  if (!window.$chatwoot) return false;
  window.$chatwoot.toggle('open');
  return true;
}
