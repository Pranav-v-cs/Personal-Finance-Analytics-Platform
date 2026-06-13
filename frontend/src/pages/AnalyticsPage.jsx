import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { PageContainer } from '../components/layout/PageContainer'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { InlineError } from '../components/common/InlineError'
import { Skeleton, SkeletonLine } from '../components/ui/Skeleton'
import { useAnalytics } from '../hooks/useAnalytics'
import { useAIExplain } from '../hooks/useAIExplain'
import { useAuth } from '../hooks/useAuth'
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
    <Badge variant={isUp ? 'warning' : 'success'}>
      {isUp ? '▲' : '▼'} {Math.abs(value)}%
    </Badge>
  )
}

function StatCard({ label, value, badge }) {
  return (
    <Card>
      <div>
        <div className="text-sm text-[var(--muted)] font-medium">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-[clamp(1.3rem,2.5vw,1.85rem)] font-extrabold tracking-tight">{value}</div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
      </div>
    </Card>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SkeletonLine className="w-40" />
          <Skeleton className="h-[200px]" />

          <Skeleton className="h-[200px]" />
        </Card>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const {
    summary, monthly, categories, categoryMonthly, analytics,
    loading, error,
    trendNarrative, categoryTrends, forecast, categoryInsights, anomalyInsights,
  } = useAnalytics()
  const data = useMemo(() => ({ summary, monthly, categories, analytics, forecast, categoryTrends, categoryInsights, anomalyInsights }), [
    summary, monthly, categories, analytics, forecast, categoryTrends, categoryInsights, anomalyInsights,
  ])

  const {
    explanation, explaining, explainError,
    explainForecast, explainAnomaly, clearExplanation,
  } = useAIExplain(data)

  const [explainingId, setExplainingId] = useState(null)

  const validMonthly = useMemo(() => monthly.filter((m) => m.total > 0), [monthly])

  const monthlyChange = useMemo(() => {
    if (validMonthly.length < 2) return null
    const last = validMonthly[validMonthly.length - 1].total
    const prev = validMonthly[validMonthly.length - 2].total
    if (!prev) return null
    return Math.round(((last - prev) / prev) * 100)
  }, [validMonthly])

  const cumulativeData = useMemo(() => {
    const result = []
    let running = 0
    for (let i = 0; i < monthly.length; i++) {
      running += Number(monthly[i].total)
      result.push({ ...monthly[i], cumulative: running })
    }
    return result
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
      <PageContainer>
        <PageHeader eyebrow="Analytics" title="Understand your spending" description="Deep-dive analytics are being prepared." />
        <AnalyticsSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Analytics" title="Understand your spending" description="Detailed breakdowns of where your money goes." />
        <InlineError message={error} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Analytics"
        title="Understand your spending"
        description="Detailed breakdowns of where your money goes."
      />

      {/* 1. Spending Overview */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Spending overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        {trendNarrative && <p className="text-sm text-[var(--muted)] italic">{trendNarrative}</p>}
        <div className="mt-2">
          <ChartTrend data={monthly} height={80} currency={user?.currency} />
        </div>
      </section>

      {/* 2. Spending Trends */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Spending trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartArea data={cumulativeData} dataKey="cumulative" name="Total" height={240} currency={user?.currency} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Category mix over time</CardTitle>
            </CardHeader>
            <CardContent>
            {stackedData.length ? (
              <ChartStacked data={stackedData} categories={stackedCategories} currency={user?.currency} />
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-8">Add expenses in different categories to see how your spending breaks down over time.</p>
            )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Category Intelligence */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Category intelligence</h2>
        <Card>
          <CardHeader>
            <CardTitle>Category breakdown & insights</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartDonut data={categories} />
            <div className="flex flex-col gap-1">
              {(categories || []).map((cat, i) => {
                const trend = categoryTrends?.[cat.category]
                return (
                  <div key={cat.category} className="flex items-center justify-between text-sm py-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      {cat.category}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {trend && trend.direction !== 'flat' && (
                        <span className={`text-xs category-trend-${trend.direction}`}>
                          {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '◆'} {Math.abs(trend.change)}%
                        </span>
                      )}
                      <span className="font-semibold font-mono tabular-nums">{formatCurrency(cat.total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {categoryInsights.length > 0 && (
            <div className="flex flex-col gap-1 mt-4">
              {categoryInsights.map((insight, i) => (
                <div key={i} className="text-xs text-[var(--muted)]">{insight}</div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </section>

      {/* 4. Spending Behavior */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Spending behavior</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartHeatmap data={analytics?.weekday_aggregates} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top transactions</CardTitle>
            </CardHeader>
            <CardContent>
            {(analytics?.largest_transactions || []).length > 0 ? (
              <div className="flex flex-col gap-2">
                {analytics.largest_transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex flex-col min-w-0">
                      <strong className="truncate">{txn.title}</strong>
                      <span className="text-[var(--muted)]">{txn.category} · {formatDate(txn.date)}</span>
                    </div>
                    <strong className="flex-shrink-0">{formatCurrency(txn.amount)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-8">No transactions recorded.</p>
            )}
            {frequencyMetrics && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Transactions / week</span>
                  <span className="font-semibold">{frequencyMetrics.txnsPerWeek}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Average size</span>
                  <span className="font-semibold">{frequencyMetrics.avgSize}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Most active day</span>
                  <span className="font-semibold">{frequencyMetrics.mostActiveDay}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">Least active day</span>
                  <span className="font-semibold">{frequencyMetrics.leastActiveDay}</span>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Forecasting */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Spending forecast</h2>
        {forecast ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-0.5">
                <CardTitle>Month-end projection</CardTitle>
                <p className="text-xs text-[var(--muted)]">
                  Based on {forecast.daysElapsed} day{forecast.daysElapsed !== 1 ? 's' : ''} of data
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { clearExplanation(); setExplainingId('forecast'); explainForecast(forecast) }} disabled={explaining && explainingId === 'forecast'}>
                {explaining && explainingId === 'forecast' ? 'Explaining...' : 'Explain'}
              </Button>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)]">Projected total</span>
                <span className="text-lg font-extrabold tracking-tight">{formatCurrency(forecast.projected)}</span>
                <span className="text-xs text-[var(--muted)]">vs {formatCurrency(forecast.lastMonthTotal)} last month</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)]">Daily average</span>
                <span className="text-lg font-extrabold tracking-tight">{formatCurrency(forecast.dailyRate)}</span>
                <span className="text-xs text-[var(--muted)]">{forecast.daysRemaining} day{forecast.daysRemaining !== 1 ? 's' : ''} remaining</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[var(--muted)]">Confidence</span>
                <span className="text-lg font-extrabold tracking-tight">{forecast.confidence}</span>
                <span className="text-xs text-[var(--muted)]">
                  {forecast.confidence === 'High' ? 'Sufficient data' : forecast.confidence === 'Medium' ? 'Partial data' : 'Limited data'}
                </span>
              </div>
            </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-[var(--muted)]">
                {forecast.vsLastMonth > 0
                  ? `If current pace holds, you will exceed last month by ${forecast.vsLastMonth}%.`
                  : forecast.vsLastMonth < 0
                    ? `If current pace holds, you will spend ${Math.abs(forecast.vsLastMonth)}% less than last month.`
                    : 'You are on track to match last month\'s spending.'}
              </p>
            </CardFooter>
            {explanation && explainingId === 'forecast' && (
              <CardContent className="border-t border-[var(--border)]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--muted)]">{explanation}</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => { clearExplanation(); setExplainingId(null) }}>Clear</Button>
              </CardContent>
            )}
            {explainError && explainingId === 'forecast' && <CardContent><InlineError message={explainError} /></CardContent>}
          </Card>
        ) : (
          <Card>
            <CardContent>
              <p className="text-sm text-[var(--muted)] text-center py-8">Add expenses this month to see your spending forecast.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 6. Anomaly Detection */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-extrabold tracking-tight">Unusual activity</h2>
        {anomalyInsights.transactions.length > 0 || anomalyInsights.categorySpikes.length > 0 ? (
          <>
            {anomalyInsights.transactions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {anomalyInsights.transactions.map((txn) => (
                  <Card key={txn.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{txn.title}</CardTitle>
                        <span className="text-lg font-extrabold font-mono">{formatCurrency(txn.amount)}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <span>{txn.category}</span>
                        <span>·</span>
                        <span>{formatDate(txn.date)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[var(--accent)] font-semibold">
                          {avgExpense > 0
                            ? `${Math.round(txn.amount / avgExpense)}x your average expense`
                            : `z-score: ${txn.z_score}`}
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs h-auto py-0.5" onClick={() => { clearExplanation(); setExplainingId(`anomaly-${txn.id}`); explainAnomaly(txn, avgExpense) }} disabled={explaining && explainingId === `anomaly-${txn.id}`}>
                          {explaining && explainingId === `anomaly-${txn.id}` ? 'Explaining...' : 'Explain'}
                        </Button>
                      </div>
                      {explanation && explainingId === `anomaly-${txn.id}` && (
                        <div className="mt-2 pt-2 border-t border-[var(--border)]">
                          <p className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--muted)]">{explanation}</p>
                        </div>
                      )}
                      {explainError && explainingId === `anomaly-${txn.id}` && <div className="mt-2"><InlineError message={explainError} /></div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {anomalyInsights.categorySpikes.length > 0 && (
              <div className="flex flex-col gap-3">
                {anomalyInsights.categorySpikes.map((spike) => (
                  <Card key={spike.category}>
                    <CardHeader>
                      <CardTitle className="text-base">{spike.category} spike</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[var(--muted)]">
                        {spike.category} spending is <strong className="text-[var(--accent)]">{spike.percentAbove}%</strong> above normal this month
                        ({formatCurrency(spike.current)} vs typical {formatCurrency(spike.average)})
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent>
              <p className="text-sm text-[var(--muted)] text-center py-8">No unusual transactions detected. Your spending patterns appear consistent.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
    </PageContainer>
  )
}
