/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aei: {
          purple: '#6B1D6F',
          'purple-dark': '#551459',
          'purple-light': '#842689',
          green: '#1E7E34',
          'green-dark': '#166329',
          'green-light': '#2CA346',
          gold: '#D99A36',
          'gold-light': '#F4B755',
          'gold-dark': '#B57C23',
        },
        wfp: {
          blue: '#007DBC',
          'blue-dark': '#006294',
          'blue-light': '#339FD5',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
