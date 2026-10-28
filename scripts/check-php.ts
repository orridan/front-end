/**
 * npm run check:php
 * 1. php -l on every PHP file in public/api.
 * 2. Confirms the PHP subject list matches content.ts.
 * 3. Runs contact.php under PHP's built-in server with a throwaway config and checks the
 *    rejection paths: method, content type, size, JSON, type, honeypot, validation,
 *    reCAPTCHA failure and rate limiting. Mail is never actually sent.
 * Skips with a warning (exit 0) when PHP is not installed.
 */
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = join(root, 'public/api');
const content = await import('../src/content.ts');

const version = spawnSync('php', ['-v'], { encoding: 'utf8' });
if (version.error || version.status !== 0) {
  console.warn('check:php SKIPPED: php is not installed on this machine. Run it where PHP 7.4+ is available.');
  process.exit(0);
}

const errors: string[] = [];
for (const file of ['contact.php', 'config.example.php']) {
  const r = spawnSync('php', ['-l', join(apiDir, file)], { encoding: 'utf8' });
  if (r.status !== 0) errors.push(`php -l ${file}: ${r.stdout}${r.stderr}`);
}

const php = readFileSync(join(apiDir, 'contact.php'), 'utf8');
const subjectsMatch = /const SUBJECTS = \[([^\]]*)\]/.exec(php);
const phpSubjects = subjectsMatch ? [...subjectsMatch[1].matchAll(/'([^']*)'/g)].map((m) => m[1]) : [];
if (JSON.stringify(phpSubjects) !== JSON.stringify(content.contact.subjects)) {
  errors.push(`contact.php SUBJECTS ${JSON.stringify(phpSubjects)} differ from content.ts ${JSON.stringify(content.contact.subjects)}`);
}

/* Functional run in an isolated copy. */
const work = mkdtempSync(join(tmpdir(), 'orridan-php-'));
const docroot = join(work, 'site');
cpSync(apiDir, join(docroot, 'api'), { recursive: true });
writeFileSync(
  join(docroot, 'api', 'config.php'),
  `<?php\ndefine('RECAPTCHA_SECRET', 'test-secret');\ndefine('MAIL_TO', 'team@example.com');\ndefine('MAIL_FROM', 'no-reply@example.com');\ndefine('ALLOWED_HOSTNAMES', ['localhost']);\ndefine('RATE_LIMIT_SALT', 'check-${Date.now()}');\n`,
);
const port = 8790 + Math.floor(Math.random() * 100);
const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', docroot], { stdio: 'ignore' });
const base = `http://127.0.0.1:${port}/api/contact.php`;

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base, { method: 'GET' });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error('PHP server did not start');
}

type Case = { name: string; init: RequestInit; status: number; error?: string; ok?: boolean };
const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const validContact = { type: 'contact', name: 'Ada Lovelace', email: 'ada@example.com', company: '', subject: 'Pricing', message: 'Hello, this is a test.', hp_field: '' };

const cases: Case[] = [
  { name: 'GET is rejected', init: { method: 'GET' }, status: 405, error: 'method_not_allowed' },
  { name: 'form encoding is rejected', init: { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'x' }, status: 415, error: 'unsupported_media_type' },
  { name: 'body over 10 KB is rejected', init: json({ type: 'contact', message: 'x'.repeat(11000) }), status: 413, error: 'payload_too_large' },
  { name: 'invalid JSON is rejected', init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{nope' }, status: 400, error: 'invalid_json' },
  { name: 'cross-origin request is rejected', init: { ...json(validContact), headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' } }, status: 403, error: 'forbidden' },
  { name: 'unknown type is rejected', init: json({ type: 'other' }), status: 400, error: 'invalid_type' },
  { name: 'honeypot is silently accepted', init: json({ ...validContact, hp_field: 'spam' }), status: 200, ok: true },
  { name: 'bad email is rejected', init: json({ ...validContact, email: 'not-an-email' }), status: 422, error: 'invalid_email' },
  { name: 'header injection in email is rejected', init: json({ ...validContact, email: 'a@example.com\r\nBcc: x@example.com' }), status: 422, error: 'invalid_email' },
  { name: 'short message is rejected', init: json({ ...validContact, message: 'short' }), status: 422, error: 'invalid_message' },
  { name: 'unknown subject is rejected', init: json({ ...validContact, subject: 'Hacking' }), status: 422, error: 'invalid_subject' },
];

try {
  await waitForServer();
  for (const c of cases) {
    const res = await fetch(base, c.init);
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    const good = res.status === c.status && (c.error ? body.error === c.error : body.ok === c.ok);
    console.log(`${good ? 'PASS' : 'FAIL'}  ${c.name} (${res.status} ${JSON.stringify(body)})`);
    if (!good) errors.push(`${c.name}: expected ${c.status} ${c.error ?? 'ok'}, got ${res.status} ${JSON.stringify(body)}`);
  }
  // Earlier cases that passed the honeypot used 4 rate-limit slots; the 5th is a reCAPTCHA
  // failure (fake token cannot verify), the 6th must be rate limited.
  const captcha = await fetch(base, json({ ...validContact, recaptchaToken: 'fake' }));
  const captchaBody = (await captcha.json()) as { error?: string };
  const captchaGood = captcha.status === 400 && captchaBody.error === 'captcha_failed';
  console.log(`${captchaGood ? 'PASS' : 'FAIL'}  invalid reCAPTCHA token is rejected (${captcha.status} ${JSON.stringify(captchaBody)})`);
  if (!captchaGood) errors.push(`reCAPTCHA: expected 400 captcha_failed, got ${captcha.status}`);
  const limited = await fetch(base, json(validContact));
  const limitedBody = (await limited.json()) as { error?: string };
  const limitedGood = limited.status === 429 && limitedBody.error === 'rate_limited';
  console.log(`${limitedGood ? 'PASS' : 'FAIL'}  6th request in 10 minutes is rate limited (${limited.status} ${JSON.stringify(limitedBody)})`);
  if (!limitedGood) errors.push(`rate limit: expected 429, got ${limited.status}`);
  // No response may leak internal details.
  for (const c of cases) {
    const text = await (await fetch(base, c.init)).text();
    if (/Warning|Fatal|Stack|\.php on line/i.test(text)) errors.push(`${c.name}: response leaks PHP internals`);
  }
} catch (err) {
  errors.push(`functional run: ${(err as Error).message}`);
} finally {
  server.kill();
  rmSync(work, { recursive: true, force: true });
}

if (errors.length) {
  console.error(`check:php failed:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log('check:php OK: syntax valid, subjects in sync, endpoint rejection paths verified.');
