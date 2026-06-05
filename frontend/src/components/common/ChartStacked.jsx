import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#7c74e8', '#5a52cc', '#9d94f0', '#4a42b8', '#b4acf8', '#3a32a4', '#6c64d8', '#8c84e0', '#aca4f0', '#2a2294']

function StackedTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="chart-tooltip-row" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </div>
      ))}
    </div>
  )
}

export default function ChartStacked({ data, categories }) {
  if (!data?.length || !categories?.length) return null

  return (
    <div className="chart-container" style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} width={50} />
          <Tooltip content={<StackedTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} iconType="circle" iconSize={8} />
          {categories.map((cat, i) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
