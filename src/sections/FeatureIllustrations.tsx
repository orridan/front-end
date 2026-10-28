/** Small CSS/SVG micro-illustrations for the feature cards, one distinct motion each. Decorative. */
import { features } from '../content';

export function TimelineIllustration({ points }: { points: string[] }) {
  const columns = `repeat(${points.length}, minmax(0, 1fr))`;
  const label = (p: string, i: number, row: 'top' | 'bottom') => (
    <span key={`${row}-${i}`} className="mono text-[0.625rem] leading-tight opacity-90 text-center whitespace-nowrap">
      {(row === 'top') === (i % 2 === 1) ? p : ''}
    </span>
  );
  return (
    <div aria-hidden="true" className="grid gap-2" style={{ gridTemplateColumns: columns }}>
      {points.map((p, i) => label(p, i, 'top'))}
      <div className="relative h-4" style={{ gridColumn: `1 / span ${points.length}` }}>
        <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px bg-blush opacity-30" />
        <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px bg-pink anim-draw-x" />
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: columns }}>
          {points.map((p, i) => (
            <span key={`${p}-${i}`} className="grid place-items-center">
              <span className={`w-3 h-3 rotate-45 border ${i === points.length - 1 ? 'bg-pink border-pink' : 'bg-navy border-blush'}`} />
            </span>
          ))}
        </div>
      </div>
      {points.map((p, i) => label(p, i, 'bottom'))}
    </div>
  );
}

export function StepperIllustration({ points }: { points: string[] }) {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <p className="display text-[clamp(5rem,3rem+6vw,8.5rem)] text-transparent [-webkit-text-stroke:1.5px_var(--c1)] leading-[0.8] -ml-1">
        {points[points.length - 1]}
      </p>
      <span className="block h-px bg-navy/40 mb-2" />
      {points.map((p, i) => (
        <div key={p} className="flex items-center gap-3">
          <span
            className="anim-step inline-flex items-center justify-center min-w-[3.5rem] border border-navy bg-navy text-light mono text-[0.75rem] px-2 py-1"
            style={{ animationDelay: `${i}s` }}
          >
            {p}
          </span>
          <span className="flex-1 h-px bg-navy/40" />
          <span className="mono text-[0.625rem] text-navy/80">{String(i + 1).padStart(2, '0')}</span>
        </div>
      ))}
    </div>
  );
}

export function BarsIllustration({ points, label }: { points: string[]; label: string }) {
  const expected = [70, 70, 70];
  const observed = [64, 74, 82];
  return (
    <div aria-hidden="true">
      <div className="relative flex items-end gap-5 h-24 border-b hairline">
        <span className="absolute inset-x-0 border-t border-dashed border-blush/50" style={{ bottom: `${expected[0]}%` }} />
        {points.map((p, i) => (
          <div key={p} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="anim-bar w-4 bg-pink" style={{ height: `${observed[i]}%`, animationDelay: `${i * 0.4}s` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-5 mt-1.5">
        {points.map((p) => (
          <span key={p} className="flex-1 text-center mono text-[0.625rem] text-light/80">
            {p}
          </span>
        ))}
      </div>
      <p className="mt-2 mono text-[0.625rem] uppercase tracking-wider text-blush">
        {label}
      </p>
    </div>
  );
}

/** Stacked scenario sheets with a sweep line passing over them. */
export function ScenarioIllustration() {
  return (
    <div aria-hidden="true" className="relative h-28 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute border border-blush/40 bg-navy"
          style={{ left: `${i * 9}%`, top: `${i * 14}%`, width: '72%', height: '58%', opacity: 0.5 + i * 0.25 }}
        >
          <div className="m-2.5 h-1.5 w-1/3 bg-pink/80" />
          <div className="mx-2.5 h-1 w-2/3 bg-blush/25" />
          <div className="mx-2.5 mt-1.5 h-1 w-1/2 bg-blush/25" />
          <span className="absolute right-2 bottom-1.5 mono text-[0.625rem] text-blush">v{i + 1}</span>
        </div>
      ))}
      <span className="absolute top-0 bottom-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-pink/25 to-transparent anim-sweep" />
    </div>
  );
}

/** Rows of recorded readings with a scan bar. Static records, not a live feed. */
export function RecordRowsIllustration() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden border hairline">
      {features.sampleRecords.map((r, i) => (
        <div key={r} className={`flex justify-between px-2.5 py-1.5 mono text-[0.625rem] text-blush/90 ${i ? 'border-t hairline' : ''}`}>
          <span>{r}</span>
          <span className="w-1/3 h-1 self-center bg-blush/25" />
        </div>
      ))}
      <span className="absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-blush/15 to-transparent anim-sweep" style={{ animationDuration: '4.5s' }} />
    </div>
  );
}

/** Checklist whose ticks light up in turn. */
export function ChecklistIllustration() {
  return (
    <ul aria-hidden="true" className="grid gap-1.5">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-2.5">
          <span className="anim-step grid place-items-center w-4 h-4 border border-pink text-pink" style={{ animationDelay: `${i * 0.9}s` }}>
            <svg viewBox="0 0 12 12" width="10" height="10">
              <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <span className="h-1 bg-blush/30" style={{ width: `${70 - i * 15}%` }} />
        </li>
      ))}
    </ul>
  );
}

/** Small gauge whose needle settles back and forth. */
export function GaugeIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 64" width="120" height="64" className="w-28 h-auto">
      <path d="M10 58 A50 50 0 0 1 110 58" fill="none" stroke="#FFCEE3" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M38 17 A50 50 0 0 1 82 17" fill="none" stroke="#FF85BB" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = Math.PI - (i * Math.PI) / 6;
        return <line key={i} x1={60 + 44 * Math.cos(a)} y1={58 - 44 * Math.sin(a)} x2={60 + 50 * Math.cos(a)} y2={58 - 50 * Math.sin(a)} stroke="#FFCEE3" strokeOpacity="0.6" />;
      })}
      <g className="anim-wobble" style={{ transformOrigin: '60px 58px' }}>
        <line x1="60" y1="58" x2="60" y2="16" stroke="#F5F5F5" strokeWidth="1.5" />
      </g>
      <circle cx="60" cy="58" r="3.5" fill="#FF85BB" />
    </svg>
  );
}

/** Activity log lines with a blinking caret on the newest entry. */
export function TrailIllustration() {
  return (
    <div aria-hidden="true" className="grid gap-1 mono text-[0.625rem] text-blush/85">
      <span>{features.sampleTrail[0]}</span>
      <span>{features.sampleTrail[1]}</span>
      <span className="flex items-center gap-1">
        {features.sampleTrail[2]} <span className="blink inline-block w-1.5 h-3 bg-pink" />
      </span>
    </div>
  );
}
