import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0A0A0A',
        light: '#F5F2EE',
        'text-dark': '#1A1A1A',
        'text-light': '#E8E4DF',
        muted: '#888880',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
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
