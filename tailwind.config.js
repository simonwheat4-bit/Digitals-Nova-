/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040711',
          900: '#060b1a',
          850: '#0a1027',
          800: '#0f1738',
          700: '#182452',
          600: '#233470',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          accent: '#00f2fe',
        },
        electric: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        purple: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          glow: '#7928ca',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.3)',
        'glow-blue': '0 0 30px -5px rgba(37, 99, 235, 0.35)',
        'glow-purple': '0 0 30px -5px rgba(121, 40, 202, 0.3)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px 1px rgba(0, 242, 254, 0.15)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
