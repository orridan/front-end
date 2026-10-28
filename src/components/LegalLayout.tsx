import type { ReactNode } from 'react';
import { company, contact, legalCommon, type LegalSection, type SeoEntry } from '../content';
import { fill, isRealEmail, isRealPhone, isRealUrl, telHref } from '../lib/placeholder';
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

const tokens = {
  retention: company.dataRetention,
  company: company.legalName,
  governingLaw: company.governingLaw,
};

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
  extraToc = [],
  children,
}: {
  seo: SeoEntry;
  heading: string;
  intro: string;
  sections: LegalSection[];
  /** Table of contents entries for sections passed as children. */
  extraToc?: { id: string; heading: string }[];
  children?: ReactNode;
}) {
  return (
    <>
      <Seo entry={seo} />
      <PageHeader title={heading}>
        <p className="text-muted">
          {legalCommon.lastUpdated}: <time dateTime={buildDate}>{formatDate(buildDate)}</time>
        </p>
      </PageHeader>
      <div className="container-site pt-10 pb-20">
        <p role="note" className="glass !rounded-lg2 flex items-start gap-3 p-4 text-blush max-w-prose">
          <Icon name="info" size={22} className="shrink-0 mt-0.5" />
          {legalCommon.draftBanner}
        </p>
        <div className="mt-10 grid gap-12 lg:grid-cols-[16rem_1fr]">
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
              <li>
                <a href="#contact-us" className="block pl-4 py-1.5 text-small text-light/85 hover:text-light">
                  {legalCommon.contactHeading}
                </a>
              </li>
            </ul>
          </nav>
          <article className="prose-legal max-w-prose">
            <div className="flex items-center gap-3 mb-6">
              <Logo variant="light" height={26} />
            </div>
            <p className="lead text-muted">{intro}</p>
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.heading}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="text-light/90">
                    {fill(p, tokens)}
                  </p>
                ))}
                {s.list ? (
                  <ul>
                    {s.list.map((item) => (
                      <li key={item} className="text-light/90">
                        {fill(item, tokens)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
            {children}
            <section id="contact-us" aria-labelledby="contact-us-h">
              <h2 id="contact-us-h">{legalCommon.contactHeading}</h2>
              <p className="text-light/90 mb-5">{legalCommon.contactIntro}</p>
              <div className="glass p-6">
                <p className="font-semibold mb-4">{company.legalName}</p>
                <CompanyContact />
              </div>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
