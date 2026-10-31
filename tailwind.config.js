/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired neutral palette
        notion: {
          bg: '#FFFFFF',
          bgSecondary: '#F7F6F3',
          border: '#E9E5E0',
          text: '#37352F',
          textSecondary: '#787774',
          textMuted: '#9B9A97',
          accent: '#2F80ED',
          accentHover: '#1A6FD6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Menlo', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'sidebar': '0 0 0 1px #E9E5E0, 0 2px 8px rgba(0, 0, 0, 0.04)',
        'sidebar-hover': '0 0 0 1px #E9E5E0, 0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}