import { cn } from '../../lib/utils'

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4 py-8', className)}>
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">{eyebrow}</span>
        ) : null}
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-[var(--muted)] mt-0.5">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2 flex-shrink-0">{actions}</div> : null}
    </div>
  )
}
