export const colors = {
  brand: { 50: '#eeecfd', 100: '#d5d2f8', 200: '#aba5f1', 400: '#7c74e8', 600: '#5a52cc', 800: '#3b3599', 900: '#221f66' },
  neutral: { 0: '#ffffff', 50: '#f8f8f7', 100: '#f0efed', 200: '#e2e1de', 300: '#c8c7c2', 400: '#9e9d97', 500: '#6e6d68', 600: '#4a4945', 700: '#33322f', 800: '#1e1d1b', 900: '#111110' },
  success: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  warning: { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
  danger: { bg: '#fdecea', text: '#c62828', border: '#ef9a9a' },
  info: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
}

export const type = {
  sans: '"DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
  scale: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
}

export const space = { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px' }
export const radius = { sm: '6px', md: '10px', lg: '14px', xl: '20px', full: '9999px' }
export const shadow = { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 12px rgba(0,0,0,0.08)', lg: '0 8px 32px rgba(0,0,0,0.12)' }
export const motion = { fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }, normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }

export const themeVars = {
  dark: {
    bg: 'linear-gradient(180deg, rgba(17,17,16,1) 0%, rgba(17,17,16,1) 100%)',
    bgAlt: 'rgba(30,29,27,0.92)',
    surface: 'rgba(30,29,27,0.82)',
    surfaceStrong: 'rgba(51,50,47,0.92)',
    text: colors.neutral[50],
    muted: 'rgba(248,248,247,0.68)',
    border: 'rgba(226,225,222,0.10)',
    accent: colors.brand[400],
    accentStrong: colors.brand[200],
    accentSoft: 'rgba(124,116,232,0.18)',
    shadow: 'rgba(0,0,0,0.42)',
    grid: 'rgba(255,255,255,0.03)',
  },
  light: {
    bg: 'linear-gradient(180deg, rgba(248,248,247,1) 0%, rgba(255,255,255,1) 100%)',
    bgAlt: 'rgba(255,255,255,0.96)',
    surface: 'rgba(255,255,255,0.88)',
    surfaceStrong: 'rgba(248,248,247,0.98)',
    text: colors.neutral[900],
    muted: 'rgba(17,17,16,0.64)',
    border: 'rgba(17,17,16,0.08)',
    accent: colors.brand[600],
    accentStrong: colors.brand[800],
    accentSoft: 'rgba(90,82,204,0.12)',
    shadow: 'rgba(17,17,16,0.10)',
    grid: 'rgba(17,17,16,0.04)',
  },
}
