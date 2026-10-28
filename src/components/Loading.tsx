import { loading } from '../content';
import { LogoMark } from './Logo';

/** Loading state shown while a route chunk downloads. Reserves the viewport to avoid layout shift. */
export function Loading({ minHeight = '100vh' }: { minHeight?: string }) {
  return (
    <div className="grid place-items-center" style={{ minHeight }} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <LogoMark size={56} className="loading-pulse" />
        <span className="sr-only">{loading.label}</span>
      </div>
    </div>
  );
}
