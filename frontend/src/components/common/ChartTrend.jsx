import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency } from '../../utils/format'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      <div className="chart-tooltip-value">{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

export default function ChartTrend({ data, height = 240 }) {
  if (!data?.length) return null

  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c74e8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7c74e8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} width={50} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="total" stroke="#7c74e8" strokeWidth={2} fill="url(#trendFill)" dot={false} activeDot={{ r: 4, fill: '#7c74e8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
