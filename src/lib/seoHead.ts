/**
 * Pure head-tag builder shared by the <Seo> component (runtime), the Vite index.html
 * transform and the post-build per-route HTML writer. One source, identical output.
 */
import { citationLinks, company, site, socialLinks, type SeoEntry } from '../content';
import { isRealEmail, isRealPhone, isRealUrl, isPlaceholder } from './placeholder';

export type HeadTag = { tag: 'meta' | 'link'; attrs: Record<string, string> };

export function absoluteUrl(path: string): string {
  if (path === '/' || path === '') return `${site.url}/`;
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/+$/, '');
}

/** Only indexable pages and the product shell get a canonical. */
export function hasCanonical(entry: SeoEntry): boolean {
  return entry.path !== '/404' && entry.path !== '/checkout/success';
}

export function headFor(entry: SeoEntry): { title: string; tags: HeadTag[] } {
  const url = absoluteUrl(entry.path);
  const image = absoluteUrl(site.ogImage);
  const robots = entry.noindex ? 'noindex,follow' : 'index,follow';
  const tags: HeadTag[] = [
    { tag: 'meta', attrs: { name: 'description', content: entry.description } },
    { tag: 'meta', attrs: { name: 'robots', content: robots } },
  ];
  if (hasCanonical(entry)) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } });
    tags.push({ tag: 'meta', attrs: { property: 'og:url', content: url } });
  }
  tags.push(
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: site.name } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en' } },
    { tag: 'meta', attrs: { property: 'og:title', content: entry.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: entry.description } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: String(site.ogImageWidth) } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: String(site.ogImageHeight) } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: `${site.name}: ${site.category}` } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: entry.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: entry.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
    { tag: 'meta', attrs: { name: 'twitter:image:alt', content: `${site.name}: ${site.category}` } },
  );
  return { title: entry.title, tags };
}

/** Organization and WebSite structured data, built only from real (non-placeholder) values. */
export function structuredData(): Record<string, unknown>[] {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon-512.png'),
  };
  if (!isPlaceholder(company.legalName)) org.legalName = company.legalName;
  if (isRealEmail(company.email)) org.email = company.email;
  if (!isPlaceholder(company.founder)) org.founder = { '@type': 'Person', name: company.founder };
  if (!isPlaceholder(company.founded)) org.foundingDate = company.founded;
  const offices = company.offices.filter((o) => isRealPhone(o.tel ?? o.phone) && !isPlaceholder(o.address));
  if (offices.length) {
    org.address = offices.map((o) => o.address);
    org.contactPoint = offices.map((o) => ({ '@type': 'ContactPoint', telephone: o.tel ?? o.phone, contactType: 'customer support', areaServed: o.region }));
  }
  const sameAs = [...socialLinks, ...citationLinks].map((s) => s.href).filter((href) => isRealUrl(href));
  if (sameAs.length) org.sameAs = sameAs;
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absoluteUrl('/'),
    inLanguage: 'en',
  };
  return [org, website];
}

/* ========== string rendering for build-time HTML ========== */

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderHead(entry: SeoEntry): string {
  const { title, tags } = headFor(entry);
  const lines = [`<title>${escapeAttr(title)}</title>`];
  for (const t of tags) {
    const attrs = Object.entries(t.attrs)
      .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
      .join(' ');
    lines.push(`<${t.tag} data-seo ${attrs} />`);
  }
  return lines.join('\n    ');
}

export function renderStructuredData(): string {
  return structuredData()
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
}

export const SEO_START = '<!-- seo:start -->';
export const SEO_END = '<!-- seo:end -->';

export function replaceSeoBlock(html: string, entry: SeoEntry): string {
  const start = html.indexOf(SEO_START);
  const end = html.indexOf(SEO_END);
  if (start === -1 || end === -1) throw new Error('SEO markers missing from index.html');
  return html.slice(0, start + SEO_START.length) + '\n    ' + renderHead(entry) + '\n    ' + html.slice(end);
}
