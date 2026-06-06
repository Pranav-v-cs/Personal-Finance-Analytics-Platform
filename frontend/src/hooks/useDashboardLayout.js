import { useCallback, useMemo, useRef, useState } from 'react'
import { WIDGET_DEFS, WIDGET_IDS, PRESETS, ZONES } from '../config/widgets'

const STORAGE_KEY = 'dashboard_layout'

const DEFAULT_AI_PROVIDER = 'openrouter'

function loadLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed.zones) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      return parsed
    }
  } catch {
    /* ignore */
  }
  return null
}

function saveLayout(layout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch {
    /* ignore */
  }
}

function getDefaultLayout() {
  return {
    preset: 'default',
    zones: { ...PRESETS.default.zones },
    hiddenWidgets: [],
    widgetSizes: {},
    density: 'comfortable',
    aiProvider: DEFAULT_AI_PROVIDER,
    theme: 'dark',
  }
}

function cloneZoneWidgets(zones) {
  const result = {}
  for (const zone of ZONES) {
    result[zone] = [...(zones[zone] || [])]
  }
  return result
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState(() => {
    return loadLayout() || getDefaultLayout()
  })
  const ref = useRef(layout)
  ref.current = layout

  const persist = useCallback((next) => {
    setLayout(next)
    saveLayout(next)
  }, [])

  const allVisibleWidgets = useMemo(() => {
    const ids = []
    for (const zone of ZONES) {
      const zoneIds = layout.zones[zone] || []
      for (const id of zoneIds) {
        if (WIDGET_IDS.includes(id) && !layout.hiddenWidgets.includes(id)) {
          ids.push(id)
        }
      }
    }
    return ids
  }, [layout.zones, layout.hiddenWidgets])

  const hiddenWidgetsData = useMemo(() => {
    return layout.hiddenWidgets
      .filter((id) => WIDGET_IDS.includes(id))
      .map((id) => WIDGET_DEFS[id])
      .filter(Boolean)
  }, [layout.hiddenWidgets])

  const getWidgetSize = useCallback(
    (id) => {
      const def = WIDGET_DEFS[id]
      if (!def) return 'medium'
      return layout.widgetSizes[id] || def.defaultSize || 'medium'
    },
    [layout.widgetSizes],
  )

  const setWidgetSize = useCallback(
    (id, size) => {
      const def = WIDGET_DEFS[id]
      if (!def || !def.sizes.includes(size)) return
      const sizes = { ...ref.current.widgetSizes, [id]: size }
      persist({ ...ref.current, widgetSizes: sizes })
    },
    [persist],
  )

  const cycleWidgetSize = useCallback(
    (id) => {
      const def = WIDGET_DEFS[id]
      if (!def || def.sizes.length <= 1) return
      const current = ref.current.widgetSizes[id] || def.defaultSize
      const idx = def.sizes.indexOf(current)
      const next = def.sizes[(idx + 1) % def.sizes.length]
      const sizes = { ...ref.current.widgetSizes, [id]: next }
      persist({ ...ref.current, widgetSizes: sizes })
    },
    [persist],
  )

  const reorder = useCallback(
    (zone, activeId, overId) => {
      if (!zone || !activeId || !overId || activeId === overId) return
      const zoneWidgets = [...(ref.current.zones[zone] || [])]
      const oldIndex = zoneWidgets.indexOf(activeId)
      const newIndex = zoneWidgets.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return
      zoneWidgets.splice(oldIndex, 1)
      zoneWidgets.splice(newIndex, 0, activeId)
      const zones = { ...ref.current.zones, [zone]: zoneWidgets }
      persist({ ...ref.current, preset: 'custom', zones })
    },
    [persist],
  )

  const toggleWidget = useCallback(
    (id) => {
      const def = WIDGET_DEFS[id]
      if (!def || def.alwaysVisible) return
      const hidden = [...ref.current.hiddenWidgets]
      const idx = hidden.indexOf(id)
      if (idx >= 0) {
        hidden.splice(idx, 1)
      } else {
        hidden.push(id)
      }
      persist({ ...ref.current, hiddenWidgets: hidden })
    },
    [persist],
  )

  const applyPreset = useCallback(
    (presetKey) => {
      const preset = PRESETS[presetKey]
      if (!preset) return
      persist({
        ...ref.current,
        preset: presetKey,
        zones: cloneZoneWidgets(preset.zones),
        hiddenWidgets: [],
      })
    },
    [persist],
  )

  const resetLayout = useCallback(() => {
    persist(getDefaultLayout())
  }, [persist])

  const setDensity = useCallback(
    (density) => {
      persist({ ...ref.current, density })
    },
    [persist],
  )

  const setAiProvider = useCallback(
    (provider) => {
      persist({ ...ref.current, aiProvider: provider })
    },
    [persist],
  )

  const setTheme = useCallback(
    (theme) => {
      persist({ ...ref.current, theme })
    },
    [persist],
  )

  return {
    zones: layout.zones,
    allVisibleWidgets,
    visibleWidgets: allVisibleWidgets,
    hiddenWidgets: hiddenWidgetsData,
    preset: layout.preset,
    density: layout.density,
    aiProvider: layout.aiProvider,
    widgetSizes: layout.widgetSizes,
    layoutTheme: layout.theme,
    reorder,
    toggleWidget,
    applyPreset,
    resetLayout,
    setDensity,
    setAiProvider,
    setTheme,
    setWidgetSize,
    cycleWidgetSize,
    getWidgetSize,
    isVisible: (id) => !layout.hiddenWidgets.includes(id),
    isHidden: (id) => layout.hiddenWidgets.includes(id),
  }
}
