import { useState, useCallback } from 'react'

export function useContainerSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  const ref = useCallback((el) => {
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize(prev => {
        const w = Math.round(width)
        const h = Math.round(height)
        if (prev.width === w && prev.height === h) return prev
        return { width: w, height: h }
      })
    })
    ro.observe(el)

    const { width, height } = el.getBoundingClientRect()
    if (width > 0 || height > 0) {
      setSize({ width: Math.round(width), height: Math.round(height) })
    }

    return () => ro.disconnect()
  }, [])

  return { ref, width: size.width, height: size.height }
}
