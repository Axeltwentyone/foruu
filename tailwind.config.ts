import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: token('paper'),
        ink: token('ink'),
        mute: token('mute'),
        rule: token('rule'),
        accent: token('accent'),
      },
      fontFamily: {
        // Corps : écriture manuscrite lisible · Titres, dates, signature : cursive élégante
        serif: ['Caveat', 'cursive'],
        body: ['Caveat', 'cursive'],
        mono: ['Caveat', 'cursive'],
        display: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
