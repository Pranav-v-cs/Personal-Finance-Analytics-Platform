export function DeltaBadge({ value, inverse = false }) {
  if (value === 0 || value === null || value === undefined) return null

  const isPositive = value > 0
  const direction = isPositive ? '▲' : '▼'
  const tone = inverse ? (isPositive ? 'danger' : 'success') : (isPositive ? 'success' : 'danger')

  return (
    <span className={`delta-badge delta-${tone}`}>
      {direction} {Math.abs(value).toFixed(1)}%
    </span>
  )
}
