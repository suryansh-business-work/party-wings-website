/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        party: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#fb923c'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
