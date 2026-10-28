import { Link } from 'react-router';
import { drawing, hero } from '../content';
import { SectionLink } from '../components/Links';
import { Icon } from '../components/Icon';
import { DrawingStrip, Guides, SectionTag } from '../components/Drawing';

/**
 * Three headline sentences: solid, outline, then solid with the last word in pink.
 * The full text is plain text inside the H1, so screen readers read it as written.
 */
function Headline() {
  const [first, second, third] = hero.titleLines;
  const lastSpace = third.lastIndexOf(' ');
  return (
    <h1 id="hero-title" className="text-hero intro-rise-2 relative z-10">
      <span className="block">{first}</span>{' '}
      <span className="block outline-text">{second}</span>{' '}
      <span className="block">
        {third.slice(0, lastSpace)} <span className="text-gradient">{third.slice(lastSpace + 1)}</span>
      </span>
    </h1>
  );
}

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden drawing atmosphere">
      <Guides />
      <div className="container-site relative pt-[6.5rem] sm:pt-[7.5rem]">
        <DrawingStrip items={drawing.headerStrip} />
      </div>
      <div className="container-site relative grid lg:grid-cols-12 gap-10 lg:gap-0 items-center pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="lg:col-span-6 lg:pr-4">
          <SectionTag id="top" className="intro-rise !flex" />
          <p className="mt-5 eyebrow eyebrow-pill !flex w-fit intro-rise">
            <span className="inline-block w-1.5 h-1.5 bg-pink" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <div className="mt-6 lg:mr-[-12%]">
            <Headline />
          </div>
          <p className="mt-7 lead text-muted max-w-[34rem] intro-rise-3">{hero.text}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3 intro-rise-3">
            <Link to={hero.cta.to} className="btn btn-primary shimmer !min-h-[54px] !px-7 text-[1.0625rem]" data-testid="hero-cta">
              {hero.cta.label}
              <Icon name="arrowRight" size={20} />
            </Link>
            <SectionLink sectionId={hero.secondaryCta.sectionId} className="btn btn-ghost !min-h-[54px] !px-6">
              {hero.secondaryCta.label}
              <Icon name="chevronDown" size={18} />
            </SectionLink>
          </div>
        </div>
        <div className="lg:col-span-6 intro-rise-3">
          <img
            src={hero.image.src}
            srcSet={hero.image.srcSet}
            sizes="(min-width: 1024px) 50vw, 100vw"
            width={hero.image.width}
            height={hero.image.height}
            alt={hero.image.alt}
            className="w-full max-w-[640px] h-auto mx-auto"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
      <div className="container-site relative pb-6">
        <DrawingStrip items={drawing.footerStrip} />
      </div>
    </section>
  );
}
