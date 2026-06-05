import { memo } from 'react'

function ChartBarsComponent({ data, maxHeight = 180 }) {
  const max = Math.max(...data.map((item) => Number(item.total || 0)), 1)

  return (
    <div className="flex items-end gap-2" style={{ height: maxHeight }}>
      {data.map((item) => {
        const height = `${Math.max(8, (Number(item.total || 0) / max) * maxHeight)}px`
        return (
          <div key={item.month || item.label || item.name} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <span className="text-[10px] text-[var(--muted)] font-mono">{Number(item.total || 0).toFixed(0)}</span>
            <div className="w-full rounded-t bg-gradient-to-t from-[var(--accent)] to-[var(--accentStrong)]" style={{ height }} />
            <span className="text-[10px] text-[var(--muted)] truncate w-full text-center">{item.label || item.month || item.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export const ChartBars = memo(ChartBarsComponent)
