import { Badge } from '../components/common/Badge'
import { ChartBars } from '../components/common/ChartBars'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { PageHeader } from '../components/common/PageHeader'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { StatCard } from '../components/common/StatCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { formatCurrency, formatDate } from '../utils/format'
import { useDashboard } from '../hooks/useDashboard'
import { useRouter } from '../hooks/useRouter'

function DashboardSkeleton() {
  return (
    <div className="dashboard-stack">
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

  const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
  const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)
  const avgPerDay = Number(summary?.avgPerDay ?? summary?.avg_per_day ?? 0)
  const topCategory = summary?.topCategory || summary?.top_category || categories[0] || null
  const monthSeries = monthly.length ? monthly : []
  const hasExpenses = expenseCount > 0

  return (
    <div className="dashboard-stack">
      <PageHeader
        eyebrow="Dashboard"
        title="Your financial snapshot"
        description="A concise view of spend, concentration, and recent activity."
        actions={
          <>
            <Button onClick={() => navigate('/expenses')}>Quick Add Expense</Button>
            <Badge tone="info">Last refreshed now</Badge>
          </>
        }
      />

      <div className="stats-grid">
        <StatCard label="Total expenses" value={formatCurrency(totalExpenses)} helper="All-time spend" />
        <StatCard label="Expense count" value={expenseCount} helper="Tracked entries" />
        <StatCard label="Avg per day" value={formatCurrency(avgPerDay)} helper="Active period average" />
        <StatCard
          label="Top category"
          value={topCategory?.category || 'None'}
          helper={topCategory ? formatCurrency(topCategory.total_amount || topCategory.total) : 'No data'}
        />
      </div>

      {!hasExpenses ? (
        <Card className="dashboard-panel">
          <EmptyState
            title="Start by adding your first expense."
            description="Once you capture a few transactions, the spend trend, recent activity, and category mix will populate here."
            actionLabel="Quick Add Expense"
            onAction={() => navigate('/expenses')}
          />
        </Card>
      ) : (
        <div className="dashboard-grid">
          <Card className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Monthly trend</div>
                <h2>Rolling spend</h2>
              </div>
            </div>
            <ChartBars data={monthSeries} />
          </Card>

            <Card className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">Recent activity</div>
                  <h2>Latest transactions</h2>
              </div>
              <button type="button" className="text-button" onClick={() => navigate('/expenses')}>
                View all
                </button>
              </div>
              {recent.length === 0 ? (
                <EmptyState
                  title="No recent activity yet."
                  description="Add a few expenses and the latest transactions will appear here."
                  actionLabel="Quick Add Expense"
                  onAction={() => navigate('/expenses')}
                />
              ) : (
                <div className="recent-list">
                  {recent.map((expense) => (
                    <div key={expense.id} className="recent-row">
                      <div>
                        <strong>{expense.title || expense.description || 'Expense'}</strong>
                        <span>{expense.category}</span>
                      </div>
                      <div>
                        <strong>{formatCurrency(expense.amount)}</strong>
                        <span>{formatDate(expense.date || expense.transaction_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          <Card className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Category mix</div>
                <h2>Where the money goes</h2>
              </div>
            </div>
            {categories.length === 0 ? (
              <EmptyState
                title="No category breakdown yet."
                description="Once you have spending in multiple categories, this breakdown will appear here."
                actionLabel="Quick Add Expense"
                onAction={() => navigate('/expenses')}
              />
            ) : (
              <div className="category-list">
                {categories.map((row) => (
                  <div key={row.category} className="category-row">
                    <div>
                      <strong>{row.category}</strong>
                      <span>{row.expense_count ?? 0} entries</span>
                    </div>
                    <strong>{formatCurrency(row.total_amount || row.total)}</strong>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
