/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        surface: {
          950: '#07111f',
          900: '#0f1b2d',
          800: '#16263d',
          700: '#213655'
        }
      },
      boxShadow: {
        board: '0 30px 80px rgba(7, 17, 31, 0.35)',
        glass: '0 20px 60px rgba(15, 27, 45, 0.25)'
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at center, rgba(255,255,255,0.1) 0, transparent 20%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
