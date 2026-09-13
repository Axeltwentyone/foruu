/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Papier vieilli
        paper: {
          light: '#f2e6c9',
          DEFAULT: '#e9d9b4',
          dark: '#d8c395',
        },
        ink: {
          DEFAULT: '#3b2a18',
          soft: '#5a4327',
        },
      },
      fontFamily: {
        // Titres, date, signature — cursive élégante
        display: ['"Dancing Script"', 'cursive'],
        // Corps de la lettre — écriture manuscrite lisible
        body: ['"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
}
