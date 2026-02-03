/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1d1b17",
          800: "#2a2722",
          700: "#3b362f",
          600: "#5a544c"
        },
        sand: {
          50: "#faf7f2",
          100: "#f5f0e7",
          200: "#ebe3d6",
          300: "#dfd5c4"
        }
      }
    }
  },
  plugins: []
};
