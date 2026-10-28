import type { Config } from 'tailwindcss';

/**
 * "Midnight Twin": exactly four colours, used with opacity. The default Tailwind palette is
 * replaced (not extended) so no other hue can sneak in through a utility class.
 */
const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      navy: withAlpha('--c1-rgb'),
      pink: withAlpha('--c2-rgb'),
      blush: withAlpha('--c3-rgb'),
      light: withAlpha('--c4-rgb'),
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    fontFamily: {
      display: ['var(--font-display)'],
      body: ['var(--font-body)'],
      mono: ['var(--font-mono)'],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    extend: {
      fontSize: {
        h1: ['var(--fs-h1)', { lineHeight: 'var(--lh-tight)' }],
        h2: ['var(--fs-h2)', { lineHeight: 'var(--lh-tight)' }],
        h3: ['var(--fs-h3)', { lineHeight: 'var(--lh-snug)' }],
        lead: ['var(--fs-lead)', { lineHeight: 'var(--lh-body)' }],
        body: ['var(--fs-body)', { lineHeight: 'var(--lh-body)' }],
        small: ['var(--fs-small)', { lineHeight: 'var(--lh-body)' }],
        label: ['var(--fs-label)', { lineHeight: '1.4' }],
      },
      borderRadius: {
        card: 'var(--radius-card)',
        lg2: 'var(--radius-lg)',
        pill: '999px',
      },
      maxWidth: {
        site: 'var(--site-max)',
        prose: '68ch',
      },
      spacing: {
        nav: 'var(--nav-h)',
      },
      zIndex: {
        nav: '40',
        overlay: '50',
        chat: '60',
        consent: '70',
        modal: '80',
      },
    },
  },
  plugins: [],
} satisfies Config;
