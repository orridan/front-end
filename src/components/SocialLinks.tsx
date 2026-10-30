import { citationLinks, footer, socialLinks, type ExternalLink as ExtLink } from '../content';
import { isRealUrl } from '../lib/placeholder';
import { BrandIcon } from './BrandIcon';
import { ExternalLink } from './Links';
import { Icon } from './Icon';

function LinkGroup({ heading, links }: { heading: string; links: ExtLink[] }) {
  const real = links.filter((l) => isRealUrl(l.href));
  if (real.length === 0) return null;
  return (
    <div>
      <p className="mono text-[0.625rem] uppercase tracking-[0.16em] text-blush/80 mb-2">{heading}</p>
      <ul className="flex flex-wrap gap-2" role="list">
        {real.map((l) => (
          <li key={l.label}>
            <ExternalLink href={l.href} className="inline-flex items-center gap-2 min-h-[44px] px-3 border border-blush/40 rounded-sm text-light/90 hover:text-light hover:border-pink">
              {l.icon && l.icon !== 'link' ? <BrandIcon name={l.icon} size={18} /> : <Icon name="link" size={16} />}
              {l.label}
              <span className="sr-only">{footer.newTab}</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Social profiles and company listings; links without a URL stay hidden. */
export function SocialLinks({ className = '' }: { className?: string }) {
  if (![...socialLinks, ...citationLinks].some((l) => isRealUrl(l.href))) return null;
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${className}`}>
      <LinkGroup heading={footer.socialHeading} links={socialLinks} />
      <LinkGroup heading={footer.citationHeading} links={citationLinks} />
    </div>
  );
}
