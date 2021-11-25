const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      ...colors,
      primary: '#d8121b',
      dark: '#212121',
      light: '#ffffff',
    },
    extend: {},
  },
  variants: {
    extend: {
      margin: ['first', 'last'],
    },
  },
  plugins: [],
}
