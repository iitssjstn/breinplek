import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        surface: '#F1EFE6',
        surface2: '#E9E6D8',
        ink: '#23262B',
        muted: '#5B5F66',
        line: '#DEDBCC',
        teal: {
          DEFAULT: '#2F6E62',
          dark: '#204E45',
          light: '#E4EEEB',
        },
        plum: {
          DEFAULT: '#5B5CA6',
          dark: '#42437D',
          light: '#EAE9F5',
        },
        amber: {
          DEFAULT: '#D98E3B',
          dark: '#AD6D24',
          light: '#F8ECDB',
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
