export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 60px rgba(0,0,0,0.25)'
      },
      colors: {
        surface: '#0b1220',
        surface2: '#111a2a',
        accent: '#5c7cff',
        accentSoft: '#4f6ef8'
      }
    }
  },
  plugins: []
};
