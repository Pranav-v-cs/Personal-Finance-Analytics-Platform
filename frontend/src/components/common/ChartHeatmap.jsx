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
    <div className="heatmap-grid">
      {grid.map((cell) => {
        const intensity = getIntensity(cell.avg, maxAvg)
        const alpha = 0.12 + intensity * 0.5
        return (
          <div
            key={cell.day}
            className="heatmap-cell"
            style={{ background: `rgba(124, 116, 232, ${alpha})` }}
          >
            <div className="heatmap-day">{cell.label}</div>
            <div className="heatmap-value">{formatCurrency(cell.avg)}</div>
            <div className="heatmap-count">{cell.count} txns</div>
          </div>
        )
      })}
    </div>
  )
})

export default ChartHeatmap
