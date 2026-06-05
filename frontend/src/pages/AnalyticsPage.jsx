import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/common/Badge'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { useDashboard } from '../hooks/useDashboard'

function AnalyticsSkeleton() {
  return (
    <div className="analytics-stack">
      <div className="analytics-grid">
        <Card className="analytics-panel">
          <SkeletonLine className="w-40" />
          <Skeleton className="chart-placeholder" />
        </Card>
        <Card className="analytics-panel">
          <SkeletonLine className="w-32" />
          <Skeleton className="chart-placeholder" />
        </Card>
      </div>
    </div>
  )
}

const PLACEHOLDER_SECTIONS = [
  {
    eyebrow: 'Trend analysis',
    title: 'Spending trends',
    description: 'Understand how your spending patterns shift across weeks, months, and seasons. Spot upward or downward trends before they become habits.',
    badge: 'Phase 4',
  },
  {
    eyebrow: 'Category intelligence',
    title: 'Category analysis',
    description: 'See which categories drive your spending and how their shares change over time. Identify categories that deserve more attention.',
    badge: 'Phase 4',
  },
  {
    eyebrow: 'Forecasting',
    title: 'Spending forecast',
    description: 'Project next month\'s spend based on historical patterns and current velocity. Get early warnings when you\'re trending over budget.',
    badge: 'Coming soon',
  },
  {
    eyebrow: 'Budget analysis',
    title: 'Budget performance',
    description: 'Compare actual spending against targets. Visualize over-budget and under-budget categories at a glance.',
    badge: 'Coming soon',
  },
  {
    eyebrow: 'AI reports',
    title: 'Monthly narratives',
    description: 'Receive auto-generated plain-English summaries of your financial activity. Understand what changed and why without crunching numbers.',
    badge: 'Coming soon',
  },
  {
    eyebrow: 'Anomaly detection',
    title: 'Unusual activity',
    description: 'Get flagged when a transaction or spending pattern falls outside your normal range. Catch errors, fraud, or one-off surprises early.',
    badge: 'Coming soon',
  },
]

export default function AnalyticsPage() {
  const { loading, error } = useDashboard()

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Analytics" title="Understand your spending" description="Deep-dive tools are being prepared." />
        <AnalyticsSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Analytics" title="Understand your spending" description="Detailed breakdowns of where your money goes." />
        <InlineError message={error} />
      </>
    )
  }

  return (
    <div className="analytics-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Understand your spending"
        description="Deep-dive analytics are coming in future phases. Placeholder cards below show what\'s planned."
      />

      <div className="analytics-grid">
        {PLACEHOLDER_SECTIONS.map((section) => (
          <Card key={section.title} className="analytics-panel placeholder-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">{section.eyebrow}</div>
                <h2>{section.title}</h2>
              </div>
              <Badge tone="info">{section.badge}</Badge>
            </div>
            <p className="panel-copy">{section.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
