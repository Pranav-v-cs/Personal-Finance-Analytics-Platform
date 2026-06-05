import { Button } from '../ui/Button'

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-lg">{title}</h3>
        <p className="text-sm text-[var(--muted)] max-w-md">{description}</p>
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  )
}
