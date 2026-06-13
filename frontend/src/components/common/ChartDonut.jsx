import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#7c74e8', '#5a52cc', '#9d94f0', '#4a42b8', '#b4acf8', '#3a32a4', '#6c64d8', '#8c84e0', '#aca4f0', '#2a2294']

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surfaceStrong)] px-3 py-2 shadow-[0_4px_12px_var(--shadow)] text-xs">
      <div className="font-semibold mb-1">{d.category}</div>
      <div className="font-mono font-bold">{formatCurrency(d.total)} ({Math.round(Number(d.percent))}%)</div>
    </div>
  )
}

function ChartDonut({ data, innerRadius = 75 }) {
  if (!data?.length) return null

  const numericData = data.map(d => ({ ...d, total: Number(d.total) }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart data={numericData}>
        <Pie
          data={numericData}
          dataKey="total"
          nameKey="category"
          innerRadius={innerRadius}
          outerRadius={110}
          paddingAngle={2}
          strokeWidth={0}
        >
          {numericData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<DonutTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ChartDonut
