/**
 * npm run check:external
 * HEAD-checks every external link (content.ts, .env payment links, built HTML) and reports
 * failures. Falls back to GET when a server rejects HEAD. Needs network access.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));

const content = await import('../src/content.ts');
const { isRealUrl } = await import('../src/lib/placeholder.ts');

const urls = new Set<string>();
const add = (u: string | undefined) => {
  if (u && isRealUrl(u)) urls.add(u);
};

add(content.site.dashboardUrl);
add(content.company.website);
content.socialLinks.forEach((l) => add(l.href));
content.citationLinks.forEach((l) => add(l.href));
Object.values(content.stripeLinks).forEach((i) => Object.values(i).forEach(add));

const dist = join(root, 'dist');
if (existsSync(dist)) {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p) : n.endsWith('.html') ? [p] : [];
    });
  for (const f of walk(dist)) {
    for (const m of readFileSync(f, 'utf8').matchAll(/(?:href|content)="(https?:\/\/[^"]+)"/g)) add(m[1]);
  }
}

async function check(url: string): Promise<{ url: string; status: number | string }> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'orridan-link-check' } });
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let status = await attempt('HEAD');
    if (status === 405 || status === 403 || status === 501) status = await attempt('GET');
    return { url, status };
  } catch (err) {
    return { url, status: (err as Error).name === 'AbortError' ? 'timeout' : (err as Error).message };
  }
}

const results = await Promise.all([...urls].map(check));
const failures = results.filter((r) => typeof r.status !== 'number' || r.status >= 400);
for (const r of results) console.log(`${typeof r.status === 'number' && r.status < 400 ? 'OK  ' : 'FAIL'}  ${r.status}  ${r.url}`);
if (failures.length) {
  console.error(`check:external: ${failures.length} of ${results.length} external link(s) failed.`);
  process.exit(1);
}
console.log(`check:external OK: ${results.length} external link(s) reachable.`);
