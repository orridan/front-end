import { useRef } from 'react';
import { howItWorks, sectionIds } from '../content';
import { IllustrationTile } from '../components/Illustration';
import { SectionTag } from '../components/Drawing';
import { drawConnectors, useGsap } from '../lib/gsapMotion';

/**
 * Vertical blueprint timeline: a central spine with numbered nodes and callouts alternating
 * left and right. The pink progress line fills as the list scrolls through (GSAP scrub); it is
 * fully drawn when motion is reduced or scripts fail. Mobile: one column with the spine on the left.
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useGsap(sectionRef, (root) => {
    if (listRef.current) drawConnectors(root, listRef.current);
  });

  return (
    <section ref={sectionRef} id={sectionIds.howItWorks} aria-labelledby="how-title" className="section paper overflow-hidden">
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <SectionTag id={sectionIds.howItWorks} />
            <h2 id="how-title" className="mt-4" data-reveal>
              {howItWorks.heading}
            </h2>
          </div>
          <p className="lead text-muted lg:col-span-5 lg:col-start-8" data-reveal>
            {howItWorks.intro}
          </p>
        </div>

        <div className="relative mt-16">
          {/* Spine: faint track plus the pink progress fill */}
          <div aria-hidden="true" className="absolute top-0 bottom-0 left-[22px] lg:left-1/2 w-px -translate-x-1/2 bg-navy/20">
            <div data-connector="y" className="absolute inset-0 origin-top bg-pink" />
          </div>
          <ol ref={listRef} className="relative grid gap-12 lg:gap-6" role="list">
            {howItWorks.steps.map((step, i) => {
              const right = i % 2 === 1;
              return (
                <li key={step.title} className="relative lg:grid lg:grid-cols-2 lg:gap-24 pl-16 lg:pl-0" data-reveal>
                  {/* Numbered node on the spine */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 top-0 grid place-items-center w-11 h-11 bg-navy text-light mono text-[0.8125rem] border-2 border-pink z-10"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={`${right ? 'lg:col-start-2' : 'lg:col-start-1 lg:text-right'}`}>
                    <div className={`relative card-light crop p-6 sm:p-7 ${right ? '' : 'lg:ml-auto'} max-w-[30rem]`}>
                      {/* Leader from the card to the node (desktop) */}
                      <span
                        aria-hidden="true"
                        className={`hidden lg:block absolute top-5 h-px w-[4.5rem] bg-pink ${right ? '-left-[4.5rem]' : '-right-[4.5rem]'}`}
                      />
                      <div className={`flex items-center gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}>
                        <IllustrationTile title={step.title} icon={step.icon} size={64} />
                        <p className="mono text-[0.75rem] uppercase tracking-[0.14em]">
                          {howItWorks.stepLabel} {String(i + 1).padStart(2, '0')}
                        </p>
                      </div>
                      <h3 className="mt-4 !text-[1.25rem]">{step.title}</h3>
                      <p className="mt-2 text-muted">{step.text}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
