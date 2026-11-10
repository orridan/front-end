import { useNavigate } from 'react-router';
import { closingBanner, drawing } from '../content';
import { Icon } from '../components/Icon';
import { DimLine } from '../components/Drawing';
import { requestContact } from '../lib/contactBridge';

/** Large outline headline with the ring. The button opens the contact form (dashboard is only linked from /product). */
export function ClosingBanner() {
  const navigate = useNavigate();
  return (
    <section aria-labelledby="closing-title" className="relative overflow-hidden border-t hairline drawing">
      <div className="container-site py-14 sm:py-20 grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8 relative z-10" data-reveal>
          <h2 id="closing-title" className="outline-text !text-[clamp(2.75rem,1.4rem+5vw,6.5rem)]">
            {closingBanner.heading}
          </h2>
          <DimLine className="mt-6 max-w-[40rem]" />
          <p className="mt-6 lead text-muted max-w-[34rem]">{closingBanner.text}</p>
          <button
            type="button"
            onClick={() => requestContact(closingBanner.subject, navigate)}
            className="mt-8 btn btn-primary shimmer !min-h-[54px] !px-7 w-fit"
            data-testid="closing-cta"
          >
            {closingBanner.cta}
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
        <div className="lg:col-span-4 relative" aria-hidden="true">
          <svg viewBox="-160 -160 320 320" className="w-full max-w-[22rem] mx-auto h-auto">
            <circle r="150" fill="none" stroke="#FFCEE3" strokeOpacity="0.25" />
            <circle r="128" fill="none" stroke="#FFCEE3" strokeOpacity="0.3" strokeDasharray="2 6" />
            <path d="M-128 0A128 128 0 0 1 90.5 -90.5" fill="none" stroke="#FF85BB" strokeWidth="5" strokeLinecap="round" />
            <circle r="86" fill="none" stroke="#FF85BB" strokeOpacity="0.5" />
            <circle r="40" fill="#FF85BB" fillOpacity="0.85" />
            <path d="M-170 0H170M0 -170V170" stroke="#FFCEE3" strokeOpacity="0.2" strokeDasharray="8 4 2 4" />
            <text x="100" y="-120" className="font-mono" fontSize="11" fill="#FFCEE3">
              {drawing.labels.diameter}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
