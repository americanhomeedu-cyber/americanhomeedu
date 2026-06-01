import type { Config } from 'tailwindcss'

/**
 * American Home Blueprint design tokens.
 *
 * Shared brand core (cream / green / gold) is encoded as exact hex.
 * Context-dependent tokens (secondary grays, borders, surface, radii,
 * shadows, body font) are CSS variables defined in app/globals.css and
 * overridden per area via .theme-marketing / .theme-student / .theme-admin.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './emails/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- shared brand core (identical across all areas) ---
        cream: { DEFAULT: '#F5F1EA', deep: '#EFE9DE' },
        paper: '#FFFFFF',
        ink: {
          DEFAULT: '#1A1A1A',
          soft: 'var(--ink-soft)',
          mute: 'var(--ink-mute)',
        },
        green: {
          DEFAULT: '#2D4A3E',
          deep: '#213A30',
          soft: '#3C6151',
          tint: 'var(--green-tint)',
        },
        gold: {
          DEFAULT: '#C9A96E',
          deep: 'var(--gold-deep)',
          soft: 'var(--gold-soft)',
        },
        line: { DEFAULT: 'var(--line)', soft: 'var(--line-soft)' },

        // --- contextual surfaces (area-scoped) ---
        surface: 'var(--surface)',
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },

        // --- status (admin / student) ---
        success: { DEFAULT: 'var(--success)', soft: 'var(--success-soft)' },
        warning: { DEFAULT: 'var(--warning)', soft: 'var(--warning-soft)' },
        error: { DEFAULT: 'var(--error)', soft: 'var(--error-soft)' },
        info: { DEFAULT: 'var(--info)', soft: 'var(--info-soft)' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        e1: 'var(--shadow-sm)',
        e2: 'var(--shadow-md)',
        e3: 'var(--shadow-lg)',
        gold: 'var(--shadow-gold)',
      },
      maxWidth: {
        wrap: '1200px',
        content: '1280px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
export default config
