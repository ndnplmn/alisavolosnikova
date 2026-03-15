import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core neutrals
        dark:          '#0A0A0A',  // Obsidian Deep
        light:         '#F5F5F5',  // Museum White
        'text-dark':   '#0A0A0A',  // Obsidian Deep
        'text-light':  '#F5F5F5',  // Museum White
        muted:         '#8A8A8A',  // neutral mid-gray
        // Palette additions
        slate:         '#1C1C1E',  // Slate Shadow
        teal:          '#4A7C7C',  // Ethereal Teal
        cobalt:        '#2563EB',  // Electric Cobalt
        silver:        '#D1D5DB',  // Silver Silk
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        extreme: '0.2em',
        wide: '0.12em',
      },
    },
  },
  plugins: [],
}

export default config
