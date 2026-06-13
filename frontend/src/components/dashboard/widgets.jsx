import { memo } from 'react'
import { ChartBars } from '../common/ChartBars'
import { DeltaBadge } from '../common/DeltaBadge'
import { InsightCard } from '../common/InsightCard'
import { StatCard } from '../common/StatCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../lib/utils'

export const WidgetInsights = memo(function WidgetInsights({ insights }) {
  if (!insights || insights.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => (
        <InsightCard key={`${insight.type}-${insight.message}`} insight={insight} />
      ))}
    </div>
  )
})

export const WidgetMetrics = memo(function WidgetMetrics({ metrics, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  )
})

export const WidgetTrend = memo(function WidgetTrend({ monthSeries, formatCurrency, trendNarrative, DeltaBadge, metrics }) {
  return (
    <>
      {monthSeries.length >= 2 ? (
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--muted)]">This month</span>
            <span className="text-sm font-semibold text-[var(--text)]">{formatCurrency(monthSeries[monthSeries.length - 1]?.total ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[var(--muted)]">Last month</span>
            <span className="text-sm font-semibold text-[var(--text)]">{formatCurrency(monthSeries[monthSeries.length - 2]?.total ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-[var(--border)] pt-2">
            <span className="text-sm text-[var(--muted)]">Change</span>
            <DeltaBadge value={metrics.momChangePercent} />
          </div>
        </div>
      ) : null}
      <ChartBars data={monthSeries} />
      {trendNarrative && <p className="text-sm text-[var(--muted)] italic mt-3">{trendNarrative}</p>}
    </>
  )
})

export const WidgetCategoryIntelligence = memo(function WidgetCategoryIntelligence({ categories, formatCurrency }) {
  if (categories.length === 0) return <p className="text-sm text-[var(--muted)] text-center py-4">Add expenses in different categories to see your spending breakdown.</p>
  return (
    <div className="flex flex-col gap-3">
      {categories.slice(0, 5).map((row, idx) => {
        const pct = Number(row.percent ?? 0).toFixed(0)
        return (
          <div key={row.category} className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)] flex-shrink-0 mt-0.5">{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm font-semibold text-[var(--text)]">{row.category}</strong>
                <span className="text-sm font-medium text-[var(--muted)]">{formatCurrency(row.total_amount || row.total)}</span>
              </div>
              <Progress value={Number(pct)} className="h-1.5" />
              <span className="mt-1 block text-xs text-[var(--muted)]">{pct}% of spend</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export const WidgetBudgetSummary = memo(function WidgetBudgetSummary({ budgets, formatCurrency, navigate }) {
  if (budgets.length === 0) return <p className="text-sm text-[var(--muted)] text-center py-4">No budgets set. Create spending targets to track adherence.</p>
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-[var(--text)]">{budgets.length}</span>
          <span className="text-xs text-[var(--muted)]">Budgets</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-[var(--text)]">
            {budgets.filter((b) => {
              const pct = Number(b.current_spend) / Number(b.monthly_limit) * 100
              return pct >= 75 && pct < 100
            }).length}
          </span>
          <span className="text-xs text-[var(--muted)]">At risk</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl font-bold text-red-400">
            {budgets.filter((b) => Number(b.current_spend) > Number(b.monthly_limit)).length}
          </span>
          <span className="text-xs text-[var(--muted)]">Over budget</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {budgets.slice(0, 4).map((b) => {
          const pct = Number(b.current_spend) / Number(b.monthly_limit) * 100
          const status = pct > 100 ? 'danger' : pct >= 75 ? 'warning' : 'healthy'
          const statusColor = status === 'danger' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-green-400'
          return (
            <div key={b.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text)]">{b.category}</span>
                <span className={cn('text-sm', statusColor)}>
                  {formatCurrency(b.current_spend)} / {formatCurrency(b.monthly_limit)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-full rounded-full transition-all duration-300" style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: pct > 100 ? 'linear-gradient(90deg, #ef5350, #c62828)' : 'linear-gradient(90deg, var(--accent), var(--accentStrong))',
                }} />
              </div>
            </div>
          )
        })}
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate('/budgets')}>
        Manage budgets
      </Button>
    </div>
  )
})

export const WidgetGoalProgress = memo(function WidgetGoalProgress({ goals, formatCurrency, navigate }) {
  if (goals.length === 0) return <p className="text-sm text-[var(--muted)] text-center py-4">Set a savings goal to track progress toward your financial targets.</p>
  return (
    <div className="flex flex-col gap-4">
      {goals.slice(0, 4).map((goal) => {
        const current = Number(goal.current_amount || 0)
        const target = Number(goal.target_amount)
        const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
        return (
          <div key={goal.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text)]">{goal.name}</span>
              <span className="text-sm font-semibold text-[var(--muted)]">{Math.round(pct)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div className="h-full rounded-full transition-all duration-300" style={{
                width: `${pct}%`,
                background: pct >= 100 ? 'linear-gradient(90deg, #66bb6a, #2e7d32)' : 'linear-gradient(90deg, var(--accent), #42a5f5)',
              }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text)]">{formatCurrency(current)}</span>
              <span className="text-xs text-[var(--muted)]">of {formatCurrency(target)}</span>
            </div>
          </div>
        )
      })}
      <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate('/budgets')}>
        Manage goals
      </Button>
    </div>
  )
})

export const WidgetAIAssistant = memo(function WidgetAIAssistant() {
  return (
    <p className="text-sm text-[var(--muted)] leading-relaxed">
      Ask questions like: <em className="italic">&ldquo;Where did I overspend?&rdquo;</em>, <em className="italic">&ldquo;How can I save money?&rdquo;</em>, or <em className="italic">&ldquo;Compare this month with last month.&rdquo;</em>
    </p>
  )
})
