import { memo } from 'react'
import { Card } from '../ui/Card'

function StatCardComponent({ label, value, helper, badge, tone = 'default' }) {
  return (
    <Card className={`stat-card stat-card-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value-row">
        <div className="stat-value">{value}</div>
        {badge ? <div className="stat-badge">{badge}</div> : null}
      </div>
      {helper ? <div className="stat-helper">{helper}</div> : null}
    </Card>
  )
}

export const StatCard = memo(StatCardComponent)
