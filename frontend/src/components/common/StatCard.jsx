import { memo } from 'react'
import { Card } from '../ui/Card'

function StatCardComponent({ label, value, helper, tone = 'default' }) {
  return (
    <Card className={`stat-card stat-card-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {helper ? <div className="stat-helper">{helper}</div> : null}
    </Card>
  )
}

export const StatCard = memo(StatCardComponent)
