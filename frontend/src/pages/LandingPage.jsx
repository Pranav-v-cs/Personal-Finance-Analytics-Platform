import { Helmet } from 'react-helmet-async'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { ChartBars } from '../components/common/ChartBars'
import { Reveal } from '../components/common/Reveal'
import { SectionTitle } from '../components/common/SectionTitle'
import { useRouter } from '../hooks/useRouter'

const demoMonthly = [
  { label: 'Jul', total: 1200 },
  { label: 'Aug', total: 1700 },
  { label: 'Sep', total: 980 },
  { label: 'Oct', total: 2100 },
  { label: 'Nov', total: 1850 },
  { label: 'Dec', total: 2300 },
]

const demoFeatures = [
  {
    title: 'Fast expense entry',
    description: 'Capture spending in a focused form with inline validation and clear defaults.',
  },
  {
    title: 'Monthly trend clarity',
    description: 'Track runway and spikes over time without scanning a dense spreadsheet.',
  },
  {
    title: 'Theme persistence',
    description: 'Dark mode is the default, with a persisted light alternative for daylight use.',
  },
]

export default function LandingPage() {
  const { navigate } = useRouter()
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Expense Tracker',
    applicationCategory: 'FinanceApplication',
    description: 'Personal finance analytics platform for tracking expenses and visualizing spending patterns.',
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <Helmet>
        <title>Expense Tracker - Personal Finance Analytics</title>
        <meta
          name="description"
          content="Track expenses, visualize spending patterns, and take control of your personal finances."
        />
        <meta property="og:title" content="Expense Tracker" />
        <meta property="og:description" content="Personal finance analytics platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://yourdomain.com" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 max-w-6xl mx-auto w-full" aria-label="Primary">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-white">PF</div>
          <div className="flex flex-col">
            <div className="text-sm font-black tracking-tight">Pulse Finance</div>
            <div className="text-xs text-[var(--muted)]">Analytics platform</div>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/auth')}>Sign in</Button>
      </nav>

      <header className="flex flex-col lg:flex-row items-center gap-12 px-6 lg:px-12 py-12 lg:py-20 max-w-6xl mx-auto w-full">
        <Reveal className="flex flex-col gap-6 max-w-lg">
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">Expense tracker for people who want signal, not clutter</span>
            <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-black tracking-tight leading-tight">See spending clearly, act on it faster, and keep the interface calm.</h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Pulse Finance turns expense data into an executive-style dashboard with focused flows for tracking,
              analysis, and account management.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/auth')}>Get started</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Open dashboard</Button>
          </div>
        </Reveal>

        <Reveal className="flex-shrink-0" delay={80}>
          <Card className="w-full max-w-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wide">Monthly spend</div>
                  <div className="text-2xl font-black tracking-tight">$12,430</div>
                </div>
                <span className="rounded-full bg-[rgba(245,127,23,0.12)] px-2.5 py-0.5 text-xs font-semibold text-[#f7b14a]">+8.4% vs last month</span>
              </div>
              <ChartBars data={demoMonthly} />
            </CardContent>
          </Card>
        </Reveal>
      </header>

      <main className="flex flex-col gap-16 px-6 lg:px-12 py-12 lg:py-20 max-w-6xl mx-auto w-full">
        <Reveal>
          <section className="flex flex-col gap-8">
            <SectionTitle
              eyebrow="Product preview"
              title="A dashboard that feels designed, not assembled."
              description="Static preview cards show the direction of the product before sign-in."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Total expenses</span>
                    <strong className="text-lg font-black">$18.2k</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Top category</span>
                    <strong className="text-sm font-bold">Food & Dining</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Avg per day</span>
                    <strong className="text-sm font-bold">$61.73</strong>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between text-sm"><span>Rent</span><strong>$1,800</strong></div>
                  <div className="flex items-center justify-between text-sm"><span>Groceries</span><strong>$420</strong></div>
                  <div className="flex items-center justify-between text-sm"><span>Transport</span><strong>$96</strong></div>
                </CardContent>
              </Card>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="flex flex-col gap-8">
            <SectionTitle
              eyebrow="Analytics showcase"
              title="Simple visualizations, built for quick reads."
              description="The app uses a restrained chart system to avoid the usual dashboard-template look."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-5">
                  <ChartBars data={demoMonthly} maxHeight={150} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="10" strokeDasharray={`${72 * 3.266} 326.6`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <strong className="text-lg font-black">72%</strong>
                      <span className="text-xs text-[var(--muted)]">Essential spend</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="flex flex-col gap-8">
            <SectionTitle
              eyebrow="Feature highlights"
              title="Focused workflows for the entire finance loop."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {demoFeatures.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="flex flex-col gap-2 p-5">
                    <h3 className="text-lg font-extrabold tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="flex flex-col gap-8">
            <Card className="bg-gradient-to-br from-[var(--accent)] to-[var(--accentStrong)] border-0">
              <CardContent className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-8">
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.15em] text-white/70 font-semibold">Roadmap</span>
                  <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">AI insights, budget alerts, and richer category analysis are next.</h2>
                </div>
                <Button onClick={() => navigate('/auth')} className="bg-white text-[var(--accent)] hover:bg-white/90 flex-shrink-0">
                  Start tracking
                </Button>
              </CardContent>
            </Card>
          </section>
        </Reveal>
      </main>

      <footer className="flex items-center justify-center gap-4 px-6 py-8 text-xs text-[var(--muted)]">
        <span className="font-bold text-[var(--text)]">Pulse Finance</span>
        <span>Built for clarity, not noise.</span>
      </footer>
    </div>
  )
}
