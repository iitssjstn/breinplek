import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surface2: 'var(--color-surface2)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        teal: {
          DEFAULT: 'var(--color-teal)',
          dark: 'var(--color-teal-dark)',
          light: 'var(--color-teal-light)',
        },
        plum: {
          DEFAULT: 'var(--color-plum)',
          dark: 'var(--color-plum-dark)',
          light: 'var(--color-plum-light)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          dark: 'var(--color-amber-dark)',
          light: 'var(--color-amber-light)',
        },
      },
      fontFamily: {
        heading: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        body: ['var(--font-atkinson)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '42rem',
      },
    },
  },
  plugins: [],
};

export default config;
