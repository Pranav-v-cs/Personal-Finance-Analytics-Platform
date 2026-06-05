import { useState } from 'react'
import { ChartBars } from '../components/common/ChartBars'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { DeltaBadge } from '../components/common/DeltaBadge'
import { InsightCard } from '../components/common/InsightCard'
import { PageHeader } from '../components/common/PageHeader'
import { QuickAdd } from '../components/QuickAdd'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { StatCard } from '../components/common/StatCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../utils/format'
import { createExpense } from '../services/expenseService'
import { useDashboard } from '../hooks/useDashboard'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useInsights } from '../hooks/useInsights'
import { useSpendingMetrics } from '../hooks/useSpendingMetrics'
import { useRouter } from '../hooks/useRouter'

function DashboardSkeleton() {
  return (
    <div className="dashboard-stack">
      <Card className="dashboard-panel">
        <SkeletonLine className="w-32" />
        <SkeletonLine className="w-48" />
      </Card>
      <div className="stats-grid">
        <Skeleton className="stat-card" />
        <Skeleton className="stat-card" />
        <Skeleton className="stat-card" />
        <Skeleton className="stat-card" />
      </div>
      <Card className="dashboard-panel">
        <SkeletonLine className="w-40" />
        <Skeleton className="chart-placeholder" />
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { summary, monthly, recent, categories, loading, error } = useDashboard()
  const { navigate } = useRouter()
  const [quickAddSaving, setQuickAddSaving] = useState(false)
  const insights = useInsights({ summary, monthly, recent, categories })
  const metrics = useSpendingMetrics({ summary, monthly, recent })
  const health = useFinancialHealth({ summary, monthly })

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="Loading insights..." />
        <DashboardSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="A quick read on spending." />
        <InlineError message={error} />
      </>
    )
  }

  const monthSeries = monthly.length ? monthly : []
  const hasExpenses = metrics.expenseCount > 0

  const handleQuickAdd = async (values) => {
    setQuickAddSaving(true)
    try {
      await createExpense(values)
      window.location.reload()
    } catch {
      setQuickAddSaving(false)
      throw new Error('Failed to save expense')
    }
  }

  return (
    <div className="dashboard-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Your financial snapshot"
        description="Your financial health, key metrics, and spending trends."
        actions={
          <>
            <Button onClick={() => navigate('/expenses')}>All transactions</Button>
          </>
        }
      />

      {!hasExpenses ? (
        <Card className="dashboard-panel">
          <EmptyState
            title="Add your first expense to see your financial overview."
            description="Once you capture a few transactions, your health score, trends, and category mix will populate here."
            actionLabel="Add a transaction"
            onAction={() => navigate('/expenses')}
          />
        </Card>
      ) : (
        <>
          <Card className="dashboard-panel health-card health-hero">
            <div className="health-hero-body">
              {health.score !== null ? (
                <>
                  <div className="health-score-display">
                    <span className={`health-score-value score-${health.label.toLowerCase().replace(/\s+/g, '-')}`}>{health.score}</span>
                    <span className="health-score-label">{health.label}</span>
                    {health.scoreChange !== null && health.scoreChange !== 0 && (
                      <span className={`delta-badge ${health.scoreChange > 0 ? 'delta-success' : 'delta-danger'}`}>
                        {health.scoreChange > 0 ? '▲' : '▼'} {Math.abs(health.scoreChange)} pts
                      </span>
                    )}
                  </div>
                  <div className="health-hero-text">
                    <div className="eyebrow">Financial Health</div>
                    <h2>Wellness score</h2>
                    <p className="health-score-desc">{health.recommendation}</p>
                    {health.actionRecommendation && (
                      <p className="health-action">{health.actionRecommendation}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="health-score-display">
                    <span className="health-score-value score-pending">--</span>
                    <span className="health-score-label">Pending</span>
                  </div>
                  <div className="health-hero-text">
                    <div className="eyebrow">Financial Health</div>
                    <h2>Wellness score</h2>
                    <p className="health-score-desc">{health.recommendation}</p>
                    {health.actionRecommendation && (
                      <p className="health-action">{health.actionRecommendation}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>

          {insights.length > 0 && (
            <div className="dashboard-section">
              <div className="section-heading">
                <div className="eyebrow">Insights</div>
                <h2>Spending patterns</h2>
              </div>
              <div className="insight-cards">
                {insights.map((insight) => (
                  <InsightCard key={`${insight.type}-${insight.message}`} insight={insight} />
                ))}
              </div>
            </div>
          )}

          <div className="stats-grid">
            <StatCard label="Total spending" value={formatCurrency(metrics.totalExpenses)} helper="All-time spend" />
            <StatCard
              label="Monthly change"
              value={metrics.momChangePercent !== 0 ? `${metrics.momChangePercent > 0 ? '+' : ''}${metrics.momChangePercent.toFixed(1)}%` : '0%'}
              helper="Compared to last month"
              badge={metrics.momChangePercent !== 0 ? <DeltaBadge value={metrics.momChangePercent} /> : null}
            />
            <StatCard label="Avg daily spend" value={formatCurrency(metrics.avgDailySpend)} helper="Across tracked period" />
            <StatCard label="Expense count" value={String(metrics.expenseCount)} helper="Total transactions" />
          </div>

          <div className="dashboard-grid">
            <Card className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">Monthly trend</div>
                  <h2>Rolling spend</h2>
                </div>
              </div>
              {monthSeries.length >= 2 ? (
                <div className="mom-comparison">
                  <div className="mom-row">
                    <span className="mom-label">This month</span>
                    <span className="mom-value">{formatCurrency(monthSeries[monthSeries.length - 1]?.total_amount ?? 0)}</span>
                  </div>
                  <div className="mom-row">
                    <span className="mom-label">Last month</span>
                    <span className="mom-value">{formatCurrency(monthSeries[monthSeries.length - 2]?.total_amount ?? 0)}</span>
                  </div>
                  <div className="mom-row mom-change">
                    <span className="mom-label">Change</span>
                    <DeltaBadge value={metrics.momChangePercent} />
                  </div>
                </div>
              ) : null}
              <ChartBars data={monthSeries} />
            </Card>

            <Card className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">Category mix</div>
                  <h2>Where the money goes</h2>
                </div>
              </div>
              {categories.length === 0 ? (
                <p className="empty-inline">No categories yet.</p>
              ) : (
                <div className="category-list">
                  {categories.slice(0, 5).map((row) => (
                    <div key={row.category} className="category-row">
                      <div>
                        <strong>{row.category}</strong>
                        <span>{row.percent?.toFixed(0) || 0}% of spend</span>
                      </div>
                      <strong>{formatCurrency(row.total_amount || row.total)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="dashboard-panel quick-add-panel">
            <QuickAdd categories={categories} onSubmit={handleQuickAdd} saving={quickAddSaving} />
          </Card>
        </>
      )}

      <button
        type="button"
        className="fab"
        onClick={() => navigate('/expenses')}
        aria-label="Quick add expense"
      >
        +
      </button>
    </div>
  )
}
