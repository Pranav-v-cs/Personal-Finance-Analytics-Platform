import { Card } from '../components/ui/Card'

export function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-marketing">
        <div className="eyebrow">Personal finance analytics</div>
        <h1>Track spending with a calmer, sharper workflow.</h1>
        <p>
          A premium expense tracker with focused dashboards, fast entry flows, and a visual system built for clarity.
        </p>
        <div className="auth-points">
          <div>Protected data access with JWT auth</div>
          <div>Dashboard summaries and monthly trend views</div>
          <div>Theme-aware interface with persisted preferences</div>
        </div>
      </div>
      <Card className="auth-card-shell">{children}</Card>
    </div>
  )
}
