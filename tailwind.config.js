/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f0e6ff',
          100: '#d4bfff',
          200: '#b080ff',
          300: '#8c4fff',
          400: '#7c3aed',
          500: '#6d28d9',
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#2e1065',
          900: '#1e0a3c',
        },
        surface: {
          DEFAULT: 'rgba(30, 10, 60, 0.6)',
          light: 'rgba(40, 20, 75, 0.5)',
          dark: 'rgba(15, 5, 30, 0.8)',
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
