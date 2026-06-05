import { useState } from 'react'
import { Card } from '../ui/Card'

export function InsightCard({ insight, onDismiss }) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  function handleDismiss() {
    setHidden(true)
    onDismiss?.(insight)
  }

  return (
    <Card className="dashboard-panel insight-card">
      <div className="insight-card-body">
        <div className="insight-card-icon">{insight.type === 'increase' ? '↑' : insight.type === 'decrease' ? '↓' : 'i'}</div>
        <div>
          <strong>{insight.title}</strong>
          <p>{insight.message}</p>
          {insight.actionLabel ? (
            <button type="button" className="text-button insight-card-action">{insight.actionLabel}</button>
          ) : null}
        </div>
        {insight.dismissible ? (
          <button
            type="button"
            className="insight-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss insight"
          >
            ×
          </button>
        ) : null}
      </div>
    </Card>
  )
}
