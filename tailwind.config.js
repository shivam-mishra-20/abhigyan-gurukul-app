/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8BC53F',
          700: '#6EA530'
        },
        accent: '#0A7EA4',
        neutral: '#687076'
      }
    },
  },
  plugins: [],
};