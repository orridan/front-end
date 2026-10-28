import { useRef, type ReactNode } from 'react';
import { drawing, features, sectionIds } from '../content';
import { IllustrationTile } from '../components/Illustration';
import { DimLine, Guides, SectionTag } from '../components/Drawing';
import { usePauseOffscreen } from '../lib/hooks';
import {
  BarsIllustration,
  ChecklistIllustration,
  GaugeIllustration,
  RecordRowsIllustration,
  ScenarioIllustration,
  StepperIllustration,
  TimelineIllustration,
  TrailIllustration,
} from './FeatureIllustrations';

/** Leader node on a card edge: a short line and a dot reaching toward the next card. */
function Leader({ side }: { side: 'right' | 'left' | 'bottom' }) {
  const pos =
    side === 'right'
      ? 'top-10 -right-6 w-6 h-px'
      : side === 'left'
        ? 'top-10 -left-6 w-6 h-px'
        : 'left-10 -bottom-6 h-6 w-px';
  return (
    <span aria-hidden="true" className={`hidden lg:block absolute ${pos} bg-pink/60`}>
      <span className={`absolute w-1.5 h-1.5 rounded-full bg-pink ${side === 'bottom' ? 'left-1/2 -translate-x-1/2 bottom-0' : side === 'right' ? 'right-0 top-1/2 -translate-y-1/2' : 'left-0 top-1/2 -translate-y-1/2'}`} />
    </span>
  );
}

function Card({
  icon,
  title,
  text,
  children,
  className = '',
  tone = 'dark',
  code,
}: {
  icon: string;
  title: string;
  text: string;
  children?: ReactNode;
  className?: string;
  tone?: 'dark' | 'pink';
  code: string;
}) {
  return (
    <li className={`${tone === 'pink' ? 'card-pink' : 'panel spotlight'} crop lift relative p-6 sm:p-7 flex flex-col gap-4 ${className}`} data-reveal>
      <div className="flex items-start justify-between gap-4">
        <IllustrationTile title={title} icon={icon} />
        <span className={`mono text-[0.625rem] tracking-[0.14em] ${tone === 'pink' ? 'text-navy/80' : 'text-blush/70'}`} aria-hidden="true">
          {code}
        </span>
      </div>
      <div>
        <h3>{title}</h3>
        <p className="mt-2 text-muted">{text}</p>
      </div>
      {children ? <div className={tone === 'pink' ? 'flex-1 flex flex-col justify-center pt-2' : 'mt-auto pt-2'}>{children}</div> : null}
    </li>
  );
}

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);
  const [first, middle, last] = features.highlight;
  const [scenarios, telemetry, maintenance, dashboard, trail] = features.bento;

  return (
    <section id={sectionIds.features} aria-labelledby="features-title" className="section drawing atmosphere overflow-hidden">
      <Guides labels={false} />
      <div ref={ref} className="container-site relative">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionTag id={sectionIds.features} />
            <h2 id="features-title" className="mt-4" data-reveal>
              {features.heading}
            </h2>
          </div>
          <p className="lead text-muted lg:col-span-4 lg:col-start-9 lg:mt-16" data-reveal>
            {features.intro}
          </p>
        </div>

        {/* Asymmetric bento: one tall pink card overlapping its neighbours, joined by leaders. */}
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12" role="list">
          <Card icon="activity" title={first.title} text={first.text} code={`${drawing.labels.featureCode}01`} className="lg:col-span-4">
            <TimelineIllustration points={first.points} />
            <Leader side="right" />
          </Card>
          <Card
            icon="version"
            title={middle.title}
            text={middle.text}
            code={`${drawing.labels.featureCode}02`}
            tone="pink"
            className="md:row-span-2 lg:col-span-4 lg:row-span-2 lg:-mx-4 lg:-mt-6 lg:mb-6 z-10"
          >
            <StepperIllustration points={middle.points} />
          </Card>
          <Card icon="compare" title={last.title} text={last.text} code={`${drawing.labels.featureCode}03`} className="lg:col-span-4 lg:mt-14">
            <BarsIllustration points={last.points} label={features.illustrativeLabel} />
            <Leader side="left" />
          </Card>
          <Card icon={scenarios.icon} title={scenarios.title} text={scenarios.text} code={`${drawing.labels.featureCode}04`} className="lg:col-span-4">
            <ScenarioIllustration />
            <Leader side="bottom" />
          </Card>
          <Card icon={telemetry.icon} title={telemetry.title} text={telemetry.text} code={`${drawing.labels.featureCode}05`} className="lg:col-span-4 lg:-mt-2">
            <RecordRowsIllustration />
          </Card>
          <Card icon={maintenance.icon} title={maintenance.title} text={maintenance.text} code={`${drawing.labels.featureCode}06`} className="lg:col-span-5">
            <ChecklistIllustration />
            <Leader side="right" />
          </Card>
          <Card icon={dashboard.icon} title={dashboard.title} text={dashboard.text} code={`${drawing.labels.featureCode}07`} className="lg:col-span-3 lg:-mt-16 z-10">
            <GaugeIllustration />
          </Card>
          <Card icon={trail.icon} title={trail.title} text={trail.text} code={`${drawing.labels.featureCode}08`} className="md:col-span-2 lg:col-span-4">
            <TrailIllustration />
            <Leader side="left" />
          </Card>
        </ul>

        {/* Product facts as a dimensioned strip */}
        <div className="mt-20">
          <h3 className="section-tag" data-reveal>
            {features.factsHeading}
          </h3>
          <DimLine className="mt-4" label={`${features.facts.length} ${drawing.labels.factsDim}`} />
          <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 border-l hairline">
            {features.facts.map((f) => (
              <div key={f.label} className="px-5 py-6 sm:px-7 flex flex-col gap-2 border-r border-b hairline" data-reveal>
                <dt className="order-2 mono text-[0.75rem] uppercase tracking-[0.12em] text-blush">{f.label}</dt>
                <dd className="order-1 display text-[clamp(2.5rem,1.8rem+2.8vw,4.5rem)] text-light">
                  {f.value !== null ? (
                    <>
                      <span aria-hidden="true" data-count={f.value} className="tabular">
                        {f.value}
                      </span>
                      <span className="sr-only">{f.value}</span>
                      <span className="text-pink">{f.suffix}</span>
                    </>
                  ) : (
                    <span className="outline-text">{f.display}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
