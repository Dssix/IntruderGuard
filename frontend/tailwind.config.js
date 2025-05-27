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
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'], // Added fallback
      },
      colors: {
        'dark-bg': 'rgb(var(--background-start-rgb))',
        'dark-surface': 'rgb(var(--surface-color-rgb))',
        'dark-border': 'rgb(var(--border-color-rgb))',
        'accent-glow': 'rgb(var(--accent-glow-rgb))',
        'accent-secondary': 'rgb(var(--accent-secondary-rgb))',
        'text-primary': 'rgb(var(--foreground-rgb))',
        'text-secondary': 'rgba(var(--foreground-rgb), 0.7)', // Adjusted for better contrast
        'success': 'rgb(var(--success-rgb))',
        'warning': 'rgb(var(--warning-rgb))',
        'error': 'rgb(var(--error-rgb))',
      },
      boxShadow: {
        'glow-sm': '0 0 8px 2px rgba(var(--accent-glow-rgb), 0.4)',
        'glow-md': '0 0 15px 5px rgba(var(--accent-glow-rgb), 0.5)',
        'glow-lg': '0 0 25px 8px rgba(var(--accent-glow-rgb), 0.5)',
        'card': '0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)',
      },
      animation: {
        pulse: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'subtle-float 6s ease-in-out infinite',
        // 'gradient-bg': 'gradient-bg 15s ease infinite', // Removed as it's no longer used
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.03)' }, // Slightly more pronounced pulse
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }, // Slightly more float
        },
        // 'gradient-bg': { // Removed as it's no longer used
        //   '0%, 100%': { 'background-position': '0% 50%' },
        //   '50%': { 'background-position': '100% 50%' },
        // },
      },
      // backgroundImage: { // Removed as it's no longer used
      //   'animated-gradient': 'linear-gradient(-45deg, rgb(var(--accent-secondary-rgb)), rgb(var(--accent-glow-rgb)), rgb(var(--background-start-rgb)), rgb(var(--surface-color-rgb)))',
      // },
      // backgroundSize: { // Removed as it's no longer used
      //   '400%': '400% 400%',
      // }
    },
  },
  plugins: [],
};