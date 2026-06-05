export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-1">
      {eyebrow ? <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">{eyebrow}</span> : null}
      <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
      {description ? <p className="text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  )
}
