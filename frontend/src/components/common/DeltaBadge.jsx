import { Badge } from '../ui/Badge'

export function DeltaBadge({ value, inverse = false }) {
  if (value === 0 || value === null || value === undefined) return null

  const isPositive = value > 0
  const direction = isPositive ? '▲' : '▼'
  const variant = inverse ? (isPositive ? 'danger' : 'success') : (isPositive ? 'success' : 'danger')

  return (
    <Badge variant={variant}>
      {direction} {Math.abs(value).toFixed(1)}%
    </Badge>
  )
}
