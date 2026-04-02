/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        void: '#050508',
        surface: '#0d0d14',
        panel: '#12121c',
        border: '#1e1e2e',
        muted: '#2a2a3e',
        accent: '#7c6af7',
        'accent-glow': '#9d8fff',
        ember: '#f97316',
        jade: '#10b981',
        crimson: '#ef4444',
        'text-primary': '#e8e8f0',
        'text-secondary': '#8888aa',
        'text-muted': '#555570',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(124,106,247,0.2)',
        'glow': '0 0 40px rgba(124,106,247,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
