import { Helmet } from 'react-helmet-async'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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
    <div className="landing-page">
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

      <header>
        <nav className="landing-nav" aria-label="Primary">
          <div className="brand-block landing-brand">
            <div className="brand-mark">PF</div>
            <div className="brand-copy">
              <div className="brand-name">Pulse Finance</div>
              <div className="brand-subtitle">Analytics platform</div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/auth')}>Sign in</Button>
        </nav>

        <div className="hero">
        <Reveal className="hero-copy">
          <div className="eyebrow">Expense tracker for people who want signal, not clutter</div>
          <h1>See spending clearly, act on it faster, and keep the interface calm.</h1>
          <p>
            Pulse Finance turns expense data into an executive-style dashboard with focused flows for tracking,
            analysis, and account management.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/auth')}>Get started</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Open dashboard</Button>
          </div>
        </Reveal>

        <Reveal className="hero-preview" delay={80}>
          <Card className="mockup-card">
            <div className="mockup-topline">
              <div>
                <div className="mockup-label">Monthly spend</div>
                <div className="mockup-value">$12,430</div>
              </div>
              <div className="mockup-chip">+8.4% vs last month</div>
            </div>
            <ChartBars data={demoMonthly} />
          </Card>
        </Reveal>
        </div>
      </header>

      <main>
        <Reveal>
        <section className="landing-section">
          <SectionTitle
            eyebrow="Product preview"
            title="A dashboard that feels designed, not assembled."
            description="Static preview cards show the direction of the product before sign-in."
          />
          <div className="preview-grid">
            <Card className="preview-panel">
              <div className="preview-stat">
                <span>Total expenses</span>
                <strong>$18.2k</strong>
              </div>
              <div className="preview-stat">
                <span>Top category</span>
                <strong>Food & Dining</strong>
              </div>
              <div className="preview-stat">
                <span>Avg per day</span>
                <strong>$61.73</strong>
              </div>
            </Card>
            <Card className="preview-panel">
              <div className="preview-list">
                <div className="preview-list-row"><span>Rent</span><strong>$1,800</strong></div>
                <div className="preview-list-row"><span>Groceries</span><strong>$420</strong></div>
                <div className="preview-list-row"><span>Transport</span><strong>$96</strong></div>
              </div>
            </Card>
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section className="landing-section">
          <SectionTitle
            eyebrow="Analytics showcase"
            title="Simple visualizations, built for quick reads."
            description="The app uses a restrained chart system to avoid the usual dashboard-template look."
          />
          <div className="analytics-showcase">
            <Card className="analytics-panel">
              <ChartBars data={demoMonthly} maxHeight={150} />
            </Card>
            <Card className="analytics-panel">
              <div className="donut-demo">
                <div className="donut-ring" />
                <div className="donut-center">
                  <strong>72%</strong>
                  <span>Essential spend</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section className="landing-section">
          <SectionTitle
            eyebrow="Feature highlights"
            title="Focused workflows for the entire finance loop."
          />
          <div className="feature-grid">
            {demoFeatures.map((feature) => (
              <Card key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section className="landing-cta">
          <Card className="cta-card">
            <div>
              <div className="eyebrow">Roadmap</div>
              <h2>AI insights, budget alerts, and richer category analysis are next.</h2>
            </div>
            <Button onClick={() => navigate('/auth')}>Start tracking</Button>
          </Card>
        </section>
        </Reveal>
      </main>

      <footer className="landing-footer">
        <span>Pulse Finance</span>
        <span>Built for clarity, not noise.</span>
      </footer>
    </div>
  )
}
