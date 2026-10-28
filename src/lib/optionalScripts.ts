/**
 * Optional, consent-gated loaders. Nothing in here may run before the visitor allows the
 * matching category. Both are stubs today: wire a real provider in when one is chosen.
 */
import { readEnv } from '../env';

declare global {
  interface Window {
    __orridanOptional?: { analytics?: boolean; chat?: string };
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

/** Runs only when a provider is configured AND the Preferences category is on. */
export function loadChatProvider(): void {
  const provider = readEnv('VITE_CHAT_PROVIDER', 'none').toLowerCase();
  if (chatLoaded || !provider || provider === 'none') return;
  chatLoaded = true;
  window.__orridanOptional = { ...window.__orridanOptional, chat: provider };
  // Add the third-party widget loader for the chosen provider here.
}

export function chatProviderConfigured(): boolean {
  const provider = readEnv('VITE_CHAT_PROVIDER', 'none').toLowerCase();
  return Boolean(provider) && provider !== 'none';
}
