/**
 * Post-build: writes per-route HTML copies with the right head already in place (so crawlers
 * and SEO checkers see title, description, canonical and robots without JavaScript), writes
 * sitemap.xml, and verifies every file the HTML or manifest references exists.
 *
 * Usage: tsx scripts/postbuild.ts [outDir]   (default: dist)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, process.argv[2] ?? 'dist');
const mode = process.argv[2] === 'dist-e2e' ? 'e2e' : 'production';

for (const file of [`.env.${mode}`, '.env']) {
  const p = join(root, file);
  if (existsSync(p)) process.loadEnvFile(p);
}

const { seo, site } = await import('../src/content.ts');
const { replaceSeoBlock, absoluteUrl, renderStructuredData } = await import('../src/lib/seoHead.ts');

const errors: string[] = [];
const indexPath = join(outDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`postbuild: ${indexPath} not found. Run vite build first.`);
  process.exit(1);
}
// Home head and JSON-LD (built only from real, non-placeholder values) go into index.html first.
// Idempotent: strip any prerendered markup from a previous run before templating.
const template = stripRoot(readFileSync(indexPath, 'utf8'));
if (!template.includes('<!-- jsonld -->') && !template.includes('application/ld+json')) {
  console.error('postbuild: JSON-LD marker missing from index.html.');
  process.exit(1);
}
const indexHtml = replaceSeoBlock(template, seo.home).replace('<!-- jsonld -->', renderStructuredData());
writeFileSync(indexPath, indexHtml);

function stripRoot(html: string): string {
  const start = html.indexOf('<div id="root">');
  const end = html.indexOf('<noscript>', start);
  if (start === -1 || end === -1) return html;
  return `${html.slice(0, start)}<div id="root"></div>
    ${html.slice(end)}`;
}

/* ========== meta length rules ========== */
for (const [key, entry] of Object.entries(seo)) {
  if (entry.title.length > 60) errors.push(`Title for ${key} is ${entry.title.length} chars (max 60).`);
  if (entry.description.length > 160) errors.push(`Description for ${key} is ${entry.description.length} chars (max 160).`);
}

/* ========== per-route HTML ========== */
const pages: { file: string; entry: (typeof seo)[keyof typeof seo] }[] = [
  { file: 'product.html', entry: seo.product },
  { file: 'privacy.html', entry: seo.privacy },
  { file: 'terms.html', entry: seo.terms },
  { file: 'cookies.html', entry: seo.cookies },
  { file: 'checkout/success.html', entry: seo.checkoutSuccess },
  { file: '404.html', entry: seo.notFound },
];
for (const { file, entry } of pages) {
  const target = join(outDir, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, replaceSeoBlock(indexHtml, entry));
}

/* ========== sitemap.xml ========== */
const lastmod = new Date().toISOString().slice(0, 10);
const urls = Object.values(seo)
  .filter((e) => e.inSitemap && !e.noindex)
  .map((e) => `  <url>\n    <loc>${absoluteUrl(e.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`);
writeFileSync(
  join(outDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
);

/* ========== prerender ========== */
/**
 * Loads every route in headless Chromium and writes the rendered #root markup into its HTML
 * file. First paint then needs no JavaScript, and crawlers see the full content. At runtime
 * React renders fresh (no hydration) inside startTransition, so the static markup stays on
 * screen until the app is ready and is then swapped for identical live markup.
 */
const prerenderRoutes: { file: string; path: string; ready: string }[] = [
  { file: 'index.html', path: '/', ready: '#contact' },
  { file: 'product.html', path: '/product', ready: 'main h1' },
  { file: 'privacy.html', path: '/privacy', ready: '#contact-us' },
  { file: 'terms.html', path: '/terms', ready: '#contact-us' },
  { file: 'cookies.html', path: '/cookies', ready: '#contact-us' },
  { file: 'checkout/success.html', path: '/checkout/success', ready: 'main h1' },
  { file: '404.html', path: '/__not-found__', ready: 'main h1' },
];

async function prerender(): Promise<string | null> {
  if (process.env.SKIP_PRERENDER) return 'SKIP_PRERENDER is set';
  let chromium: typeof import('@playwright/test').chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    return '@playwright/test is not installed';
  }
  const { spawn } = await import('node:child_process');
  const port = 4390 + Math.floor(Math.random() * 50);
  const server = spawn(process.execPath, ['--import', 'tsx', join(root, 'scripts/serve-dist.ts'), outDir, String(port)], { stdio: 'ignore' });
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    // Only the local build is needed; never let a third party into the snapshot.
    await context.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    const captured: { file: string; html: string }[] = [];
    for (const r of prerenderRoutes) {
      for (let attempt = 0; ; attempt++) {
        try {
          await page.goto(`http://localhost:${port}${r.path}`, { waitUntil: 'networkidle' });
          break;
        } catch (err) {
          if (attempt > 20) throw err;
          await new Promise((res) => setTimeout(res, 250));
        }
      }
      await page.waitForSelector(r.ready, { state: 'attached', timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      const html = await page.evaluate(() => document.getElementById('root')?.innerHTML ?? '');
      if (!html.includes('<main')) throw new Error(`prerender of ${r.path} produced no <main>`);
      captured.push({ file: r.file, html });
    }
    if (pageErrors.length) throw new Error(`page errors during prerender: ${pageErrors.join('; ')}`);
    for (const { file, html } of captured) {
      const target = join(outDir, file);
      const source = readFileSync(target, 'utf8');
      if (!source.includes('<div id="root"></div>')) throw new Error(`${file}: empty #root marker not found`);
      writeFileSync(target, source.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
    }
    return null;
  } catch (err) {
    const message = (err as Error).message;
    if (/Executable doesn't exist|browserType.launch/i.test(message)) return `Chromium is not installed (npx playwright install chromium)`;
    errors.push(`prerender failed: ${message}`);
    return null;
  } finally {
    await browser?.close();
    server.kill();
  }
}

const skipped = await prerender();

/* ========== inline the stylesheet ========== */
// The single CSS file is small (about 9 KB compressed). Inlining it removes the only
// render-blocking request, so the prerendered markup paints on the first round trip.
for (const file of ['index.html', ...pages.map((p) => p.file)]) {
  const target = join(outDir, file);
  const html = readFileSync(target, 'utf8');
  const link = /<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/.exec(html);
  if (!link) continue;
  const css = readFileSync(join(outDir, link[1]), 'utf8').replace(/<\/style/gi, '<\\/style');
  writeFileSync(target, html.replace(link[0], () => `<style>${css}</style>`));
}
if (skipped) console.warn(`postbuild: prerender skipped (${skipped}). Pages still work as a client-rendered app.`);

/* ========== verification ========== */
const allHtml = ['index.html', ...pages.map((p) => p.file)];
for (const file of allHtml) {
  const html = readFileSync(join(outDir, file), 'utf8');
  const canonicals = html.match(/rel="canonical"/g)?.length ?? 0;
  const entry = file === 'index.html' ? seo.home : pages.find((p) => p.file === file)!.entry;
  const expectCanonical = entry.path !== '/404' && entry.path !== '/checkout/success';
  if (canonicals !== (expectCanonical ? 1 : 0)) errors.push(`${file}: expected ${expectCanonical ? 1 : 0} canonical, found ${canonicals}.`);
  const head = html.slice(0, html.indexOf('</head>'));
  if ((head.match(/<title>/g)?.length ?? 0) !== 1) errors.push(`${file}: expected exactly one <title> in <head>.`);
  if (!html.includes(`content="${entry.noindex ? 'noindex,follow' : 'index,follow'}"`)) errors.push(`${file}: robots meta mismatch.`);
  if (/\b(NVIDIA)\b/i.test(html)) errors.push(`${file}: forbidden brand name found.`);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const ref = m[1];
    if (ref === '/') continue;
    const candidates = [join(outDir, ref), join(outDir, `${ref}.html`)];
    if (!candidates.some((c) => existsSync(c))) errors.push(`${file}: referenced file ${ref} is missing from ${outDir}.`);
  }
}

const manifest = JSON.parse(readFileSync(join(outDir, 'site.webmanifest'), 'utf8')) as { icons: { src: string }[]; theme_color: string };
for (const icon of manifest.icons) {
  if (!existsSync(join(outDir, icon.src))) errors.push(`site.webmanifest: icon ${icon.src} is missing.`);
}
if (manifest.theme_color.toUpperCase() !== site.themeColor.toUpperCase()) errors.push('site.webmanifest: theme colour mismatch.');

const required = [
  '.htaccess',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'og-image.png',
  'api/contact.php',
  'api/config.example.php',
  'api/.htaccess',
];
for (const f of required) if (!existsSync(join(outDir, f))) errors.push(`Missing deliverable: ${f}`);
if (existsSync(join(outDir, 'api/config.php'))) errors.push('api/config.php must never be shipped in the build output.');

const robots = existsSync(join(outDir, 'robots.txt')) ? readFileSync(join(outDir, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${absoluteUrl('/sitemap.xml')}`)) errors.push('robots.txt does not reference the sitemap URL.');

if (errors.length) {
  console.error(`postbuild failed:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`postbuild OK (${outDir}): ${pages.length} route files, sitemap with ${urls.length} URLs.`);
