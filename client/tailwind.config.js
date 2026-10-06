/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        repx: {
          950: '#060709',
          900: '#0A0C10',
          850: '#0E1117',
          800: '#141822',
          750: '#1B212F',
          700: '#232A3C',
          border: '#232938',
          borderLight: '#323B50',
          volt: '#D4FF00',
          voltHover: '#BCE500',
          voltMuted: 'rgba(212, 255, 0, 0.15)',
          cyan: '#00F0FF',
          crimson: '#FF2E5B',
          amber: '#FFB800',
          purple: '#A855F7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'volt-glow': '0 0 25px -3px rgba(212, 255, 0, 0.35)',
        'cyan-glow': '0 0 25px -3px rgba(0, 240, 255, 0.35)',
        'crimson-glow': '0 0 25px -3px rgba(255, 46, 91, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
