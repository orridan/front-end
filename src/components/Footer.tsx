import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { citationLinks, drawing, footer, socialLinks, type ExternalLink as ExtLink, type FooterLink } from '../content';
import { consentStore } from '../lib/consent';
import { isRealUrl, fill } from '../lib/placeholder';
import { useFillOnScroll } from '../lib/fillOnScroll';
import { ExternalLink, SectionLink } from './Links';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { Newsletter } from './Newsletter';
import { CompanyContact } from './LegalLayout';

const rowCls = 'group flex items-center gap-3 w-full min-h-[44px] py-2 text-light/90 hover:text-light';

function IndexRow({ link, n }: { link: FooterLink; n: number }) {
  const inner = (
    <>
      <span className="mono text-[0.6875rem] text-blush/70 w-6" aria-hidden="true">
        {String(n).padStart(2, '0')}
      </span>
      <span className="font-medium">{link.label}</span>
      <span aria-hidden="true" className="ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-transform text-pink">
        <Icon name="arrowRight" size={16} />
      </span>
    </>
  );
  switch (link.kind) {
    case 'section':
      return (
        <SectionLink sectionId={link.sectionId} className={rowCls}>
          {inner}
        </SectionLink>
      );
    case 'route':
      return (
        <Link to={link.to} className={rowCls}>
          {inner}
        </Link>
      );
    case 'external':
      return (
        <ExternalLink href={link.href} className={rowCls}>
          {inner}
          <span className="sr-only">{footer.newTab}</span>
        </ExternalLink>
      );
    case 'file':
      // Static files are plain anchors, never router links.
      return (
        <a href={link.href} className={rowCls}>
          {inner}
        </a>
      );
    case 'cookie-preferences':
      return (
        <button type="button" className={`${rowCls} text-left`} onClick={() => consentStore.openPreferences()}>
          {inner}
        </button>
      );
  }
}

/** One title-block cell: small mono caption over a value. */
function Cell({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-r border-blush/30 p-4 sm:p-5 ${className}`}>
      <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function LinkGroup({ heading, links }: { heading: string; links: ExtLink[] }) {
  const real = links.filter((l) => isRealUrl(l.href));
  if (real.length === 0) return null;
  return (
    <div>
      <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80 mb-2">{heading}</p>
      <ul className="flex flex-wrap gap-2" role="list">
        {real.map((l) => (
          <li key={l.label}>
            <ExternalLink href={l.href} className="inline-flex items-center gap-2 min-h-[44px] px-3 border border-blush/40 rounded-sm text-light/90 hover:text-light">
              <Icon name={l.icon === 'x' ? 'xLogo' : (l.icon ?? 'link')} size={16} />
              {l.label}
              <span className="sr-only">{footer.newTab}</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const wordRef = useRef<HTMLDivElement>(null);
  useFillOnScroll(wordRef);
  const hasLinks = socialLinks.some((l) => isRealUrl(l.href)) || citationLinks.some((l) => isRealUrl(l.href));
  const half = Math.ceil(footer.index.length / 2);

  function backToTop() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }

  return (
    <footer id="site-footer" className="relative drawing atmosphere pt-16 pb-8 border-t hairline overflow-hidden">
      <div className="container-site">
        <div className="border-l border-t border-blush/30" aria-label={footer.titleBlock.label} role="group">
          {/* Revision request strip (newsletter) */}
          <div className="border-b border-r border-blush/30 p-5 sm:p-6">
            <Newsletter />
          </div>

          <div className="grid lg:grid-cols-12">
            {/* Identity */}
            <div className="lg:col-span-4 border-b border-r border-blush/30 p-5 sm:p-6 grid gap-3 content-start">
              <Link to="/" className="inline-flex w-fit" aria-label="Orridan home">
                <Logo variant="light" height={34} />
              </Link>
              <p className="text-small text-muted max-w-xs">{footer.tagline}</p>
            </div>

            {/* Drawing cells */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4">
              <Cell label={footer.titleBlock.drawing}>
                <p className="display text-[1.75rem]">{footer.titleBlock.drawingValue}</p>
              </Cell>
              <Cell label={footer.titleBlock.revision}>
                <p className="display text-[1.75rem] tabular">{year}</p>
              </Cell>
              <Cell label={footer.titleBlock.sheet}>
                <p className="display text-[1.75rem]">{footer.titleBlock.sheetValue}</p>
              </Cell>
              <Cell label={footer.titleBlock.scale}>
                <p className="display text-[1.75rem]">{footer.titleBlock.scaleValue}</p>
              </Cell>
            </div>

            {/* Index */}
            <nav aria-label={footer.titleBlock.index} className="lg:col-span-7 border-b border-r border-blush/30 p-5 sm:p-6">
              <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80">{footer.titleBlock.index}</p>
              <div className="mt-2 grid sm:grid-cols-2 sm:gap-x-8">
                {[footer.index.slice(0, half), footer.index.slice(half)].map((col, c) => (
                  <ul key={c} className="divide-y divide-blush/15" role="list">
                    {col.map((link, i) => (
                      <li key={link.label}>
                        <IndexRow link={link} n={c * half + i + 1} />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </nav>

            {/* Contact from the company object */}
            <div className="lg:col-span-5 border-b border-r border-blush/30 p-5 sm:p-6">
              <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80 mb-3">{footer.titleBlock.contact}</p>
              <CompanyContact />
            </div>
          </div>

          {hasLinks ? (
            <div className="border-b border-r border-blush/30 p-5 sm:p-6 grid gap-6 sm:grid-cols-2">
              <LinkGroup heading={footer.socialHeading} links={socialLinks} />
              <LinkGroup heading={footer.citationHeading} links={citationLinks} />
            </div>
          ) : null}

          <div className="border-b border-r border-blush/30 px-5 py-3 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-small text-muted">{fill(footer.copyright, { year })}</p>
            <button type="button" onClick={backToTop} className="btn btn-ghost btn-sm w-fit">
              <Icon name="arrowUp" size={16} />
              {footer.backToTop}
            </button>
          </div>
        </div>

        {/* Giant wordmark: outline that fills pink as the footer scrolls in */}
        <div ref={wordRef} className="relative mt-10 select-none" aria-hidden="true">
          <p className="display outline-text text-[clamp(5.5rem,0.5rem+23vw,23rem)] leading-[0.8] whitespace-nowrap">{drawing.outlineWord}</p>
          <div className="absolute inset-0 overflow-hidden" data-fill-mask>
            <div data-fill-inner>
              <p className="display text-pink text-[clamp(5.5rem,0.5rem+23vw,23rem)] leading-[0.8] whitespace-nowrap">{drawing.outlineWord}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
