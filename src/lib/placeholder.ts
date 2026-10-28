/** A value is a placeholder when it is empty or wrapped in [square brackets]. */
export function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true;
  const v = value.trim();
  return v === '' || /^\[.*\]$/.test(v);
}

export function isRealUrl(value: string | null | undefined): value is string {
  if (isPlaceholder(value)) return false;
  try {
    const u = new URL(value as string);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value.trim());
}

export function isRealEmail(value: string | null | undefined): value is string {
  return !isPlaceholder(value) && isValidEmail((value as string).trim());
}

export function isRealPhone(value: string | null | undefined): value is string {
  return !isPlaceholder(value) && /^\+?[\d\s().-]{6,}$/.test((value as string).trim());
}

/** tel: href with spaces and punctuation stripped. */
export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in values ? String(values[key]) : `{${key}}`));
}
