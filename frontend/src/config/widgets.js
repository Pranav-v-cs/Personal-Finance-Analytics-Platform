export const WIDGET_DEFS = {
  'financial-health': {
    id: 'financial-health',
    title: 'Financial Health',
    subtitle: 'Wellness score',
    defaultOrder: 0,
    alwaysVisible: true,
    group: 'core',
  },
  insights: {
    id: 'insights',
    title: 'Insights',
    subtitle: 'Spending patterns',
    defaultOrder: 1,
    alwaysVisible: false,
    group: 'analytics',
  },
  metrics: {
    id: 'metrics',
    title: 'Key Metrics',
    subtitle: 'Spending overview',
    defaultOrder: 2,
    alwaysVisible: false,
    group: 'analytics',
  },
  trend: {
    id: 'trend',
    title: 'Monthly Trend',
    subtitle: 'Rolling spend',
    defaultOrder: 3,
    alwaysVisible: false,
    group: 'analytics',
  },
  'category-intelligence': {
    id: 'category-intelligence',
    title: 'Category Intelligence',
    subtitle: 'Where the money goes',
    defaultOrder: 4,
    alwaysVisible: false,
    group: 'analytics',
  },
  'budget-summary': {
    id: 'budget-summary',
    title: 'Budget Summary',
    subtitle: 'Spending targets',
    defaultOrder: 5,
    alwaysVisible: false,
    group: 'budget',
  },
  'goal-progress': {
    id: 'goal-progress',
    title: 'Goal Progress',
    subtitle: 'Financial targets',
    defaultOrder: 6,
    alwaysVisible: false,
    group: 'budget',
  },
  'quick-add': {
    id: 'quick-add',
    title: 'Quick Add',
    subtitle: 'Add transaction',
    defaultOrder: 7,
    alwaysVisible: false,
    group: 'utility',
  },
  'ai-assistant': {
    id: 'ai-assistant',
    title: 'AI Assistant',
    subtitle: 'Coming soon',
    defaultOrder: 8,
    alwaysVisible: false,
    group: 'future',
  },
}

export const WIDGET_IDS = Object.keys(WIDGET_DEFS)

export const PRESETS = {
  default: {
    label: 'Default',
    description: 'Balanced overview',
    order: [
      'financial-health',
      'insights',
      'metrics',
      'trend',
      'category-intelligence',
      'budget-summary',
      'goal-progress',
      'quick-add',
      'ai-assistant',
    ],
  },
  analytics: {
    label: 'Analytics Focus',
    description: 'Prioritize spending analysis',
    order: [
      'financial-health',
      'metrics',
      'trend',
      'category-intelligence',
      'insights',
      'quick-add',
      'budget-summary',
      'goal-progress',
      'ai-assistant',
    ],
  },
  budget: {
    label: 'Budget Focus',
    description: 'Prioritize budgets and goals',
    order: [
      'financial-health',
      'budget-summary',
      'goal-progress',
      'insights',
      'metrics',
      'trend',
      'category-intelligence',
      'quick-add',
      'ai-assistant',
    ],
  },
  minimal: {
    label: 'Minimal',
    description: 'Only health and top insights',
    order: [
      'financial-health',
      'insights',
      'quick-add',
    ],
  },
}

export const DENSITY_MODES = {
  compact: { label: 'Compact', spacing: 'compact' },
  comfortable: { label: 'Comfortable', spacing: 'comfortable' },
}
