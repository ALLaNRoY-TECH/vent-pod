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
          500: '#8b5cf6', // Violet/Purple accent
          600: '#7c3aed',
        },
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
