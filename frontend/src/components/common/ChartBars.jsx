import { memo } from 'react'

function ChartBarsComponent({ data, maxHeight = 180 }) {
  const max = Math.max(...data.map((item) => Number(item.total || 0)), 1)

  return (
    <div className="chart-bars" style={{ ['--chart-height']: `${maxHeight}px` }}>
      {data.map((item) => {
        const height = `${Math.max(8, (Number(item.total || 0) / max) * maxHeight)}px`
        return (
          <div key={item.month || item.label || item.name} className="chart-bar-group">
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ height }} />
            </div>
            <div className="chart-bar-label">{item.label || item.month || item.name}</div>
            <div className="chart-bar-value">{Number(item.total || 0).toFixed(0)}</div>
          </div>
        )
      })}
    </div>
  )
}

export const ChartBars = memo(ChartBarsComponent)
