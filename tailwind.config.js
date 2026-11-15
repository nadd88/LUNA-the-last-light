import { tokens } from './src/design/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Tokens
        primary: tokens.colors.primary,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
        info: tokens.colors.info,
        surface: tokens.colors.surface,
        'text-1': tokens.colors.text[1],
        'text-2': tokens.colors.text[2],
        'text-3': tokens.colors.text[3],

        // Heritage space palette preserved
        space: {
          950: '#030712',
          900: '#070b18',
          850: '#0c1224',
          800: '#111b33',
          700: '#1e294b',
        },
        luna: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          amber: '#f59e0b',
          red: '#ef4444',
          emerald: '#10b981',
          gold: '#fbbf24',
          ice: '#93c5fd'
        }
      },
      maxWidth: {
        narrow: tokens.layout.narrow,
        default: tokens.layout.default,
        wide: tokens.layout.wide,
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Chakra Petch', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 18px rgba(0,240,255,0.8))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
