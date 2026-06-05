export const SIZES = ['small', 'medium', 'large']

export const WIDGET_DEFS = {
  'financial-health': {
    id: 'financial-health',
    title: 'Financial Health',
    subtitle: 'Wellness score',
    defaultOrder: 0,
    alwaysVisible: true,
    group: 'core',
    zone: 'hero',
    defaultSize: 'large',
    sizes: ['large'],
  },
  insights: {
    id: 'insights',
    title: 'Insights',
    subtitle: 'Spending patterns',
    defaultOrder: 1,
    alwaysVisible: false,
    group: 'analytics',
    zone: 'insights',
    defaultSize: 'medium',
    sizes: ['small', 'medium', 'large'],
  },
  metrics: {
    id: 'metrics',
    title: 'Key Metrics',
    subtitle: 'Spending overview',
    defaultOrder: 2,
    alwaysVisible: false,
    group: 'analytics',
    zone: 'analytics',
    defaultSize: 'medium',
    sizes: ['small', 'medium'],
  },
  trend: {
    id: 'trend',
    title: 'Trend Analysis',
    subtitle: 'Rolling spend',
    defaultOrder: 3,
    alwaysVisible: false,
    group: 'analytics',
    zone: 'analytics',
    defaultSize: 'medium',
    sizes: ['small', 'medium', 'large'],
  },
  'category-intelligence': {
    id: 'category-intelligence',
    title: 'Category Mix',
    subtitle: 'Where the money goes',
    defaultOrder: 4,
    alwaysVisible: false,
    group: 'analytics',
    zone: 'analytics',
    defaultSize: 'medium',
    sizes: ['small', 'medium', 'large'],
  },
  'budget-summary': {
    id: 'budget-summary',
    title: 'Budget Summary',
    subtitle: 'Spending targets',
    defaultOrder: 5,
    alwaysVisible: false,
    group: 'budget',
    zone: 'hero',
    defaultSize: 'small',
    sizes: ['small', 'medium'],
  },
  'goal-progress': {
    id: 'goal-progress',
    title: 'Goal Progress',
    subtitle: 'Financial targets',
    defaultOrder: 6,
    alwaysVisible: false,
    group: 'budget',
    zone: 'hero',
    defaultSize: 'small',
    sizes: ['small', 'medium'],
  },
  'quick-add': {
    id: 'quick-add',
    title: 'Quick Add',
    subtitle: 'Add transaction',
    defaultOrder: 7,
    alwaysVisible: false,
    group: 'utility',
    zone: 'utility',
    defaultSize: 'small',
    sizes: ['small'],
  },
  'ai-assistant': {
    id: 'ai-assistant',
    title: 'AI Assistant',
    subtitle: 'Coming soon',
    defaultOrder: 8,
    alwaysVisible: false,
    group: 'future',
    zone: 'future',
    defaultSize: 'medium',
    sizes: ['small', 'medium', 'large'],
  },
}

export const WIDGET_IDS = Object.keys(WIDGET_DEFS)

export const PRESETS = {
  default: {
    label: 'Default',
    description: 'Balanced overview',
    zones: {
      hero: ['financial-health', 'budget-summary', 'goal-progress'],
      insights: ['insights'],
      analytics: ['metrics', 'trend', 'category-intelligence'],
      utility: ['quick-add'],
      future: ['ai-assistant'],
    },
  },
  analytics: {
    label: 'Analytics Focus',
    description: 'Prioritize forecasting and trends',
    zones: {
      hero: ['financial-health', 'insights'],
      insights: [],
      analytics: ['metrics', 'trend', 'category-intelligence'],
      utility: ['quick-add'],
      future: ['ai-assistant'],
    },
  },
  budget: {
    label: 'Budget Focus',
    description: 'Track budgets and goals',
    zones: {
      hero: ['financial-health', 'budget-summary', 'goal-progress'],
      insights: ['insights'],
      analytics: ['metrics'],
      utility: ['quick-add'],
      future: ['ai-assistant'],
    },
  },
  goal: {
    label: 'Goal Focus',
    description: 'Focus on financial targets',
    zones: {
      hero: ['financial-health', 'goal-progress'],
      insights: ['insights'],
      analytics: ['metrics'],
      utility: ['quick-add'],
      future: [],
    },
  },
  minimal: {
    label: 'Minimal',
    description: 'Only health and top insights',
    zones: {
      hero: ['financial-health'],
      insights: ['insights'],
      analytics: [],
      utility: ['quick-add'],
      future: [],
    },
  },
}

export const PRESET_KEYS = Object.keys(PRESETS)

export function getZoneWidgets(presetKey, zone) {
  const preset = PRESETS[presetKey]
  if (!preset) return []
  return preset.zones[zone] || []
}

export const ZONES = ['hero', 'insights', 'analytics', 'utility', 'future']

export const ZONE_LABELS = {
  hero: 'Overview',
  insights: 'Insights',
  analytics: 'Analytics',
  utility: 'Utilities',
  future: 'Coming Soon',
}

export const DENSITY_MODES = {
  compact: { label: 'Compact', spacing: 'compact' },
  comfortable: { label: 'Comfortable', spacing: 'comfortable' },
}
