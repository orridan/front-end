import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { externalLinkProps } from '../lib/links';

type SectionLinkProps = {
  sectionId: string;
  children: ReactNode;
  className?: string;
  ariaCurrent?: 'location' | 'page';
  onClick?: () => void;
};

/** Link to a landing page section. Always /#id so it works from every route. */
export function SectionLink({ sectionId, children, className, ariaCurrent, onClick }: SectionLinkProps) {
  return (
    <Link to={{ pathname: '/', hash: `#${sectionId}` }} className={className} aria-current={ariaCurrent} onClick={onClick}>
      {children}
    </Link>
  );
}

type ExternalProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & { href: string; children: ReactNode };

/** External link: always a new tab with rel="noopener noreferrer". Renders nothing for empty hrefs. */
export function ExternalLink({ href, children, ...rest }: ExternalProps) {
  if (!href || href === '#') return null;
  return (
    <a href={href} {...externalLinkProps} {...rest}>
      {children}
    </a>
  );
}
