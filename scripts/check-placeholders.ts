/**
 * npm run check:placeholders
 * Lists every unfilled company, social, key and price placeholder as a warning.
 * Never fails the build: these are client inputs, not code defects.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (existsSync(join(root, '.env'))) process.loadEnvFile(join(root, '.env'));

const content = await import('../src/content.ts');
const { isPlaceholder, isRealUrl } = await import('../src/lib/placeholder.ts');

const warnings: string[] = [];

for (const [key, value] of Object.entries(content.company)) {
  if (typeof value === 'string' && isPlaceholder(value)) warnings.push(`company.${key}: ${value || '(empty)'}`);
}
for (const link of content.socialLinks) {
  if (!isRealUrl(link.href)) warnings.push(`socialLinks "${link.label}": no URL (hidden until filled)`);
}
for (const link of content.citationLinks) {
  if (!isRealUrl(link.href)) warnings.push(`citationLinks "${link.label}": no URL (hidden until filled)`);
}

const envKeys = [
  'VITE_SITE_URL',
  'VITE_DASHBOARD_URL',
  'VITE_RECAPTCHA_SITE_KEY',
  'VITE_STRIPE_LINK_ORGANISATION_MONTHLY',
  'VITE_STRIPE_LINK_ORGANISATION_ANNUAL',
  'VITE_STRIPE_LINK_TWIN_MONTHLY',
  'VITE_STRIPE_LINK_TWIN_ANNUAL',
];
for (const key of envKeys) {
  if (!process.env[key]?.trim()) warnings.push(`.env ${key} is empty${key.startsWith('VITE_STRIPE') ? ' (button renders "Sandbox checkout not configured")' : ''}`);
}
for (const key of ['VITE_STRIPE_LINK_ENTERPRISE_MONTHLY', 'VITE_STRIPE_LINK_ENTERPRISE_ANNUAL']) {
  if (!process.env[key]?.trim()) warnings.push(`.env ${key} is empty (not used: Enterprise shows "Contact us")`);
}

const contentSource = readFileSync(join(root, 'src/content.ts'), 'utf8');
if (contentSource.includes('PLACEHOLDER PRICES')) {
  const prices = content.pricing.plans
    .map((p) => `${p.name} ${p.monthly === null ? 'custom' : `${content.pricing.currencySymbol}${p.monthly}/month`}`)
    .join(', ');
  warnings.push(`pricing: placeholder prices to confirm with client (${prices}, annual discount ${content.pricing.annualDiscount * 100}%)`);
  warnings.push('pricing: plan feature lists and the comparison table are placeholders to confirm with client');
}
if (!content.productPageReady) warnings.push('productPageReady is false: /product is noindex and not in the sitemap');

const php = join(root, 'public/api/config.php');
if (!existsSync(php)) warnings.push('api/config.php is not present locally (expected: create it on the server from config.example.php)');

if (warnings.length) {
  console.warn(`check:placeholders: ${warnings.length} placeholder(s) still to fill in:`);
  for (const w of warnings) console.warn(`  WARN  ${w}`);
} else {
  console.log('check:placeholders: no placeholders left.');
}
