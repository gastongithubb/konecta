/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'corporate-blue': '#0066cc',
        'corporate-lightblue': '#66ccff',
        'corporate-white': '#ffffff',
        'corporate-salmon': '#ff9999',
      },
    },
  },
  plugins: [],
}
