/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hevy: {
          blue: '#0084FF',
          blueHover: '#0070D8',
          blueLight: '#EFF6FF',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        repx: {
          950: '#F8FAFC',
          900: '#FFFFFF',
          850: '#F1F5F9',
          800: '#E2E8F0',
          750: '#CBD5E1',
          700: '#94A3B8',
          border: '#E2E8F0',
          borderLight: '#CBD5E1',
          volt: '#0084FF',
          voltHover: '#0070D8',
          voltMuted: 'rgba(0, 132, 255, 0.1)',
          cyan: '#0284C7',
          crimson: '#EF4444',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'hevy-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'hevy-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'volt-glow': '0 2px 8px -1px rgba(0, 132, 255, 0.35)',
        'cyan-glow': '0 2px 8px -1px rgba(2, 132, 199, 0.35)',
        'crimson-glow': '0 2px 8px -1px rgba(239, 68, 68, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
