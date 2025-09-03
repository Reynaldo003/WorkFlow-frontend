/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#11192E',
      },
      fontFamily: {
        sans: ['Roboto Mono'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
    container: { center: true, padding: '1rem' },
  },
  plugins: [],
};
