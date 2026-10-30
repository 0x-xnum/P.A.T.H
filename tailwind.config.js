/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lunar: {
          dark: '#0a0d14',
          panel: '#111726',
          border: '#1e293b',
          accent: '#38bdf8',
          gold: '#facc15',
          danger: '#ef4444',
          success: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
