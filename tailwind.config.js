/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4F46E5',
        },
        blue: {
          600: '#2563EB',
        },
      },
    },
  },
  plugins: [],
} 