/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, homely color palette for a recipe/cooking app
        'cream': {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e7',
          300: '#f7ecda',
          400: '#f4e5cd',
          500: '#f1dfc1',
        },
        'terracotta': {
          400: '#e07856',
          500: '#d86f4e',
          600: '#c05a3a',
        },
        'sage': {
          400: '#9daf8e',
          500: '#8a9d7a',
          600: '#6f8360',
        },
        'olive': {
          600: '#6b7d5a',
          700: '#5a6b4a',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
