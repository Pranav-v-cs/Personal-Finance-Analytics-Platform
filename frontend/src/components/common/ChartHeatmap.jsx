import { memo } from 'react'
import { formatCurrency } from '../../utils/format'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getIntensity(value, max) {
  if (!max || !value) return 0
  return Math.min(value / max, 1)
}

const ChartHeatmap = memo(function ChartHeatmap({ data }) {
  if (!data?.length) return null

  const maxAvg = Math.max(...data.map((d) => d.avg), 1)

  const grid = []
  for (let day = 0; day < 7; day++) {
    const entry = data.find((d) => d.day === day)
    grid.push({
      day,
      label: DAY_LABELS[day],
      avg: entry?.avg || 0,
      count: entry?.count || 0,
      total: entry?.total || 0,
    })
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
    <div className="flex flex-col gap-1.5 w-full max-w-sm">
      {grid.map((cell) => {
        const intensity = getIntensity(cell.avg, maxAvg)
        const alpha = 0.12 + intensity * 0.5
        return (
          <div
            key={cell.day}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5"
            style={{ background: `rgba(124, 116, 232, ${alpha})` }}
          >
            <div className="w-10 text-xs font-semibold text-[var(--muted)]">{cell.label}</div>
            <div className="flex-1 text-sm font-bold font-mono text-right">{formatCurrency(cell.avg)}</div>
            <div className="text-[11px] text-[var(--muted)] whitespace-nowrap">{cell.count} txn{cell.count !== 1 ? 's' : ''}</div>
          </div>
        )
      })}
    </div>
    </div>
  )
})

export default ChartHeatmap
