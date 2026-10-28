# Orridan frontend: final report

## Content update (client document ORRIDAN.pdf)

- Page order is now Hero, About, How It Works, Features, Pricing, FAQ, Contact (nav and footer follow it).
- New copy for Hero (with a second button, See How It Works), About, Pricing (plan headlines, lists, CTAs, feature comparison heading, Which plan fits your team block), FAQ (7 new questions), Contact (work order intro, form availability, Find your way to Orridan) and the closing banner (Discuss Your Requirements opens the contact form).
- How It Works and Features unchanged (marked ok).
- Removed: Pillars, Result vs Expectation, the Built for / Who uses it explorer, the Company details note, business hours, annual billing and the Stripe test-card note.
- Product name O.VX is the /product heading and the label of every link to /product (nav button, formerly Get Started; product page nav; footer).
- Company details filled: Orridan PVT LTD (Sri Lanka) and Orridan LLC (USA) with both addresses and phones, help@orridan.net, founder Iraj Senanayake, founded 10 June 2024. Shown in Contact, footer and legal pages and in Organization JSON-LD. Governing law and data retention are still placeholders.
- Footer Cookies and Cookie preferences links removed at the client's request; preferences can still be changed from the cookie banner and the Cookie Policy page (/cookies, linked from the banner and the sitemap).
- Client artwork: originals kept in assets-source/ (not uploaded). Hero image converted to WebP (2.4 MB SVG to 178 KB / 71 KB). Icons renamed to web-safe names in public/images/illustrations and shown on light tiles in How It Works, Features and About. Client logo (cropped to the wordmark) in nav, footer and legal pages. The five audience illustrations are unused because their section was removed.
- generate-brand.ts no longer overwrites a client favicon.svg: a new one dropped into public/ is copied to assets-source/favicon.svg and favicon.ico, apple-touch and PNG icons are built from it. The client's favicon (RR mark, assets-source/favicon.svg) is the source; favicon.ico, apple-touch and app icons are regenerated from it, and the links carry ?v=3 to bypass cached icons. The nav shows only the wordmark (scroll ring and mark removed). Define Scenarios and Activity Trail images added (also used for About "Traceable Activity").
- FAQ prices are filled from getPrice(), so they always match the pricing cards.
- Checks: npm run check passed; Playwright (Chromium 375 and 1280, WebKit 768) 88 passed, 0 failed.

## Redesign ("The Engineering Drawing, Alive", see DESIGN_BRIEF.md)

- **Changed:** floating command capsule nav (scroll-progress ring, sliding indicator, condenses to ring plus Menu, sheet label), asset-tree menu, blueprint hero with dimension lines and four callouts, dimension-chain pillars, overlapping bento with leader lines, central-spine timeline, instrument-panel gauge, tabbed Built for / Who uses it explorer (replaces the carousel), outline-word About with stamped values, pricing comparison board, two-pane FAQ, work-order contact form with a title-block card, outline closing banner, title-block footer with a scroll-filled wordmark. New display font Big Shoulders Display.
- **Kept:** routes, all content.ts copy, getPrice and sandbox checkout, form, reCAPTCHA, PHP endpoint, newsletter, consent, chatbot, SEO files, .htaccess, favicons, /product shell.
- **Behaviour not preserved as asked:** the closing banner button and the footer index do not link to the dashboard (client rule: dashboard only from /product). The carousel is gone (merged into the explorer).
- **Bugs found and fixed during the restyle:** capsule flicker from scroll anchoring, GSAP scroll-memory restore snapping early scrollers to the top, first-load scroll reset, anchor-jump layout shift in Firefox with content-visibility, flaky band-based scroll-spy (now computed per frame).
- **Checks after the restyle:** npm run check passed (36 unit tests, dashes, links, PHP). Playwright: targeted runs pass in Chromium, Firefox and WebKit; the final full 9-project run was still in progress when this report was written (see below). Lighthouse was not re-run after the restyle.
- **Manual:** visual review on real devices, re-run `npm run e2e` and `npm run lighthouse` to completion.

Build date: 2026-10-22. Everything marked Pass was actually run on this machine (Windows 11,
Node 24, PHP 8.2, Playwright Chromium/Firefox/WebKit). Nothing has been uploaded to orridan.net.

## Checks run

| Check | Result |
|---|---|
| `npm run check` (typecheck, lint, check:dashes, check:placeholders, 35 unit tests, build + pricing consistency tests, postbuild, check:links, check:php) | **Pass**, exit 0 |
| `npm run check:php`: `php -l` and 13 live requests against `contact.php` (405, 415, 413, bad JSON, cross-origin, bad type, honeypot, bad email, header injection, short message, bad subject, reCAPTCHA failure, rate limit 429) | **Pass** |
| `npm run e2e`: 243 tests, Chromium/Firefox/WebKit at 375/768/1280 | Last full parallel run: 213 passed, 9 flaky, 3 failed, 18 skipped (desktop-only or mobile-only tests). **All 3 failures and most flakes were WebKit process crashes ("Target crashed")** under parallel load. Run serially, every WebKit project passes (webkit-768: 25/25; webkit-375 + webkit-1280: 49 passed, 1 intermittent that then passed 3 of 3 on repeat). Chromium and Firefox: all pass. |
| `npm run lighthouse` (mobile, local server with brotli) | `/`: 99 / 100 / 100 / 100 on 3 consecutive runs. `/product`: 96 / 100 / 100 / **69**. One earlier outlier run scored 25 on `/` and did not reproduce. |
| `npm run check:external` | dashboard and orridan.net home: 200. New routes 404 because the site is not uploaded yet. **Re-run after upload.** |

## QA checklist

| Item | Status |
|---|---|
| Active navbar highlight (scroll-spy, aria-current) | Pass (e2e, desktop) |
| Responsive layout and hamburger (focus trap, Esc, scroll lock, closes on link and route change) | Pass (e2e 375/768; screenshots 375/1280) |
| Graphics, icons, illustrations | Pass (all SVG, no empty boxes; reviewed in screenshots) |
| Full content integration (all copy from content.ts) | Pass |
| No em dashes | Pass (`check:dashes`) |
| Product page header, correct name, working link | Pass (e2e) |
| All internal links | Pass (`check:links` + e2e crawl) |
| External links incl. social and citation | **Manual**: social and citation URLs are empty, so they are hidden; re-run `check:external` after upload |
| Pricing accuracy monthly and annual | Pass (unit + render consistency test + e2e) |
| Sandbox payment | Pass for button states (e2e with fake links). **Manual** for real Stripe test links and the success flow |
| Footer links | Pass (e2e crawl) |
| Favicon on all devices | Pass for generation and references (postbuild verifies files). **Manual** on real devices |
| GDPR banner (nothing before consent, Reject, Customise, persistence) | Pass (e2e) |
| Chatbot | Pass (unit matcher + e2e) |
| Sitemap and footer link | Pass (generated, excludes noindex pages, linked as plain `<a>`) |
| robots.txt | Pass (file); **Manual** live check |
| .htaccess HTTPS redirect | **Manual** (cannot run Apache locally; curl commands in README) |
| reCAPTCHA on contact | Pass with a stub in e2e; server verification path tested in check:php. **Manual** with live keys |
| Canonical tags | Pass (exactly one per page, absolute, in static HTML) |
| Meta tags | Pass (titles 60 or fewer chars, descriptions 160 or fewer, OG, Twitter, robots) |
| All buttons work | Pass (e2e) |
| Top-of-page and useEffect behaviour | Pass (e2e route-change test; StrictMode-safe effects) |
| The two product page buttons | Pass (e2e) |
| UI/UX, logo, colour, typography consistency | Pass (single logo file, 4-colour Tailwind palette, one type scale) |
| Cross-browser display | Pass in Playwright engines. **Manual**: real Safari (macOS/iOS) and Edge |
| Terms and Privacy with phone, email, address, website | Pass (shown from the company object; placeholders visible, no tel:/mailto: yet) |
| Lighthouse | Pass for `/`. `/product` SEO 69 by design (see deviations) |

## Placeholders to fill in (`npm run check:placeholders`)

- Company: legal name, phone, email, registered address, business hours, governing law, data retention period (`src/content.ts`, `company`).
- Social links: LinkedIn, GitHub, X, YouTube. Citation: company register entry (all hidden until a URL is added).
- `.env`: `VITE_RECAPTCHA_SITE_KEY`, and four Stripe test Payment Links (Organisation and Twin Management, monthly and annual). The two Enterprise keys are unused.
- Prices: Organisation $50/month, Twin Management $150/month, annual discount 20% (marked `// PLACEHOLDER PRICES`). Plan feature lists and comparison table rows are also placeholders to confirm.
- `api/config.php` on the server: `RECAPTCHA_SECRET`, `MAIL_TO`, `MAIL_FROM`, `RATE_LIMIT_SALT`.
- `productPageReady` is `false` until the real product page arrives.

## Manual verification needed

- Upload by FTP and run the `curl -I` checks in README (HTTPS and www redirects, route files, 404, `api/config.php` 403, compression, cache headers, security headers).
- Live reCAPTCHA keys: submit the contact form; confirm the email arrives and Reply-To is the visitor.
- Newsletter submission arrives by email.
- Live Stripe test links and the `/checkout/success` redirect.
- Physical device testing (iOS Safari, Android Chrome), real desktop Safari and Edge.
- SEOptimer (or similar) canonical, sitemap and robots checks after upload.
- `npm run check:external` after upload.
- Lighthouse against the live host (local numbers use a Node server, not Apache).

## Deviations and decisions to review

- **Dashboard linked only from /product** (client instruction, overriding the original brief): the closing banner now reads "Explore the Platform" and goes to /product, the footer no longer has a Dashboard link, the checkout success page offers "Go to the Product page" instead of the dashboard, and the FAQ and chatbot sign-in answers point to the Product page (with a button). Enforced by `npm run check:links` and an e2e test. Note this means /product is now also linked from the closing banner, the checkout page and the chatbot, beyond the two links the brief listed.

- **/product SEO 69 in Lighthouse**: the spec requires `noindex,follow` while `productPageReady` is false, and Lighthouse always fails "Page is blocked from indexing" for noindex pages. It becomes 100 when the flag is switched.
- **Unknown URLs return index.html with status 200** (soft 404, as the spec's .htaccess order requires); the page then shows the 404 view with `noindex`. Missing files with an extension and `/api/` paths return a real 404.
- **Prerendering added**: the build snapshots each route's rendered markup into its HTML, so first paint needs no JavaScript and crawlers see full content. React then renders fresh without hydration. If Chromium is not installed the build warns and the site is client-rendered.
- **Tailwind 3 kept** (not 4) because Tailwind 4 requires Safari 16.4+, and the spec targets Safari 15 / iOS 15. `npm audit` reports a high-severity `braces` advisory in Tailwind 3's build-time tooling only; nothing from it ships to the browser.
- **Hyphen rule**: `check:dashes` allows `--` only as code syntax (CSS custom properties such as `--c1`, HTML comments, decrement operators), since the spec's own colour tokens use it.
- **Product page is in the main bundle** (it is under 1 KB and a hero CTA target); every other route and the landing page's below-the-fold content are code-split.
- **WebKit on Windows** is slow and crash-prone under parallel load, so Playwright uses 3 workers, a 90 s timeout for WebKit and 1 retry. Flaky results are still listed by the reporter.
