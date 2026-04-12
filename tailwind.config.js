
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        surface: 'var(--bg-surface)',
        'surface-dark': 'var(--surface-dark)',
        primary: 'var(--primary-color)',
        main: 'var(--text-main)',
        muted: 'var(--text-muted)',
        border: 'var(--border-color)',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.2' },
        },
      },
      animation: {
        blink: 'blink 1.5s step-end infinite',
      },
    },
  },
  plugins: [],
}
