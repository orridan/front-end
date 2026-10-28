import { beforeEach, describe, expect, it } from 'vitest';
import { CONSENT_KEY, CONSENT_VERSION, consentStore, makeConsent, readConsent, writeConsent } from './consent';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

describe('consent storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    consentStore.reset();
  });

  it('returns null when nothing is stored', () => {
    expect(readConsent(memoryStorage())).toBeNull();
  });

  it('round trips a versioned record with a timestamp', () => {
    const s = memoryStorage();
    const record = makeConsent({ preferences: true, analytics: false }, new Date('2026-01-02T03:04:05Z'));
    expect(writeConsent(s, record)).toBe(true);
    const read = readConsent(s);
    expect(read).toEqual(record);
    expect(read?.version).toBe(CONSENT_VERSION);
    expect(read?.timestamp).toBe('2026-01-02T03:04:05.000Z');
    expect(read?.categories.necessary).toBe(true);
  });

  it('asks again when the policy version changes', () => {
    const s = memoryStorage({
      [CONSENT_KEY]: JSON.stringify({ version: 'old', timestamp: 'x', categories: { necessary: true, preferences: true, analytics: true } }),
    });
    expect(readConsent(s)).toBeNull();
  });

  it('ignores corrupt or malformed values', () => {
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: '{not json' }))).toBeNull();
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: JSON.stringify({ version: CONSENT_VERSION }) }))).toBeNull();
    expect(readConsent(memoryStorage({ [CONSENT_KEY]: 'null' }))).toBeNull();
  });

  it('survives storage that throws', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(readConsent(throwing)).toBeNull();
    expect(writeConsent(throwing, makeConsent({ preferences: false, analytics: false }))).toBe(false);
    expect(readConsent(null)).toBeNull();
  });

  it('forces necessary on and coerces flags to booleans', () => {
    const r = makeConsent({ preferences: 1 as unknown as boolean, analytics: 0 as unknown as boolean });
    expect(r.categories).toEqual({ necessary: true, preferences: true, analytics: false });
  });

  it('store persists to localStorage and notifies subscribers', () => {
    let calls = 0;
    const unsubscribe = consentStore.subscribe(() => {
      calls += 1;
    });
    expect(consentStore.get()).toBeNull();
    consentStore.set(makeConsent({ preferences: false, analytics: true }));
    expect(calls).toBe(1);
    expect(readConsent(window.localStorage)?.categories.analytics).toBe(true);
    consentStore.openPreferences();
    expect(consentStore.isDialogOpen()).toBe(true);
    consentStore.closePreferences();
    expect(consentStore.isDialogOpen()).toBe(false);
    unsubscribe();
    consentStore.set(makeConsent({ preferences: false, analytics: false }));
    expect(calls).toBe(3);
  });
});
