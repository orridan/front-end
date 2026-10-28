import { site } from '../content';

/** The client logo (public/brand/orridan-logo.svg) used everywhere on the site. */
export function Logo({ variant = 'light', className, height = 32 }: { variant?: 'light' | 'dark'; className?: string; height?: number }) {
  const width = Math.round((site.logo.width / site.logo.height) * height);
  return (
    <img
      src={variant === 'light' ? site.logo.light : site.logo.dark}
      width={width}
      height={height}
      alt={site.logo.alt}
      className={className}
      decoding="async"
    />
  );
}

export function LogoMark({ size = 48, className }: { size?: number; className?: string }) {
  return <img src={site.logo.mark} width={size} height={size} alt="" className={className} decoding="async" />;
}
