import { about, drawing, sectionIds } from '../content';
import { IllustrationTile } from '../components/Illustration';
import { DimLine, SectionTag } from '../components/Drawing';

/** Split layout: giant outline wordmark and story on navy, values stamped on a paper panel. */
export function About() {
  return (
    <section id={sectionIds.about} aria-labelledby="about-title" className="section drawing atmosphere overflow-hidden">
      <div className="container-site">
        <p aria-hidden="true" className="display outline-text text-[clamp(5rem,2rem+15vw,15rem)] leading-[0.8] select-none -ml-1" data-reveal>
          {drawing.outlineWord}
        </p>
        <DimLine className="mt-4 max-w-[62rem]" label={drawing.labels.aboutDim} />

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionTag id={sectionIds.about} />
            <p className="mt-4 eyebrow eyebrow-pill w-fit" data-reveal>
              {about.eyebrow}
            </p>
            <h2 id="about-title" className="mt-4" data-reveal>
              {about.heading}
            </h2>
            <div className="mt-6 grid gap-4 max-w-[36rem]">
              {about.story.map((p) => (
                <p key={p} className="text-muted lead" data-reveal>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 relative">
            <div className="paper crop p-6 sm:p-8 rotate-[-1.2deg] shadow-[0_30px_60px_-40px_rgb(var(--c2-rgb))]" data-reveal>
              <p className="mono text-[0.6875rem] uppercase tracking-[0.14em] flex justify-between">
                <span>{about.valuesEyebrow}</span>
                <span aria-hidden="true">{String(about.values.length).padStart(2, '0')}</span>
              </p>
              <h3 className="mt-3 display !text-[clamp(1.75rem,1.4rem+1.2vw,2.4rem)] text-navy">{about.valuesHeading}</h3>
              <ul className="mt-6 grid gap-6" role="list">
                {about.values.map((v, i) => (
                  <li key={v.title} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-start">
                    <span className="row-span-2 relative">
                      <IllustrationTile title={v.title} icon={v.icon} size={60} />
                      <span
                        className="stamp absolute -bottom-2 -right-3 !px-1.5 !py-0.5 text-navy bg-light"
                        style={{ transform: `rotate(${[-4, 3, -2, 4][i % 4]}deg)` }}
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <h4 className="!text-[1.0625rem] text-navy">{v.title}</h4>
                    <p className="text-small text-muted">{v.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
