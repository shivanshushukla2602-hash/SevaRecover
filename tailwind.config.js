/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Black + Gold / Silver tokens
        gold: {
          DEFAULT: '#C9A24B',
          bright: '#E3C578',
          dark: '#A68235',
          muted: 'rgba(201, 162, 75, 0.15)',
        },
        silver: {
          DEFAULT: '#A8ABB3',
          light: '#D8DADD',
          dark: '#585A62',
          muted: 'rgba(168, 171, 179, 0.15)',
        },
        dark: {
          bg: '#0A0A0B',
          surface: '#141416',
          surfaceElevated: '#1C1C1F',
          border: 'rgba(201, 162, 75, 0.15)',
        },
        brand: {
          50: '#1C1914',
          100: '#2A2418',
          500: '#C9A24B',
          600: '#C9A24B',
          700: '#A68235',
          800: '#1C1C1F',
          900: '#141416',
        },
        accent: {
          amber: '#D9A74A',
          amberDark: '#B88A35',
          emerald: '#7A9B7E',
          emeraldDark: '#5E7B62',
          rose: '#B5453F',
          roseDark: '#933530',
        },
        civic: {
          bg: '#0A0A0B',
          card: '#141416',
          border: 'rgba(201, 162, 75, 0.15)',
          textDark: '#F2F1EC',
          textMuted: '#9A9A9E',
        }
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'civic-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'civic-md': '0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 0 20px -6px rgba(201, 162, 75, 0.1)',
        'civic-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 30px -8px rgba(201, 162, 75, 0.15)',
        'civic-hover': '0 12px 28px -6px rgba(0, 0, 0, 0.7), 0 0 24px -4px rgba(201, 162, 75, 0.25)',
        'gold-glow': '0 0 24px -4px rgba(201, 162, 75, 0.25)',
        'gold-sm': '0 0 12px -2px rgba(201, 162, 75, 0.18)',
      },
      borderRadius: {
        'civic': '0.75rem',
        'civic-lg': '1rem',
      },
      transitionTimingFunction: {
        'civic-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
