export type ApiResult = { ok: true } | { ok: false; status: number; code: string };

type FormspreeBody = { ok?: boolean; error?: string; errors?: { code?: string; field?: string; message?: string }[] };

/**
 * POSTs JSON to a Formspree form endpoint. Success is reported only when Formspree answers
 * 2xx AND its JSON body says { ok: true }.
 */
export async function postForm(endpoint: string, payload: Record<string, unknown>, signal?: AbortSignal): Promise<ApiResult> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    let body: FormspreeBody = {};
    try {
      body = (await res.json()) as FormspreeBody;
    } catch {
      body = {};
    }
    if (res.ok && body.ok === true) return { ok: true };
    if (res.status === 429) return { ok: false, status: res.status, code: 'rate_limited' };
    const text = [body.error, ...(body.errors ?? []).flatMap((e) => [e.code, e.field, e.message])].join(' ');
    return { ok: false, status: res.status, code: /captcha/i.test(text) ? 'captcha_failed' : 'server_error' };
  } catch (err) {
    if ((err as Error).name === 'AbortError') return { ok: false, status: 0, code: 'aborted' };
    return { ok: false, status: 0, code: 'network_error' };
  }
}
