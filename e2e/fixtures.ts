import { test as base, expect, type Page } from '@playwright/test';
import { cookieConsent } from '../src/content';

export const ROUTES = ['/', '/product', '/privacy', '/terms', '/cookies'];
export const CONSENT_KEY = 'orridan.consent';

/** reCAPTCHA stub: renders a button that "solves" the check. No request reaches Google. */
const RECAPTCHA_STUB = `
  window.grecaptcha = {
    render: function (el, opts) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'I am not a robot (test stub)';
      b.setAttribute('data-testid', 'captcha-stub');
      b.onclick = function () { opts.callback('test-token'); };
      el.appendChild(b);
      return 1;
    },
    reset: function () {}
  };
  if (window.orridanRecaptchaLoaded) window.orridanRecaptchaLoaded();
`;

/** Minimal stand-in for the Chatwoot SDK: records widget calls on window.__chatwoot. */
const CHATWOOT_STUB = `window.chatwootSDK = { run: function (config) {
  var log = (window.__chatwoot = { config: config, calls: [] });
  window.$chatwoot = {
    toggle: function (s) { log.calls.push("toggle:" + s); },
    toggleBubbleVisibility: function (s) { log.calls.push("bubble:" + s); },
    reset: function () { log.calls.push("reset"); },
  };
} };`;

export async function stubThirdParties(page: Page) {
  await page.route('https://app.chatwoot.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: CHATWOOT_STUB }),
  );
  await page.route('https://www.google.com/recaptcha/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: RECAPTCHA_STUB }),
  );
}

export async function seedConsent(page: Page, categories = { preferences: false, analytics: false }) {
  const version = cookieConsent.policyVersion;
  await page.addInitScript(
    ([key, value]) => {
      try {
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
    },
    [CONSENT_KEY, JSON.stringify({ version, timestamp: new Date().toISOString(), categories: { necessary: true, ...categories } })],
  );
}

/**
 * page.goto waits until the live app has replaced the prerendered markup (html[data-ready]),
 * the same way tests of server-rendered apps wait for hydration.
 * Also collects console errors, page errors and failed requests for the whole test.
 */
export const test = base.extend<{ problems: string[] }>({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = (async (...args: Parameters<typeof page.goto>) => {
      const res = await goto(...args);
      await page.waitForSelector('html[data-ready]', { state: 'attached' });
      return res;
    }) as typeof page.goto;
    const reload = page.reload.bind(page);
    page.reload = (async (...args: Parameters<typeof page.reload>) => {
      const res = await reload(...args);
      await page.waitForSelector('html[data-ready]', { state: 'attached' });
      return res;
    }) as typeof page.reload;
    await use(page);
  },
  problems: async ({ page }, use) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') problems.push(`console: ${m.text()}`);
    });
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => {
      const reason = r.failure()?.errorText ?? '';
      // Navigations away from a page abort in-flight requests; that is not a failure.
      if (/abort|cancel/i.test(reason)) return;
      problems.push(`requestfailed: ${r.url()} ${reason}`);
    });
    page.on('response', (r) => {
      if (r.status() >= 400 && !r.url().startsWith('https://formspree.io/')) problems.push(`http ${r.status()}: ${r.url()}`);
    });
    await use(problems);
  },
});

export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
}

export function isDesktop(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= 1024;
}

export { expect };

/**
 * Jumps to a landing page section and waits for the scroll position to settle. Sections below
 * the fold use content-visibility, so scroll anchoring can adjust the position for a moment.
 */
export async function scrollToSection(page: Page, id: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    // Same as the site's own anchor jumps (src/lib/anchorScroll.ts): render every section first so
    // estimated content-visibility heights cannot make the jump land in the wrong place.
    await page.locator('#' + id).evaluate(async (el) => {
      document.documentElement.classList.add('cv-off');
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      el.scrollIntoView({ block: 'start' });
    });
    await expect
      .poll(
        async () => {
          const a = await page.evaluate(() => window.scrollY);
          await page.waitForTimeout(150);
          return Math.abs((await page.evaluate(() => window.scrollY)) - a);
        },
        { timeout: 10_000 },
      )
      .toBeLessThan(2);
    // Like the site's ScrollManager settle step: if a late layout or library refresh moved the
    // page, jump again.
    const top = await page.locator('#' + id).evaluate((el) => el.getBoundingClientRect().top);
    if (top > -40 && top < 320) return;
  }
}
