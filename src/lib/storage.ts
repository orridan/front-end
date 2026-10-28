/** Storage helpers that never throw (private mode, blocked storage, quota errors). */
type Kind = 'local' | 'session';

function store(kind: Kind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(kind: Kind, key: string): T | null {
  try {
    const raw = store(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(kind: Kind, key: string, value: unknown): boolean {
  try {
    store(kind)?.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(kind: Kind, key: string): void {
  try {
    store(kind)?.removeItem(key);
  } catch {
    // storage unavailable
  }
}
