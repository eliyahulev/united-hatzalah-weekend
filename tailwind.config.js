/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        hatzalah: {
          orange: '#FF6600',
          'orange-dark': '#E65A00',
          'orange-light': '#FF8533',
          charcoal: '#1A1A1A',
          gray: '#2A2A2A',
          'gray-light': '#F4F4F5',
        },
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.06)',
        cta: '0 8px 24px rgba(255, 102, 0, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
