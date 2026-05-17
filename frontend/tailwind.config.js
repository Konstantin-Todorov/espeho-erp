/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      'rgb(var(--rgb-bg)      / <alpha-value>)',
        surface: 'rgb(var(--rgb-surface) / <alpha-value>)',
        border:  'rgb(var(--rgb-border)  / <alpha-value>)',
        muted:   'rgb(var(--rgb-muted)   / <alpha-value>)',
        accent:  'rgb(59  130 246 / <alpha-value>)',
        success: 'rgb(34  197 94  / <alpha-value>)',
        warning: 'rgb(245 158 11  / <alpha-value>)',
        danger:  'rgb(239 68  68  / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
