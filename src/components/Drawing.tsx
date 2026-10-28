/**
 * Drawing primitives for the "engineering drawing" motif. All decorative parts are aria-hidden;
 * real content is always in the surrounding markup.
 */
import type { CSSProperties, ReactNode } from 'react';
import { drawing, sectionMeta } from '../content';

/** Mono sheet reference for a section, for example "03 / FEATURES". */
export function SectionTag({ id, className = '' }: { id: string; className?: string }) {
  const index = sectionMeta.findIndex((s) => s.id === id);
  const meta = sectionMeta[index];
  if (!meta) return null;
  return (
    <p className={`section-tag !flex w-fit ${className}`} data-reveal>
      <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
      <span className="tabular">{String(index + 1).padStart(2, '0')}</span>
      <span aria-hidden="true">/</span>
      <span>{meta.label}</span>
    </p>
  );
}

/** Small filled arrowhead used at the ends of dimension lines. */
function Arrow({ dir }: { dir: 'left' | 'right' | 'up' | 'down' }) {
  const rotate = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg viewBox="0 0 8 8" width="8" height="8" className="shrink-0" style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Horizontal dimension line: |<==== label ====>|. The line measures out on scroll
 * (data-measure is picked up by GSAP; without scripts it is simply drawn).
 */
export function DimLine({ label, className = '', style }: { label?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`flex items-center gap-0 text-blush ${className}`} style={style} aria-hidden="true">
      <span className="w-px h-3 bg-current opacity-70" />
      <Arrow dir="left" />
      <span className="flex-1 h-px bg-current opacity-60 origin-left" data-measure />
      {label ? <span className="mono text-[0.6875rem] px-2 whitespace-nowrap">{label}</span> : null}
      {label ? <span className="flex-1 h-px bg-current opacity-60 origin-right" data-measure /> : null}
      <Arrow dir="right" />
      <span className="w-px h-3 bg-current opacity-70" />
    </div>
  );
}

/** Vertical dimension line. */
export function DimLineV({ label, className = '' }: { label?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center text-blush ${className}`} aria-hidden="true">
      <span className="h-px w-3 bg-current opacity-70" />
      <Arrow dir="up" />
      <span className="flex-1 w-px bg-current opacity-60 origin-top" data-measure="y" />
      {label ? <span className="mono text-[0.6875rem] py-2 [writing-mode:vertical-rl]">{label}</span> : null}
      <Arrow dir="down" />
      <span className="h-px w-3 bg-current opacity-70" />
    </div>
  );
}

/** 12-column guide grid with column letters along the top edge (desktop only). */
export function Guides({ labels = true }: { labels?: boolean }) {
  return (
    <div className="guides" aria-hidden="true">
      <div className="container-site h-full relative">
        <div className="h-full" />
        {labels ? (
          <div className="absolute inset-x-[var(--gutter)] top-3 grid grid-cols-12">
            {drawing.columns.map((c) => (
              <span key={c} className="mono text-[0.625rem] text-blush/50 pl-1.5">
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Decorative drawing strip (DWG 001 / REV A / SCALE 1:1). */
export function DrawingStrip({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <div className={`flex items-stretch border-y hairline mono text-[0.6875rem] text-blush/80 overflow-hidden ${className}`} aria-hidden="true">
      {items.map((item, i) => (
        <span key={item} className={`px-3 py-1.5 whitespace-nowrap ${i > 0 ? 'border-l hairline' : ''} ${i === items.length - 1 ? 'hidden sm:block' : ''}`}>
          {item}
        </span>
      ))}
      <span className="flex-1 ruler self-center mx-3 opacity-70" />
    </div>
  );
}

/** Leader line ending in a dot, with a mono callout label. */
export function Callout({ label, note, className = '', style, align = 'left' }: { label: string; note?: string; className?: string; style?: CSSProperties; align?: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''} ${className}`} style={style}>
      <span className="w-2 h-2 rounded-full bg-pink shrink-0 shadow-[0_0_10px_rgb(var(--c2-rgb))]" aria-hidden="true" />
      <span className="w-10 sm:w-14 h-px bg-pink/70 shrink-0" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block mono text-[0.75rem] font-medium uppercase tracking-[0.14em] text-light">{label}</span>
        {note ? <span className="block mono text-[0.6875rem] text-blush/80">{note}</span> : null}
      </span>
    </div>
  );
}
