/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0f1117',
        surface: '#181c27',
        border:  '#252a3a',
        muted:   '#6b7280',
        accent:  '#3b82f6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
