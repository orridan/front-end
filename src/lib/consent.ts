import { cookieConsent } from '../content';

export type ConsentCategories = { necessary: true; preferences: boolean; analytics: boolean };

export type ConsentRecord = {
  version: string;
  timestamp: string;
  categories: ConsentCategories;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const CONSENT_KEY = cookieConsent.storageKey;
export const CONSENT_VERSION = cookieConsent.policyVersion;

export function makeConsent(choice: { preferences: boolean; analytics: boolean }, now = new Date()): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    timestamp: now.toISOString(),
    categories: { necessary: true, preferences: Boolean(choice.preferences), analytics: Boolean(choice.analytics) },
  };
}

/** Returns the stored consent, or null if missing, invalid or from an older policy version. */
export function readConsent(storage: StorageLike | null | undefined): ConsentRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord> | null;
    if (!parsed || parsed.version !== CONSENT_VERSION || typeof parsed.timestamp !== 'string') return null;
    const c = parsed.categories;
    if (!c || typeof c.preferences !== 'boolean' || typeof c.analytics !== 'boolean') return null;
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      categories: { necessary: true, preferences: c.preferences, analytics: c.analytics },
    };
  } catch {
    return null;
  }
}

export function writeConsent(storage: StorageLike | null | undefined, record: ConsentRecord): boolean {
  if (!storage) return false;
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* A tiny store so the banner, dialog, footer button and optional loaders share state. */
type Listener = () => void;
const listeners = new Set<Listener>();
let current: ConsentRecord | null | undefined;
let dialogOpen = false;

export const consentStore = {
  get(): ConsentRecord | null {
    if (current === undefined) current = readConsent(safeLocalStorage());
    return current;
  },
  set(record: ConsentRecord) {
    current = record;
    writeConsent(safeLocalStorage(), record);
    listeners.forEach((l) => l());
  },
  /** Footer "Cookie preferences" button and the banner Customise button. */
  openPreferences() {
    dialogOpen = true;
    listeners.forEach((l) => l());
  },
  closePreferences() {
    dialogOpen = false;
    listeners.forEach((l) => l());
  },
  isDialogOpen(): boolean {
    return dialogOpen;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Test helper. */
  reset() {
    current = undefined;
    dialogOpen = false;
  },
};
