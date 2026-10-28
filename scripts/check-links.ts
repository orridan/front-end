/**
 * npm run check:links
 * Every href/to in content.ts, in component source and in the built HTML must be non-empty,
 * not "#", and resolve to a real route, a landing page anchor, a static file or an absolute URL.
 * Runtime-rendered links are also crawled by the Playwright suite (npm run e2e).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, process.argv[2] ?? 'dist');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));

const content = await import('../src/content.ts');
const { isRealUrl } = await import('../src/lib/placeholder.ts');

const errors: string[] = [];
const routes = new Set<string>(Object.values(content.routes));
const sectionIds = new Set<string>(Object.values(content.sectionIds));

/* Every landing page section id must actually be rendered by a section component. */
const sectionsDir = join(root, 'src/sections');
const sectionSource = readdirSync(sectionsDir).map((f) => readFileSync(join(sectionsDir, f), 'utf8')).join('\n');
for (const [key, id] of Object.entries(content.sectionIds)) {
  if (!sectionSource.includes(`id={sectionIds.${key}}`)) errors.push(`sectionIds.${key} ("${id}") is not rendered by any section.`);
}

function checkTarget(where: string, value: string, opts: { allowEmpty?: boolean } = {}) {
  if (value === '' || value === undefined) {
    if (!opts.allowEmpty) errors.push(`${where}: empty link`);
    return;
  }
  if (value === '#') return errors.push(`${where}: href="#"`);
  if (/^https?:\/\//.test(value)) {
    if (!isRealUrl(value)) errors.push(`${where}: invalid URL ${value}`);
    return;
  }
  if (value.startsWith('mailto:') || value.startsWith('tel:')) return;
  if (value.startsWith('#')) {
    // In-page anchors are only valid where the id exists; checked at runtime by e2e.
    return;
  }
  if (!value.startsWith('/')) return errors.push(`${where}: relative link "${value}"`);
  const [path, hash] = value.split('#');
  if (hash !== undefined) {
    if (path !== '/' && path !== '') errors.push(`${where}: anchors only exist on the landing page (${value})`);
    if (!sectionIds.has(hash)) errors.push(`${where}: unknown section anchor #${hash}`);
    return;
  }
  const clean = path.split('?')[0];
  if (routes.has(clean)) return;
  if (existsSync(join(dist, clean)) || existsSync(join(root, 'public', clean))) return;
  errors.push(`${where}: "${value}" is not a route or a file`);
}

/* 1. content.ts: walk every exported value for href / to / sectionId keys. */
function walk(value: unknown, path: string) {
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
  if (!value || typeof value !== 'object') return;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const here = `${path}.${k}`;
    if ((k === 'href' || k === 'to') && typeof v === 'string') {
      // Social and citation entries with empty href are placeholders and are never rendered.
      const optional = /^(socialLinks|citationLinks)\[/.test(path);
      checkTarget(`content.ts ${here}`, v, { allowEmpty: optional });
    } else if (k === 'sectionId' && typeof v === 'string') {
      if (!sectionIds.has(v)) errors.push(`content.ts ${here}: unknown section "${v}"`);
    } else {
      walk(v, here);
    }
  }
}
for (const [name, value] of Object.entries(content)) walk(value, name);
for (const [plan, intervals] of Object.entries(content.stripeLinks)) {
  for (const [interval, href] of Object.entries(intervals)) {
    if (href) checkTarget(`stripeLinks.${plan}.${interval}`, href);
  }
}
checkTarget('site.dashboardUrl', content.site.dashboardUrl);

/* 2. Component source: literal href/to attributes. */
function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(tsx|ts)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx')) out.push(p);
  }
  return out;
}
for (const file of files(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\b(href|to)="([^"]*)"/g)) {
    // Template expressions (for example a CSS attribute selector) are not links.
    if (m[2].includes('${')) continue;
    checkTarget(`${relative(root, file)} ${m[1]}=`, m[2]);
  }
  if (/href=\{['"`]#?['"`]\}/.test(src)) errors.push(`${relative(root, file)}: empty or # href expression`);
}

/* 3. Built HTML. */
if (!existsSync(dist)) {
  errors.push(`${relative(root, dist)} not found: run the build first`);
} else {
  const walkHtml = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walkHtml(p) : n.endsWith('.html') ? [p] : [];
    });
  for (const file of walkHtml(dist)) {
    const html = readFileSync(file, 'utf8');
    // Client rule: the dashboard is linked only from the product page.
    const dashboardHref = `href="${content.site.dashboardUrl.replace(/\/+$/, '')}`;
    if (!file.endsWith('product.html') && html.includes(dashboardHref)) {
      errors.push(`${relative(root, file)}: links to the dashboard; only the product page may`);
    }
    for (const m of html.matchAll(/\b(href|src)="([^"]*)"/g)) {
      const where = `${relative(root, file)} ${m[1]}=`;
      if (m[2] === '' || m[2] === '#') errors.push(`${where}"${m[2]}"`);
      else if (m[2].startsWith('/') && !m[2].startsWith('//')) checkTarget(where, m[2]);
    }
  }
}

if (errors.length) {
  console.error(`check:links failed with ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('check:links OK: content.ts, component source and built HTML links all resolve.');
