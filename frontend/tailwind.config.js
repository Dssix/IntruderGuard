/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'], // Using Geist Mono as a modern terminal-like font
      },
      colors: {
        'dark-bg': '#0a0f1a', // Deep dark blue/black
        'dark-surface': '#101623', // Slightly lighter surface
        'dark-border': '#20283a',
        'accent-glow': '#00ffff', // Cyan/aqua for glowing effects
        'alert-high': '#ff4d4d', // Red for high alerts
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0a0',
      },
      boxShadow: {
        'glow-sm': '0 0 8px 2px rgba(0, 255, 255, 0.3)',
        'glow-md': '0 0 15px 5px rgba(0, 255, 255, 0.3)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};