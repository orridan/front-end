import type { CSSProperties } from 'react';
import { illustrations } from '../content';
import { Icon } from './Icon';

/** Client illustration for a step or card title, on a light tile. Falls back to the line icon. */
export function IllustrationTile({ title, icon, size = 72, className = '' }: { title: string; icon: string; size?: number; className?: string }) {
  const src = illustrations[title];
  return (
    <span className={`illus-tile ${className}`} style={{ '--illus': `${size}px` } as CSSProperties} aria-hidden="true">
      {src ? <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" /> : <Icon name={icon} size={Math.round(size * 0.45)} />}
    </span>
  );
}
