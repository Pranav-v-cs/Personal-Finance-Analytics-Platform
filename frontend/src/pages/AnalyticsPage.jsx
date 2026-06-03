import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { InlineError } from '../components/common/InlineError'
import { EmptyState } from '../components/common/EmptyState'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { ChartBars } from '../components/common/ChartBars'
import { useDashboard } from '../hooks/useDashboard'
import { formatCurrency, formatCompact } from '../utils/format'

function AnalyticsSkeleton() {
  return (
    <div className="analytics-stack">
      <Card className="analytics-panel">
        <SkeletonLine className="w-40" />
        <Skeleton className="chart-placeholder" />
      </Card>
    </div>
  )
}

export default function AnalyticsPage() {
  const { summary, monthly, loading, error } = useDashboard()

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Analytics" title="Deep dive on spending" description="Loading the analysis view..." />
        <AnalyticsSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Analytics" title="Deep dive on spending" description="A more detailed look at your data." />
        <InlineError message={error} />
      </>
    )
  }

  const categoryData = (summary?.category_breakdown || []).map((item) => ({
    name: item.category,
    total: Number(item.total_amount || 0),
  }))
  const total = Number(summary?.total_expenses || 0)

  return (
    <div className="analytics-stack">
      <PageHeader
        eyebrow="Analytics"
        title="Deep dive on spending"
        description="A tighter analysis view over the same backend data."
      />

      <div className="analytics-grid">
        <Card className="analytics-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Monthly trends</div>
              <h2>12 month profile</h2>
            </div>
          </div>
          {monthly.length === 0 ? (
            <EmptyState
              title="No monthly data yet."
              description="Monthly trend bars will appear once you log expenses over time."
            />
          ) : (
            <ChartBars data={monthly} />
          )}
        </Card>

        <Card className="analytics-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Concentration</div>
              <h2>Category breakdown</h2>
            </div>
          </div>
          {categoryData.length === 0 ? (
            <EmptyState
              title="No category breakdown yet."
              description="Spend across a few categories and the concentration view will populate here."
            />
          ) : (
            <div className="breakdown-list">
              {categoryData.map((item) => {
                const percent = total ? Math.round((item.total / total) * 100) : 0
                return (
                  <div key={item.name} className="breakdown-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatCompact(item.total)}</span>
                    </div>
                    <strong>{percent}%</strong>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="analytics-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">Summary</div>
            <h2>Headline metrics</h2>
          </div>
        </div>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total expenses</span>
            <strong>{formatCurrency(summary?.total_expenses)}</strong>
          </div>
          <div className="summary-card">
            <span>Expense count</span>
            <strong>{summary?.expense_count ?? 0}</strong>
          </div>
          <div className="summary-card">
            <span>Top category share</span>
            <strong>
              {categoryData.length ? `${Math.round((Math.max(...categoryData.map((item) => item.total)) / (total || 1)) * 100)}%` : '0%'}
            </strong>
          </div>
        </div>
      </Card>
    </div>
  )
}
