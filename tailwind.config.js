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
        interbank: {
          blue: '#003366',
          gray: '#f5f5f5'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}