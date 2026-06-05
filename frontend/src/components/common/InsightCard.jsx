import { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'

export function InsightCard({ insight, onDismiss }) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  function handleDismiss() {
    setHidden(true)
    onDismiss?.(insight)
  }

  const icon = insight.type === 'increase' ? '↑' : insight.type === 'decrease' ? '↓' : 'i'

  return (
    <Card>
      <CardContent className="flex items-start gap-3 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)] flex-shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <strong className="text-sm font-extrabold">{insight.title}</strong>
          <p className="text-xs text-[var(--muted)] mt-1">{insight.message}</p>
          {insight.actionLabel ? (
            <Button variant="ghost" size="sm" className="mt-1 h-auto px-0 text-xs text-[var(--accent)]">{insight.actionLabel}</Button>
          ) : null}
        </div>
        {insight.dismissible ? (
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded text-xs text-[var(--muted)] hover:text-[var(--text)] flex-shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss insight"
          >
            ×
          </button>
        ) : null}
      </CardContent>
    </Card>
  )
}
