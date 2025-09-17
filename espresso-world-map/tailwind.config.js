/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'montreal': ['PP Neue Montreal', 'Inter', 'sans-serif'],
      },
      colors: {
        'espresso-dark': '#270903',
        'espresso-light': '#DE9E67',
        'panel-bg': '#FAFAFA',
      },
    },
  },
  plugins: [],
}