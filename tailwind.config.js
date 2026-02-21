/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        main: 'var(--main)',
        bg: 'var(--bg)',
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #000',
        'brutal-sm': '2px 2px 0px 0px #000',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
