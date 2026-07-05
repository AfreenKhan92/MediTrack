/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ──────────────────────────────────────────────────
      // Color System — Healthcare Dashboard Palette
      // ──────────────────────────────────────────────────
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#6366f1',
        },
        secondary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          DEFAULT: '#10b981',
        },
        // Healthcare-specific semantic colors
        health: {
          critical: '#ef4444',
          warning:  '#f59e0b',
          stable:   '#10b981',
          info:     '#3b82f6',
        },
        // Dark mode surface scale
        dark: {
          app:     '#0b0f19',
          surface: '#111827',
          card:    '#1a2234',
          hover:   '#1f2937',
          border:  'rgba(255, 255, 255, 0.08)',
        },
      },

      // ──────────────────────────────────────────────────
      // Typography — Responsive Fluid Type Scale
      // ──────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display':  ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '800' }],
        'headline': ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.025em', fontWeight: '700' }],
        'title':    ['1.5rem',  { lineHeight: '1.3',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'subtitle': ['1.125rem',{ lineHeight: '1.4',  letterSpacing: '-0.01em', fontWeight: '500' }],
        'body':     ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'caption':  ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'overline': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600' }],
      },

      // ──────────────────────────────────────────────────
      // Modern Spacing System — 4px base grid
      // ──────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
        '38':  '9.5rem',
      },

      // ──────────────────────────────────────────────────
      // Layout & Sizing
      // ──────────────────────────────────────────────────
      maxWidth: {
        'dashboard': '1400px',
        'form':      '480px',
        'card':      '360px',
      },
      borderRadius: {
        '4xl': '2rem',
      },

      // ──────────────────────────────────────────────────
      // Shadow System
      // ──────────────────────────────────────────────────
      boxShadow: {
        'glass':        '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-danger':  '0 0 20px rgba(239, 68, 68, 0.3)',
        'card':         '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover':   '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      },

      // ──────────────────────────────────────────────────
      // Backdrop Blur
      // ──────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ──────────────────────────────────────────────────
      // Animation & Transitions
      // ──────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99, 102, 241, 0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up':     'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':       'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow':     'pulse-glow 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
      },

      // ──────────────────────────────────────────────────
      // Transition Timing
      // ──────────────────────────────────────────────────
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
