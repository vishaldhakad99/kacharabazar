/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EAF4EC',
          100: '#D5E9D9',
          200: '#ADCEB5',
          300: '#7EAE8E',
          400: '#4D8E67',
          500: '#2A7A4A',
          600: '#1E7A46',
          700: '#196338',
          800: '#16502E',
          900: '#14532D',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F28C28',
          600: '#D97706',
          700: '#B45309',
        },
        info: '#2F6F8F',
        danger: '#B5532A',
        success: '#6B8E23',
        ink: '#1B2A22',
        muted: '#5B6B63',
        surface: '#FFFFFF',
        background: '#F6FAF7',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 42, 34, 0.06)',
        'soft-lg': '0 10px 25px -3px rgba(27, 42, 34, 0.09)',
      }
    },
  },
  plugins: [],
}
