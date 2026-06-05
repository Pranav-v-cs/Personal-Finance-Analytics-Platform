import { Card, CardContent } from '../components/ui/Card'

export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center gap-6 p-12 bg-gradient-to-b from-[var(--surface)] to-[var(--bg)]">
        <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">Personal finance analytics</span>
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-black tracking-tight leading-tight max-w-md">
          Track spending with a calmer, sharper workflow.
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-sm">
          A premium expense tracker with focused dashboards, fast entry flows, and a visual system built for clarity.
        </p>
        <ul className="flex flex-col gap-3 text-sm">
          {[
            'Protected data access with JWT auth',
            'Dashboard summaries and monthly trend views',
            'Theme-aware interface with persisted preferences',
          ].map((point) => (
            <li key={point} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(124,116,232,0.12)] text-[10px] text-[var(--accent)] font-bold">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 lg:p-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
