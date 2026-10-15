/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zinc: {
          950: '#09090b',
          900: '#121215',
          850: '#18181b',
          800: '#27272a',
          700: '#3f3f46',
          600: '#52525b',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        },
        cyber: {
          emerald: '#34d399',
          rose: '#f43f5e',
          amber: '#fbbf24',
          cyan: '#22d3ee',
          blue: '#60a5fa',
          purple: '#c084fc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.25)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(52, 211, 153, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(251, 191, 36, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 20s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
