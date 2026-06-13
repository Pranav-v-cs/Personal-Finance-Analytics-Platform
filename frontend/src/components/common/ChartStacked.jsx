import { memo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, currencyTickFormatter } from '../../utils/format'

const COLORS = ['#7c74e8', '#5a52cc', '#9d94f0', '#4a42b8', '#b4acf8', '#3a32a4', '#6c64d8', '#8c84e0', '#aca4f0', '#2a2294']

function StackedTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surfaceStrong)] px-3 py-2 shadow-[0_4px_12px_var(--shadow)] text-xs">
      <div className="font-semibold mb-1">{label}</div>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
            {entry.name}: {formatCurrency(entry.value, currency)}
          </div>
        ))}
      </div>
    </div>
  )
}

const ChartStacked = memo(function ChartStacked({ data, categories, currency }) {
  if (!data?.length || !categories?.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" tickFormatter={currencyTickFormatter(currency)} width={50} />
        <Tooltip content={<StackedTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)' }} iconType="circle" iconSize={8} />
        {categories.map((cat, i) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
})

export default ChartStacked
