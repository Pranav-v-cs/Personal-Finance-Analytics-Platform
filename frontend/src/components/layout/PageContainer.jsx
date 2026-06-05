import { cn } from '../../lib/utils'

export function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'w-full max-w-[1200px] mx-auto px-[var(--page-padding)] pb-8',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionContainer({ className, children, ...props }) {
  return (
    <section
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      {children}
    </section>
  )
}

export function MetricGrid({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function MetricCard({ label, value, badge, className }) {
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface)] to-[var(--surfaceStrong)] p-5 shadow-[0_18px_48px_var(--shadow)]', className)}>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[clamp(1.3rem,2.5vw,1.85rem)] font-extrabold tracking-tight">{value}</span>
          {badge && <span className="flex-shrink-0">{badge}</span>}
        </div>
      </div>
    </div>
  )
}

export function BentoGrid({ className, children, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-12', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function BentoZone({ zone, label, children, className, ...props }) {
  return (
    <section
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      {label && (
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">{label}</h2>
        </div>
      )}
      {children}
    </section>
  )
}
