import type { ReactNode } from 'react';
import { company, contact, legalCommon, type LegalBlock, type LegalListItem, type LegalSection, type SeoEntry } from '../content';
import { isRealEmail, isRealPhone, isRealUrl, telHref } from '../lib/placeholder';
import { Seo } from './Seo';
import { PageHeader } from './PageHeader';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { ExternalLink } from './Links';

const buildDate = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : new Date().toISOString().slice(0, 10);

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** Renders the legal text inline markup: **bold** and [text](href). */
function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g)) {
    parts.push(text.slice(last, m.index));
    const key = m.index;
    if (m[1]) parts.push(<strong key={key}>{m[1]}</strong>);
    else if (/^https?:/.test(m[3])) parts.push(<ExternalLink key={key} href={m[3]} className="link">{m[2]}</ExternalLink>);
    else parts.push(<a key={key} href={m[3]} className="link">{m[2]}</a>);
    last = key + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

function ListItem({ item }: { item: LegalListItem }) {
  if (typeof item === 'string') return <li className="text-light/90"><RichText text={item} /></li>;
  return (
    <li className="text-light/90">
      {item.paragraphs.map((p) => <p key={p}><RichText text={p} /></p>)}
      {item.sub ? <ul>{item.sub.map((s) => <ListItem key={s} item={s} />)}</ul> : null}
    </li>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('h3' in block) return <h3>{block.h3}</h3>;
  if ('h4' in block) return <h4>{block.h4}</h4>;
  if ('p' in block) return <p className="text-light/90"><RichText text={block.p} /></p>;
  return <ul>{block.ul.map((item, i) => <ListItem key={i} item={item} />)}</ul>;
}

/** Company contact block (offices, email, website, founder) from the single company object. */
export function CompanyContact() {
  const rows: { icon: string; label: string; value: string; href: string | null; external?: boolean }[] = [
    ...company.offices.flatMap((office) => [
      {
        icon: 'phone',
        label: `${contact.infoLabels.phone}, ${office.region}`,
        value: office.phone,
        href: isRealPhone(office.tel ?? office.phone) ? telHref(office.tel ?? office.phone) : null,
      },
      { icon: 'mapPin', label: `${contact.infoLabels.address}, ${office.region}`, value: `${office.legalName}, ${office.address}`, href: null },
    ]),
    {
      icon: 'mail',
      label: contact.infoLabels.email,
      value: company.email,
      href: isRealEmail(company.email) ? `mailto:${company.email}` : null,
    },
    { icon: 'globe', label: contact.infoLabels.website, value: company.website.replace(/^https?:\/\//, ''), href: isRealUrl(company.website) ? company.website : null, external: true },
    { icon: 'building', label: contact.infoLabels.founder, value: company.founder, href: null },
    { icon: 'clock', label: contact.infoLabels.founded, value: formatDate(company.founded), href: null },
  ];
  return (
    <dl className="grid gap-4">
      {rows.map((row) => (
        <div key={row.label} className="relative pl-[3.25rem] min-h-[2.5rem]">
          <dt className="text-small text-muted">
            <span className="icon-tile !w-10 !h-10 !rounded-xl absolute left-0 top-0" aria-hidden="true">
              <Icon name={row.icon} size={20} />
            </span>
            {row.label}
          </dt>
          <dd className="font-medium break-words">
            {row.href && row.external ? (
              <ExternalLink href={row.href} className="link">
                {row.value}
              </ExternalLink>
            ) : row.href ? (
              <a href={row.href} className="link">
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalLayout({
  seo,
  heading,
  intro,
  sections,
  updated,
  draft = true,
  companyContact = true,
  extraToc = [],
  children,
}: {
  seo: SeoEntry;
  heading: string;
  intro: string | string[];
  sections: LegalSection[];
  /** Fixed "Last updated" date (ISO); the build date is shown when omitted. */
  updated?: string;
  /** Show the "draft text" banner. */
  draft?: boolean;
  /** Append the company contact card (pages whose text has its own Contact Us section turn it off). */
  companyContact?: boolean;
  /** Table of contents entries for sections passed as children. */
  extraToc?: { id: string; heading: string }[];
  children?: ReactNode;
}) {
  return (
    <>
      <Seo entry={seo} />
      <PageHeader title={heading}>
        <p className="text-muted">
          {legalCommon.lastUpdated}: <time dateTime={updated ?? buildDate}>{formatDate(updated ?? buildDate)}</time>
        </p>
      </PageHeader>
      <div className="container-site pt-10 pb-20">
        {draft ? (
          <p role="note" className="glass !rounded-lg2 flex items-start gap-3 p-4 text-blush max-w-prose mb-10">
            <Icon name="info" size={22} className="shrink-0 mt-0.5" />
            {legalCommon.draftBanner}
          </p>
        ) : null}
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr]">
          <nav aria-label={legalCommon.contents} className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] self-start">
            <p className="eyebrow mb-3">{legalCommon.contents}</p>
            <ul className="grid gap-1 border-l hairline" role="list">
              {[...sections, ...extraToc].map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block pl-4 py-1.5 text-small text-light/85 hover:text-light">
                    {s.heading}
                  </a>
                </li>
              ))}
              {companyContact ? (
                <li>
                  <a href="#contact-us" className="block pl-4 py-1.5 text-small text-light/85 hover:text-light">
                    {legalCommon.contactHeading}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
          <article className="prose-legal max-w-prose">
            <div className="flex items-center gap-3 mb-6">
              <Logo variant="light" height={26} />
            </div>
            {(Array.isArray(intro) ? intro : [intro]).map((p) => (
              <p key={p} className="lead text-muted">
                <RichText text={p} />
              </p>
            ))}
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.heading}</h2>
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </section>
            ))}
            {children}
            {companyContact ? (
            <section id="contact-us" aria-labelledby="contact-us-h">
              <h2 id="contact-us-h">{legalCommon.contactHeading}</h2>
              <p className="text-light/90 mb-5">{legalCommon.contactIntro}</p>
              <div className="glass p-6">
                <p className="font-semibold mb-4">{company.legalName}</p>
                <CompanyContact />
              </div>
            </section>
            ) : null}
          </article>
        </div>
      </div>
    </>
  );
}
