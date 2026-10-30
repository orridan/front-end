import { citationLinks, closingBanner, company, contact, faq, nav, newsletter, pricing, privacyPage, productPage, sectionIds, site, socialLinks, termsPage } from '../src/content';
import { expect, isDesktop, ROUTES, scrollThrough, scrollToSection, seedConsent, stubThirdParties, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await stubThirdParties(page);
});

test.describe('health', () => {
  for (const route of ROUTES) {
    test(`no console errors or failed requests on ${route}`, async ({ page, problems }) => {
      await seedConsent(page);
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await scrollThrough(page);
      await page.waitForLoadState('networkidle');
      expect(problems).toEqual([]);
    });
  }

  test('every internal link resolves', async ({ page, request }) => {
    await seedConsent(page);
    const seen = new Set<string>();
    for (const route of ROUTES) {
      await page.goto(route);
      await scrollThrough(page);
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href') ?? ''));
      for (const href of hrefs) {
        expect(href, `empty or # href on ${route}`).not.toMatch(/^#?$/);
        if (/^(https?:|mailto:|tel:)/.test(href) || seen.has(href)) continue;
        seen.add(href);
        const [path, hash] = href.split('#');
        if (path) {
          const res = await request.get(path);
          expect(res.status(), `${href} from ${route}`).toBe(200);
        }
        if (hash) {
          const targetPage = path || route;
          if (targetPage !== route) await page.goto(targetPage);
          await expect(page.locator(`[id="${hash}"]`), `#${hash} target`).toHaveCount(1);
          if (targetPage !== route) await page.goto(route);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  test('external links open in a new tab safely', async ({ page }) => {
    await seedConsent(page);
    for (const route of ['/', '/product']) {
      await page.goto(route);
      await scrollThrough(page);
      const bad = await page.$$eval('a[href^="http"]', (as) =>
        as.filter((a) => a.getAttribute('target') !== '_blank' || a.getAttribute('rel') !== 'noopener noreferrer').map((a) => a.outerHTML.slice(0, 120)),
      );
      expect(bad).toEqual([]);
    }
  });
});

test.describe('dashboard link placement', () => {
  test('only the product page links to the dashboard', async ({ page }) => {
    await seedConsent(page);
    for (const route of ['/', '/privacy', '/terms', '/cookies', '/checkout/success', '/missing-page']) {
      await page.goto(route);
      await scrollThrough(page);
      await expect(page.locator(`a[href^="${site.dashboardUrl}"]`), `dashboard link on ${route}`).toHaveCount(0);
    }
    await page.goto('/product');
    await expect(page.getByTestId('product-dashboard')).toHaveAttribute('href', site.dashboardUrl);
  });

  test('closing banner opens the contact form', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/');
    await page.getByTestId('closing-cta').click();
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.getByTestId('contact-subject')).toHaveValue(closingBanner.subject);
  });
});

test.describe('product page', () => {
  test('hero CTAs open the platform and scroll to the technology foundation', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/');
    await page.getByTestId('hero-cta').click();
    await expect(page).toHaveURL(/\/product$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(productPage.heading);
    const dashboard = page.getByTestId('product-dashboard');
    await expect(dashboard).toHaveAttribute('href', site.dashboardUrl);
    await expect(dashboard).toHaveAttribute('target', '_blank');
    await expect(dashboard).toHaveAttribute('rel', 'noopener noreferrer');
    await page.getByTestId('product-tech-cta').click();
    await expect(page).toHaveURL(/\/product#technology-foundation$/);
    await expect(page.getByRole('heading', { name: /A clear boundary between current records and future integrations/i })).toBeInViewport();
  });

  test('product route is indexable and canonical', async ({ page }) => {
    await page.goto('/product');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://orridan.net/product');
  });

  test('route change starts at the top of the page', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });
});

test.describe('navigation', () => {
  test('hamburger opens, traps focus and closes with Escape', async ({ page }) => {
    test.skip(isDesktop(page), 'hamburger is only shown under 1024px');
    await seedConsent(page);
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();
    // Tab many times: focus must never leave the menu.
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu closes on link click and navigates', async ({ page }) => {
    test.skip(isDesktop(page), 'hamburger is only shown under 1024px');
    await seedConsent(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Pricing' }).click();
    await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeHidden();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator('#pricing')).toBeInViewport();
  });

  test('active nav highlight follows scrolling', async ({ page }) => {
    test.skip(!isDesktop(page), 'desktop links are hidden under 1024px');
    await seedConsent(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const [id, label] of [
      ['pricing', 'Pricing'],
      ['faq', 'FAQ'],
      ['how-it-works', 'How It Works'],
    ] as const) {
      await scrollToSection(page, id);
      // The capsule condenses while scrolling down, so the links may be collapsed: include hidden.
      await expect(nav.getByRole('link', { name: label, includeHidden: true })).toHaveAttribute('aria-current', 'location', { timeout: 15_000 });
      await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
    }
  });

  test('sheet label and condensing capsule follow the scroll', async ({ page }) => {
    test.skip(!isDesktop(page), 'the expanded capsule and sheet label are desktop features');
    await seedConsent(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(nav.getByRole('link', { name: 'O.VX', exact: true })).toBeVisible({ timeout: 15_000 });
    await scrollToSection(page, 'pricing');
    // Scrolling down condenses the capsule to the ring and a Menu button.
    const menu = nav.getByRole('button', { name: 'Open menu' });
    await expect(menu).toBeVisible({ timeout: 15_000 });
    await expect(nav.getByRole('link', { name: 'O.VX', exact: true })).toBeHidden();
    if ((page.viewportSize()?.width ?? 0) >= 1280) await expect(page.getByTestId('sheet-label')).toContainText('PRICING', { ignoreCase: true });
    await menu.click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog.getByRole('link', { name: 'Pricing' })).toHaveAttribute('aria-current', 'location');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test('/product to /#pricing scrolls to Pricing', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/product');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/#pricing$/);
    await expect(page.locator('#pricing h2')).toBeInViewport({ timeout: 15_000 });
  });

  test('product page nav shows Home and O.VX with dashboard CTA', async ({ page }) => {
    test.skip(!isDesktop(page), 'desktop links are hidden under 1024px');
    await seedConsent(page);
    await page.goto('/product');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'O.VX', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Open Dashboard/ })).toHaveAttribute('href', site.dashboardUrl);
  });
});

test.describe('cookie consent', () => {
  test('nothing optional loads before consent, and Reject persists', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      // Chatwoot live chat loads for every visitor by client decision.
      if (url.hostname !== 'localhost' && url.hostname !== new URL(site.chatwoot.baseUrl).hostname) external.push(r.url());
    });
    await page.goto('/');
    const banner = page.getByTestId('consent-banner');
    await expect(banner).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(external).toEqual([]);
    expect(await page.evaluate(() => (window as { __orridanOptional?: unknown }).__orridanOptional)).toBeUndefined();
    expect(await page.evaluate(() => localStorage.getItem('orridan.prefs'))).toBeNull();

    const accept = banner.getByRole('button', { name: 'Accept all' });
    const reject = banner.getByRole('button', { name: 'Reject non-essential' });
    const a = await accept.boundingBox();
    const r = await reject.boundingBox();
    expect(Math.abs((a?.height ?? 0) - (r?.height ?? 0))).toBeLessThan(2);
    expect(await reject.evaluate((el) => el.className)).toBe(await accept.evaluate((el) => el.className));

    await reject.click();
    await expect(banner).toBeHidden();
    const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('orridan.consent'))) ?? '{}');
    expect(stored.categories).toEqual({ necessary: true, preferences: false, analytics: false });
    expect(typeof stored.timestamp).toBe('string');
    expect(typeof stored.version).toBe('string');
    await page.reload();
    await expect(page.getByTestId('consent-banner')).toBeHidden();
    expect(await page.evaluate(() => (window as { __orridanOptional?: unknown }).__orridanOptional)).toBeUndefined();
  });

  test('Customise saves choices and the Cookie Policy page reopens them', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Customise' }).click();
    const dialog = page.getByRole('dialog', { name: 'Cookie preferences' });
    await expect(dialog).toBeVisible();
    const necessary = dialog.getByRole('switch', { name: 'Necessary' });
    await expect(necessary).toHaveAttribute('aria-checked', 'true');
    await expect(necessary).toHaveAttribute('aria-disabled', 'true');
    const analytics = dialog.getByRole('switch', { name: 'Analytics' });
    await expect(analytics).toHaveAttribute('aria-checked', 'false');
    await analytics.click();
    await expect(analytics).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('consent-save').click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => (window as { __orridanOptional?: { analytics?: boolean } }).__orridanOptional?.analytics)).toBe(true);

    await page.goto('/cookies');
    await expect(page.getByTestId('consent-banner')).toBeHidden();
    await page.getByRole('main').getByRole('button', { name: 'Change cookie preferences' }).click();
    await expect(page.getByRole('dialog', { name: 'Cookie preferences' }).getByRole('switch', { name: 'Analytics' })).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Cookie preferences' })).toBeHidden();
  });
});

test.describe('pricing', () => {
  test('monthly prices are consistent and sandbox buttons are correct', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/#pricing');
    const section = page.locator('#pricing');
    await expect(section.getByTestId('sandbox-badge')).toHaveText(pricing.sandbox.badge);
    await expect(section.getByTestId('savings-badge')).toHaveCount(0);
    await expect(section.getByText('4242 4242')).toHaveCount(0);

    await expect(section.locator('[data-price-plan="organisation"]')).toHaveText('$50');
    await expect(section.locator('[data-table-price="organisation"]')).toHaveText('$50 / month');
    await expect(section.locator('[data-price-plan="twin"]')).toHaveText('$150');
    await expect(section.getByTestId('plan-cta-organisation')).toHaveAttribute('href', /buy\.stripe\.com\/test_/);
    await expect(section.getByTestId('plan-cta-twin')).toHaveAttribute('href', /buy\.stripe\.com\/test_/);

    await expect(section.locator('[data-price-billing="organisation"]')).toHaveText(pricing.billedMonthly);
    await expect(section.locator('[data-table-price="twin"]')).toHaveText('$150 / month');
    await expect(section.getByTestId('plan-cta-organisation')).toHaveAttribute('href', /test_e2e_org_monthly/);

    await expect(section.getByTestId('plan-cta-enterprise')).toHaveAttribute('href', '/#contact');
    await section.getByTestId('plan-cta-enterprise').click();
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.getByTestId('contact-subject')).toHaveValue(pricing.enterpriseSubject);
  });

  test('there is no annual billing option', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/#pricing');
    const section = page.locator('#pricing');
    await expect(section.getByTestId('interval-switch')).toHaveCount(0);
    await expect(section.getByText(/per year/)).toHaveCount(0);
  });
});

test.describe('contact form', () => {
  test('validates, then shows success only after the server confirms', async ({ page }) => {
    await seedConsent(page);
    let payload: Record<string, unknown> | null = null;
    await page.route(contact.endpoint, async (route) => {
      payload = route.request().postDataJSON();
      // Long enough to observe the disabled sending state on slow engines.
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/#contact');
    const form = page.getByTestId('contact-form');
    await form.getByTestId('contact-submit').click();
    await expect(form.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText(contact.errors.subject)).toBeVisible();
    await expect(form.getByLabel('Name')).toBeFocused();

    await form.getByLabel('Name').fill('Ada Lovelace');
    await form.getByLabel('Email', { exact: true }).fill('not-an-email');
    await form.getByLabel('Email', { exact: true }).blur();
    await expect(form.getByText(contact.errors.email)).toBeVisible();
    await form.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await form.getByTestId('contact-subject').selectOption('Pricing');
    await form.getByLabel('Message').fill('Hello, I would like to know more about plans.');
    await form.getByTestId('contact-submit').click();
    await expect(form.getByText(contact.errors.captcha)).toBeVisible();
    expect(payload).toBeNull();

    await form.getByTestId('captcha-stub').click();
    await form.getByTestId('contact-submit').click();
    await expect(form.getByTestId('contact-submit')).toBeDisabled();
    await expect(page.getByTestId('contact-success')).toBeVisible();
    expect(payload).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', subject: 'Pricing', 'g-recaptcha-response': 'test-token', _gotcha: '' });
    // The empty form returns on its own, ready for the next message.
    await expect(page.getByTestId('contact-success')).toBeHidden({ timeout: contact.successResetMs + 5000 });
    await expect(form.getByLabel('Name')).toHaveValue('');
    await expect(form.getByTestId('contact-submit')).toBeEnabled();
  });

  test('shows an error and no success when the server fails', async ({ page }) => {
    await seedConsent(page);
    await page.route(contact.endpoint, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Something went wrong' }) }),
    );
    await page.goto('/#contact');
    const form = page.getByTestId('contact-form');
    await form.getByLabel('Name').fill('Ada Lovelace');
    await form.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await form.getByTestId('contact-subject').selectOption('Support');
    await form.getByLabel('Message').fill('Testing the error state of the form.');
    await form.getByTestId('captcha-stub').click();
    await form.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-status')).toHaveText(contact.errors.server);
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
    await expect(form.getByLabel('Name')).toHaveValue('Ada Lovelace');
  });

  test('a 200 without ok:true is not treated as success', async ({ page }) => {
    await seedConsent(page);
    await page.route(contact.endpoint, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<html>proxy page</html>' }));
    await page.goto('/#contact');
    const form = page.getByTestId('contact-form');
    await form.getByLabel('Name').fill('Ada Lovelace');
    await form.getByLabel('Email', { exact: true }).fill('ada@example.com');
    await form.getByTestId('contact-subject').selectOption('Support');
    await form.getByLabel('Message').fill('Testing a misconfigured server.');
    await form.getByTestId('captcha-stub').click();
    await form.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-status')).toHaveText(contact.errors.server);
    await expect(page.getByTestId('contact-success')).toHaveCount(0);
  });

  test('newsletter validates and confirms', async ({ page }) => {
    await seedConsent(page);
    let payload: Record<string, unknown> | null = null;
    await page.route(newsletter.endpoint, (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/privacy');
    const footer = page.getByRole('contentinfo');
    await footer.getByRole('button', { name: 'Subscribe' }).click();
    await expect(footer.getByRole('alert')).toBeVisible();
    await footer.getByLabel('Email address').fill('ada@example.com');
    await footer.getByRole('button', { name: 'Subscribe' }).click();
    await expect(footer.getByText('Thanks. You are subscribed.')).toBeVisible();
    expect(payload).toMatchObject({ email: 'ada@example.com', _gotcha: '' });
    await expect(footer.getByLabel('Email address')).toHaveValue('');
    await expect(footer.getByText('Thanks. You are subscribed.')).toBeHidden({ timeout: newsletter.successResetMs + 5000 });
  });
});

test.describe('live chat', () => {
  test('FAQ button opens the contact form while Chatwoot is unavailable', async ({ page }) => {
    await page.route('https://app.chatwoot.com/**', (route) => route.abort());
    await seedConsent(page);
    await page.goto('/');
    await scrollToSection(page, sectionIds.faq);
    await page.getByRole('button', { name: faq.askCta }).click();
    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.getByTestId('contact-subject')).toHaveValue(faq.askSubject);
  });

  test('Chatwoot loads for every visitor, before any cookie choice, and the FAQ button opens it', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('consent-banner')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as { __chatwoot?: { config: unknown } }).__chatwoot?.config))
      .toEqual({ websiteToken: site.chatwoot.websiteToken, baseUrl: site.chatwoot.baseUrl });
    await page.getByTestId('consent-banner').getByRole('button', { name: 'Reject non-essential' }).click();
    await scrollToSection(page, sectionIds.faq);
    await page.getByRole('button', { name: faq.askCta }).click();
    expect(await page.evaluate(() => (window as { __chatwoot?: { calls: string[] } }).__chatwoot?.calls)).toContain('toggle:open');
  });
});

test.describe('page order and FAQ', () => {
  test('landing sections follow the client order, and nav links match it', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/');
    const ids = await page.evaluate(() => [...document.querySelectorAll('main section[id]')].map((s) => s.id));
    expect(ids).toEqual(['top', sectionIds.about, sectionIds.howItWorks, sectionIds.features, sectionIds.pricing, sectionIds.faq, sectionIds.contact]);
    expect(nav.homeLinks.map((l) => l.sectionId)).toEqual(ids.slice(1));
    for (const removed of ['pillars', 'result-vs-expectation', 'built-for']) await expect(page.locator('#' + removed)).toHaveCount(0);
  });

  test('FAQ shows the selected answer and keeps ARIA state', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/#faq');
    const item = faq.items[2];
    const button = page.getByRole('button', { name: item.question });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: item.question }).filter({ hasText: item.answer }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: faq.items[0].question })).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('social links', () => {
  test('footer and contact section show the filled profiles and listings with brand icons', async ({ page }) => {
    await seedConsent(page);
    await page.goto('/#contact');
    const filled = [...socialLinks, ...citationLinks].filter((l) => l.href);
    const empty = [...socialLinks, ...citationLinks].filter((l) => !l.href);
    for (const area of [page.locator('#contact'), page.getByRole('contentinfo')]) {
      for (const l of filled) {
        const link = area.getByRole('link', { name: new RegExp(`^${l.label}\\s*\\(`) });
        await expect(link).toHaveAttribute('href', l.href);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link.locator('svg')).toHaveCount(1);
      }
      for (const l of empty) await expect(area.getByRole('link', { name: new RegExp(`^${l.label}\\s*\\(`) })).toHaveCount(0);
    }
  });
});

test.describe('legal pages', () => {
  for (const [route, pageContent] of [['/privacy', privacyPage], ['/terms', termsPage]] as const) {
    test(`${route} shows the client legal text with its contact section`, async ({ page }) => {
      await seedConsent(page);
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1, name: pageContent.heading })).toBeVisible();
      await expect(page.getByText('Draft text, to be reviewed')).toHaveCount(0);
      await expect(page.locator('time[datetime="2026-10-29"]')).toHaveText('29 October 2026');
      for (const section of pageContent.sections) await expect(page.getByRole('heading', { level: 2, name: section.heading, exact: true })).toBeVisible();
      const contactSection = page.locator('#contact-us');
      await expect(contactSection.getByRole('link', { name: company.email })).toHaveAttribute('href', `mailto:${company.email}`);
      await expect(contactSection.getByRole('link', { name: '+1 212-842-8006' })).toHaveAttribute('href', 'tel:+12128428006');
      await expect(contactSection.getByRole('link', { name: 'https://orridan.net/#contact' })).toHaveAttribute('href', '/#contact');
      await expect(contactSection.getByRole('link', { name: '0112 854 166' })).toHaveAttribute('href', 'tel:+94112854166');
      await expect(contactSection.getByText('Orridan PVT LTD, High Level Rd, Nugegoda 10250, Sri Lanka')).toBeVisible();
      await expect(page.getByText('created with the help of')).toHaveCount(0);
    });
  }
});
