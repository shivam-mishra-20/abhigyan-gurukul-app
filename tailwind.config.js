/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // PRIMARY: Indigo for main UI elements
        primary: {
          DEFAULT: '#4F46E5',  // Indigo 600
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81'
        },
        // TAB BAR: Green for header/navigation in light mode
        tabbar: {
          DEFAULT: '#059669',  // Emerald 600
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        },
        // ACCENT: Sky blue
        accent: {
          DEFAULT: '#0EA5E9',  // Sky 500
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E'
        },
        // NEUTRAL: Gray scale
        neutral: {
          DEFAULT: '#6B7280',  // Gray 500
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        // Light mode colors - calm, academic
        light: {
          background: '#FAFAFA',  // Off-white
          surface: '#FFFFFF',
          card: '#FFFFFF',
          text: '#111827',
          textSecondary: '#6B7280',
          border: '#E5E7EB',
          divider: '#F3F4F6',
        },
        // Dark mode colors - deep charcoal
        dark: {
          background: '#18181B',  // Zinc 900
          surface: '#27272A',     // Zinc 800
          card: '#3F3F46',        // Zinc 700
          text: '#FAFAFA',        // Zinc 50
          textSecondary: '#A1A1AA',  // Zinc 400
          border: '#52525B',      // Zinc 600
          divider: '#3F3F46',
        }
      }
    },
  },
  plugins: [],
};