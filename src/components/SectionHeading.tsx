import type { ReactNode } from 'react';

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  className = '',
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="eyebrow" data-reveal>
          <span className="inline-block w-6 h-px bg-pink" aria-hidden="true" />
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="mt-4" data-reveal>
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 lead text-muted max-w-[40rem]" data-reveal>
          {intro}
        </p>
      ) : null}
      {children}
    </div>
  );
}
