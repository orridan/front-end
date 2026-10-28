import { contact } from '../content';

export type ApiResult = { ok: true } | { ok: false; status: number; code: string };

/**
 * POSTs JSON to the same-origin PHP endpoint. Success is reported only when the server
 * answers 2xx AND its JSON body says { ok: true }.
 */
export async function postForm(payload: Record<string, unknown>, signal?: AbortSignal): Promise<ApiResult> {
  try {
    const res = await fetch(contact.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
      signal,
    });
    let body: { ok?: boolean; error?: string } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      body = {};
    }
    if (res.ok && body.ok === true) return { ok: true };
    return { ok: false, status: res.status, code: typeof body.error === 'string' ? body.error : 'server_error' };
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { ok: false, status: 0, code: 'aborted' };
    return { ok: false, status: 0, code: 'network_error' };
  }
}
