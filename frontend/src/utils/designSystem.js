import { colors, radius, shadow, space, themeVars, type } from '../styles/tokens'

const themeKeys = ['bg', 'bgAlt', 'surface', 'surfaceStrong', 'text', 'muted', 'border', 'accent', 'accentStrong', 'accentSoft', 'shadow', 'grid']

export function applyDesignTokens(theme = 'dark') {
  const root = document.documentElement
  const themeStyles = themeVars[theme] || themeVars.dark

  root.dataset.theme = theme
  root.style.setProperty('--font-sans', type.sans)
  root.style.setProperty('--font-mono', type.mono)

  Object.entries(space).forEach(([key, value]) => root.style.setProperty(`--space-${key}`, value))
  Object.entries(radius).forEach(([key, value]) => root.style.setProperty(`--radius-${key}`, value))
  Object.entries(shadow).forEach(([key, value]) => root.style.setProperty(`--shadow-${key}`, value))
  Object.entries(type.scale).forEach(([key, value]) => root.style.setProperty(`--text-${key}`, value))

  Object.entries(colors.brand).forEach(([key, value]) => root.style.setProperty(`--brand-${key}`, value))
  Object.entries(colors.neutral).forEach(([key, value]) => root.style.setProperty(`--neutral-${key}`, value))

  themeKeys.forEach((key) => root.style.setProperty(`--${key}`, themeStyles[key]))
  root.style.setProperty('--success-bg', colors.success.bg)
  root.style.setProperty('--success-text', colors.success.text)
  root.style.setProperty('--success-border', colors.success.border)
  root.style.setProperty('--warning-bg', colors.warning.bg)
  root.style.setProperty('--warning-text', colors.warning.text)
  root.style.setProperty('--warning-border', colors.warning.border)
  root.style.setProperty('--danger-bg', colors.danger.bg)
  root.style.setProperty('--danger-text', colors.danger.text)
  root.style.setProperty('--danger-border', colors.danger.border)
  root.style.setProperty('--info-bg', colors.info.bg)
  root.style.setProperty('--info-text', colors.info.text)
  root.style.setProperty('--info-border', colors.info.border)
}
