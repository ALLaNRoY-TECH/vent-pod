/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        accent: {
          500: '#eab308', // Yellow accent
          600: '#ca8a04',
          900: '#713f12', // Darker yellow for gradients
        },
        dark: {
          900: '#050505',
          800: '#111111',
          700: '#1a1a1a',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(234, 179, 8, 0.3)',
      }
    },
  },
  plugins: [],
}
