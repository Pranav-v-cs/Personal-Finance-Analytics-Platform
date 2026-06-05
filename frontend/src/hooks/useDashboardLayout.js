import { useCallback, useMemo, useRef, useState } from 'react'
import { WIDGET_DEFS, WIDGET_IDS, PRESETS } from '../config/widgets'

const STORAGE_KEY = 'dashboard_layout'

function loadLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return null
}

function saveLayout(layout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch {
    // ignore
  }
}

function getDefaultLayout() {
  return {
    preset: 'default',
    widgetOrder: [...PRESETS.default.order],
    hiddenWidgets: [],
    density: 'comfortable',
  }
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

  const visibleWidgets = useMemo(() => {
    return layout.widgetOrder.filter(
      (id) => WIDGET_IDS.includes(id) && !layout.hiddenWidgets.includes(id)
    )
  }, [layout.widgetOrder, layout.hiddenWidgets])

  const hiddenWidgetsData = useMemo(() => {
    return layout.hiddenWidgets
      .filter((id) => WIDGET_IDS.includes(id))
      .map((id) => WIDGET_DEFS[id])
      .filter(Boolean)
  }, [layout.hiddenWidgets])

  const reorder = useCallback(
    (activeId, overId) => {
      if (!activeId || !overId || activeId === overId) return
      const order = [...ref.current.widgetOrder]
      const oldIndex = order.indexOf(activeId)
      const newIndex = order.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1) return
      order.splice(oldIndex, 1)
      order.splice(newIndex, 0, activeId)
      persist({ ...ref.current, preset: 'custom', widgetOrder: order })
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
        preset: presetKey,
        widgetOrder: [...preset.order],
        hiddenWidgets: [],
        density: ref.current.density,
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

  return {
    widgetOrder: layout.widgetOrder,
    visibleWidgets,
    hiddenWidgets: hiddenWidgetsData,
    preset: layout.preset,
    density: layout.density,
    reorder,
    toggleWidget,
    applyPreset,
    resetLayout,
    setDensity,
    isVisible: (id) => visibleWidgets.includes(id),
    isHidden: (id) => layout.hiddenWidgets.includes(id),
  }
}
