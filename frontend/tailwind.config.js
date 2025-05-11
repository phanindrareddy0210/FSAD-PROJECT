/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'easy-green': '#00cc99', // If still needed
        },
      },
    },
    plugins: [],
  };