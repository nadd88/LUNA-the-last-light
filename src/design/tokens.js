// LUNA Design System Tokens
// WCAG AA Compliant (All text/background pairs >= 4.5:1; high-contrast text >= 12:1)

export const tokens = {
  colors: {
    // Interactive & Focus Accent (ONLY for interactive controls, focus rings, and selection)
    primary: {
      DEFAULT: '#00f0ff',
      hover: '#38bdf8',
      active: '#0284c7',
      focus: '#00f0ff',
      dim: 'rgba(0, 240, 255, 0.15)',
      glow: 'rgba(0, 240, 255, 0.35)',
    },
    // Semantic Status Colors (Always paired with icons + descriptive text)
    success: {
      DEFAULT: '#10b981', // Emerald 500
      light: '#34d399',
      surface: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
    },
    warning: {
      DEFAULT: '#f59e0b', // Amber 500
      light: '#fbbf24',
      surface: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.40)',
    },
    danger: {
      DEFAULT: '#ef4444', // Red 500
      light: '#f87171',
      surface: 'rgba(239, 68, 68, 0.14)',
      border: 'rgba(239, 68, 68, 0.45)',
    },
    info: {
      DEFAULT: '#3b82f6', // Blue 500
      light: '#60a5fa',
      surface: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.35)',
    },
    // Surface & Background Tiers
    surface: {
      1: '#030712', // Deepest space backdrop
      2: '#0b1120', // Card / module background
      3: '#131d35', // Elevated dialog / active card background
      border: '#1e294b',
      borderHover: '#334155',
    },
    // Text Hierarchy (WCAG AA tested against surface-1, surface-2, surface-3)
    text: {
      1: '#f8fafc', // High-contrast primary text (14:1 contrast ratio)
      2: '#cbd5e1', // Secondary readable body text (7.5:1 contrast ratio)
      3: '#94a3b8', // Supporting annotations & captions (5.2:1 contrast ratio, passes AA)
    }
  },
  typography: {
    fontSans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    fontMono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
    fontDisplay: ['Chakra Petch', 'system-ui', 'sans-serif'],
    sizes: {
      xs: '0.875rem',    // 14px (STRICT MINIMUM BODY TEXT)
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.25rem',     // 20px
      xl: '1.75rem',     // 28px
      '2xl': '2.5rem',   // 40px
    }
  },
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
  },
  layout: {
    narrow: '760px',
    default: '1120px',
    wide: '1320px',
  }
};
