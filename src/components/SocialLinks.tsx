import { citationLinks, footer, socialLinks, type ExternalLink as ExtLink } from '../content';
import { isRealUrl } from '../lib/placeholder';
import { BrandIcon } from './BrandIcon';
import { ExternalLink } from './Links';
import { Icon } from './Icon';

const chip = 'inline-flex items-center gap-2 min-h-[44px] px-3 border border-blush/40 rounded-sm';

function BrandMark({ link }: { link: ExtLink }) {
  return link.icon && link.icon !== 'link' ? <BrandIcon name={link.icon} size={18} /> : <Icon name="link" size={16} />;
}

function LinkGroup({ heading, links }: { heading: string; links: ExtLink[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80 mb-2">{heading}</p>
      <ul className="flex flex-wrap gap-2" role="list">
        {links.map((l) => (
          <li key={l.label}>
            {isRealUrl(l.href) ? (
              <ExternalLink href={l.href} className={`${chip} text-light/90 hover:text-light hover:border-pink`}>
                <BrandMark link={l} />
                {l.label}
                <span className="sr-only">{footer.newTab}</span>
              </ExternalLink>
            ) : (
              // Profile not live yet: shown, but not a link until its URL is added in content.ts.
              <span className={`${chip} text-light/50 cursor-default`} title={footer.socialSoon} data-testid="social-pending">
                <BrandMark link={l} />
                {l.label}
                <span className="sr-only">({footer.socialSoon})</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Social profiles and company listings. A profile without a URL is shown dimmed and is not a link. */
export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${className}`}>
      <LinkGroup heading={footer.socialHeading} links={socialLinks} />
      <LinkGroup heading={footer.citationHeading} links={citationLinks} />
    </div>
  );
}
