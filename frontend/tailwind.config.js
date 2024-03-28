/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      'pale-white': '#f3f4ee',
      'white': '#ffffff',
      'dark': '#1c1c1c',
      "red": "#ff0000",
      "warn": "#ffc107"
    }
  },
  plugins: [],
}

