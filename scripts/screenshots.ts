/**
 * Dev helper: full-page screenshots of every route at several widths, plus console errors.
 * Usage: tsx scripts/screenshots.ts <baseUrl> <outDir> [path ...]
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'screenshots';
const paths = process.argv.slice(4).length ? process.argv.slice(4) : ['/', '/product', '/privacy', '/terms', '/cookies', '/checkout/success', '/missing-page'];
const widths = (process.env.WIDTHS ?? '375,1280').split(',').map(Number);

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  // Dismiss the consent banner so it does not cover content in screenshots.
  await context.addInitScript(() => {
    try {
      if (!localStorage.getItem('orridan.shot')) {
        localStorage.setItem('orridan.shot', '1');
      }
    } catch {
      /* ignore */
    }
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // Scroll through so lazy and scroll-triggered content renders.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    // Full-page captures skip offscreen content-visibility sections: render them all.
    await page.evaluate(() => document.documentElement.classList.add('cv-off'));
    await page.waitForTimeout(200);
    const name = `${p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_/, '')}-${width}.png`;
    await page.screenshot({ path: join(out, name), fullPage: true });
  }
  console.log(`width ${width}: ${errors.length ? errors.join('\n  ') : 'no console errors'}`);
  await context.close();
}
await browser.close();
