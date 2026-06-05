import { useMemo } from 'react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/common/Badge'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/common/Skeleton'
import { useAnalytics } from '../hooks/useAnalytics'
import { formatCurrency, formatDate, formatMonthLabel } from '../utils/format'
import ChartTrend from '../components/common/ChartTrend'
import ChartDonut from '../components/common/ChartDonut'
import ChartStacked from '../components/common/ChartStacked'
import ChartArea from '../components/common/ChartArea'
import ChartHeatmap from '../components/common/ChartHeatmap'

const COLORS = ['#7c74e8', '#5a52cc', '#9d94f0', '#4a42b8', '#b4acf8', '#3a32a4', '#6c64d8', '#8c84e0', '#aca4f0', '#2a2294']

function DeltaBadge({ value }) {
  if (value === 0 || value === null || value === undefined) return null
  const isUp = value > 0
  return (
    <Badge tone={isUp ? 'warning' : 'success'}>
      {isUp ? '▲' : '▼'} {Math.abs(value)}%
    </Badge>
  )
}

function StatCard({ label, value, badge }) {
  return (
    <Card className="analytics-panel">
      <div className="stat-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value-row">
          <div className="stat-value">{value}</div>
          {badge && <div className="stat-badge">{badge}</div>}
        </div>
      </div>
    </Card>
  )
}

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

export default function AnalyticsPage() {
  const {
    summary, monthly, categories, categoryMonthly, analytics,
    loading, error,
    trendNarrative, categoryTrends, forecast, categoryInsights, anomalyInsights,
  } = useAnalytics()

  const validMonthly = useMemo(() => monthly.filter((m) => m.total > 0), [monthly])

  const monthlyChange = useMemo(() => {
    if (validMonthly.length < 2) return null
    const last = validMonthly[validMonthly.length - 1].total
    const prev = validMonthly[validMonthly.length - 2].total
    if (!prev) return null
    return Math.round(((last - prev) / prev) * 100)
  }, [validMonthly])

  const cumulativeData = useMemo(() => {
    let running = 0
    return monthly.map((m) => {
      running += Number(m.total)
      return { ...m, cumulative: running }
    })
  }, [monthly])

  const { stackedData, stackedCategories } = useMemo(() => {
    const months = [...new Set((categoryMonthly || []).map((cm) => cm.month))].sort()
    const catSet = [...new Set((categoryMonthly || []).map((cm) => cm.category))]
    const data = months.map((month) => {
      const monthData = (categoryMonthly || []).filter((cm) => cm.month === month)
      const obj = { month, label: formatMonthLabel(month) }
      catSet.forEach((cat) => {
        const entry = monthData.find((d) => d.category === cat)
        obj[cat] = entry ? Number(entry.total_amount) : 0
      })
      return obj
    })
    return { stackedData: data, stackedCategories: catSet }
  }, [categoryMonthly])

  const frequencyMetrics = useMemo(() => {
    const weekly = analytics?.weekly_metrics || []
    const weekdayData = analytics?.weekday_aggregates || []
    if (!weekly.length) return null

    const totalTxns = weekly.reduce((s, w) => s + w.count, 0)
    const weeks = weekly.length
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const mostActive = weekdayData.reduce((best, d) => (d.count > best.count ? d : best), weekdayData[0])
    const leastActive = weekdayData.reduce((best, d) => (d.count < best.count ? d : best), weekdayData[0])

    return {
      txnsPerWeek: weeks > 0 ? (totalTxns / weeks).toFixed(1) : '0',
      avgSize: formatCurrency(weekly.reduce((s, w) => s + w.total, 0) / (totalTxns || 1)),
      mostActiveDay: mostActive ? dayLabels[mostActive.day] : '-',
      leastActiveDay: leastActive ? dayLabels[leastActive.day] : '-',
    }
  }, [analytics])

  const avgExpense = useMemo(() => {
    if (summary?.expenseCount > 0 && Number(summary.totalExpenses) > 0) {
      return Number(summary.totalExpenses) / Number(summary.expenseCount)
    }
    return 0
  }, [summary])

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Analytics" title="Understand your spending" description="Deep-dive analytics are being prepared." />
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
        description="Detailed breakdowns of where your money goes."
      />

      {/* 1. Spending Overview */}
      <section className="analytics-section">
        <div className="stats-grid">
          <StatCard
            label="Total Spending"
            value={formatCurrency(summary?.totalExpenses)}
          />
          <StatCard
            label="Monthly Change"
            value={monthlyChange !== null ? `${Math.abs(monthlyChange)}%` : '--'}
            badge={monthlyChange !== null ? <DeltaBadge value={monthlyChange} /> : null}
          />
          <StatCard
            label="Avg Daily Spend"
            value={formatCurrency(summary?.avgPerDay)}
          />
          <StatCard
            label="Expense Count"
            value={summary?.expenseCount ?? 0}
          />
        </div>
        {trendNarrative && <p className="trend-narrative">{trendNarrative}</p>}
        <div className="sparkline-wrap">
          <ChartTrend data={monthly} height={80} />
        </div>
      </section>

      {/* 2. Spending Trends */}
      <section className="analytics-section">
        <div className="section-heading">
          <h2>Spending trends</h2>
        </div>
        <div className="analytics-grid">
          <Card className="analytics-panel">
            <div className="panel-heading"><h3>Cumulative spending</h3></div>
            <ChartArea data={cumulativeData} dataKey="cumulative" name="Total" height={240} />
          </Card>
          <Card className="analytics-panel">
            <div className="panel-heading"><h3>Category mix over time</h3></div>
            {stackedData.length ? (
              <ChartStacked data={stackedData} categories={stackedCategories} />
            ) : (
              <p className="empty-inline">No category data available yet.</p>
            )}
          </Card>
        </div>
      </section>

      {/* 3. Category Intelligence */}
      <section className="analytics-section">
        <div className="section-heading">
          <h2>Category intelligence</h2>
        </div>
        <Card className="analytics-panel">
          <div className="intel-layout">
            <ChartDonut data={categories} />
            <div className="category-intel-sidebar">
              {(categories || []).map((cat, i) => {
                const trend = categoryTrends?.[cat.category]
                return (
                  <div key={cat.category} className="category-intel-row">
                    <div className="category-intel-name">
                      <span className="category-intel-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      {cat.category}
                    </div>
                    <div className="category-intel-right">
                      {trend && trend.direction !== 'flat' && (
                        <span className={`trend-arrow category-trend-${trend.direction}`}>
                          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '◆'} {Math.abs(trend.change)}%
                        </span>
                      )}
                      <span className="category-intel-amount">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {categoryInsights.length > 0 && (
            <div className="category-insights">
              {categoryInsights.map((insight, i) => (
                <div key={i} className="category-insight-item">{insight}</div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* 4. Spending Behavior */}
      <section className="analytics-section">
        <div className="section-heading">
          <h2>Spending behavior</h2>
        </div>
        <div className="analytics-grid">
          <Card className="analytics-panel">
            <div className="panel-heading"><h3>Weekly heatmap</h3></div>
            <ChartHeatmap data={analytics?.weekday_aggregates} />
          </Card>
          <Card className="analytics-panel">
            <div className="panel-heading"><h3>Top transactions</h3></div>
            {(analytics?.largest_transactions || []).length > 0 ? (
              <div className="recent-list">
                {analytics.largest_transactions.map((txn) => (
                  <div key={txn.id} className="recent-row">
                    <div>
                      <strong>{txn.title}</strong>
                      <span>{txn.category} · {formatDate(txn.date)}</span>
                    </div>
                    <strong>{formatCurrency(txn.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-inline">No transactions recorded.</p>
            )}
            {frequencyMetrics && (
              <div className="mom-comparison" style={{ marginTop: 'var(--space-4)' }}>
                <div className="mom-row">
                  <span className="mom-label">Transactions / week</span>
                  <span className="mom-value">{frequencyMetrics.txnsPerWeek}</span>
                </div>
                <div className="mom-row">
                  <span className="mom-label">Average size</span>
                  <span className="mom-value">{frequencyMetrics.avgSize}</span>
                </div>
                <div className="mom-row">
                  <span className="mom-label">Most active day</span>
                  <span className="mom-value">{frequencyMetrics.mostActiveDay}</span>
                </div>
                <div className="mom-row">
                  <span className="mom-label">Least active day</span>
                  <span className="mom-value">{frequencyMetrics.leastActiveDay}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* 5. Forecasting */}
      <section className="analytics-section">
        <div className="section-heading">
          <h2>Spending forecast</h2>
        </div>
        {forecast ? (
          <div className="forecast-card">
            <div className="forecast-header">
              <h3>Month-end projection</h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--muted)' }}>
                Based on {forecast.daysElapsed} day{forecast.daysElapsed !== 1 ? 's' : ''} of data
              </p>
            </div>
            <div className="forecast-body">
              <div className="forecast-metric">
                <span className="forecast-metric-label">Projected total</span>
                <span className="forecast-metric-value">{formatCurrency(forecast.projected)}</span>
                <span className="forecast-metric-tag">vs {formatCurrency(forecast.lastMonthTotal)} last month</span>
              </div>
              <div className="forecast-metric">
                <span className="forecast-metric-label">Daily average</span>
                <span className="forecast-metric-value">{formatCurrency(forecast.dailyRate)}</span>
                <span className="forecast-metric-tag">{forecast.daysRemaining} day{forecast.daysRemaining !== 1 ? 's' : ''} remaining</span>
              </div>
              <div className="forecast-metric">
                <span className="forecast-metric-label">Confidence</span>
                <span className="forecast-metric-value">{forecast.confidence}</span>
                <span className="forecast-metric-tag">
                  {forecast.confidence === 'High' ? 'Sufficient data' : forecast.confidence === 'Medium' ? 'Partial data' : 'Limited data'}
                </span>
              </div>
            </div>
            <p className="forecast-narrative">
              {forecast.vsLastMonth > 0
                ? `If current pace holds, you will exceed last month by ${forecast.vsLastMonth}%.`
                : forecast.vsLastMonth < 0
                  ? `If current pace holds, you will spend ${Math.abs(forecast.vsLastMonth)}% less than last month.`
                  : 'You are on track to match last month\'s spending.'}
            </p>
          </div>
        ) : (
          <Card className="analytics-panel placeholder-panel">
            <p className="panel-copy">Add expenses this month to see your spending forecast.</p>
          </Card>
        )}
      </section>

      {/* 6. Anomaly Detection */}
      <section className="analytics-section">
        <div className="section-heading">
          <h2>Unusual activity</h2>
        </div>
        {anomalyInsights.transactions.length > 0 || anomalyInsights.categorySpikes.length > 0 ? (
          <>
            {anomalyInsights.transactions.length > 0 && (
              <div className="analytics-grid">
                {anomalyInsights.transactions.map((txn) => (
                  <div key={txn.id} className="anomaly-card">
                    <div className="anomaly-card-header">
                      <h4>{txn.title}</h4>
                      <span className="anomaly-amount">{formatCurrency(txn.amount)}</span>
                    </div>
                    <div className="anomaly-details">
                      <span>{txn.category} · {formatDate(txn.date)}</span>
                    </div>
                    <div className="anomaly-zscore">
                      {avgExpense > 0
                        ? `${Math.round(txn.amount / avgExpense)}x your average expense`
                        : `z-score: ${txn.z_score}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {anomalyInsights.categorySpikes.length > 0 && (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {anomalyInsights.categorySpikes.map((spike) => (
                  <div key={spike.category} className="anomaly-spike">
                    <h4>{spike.category} spike</h4>
                    <p>
                      {spike.category} spending is {spike.percentAbove}% above normal this month
                      ({formatCurrency(spike.current)} vs typical {formatCurrency(spike.average)})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="analytics-panel placeholder-panel">
            <p className="panel-copy">No unusual transactions detected. Your spending patterns appear consistent.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
