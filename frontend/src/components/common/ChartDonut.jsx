import { memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#7c74e8', '#5a52cc', '#9d94f0', '#4a42b8', '#b4acf8', '#3a32a4', '#6c64d8', '#8c84e0', '#aca4f0', '#2a2294']

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 shadow-[0_4px_12px_var(--shadow)] text-xs">
      <div className="font-semibold mb-1">{d.category}</div>
      <div className="font-mono font-bold">{formatCurrency(d.total)} ({d.percent}%)</div>
    </div>
  )
}

const ChartDonut = memo(function ChartDonut({ data, innerRadius = 75 }) {
  if (!data?.length) return null

  return (
    <div className="min-w-0 w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={110}
            dataKey="total"
            nameKey="category"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})

export default ChartDonut
