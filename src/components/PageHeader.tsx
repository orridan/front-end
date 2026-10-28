import type { ReactNode } from 'react';
import { drawing } from '../content';
import { DimLine, DrawingStrip, Guides } from './Drawing';

/** Compact drawing-style header for the product shell, legal pages, checkout and 404. */
export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden drawing atmosphere border-b hairline">
      <Guides />
      <svg aria-hidden="true" className="absolute -right-24 top-16 w-[30rem] h-[30rem] opacity-70 pointer-events-none" viewBox="-160 -160 320 320" fill="none">
        <circle r="150" stroke="#FFCEE3" strokeOpacity="0.18" />
        <circle r="128" stroke="#FFCEE3" strokeOpacity="0.2" strokeDasharray="2 6" />
        <path d="M-128 0A128 128 0 0 1 90.5 -90.5" stroke="#FF85BB" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        <circle r="70" stroke="#FF85BB" strokeOpacity="0.35" />
        <path d="M-170 0H170M0 -170V170" stroke="#FFCEE3" strokeOpacity="0.16" strokeDasharray="8 4 2 4" />
      </svg>
      <div className="container-site relative pt-[6.5rem] sm:pt-[7.5rem]">
        <DrawingStrip items={drawing.headerStrip} />
      </div>
      <div className="container-site relative pt-12 pb-14 sm:pt-16 sm:pb-20">
        {eyebrow ? (
          <p className="section-tag">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 max-w-4xl">{title}</h1>
        <DimLine className="mt-6 max-w-[36rem]" />
        {children ? <div className="mt-6 max-w-2xl">{children}</div> : null}
      </div>
    </section>
  );
}
