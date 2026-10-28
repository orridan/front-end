/**
 * npm run lighthouse
 * Runs mobile Lighthouse (default config: Moto G emulation, slow 4G) on / and /product
 * against the production build served by scripts/serve-dist.ts, and prints the four scores.
 * Uses Playwright's Chromium unless CHROME_PATH is set. Reports go to ./lighthouse/.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const port = 4320;
const base = `http://localhost:${port}`;
const pages = (process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/product']).map((p) => p.replace(/^[A-Z]:.*Git/, ''));
const targets = { performance: 85, accessibility: 95, 'best-practices': 95, seo: 100 };

const server = spawn(process.execPath, ['--import', 'tsx', 'scripts/serve-dist.ts', 'dist', String(port)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

// Launched through Playwright (chrome-launcher cannot spawn in some sandboxed shells).
const debugPort = 9333;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: [`--remote-debugging-port=${debugPort}`],
});
const chrome = { port: debugPort, kill: () => browser.close() };
mkdirSync('lighthouse', { recursive: true });
const rows: string[] = [];
let failed = false;
try {
  for (const path of pages) {
    const result = await lighthouse(`${base}${path}`, { port: chrome.port, output: ['html', 'json'], logLevel: 'error' });
    if (!result) throw new Error(`No Lighthouse result for ${path}`);
    const { categories, audits } = result.lhr;
    const name = path === '/' ? 'home' : path.replace(/\//g, '');
    const [htmlReport, jsonReport] = result.report as string[];
    writeFileSync(`lighthouse/${name}.html`, htmlReport);
    writeFileSync(`lighthouse/${name}.json`, jsonReport);
    const scores = Object.entries(targets).map(([key, min]) => {
      const score = Math.round((categories[key]?.score ?? 0) * 100);
      if (score < min) failed = true;
      return `${key} ${score}${score < min ? ` (target ${min})` : ''}`;
    });
    rows.push(`${path.padEnd(10)} ${scores.join(' | ')}`);
    const failing = Object.values(audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'manual')
      .map((a) => `    - ${a.id}: ${a.title}${a.displayValue ? ` (${a.displayValue})` : ''}`);
    if (failing.length) rows.push(`  audits below 90 on ${path}:\n${failing.join('\n')}`);
    rows.push(`  LCP ${audits['largest-contentful-paint']?.displayValue}, TBT ${audits['total-blocking-time']?.displayValue}, CLS ${audits['cumulative-layout-shift']?.displayValue}`);
  }
} finally {
  chrome.kill();
  server.kill();
}
console.log(rows.join('\n'));
if (failed) {
  console.error('One or more Lighthouse scores are below target (see above).');
  process.exitCode = 1;
}
