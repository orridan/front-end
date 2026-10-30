import { useId } from 'react';
import { useNavigate } from 'react-router';
import { pricing, sectionIds, type Interval, type Plan } from '../content';
import { requestContact } from '../lib/contactBridge';
import { getStripeLink } from '../lib/links';
import { getPrice } from '../lib/pricing';
import { Icon } from '../components/Icon';
import { SectionTag } from '../components/Drawing';

/** Monthly billing only (annual billing was removed at the client's request). */
const interval: Interval = 'monthly';

function PriceTag({ plan }: { plan: Plan }) {
  const price = getPrice(plan.id, interval);
  if (price.kind === 'custom') {
    return (
      <div className="min-h-[5.5rem]">
        <p className="display text-[3rem]" data-price-plan={plan.id} data-price-value="custom">
          {price.label}
        </p>
        <p className="mt-2 text-small opacity-90">{pricing.customNote}</p>
      </div>
    );
  }
  return (
    <div className="min-h-[5.5rem]">
      <p className="flex items-baseline gap-2">
        <span
          className="display text-[3.5rem] tabular"
          data-price-plan={plan.id}
          data-price-interval={interval}
          data-price-value={price.perMonth}
        >
          {price.perMonthLabel}
        </span>
        <span className="opacity-90">{pricing.perMonth}</span>
      </p>
      <p className="mt-2 text-small opacity-90" data-price-billing={plan.id}>
        {price.billingLabel}
      </p>
    </div>
  );
}

function PlanAction({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const price = getPrice(plan.id, interval);
  const tone = plan.highlighted ? 'btn-navy' : 'btn-primary shimmer';
  if (price.kind === 'custom') {
    return (
      <a
        href={`/#${sectionIds.contact}`}
        className={`btn ${tone} w-full`}
        onClick={(e) => {
          e.preventDefault();
          requestContact(pricing.enterpriseSubject, navigate);
        }}
        data-testid={`plan-cta-${plan.id}`}
      >
        {plan.ctaLabel}
        <Icon name="arrowRight" size={18} />
      </a>
    );
  }
  const href = getStripeLink(plan.id, interval);
  if (!href) {
    return (
      <button type="button" className={`btn ${tone} w-full !whitespace-normal`} disabled aria-disabled="true" data-testid={`plan-cta-${plan.id}`}>
        {pricing.sandbox.notConfigured}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn ${tone} w-full`} data-testid={`plan-cta-${plan.id}`}>
      {plan.ctaLabel}
      <span className="sr-only">
        : {plan.name}, {price.fullLabel}
      </span>
      <Icon name="external" size={18} />
    </a>
  );
}

export function Pricing() {
  const switchId = useId();
  const navigate = useNavigate();

  const plans = pricing.plans;
  /* Board columns: labels, then one column per plan. Shared by the plan row and the table. */
  const columns = 'lg:grid-cols-[28%_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]';

  return (
    <section id={sectionIds.pricing} aria-labelledby="pricing-title" className="section drawing atmosphere">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionTag id={sectionIds.pricing} />
            <h2 id="pricing-title" className="mt-4" data-reveal>
              {pricing.heading}
            </h2>
            <p className="mt-4 lead text-muted max-w-[36rem]" data-reveal>
              {pricing.intro}
            </p>
          </div>
        </div>

        <div className="mt-8 border-y hairline py-3 flex items-center gap-3" data-reveal>
          <p className="inline-flex w-fit items-center gap-2 border border-pink text-pink mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] px-2.5 py-1 shrink-0 rounded-sm" data-testid="sandbox-badge">
            <Icon name="lock" size={14} />
            {pricing.sandbox.badge}
          </p>
        </div>

        {/* Comparison board. Plan cells are column heads on desktop and stacked cards on mobile. */}
        <div className="mt-12 lg:border lg:hairline lg:rounded-card">
          <ul className={`grid gap-5 lg:gap-0 ${columns} items-stretch`} role="list">
            <li aria-hidden="true" className="hidden lg:flex flex-col justify-end gap-3 p-6 border-r hairline">
              <span className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-blush">{pricing.comparison.caption}</span>
              <span className="ruler opacity-80" />
            </li>
            {plans.map((plan) => (
              <li
                key={plan.id}
                className={`relative flex flex-col gap-5 p-6 sm:p-7 ${
                  plan.highlighted ? 'card-pink lg:-mt-8 lg:mb-0 lg:rounded-b-none z-10' : 'panel lg:border-0 lg:border-r lg:last:border-r-0 lg:rounded-none spotlight'
                }`}
                data-reveal
                data-plan={plan.id}
              >
                <div>
                  {plan.highlighted ? (
                    <span className="inline-block mb-3 whitespace-nowrap bg-navy text-light mono text-[0.625rem] uppercase tracking-[0.12em] px-2 py-1 rounded-sm">
                      {pricing.popularLabel}
                    </span>
                  ) : null}
                  <h3 className="display !text-[2rem]">{plan.name}</h3>
                  <p className="mt-3 font-semibold">{plan.headline}</p>
                  <p className={`mt-2 text-small ${plan.highlighted ? 'text-navy/85' : 'text-muted'}`}>{plan.tagline}</p>
                </div>
                <PriceTag plan={plan} />
                <p className="text-small font-medium">{plan.featuresIntro}</p>
                <ul className="grid gap-2 -mt-2" role="list">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-small">
                      <Icon name="check" size={18} className={`shrink-0 mt-0.5 ${plan.highlighted ? 'text-navy' : 'text-pink'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.footnote ? <p className={`text-small ${plan.highlighted ? 'text-navy/85' : 'text-muted'}`}>{plan.footnote}</p> : null}
                <div className="mt-auto">
                  <PlanAction plan={plan} />
                </div>
              </li>
            ))}
          </ul>

        </div>

        <div className="mt-20 grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="section-tag" data-reveal>
              <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
              {pricing.comparison.eyebrow}
            </p>
            <h3 className="mt-3 display !text-[clamp(2rem,1.4rem+2.2vw,3.25rem)]" data-reveal>
              {pricing.comparison.heading}
            </h3>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-muted" data-reveal>
            {pricing.comparison.intro}
          </p>
        </div>

        <div className="mt-8">
          {/* Feature rows: a real table. Sticky header row on desktop, scrollable region on mobile. */}
          <div className="overflow-x-auto lg:overflow-visible border hairline rounded-card" role="region" aria-labelledby={`${switchId}-cap`} tabIndex={0}>
            <table className="w-full min-w-[40rem] text-left table-fixed">
              <caption id={`${switchId}-cap`} className="sr-only">
                {pricing.comparison.caption}
              </caption>
              <colgroup>
                <col className="w-[28%]" />
                {plans.map((p) => (
                  <col key={p.id} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="lg:sticky lg:top-[calc(var(--nav-h)-0.25rem)] z-20 bg-navy px-6 py-3 mono text-[0.6875rem] uppercase tracking-[0.12em] text-blush font-medium border-b hairline">
                    {pricing.comparison.featureHeader}
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className={`lg:sticky lg:top-[calc(var(--nav-h)-0.25rem)] z-20 px-6 py-3 mono text-[0.6875rem] uppercase tracking-[0.12em] font-medium border-b hairline ${
                        p.highlighted ? 'bg-pink text-navy' : 'bg-navy text-light'
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hairline">
                  <th scope="row" className="px-6 py-4 font-medium">
                    {pricing.comparison.priceRow}
                  </th>
                  {plans.map((p) => {
                    const price = getPrice(p.id, interval);
                    return (
                      <td
                        key={p.id}
                        className={`px-6 py-4 tabular text-small ${p.highlighted ? 'bg-pink/10' : ''}`}
                        data-table-price={p.id}
                        data-price-value={price.kind === 'fixed' ? price.perMonth : 'custom'}
                      >
                        {price.fullLabel}
                      </td>
                    );
                  })}
                </tr>
                {pricing.comparison.rows.map((row) => (
                  <tr key={row.feature} className="border-b hairline last:border-b-0">
                    <th scope="row" className="px-6 py-3 font-normal text-light/90 text-small">
                      {row.feature}
                    </th>
                    {plans.map((p) => (
                      <td key={p.id} className={`px-6 py-3 ${p.highlighted ? 'bg-pink/10' : ''}`}>
                        {row[p.id] ? (
                          <Icon name="check" size={20} className="text-pink" title={pricing.comparison.yes} />
                        ) : (
                          <Icon name="minus" size={20} className="text-light/50" title={pricing.comparison.no} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Which plan fits your team? */}
        <div className="mt-16 card-pink crop p-8 sm:p-10 grid gap-6 lg:grid-cols-12 lg:items-center" data-reveal>
          <div className="lg:col-span-8">
            <p className="section-tag">{pricing.fit.eyebrow}</p>
            <h3 className="mt-3 display !text-[clamp(1.75rem,1.3rem+1.8vw,2.75rem)]">{pricing.fit.heading}</h3>
            {pricing.fit.lines.map((line) => (
              <p key={line} className="mt-2 text-muted">
                {line}
              </p>
            ))}
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <button type="button" className="btn btn-navy !min-h-[52px]" onClick={() => requestContact(pricing.fit.subject, navigate)}>
              {pricing.fit.cta}
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
