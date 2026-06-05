import { memo } from 'react'
import { ChartBars } from '../common/ChartBars'
import { DeltaBadge } from '../common/DeltaBadge'
import { InsightCard } from '../common/InsightCard'
import { StatCard } from '../common/StatCard'
import { QuickAdd } from '../QuickAdd'
import { formatCurrency } from '../../utils/format'

export const WidgetFinancialHealth = memo(function WidgetFinancialHealth({ health }) {
  return (
    <div className={`health-hero-body ${health.score === null ? 'health-pending' : ''}`}>
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
            <p className="health-score-desc">{health.recommendation}</p>
            {health.actionRecommendation && (
              <p className="health-action">{health.actionRecommendation}</p>
            )}
          </div>
        </>
      )}
      {health.metrics && (
        <div className="health-metrics">
          <div className="health-metric">
            <span className="health-metric-label">Spending</span>
            <div className="health-metric-bar">
              <div className="health-metric-fill" style={{ width: `${health.metrics.spendingScore}%`, background: health.metrics.spendingScore >= 70 ? '#66bb6a' : health.metrics.spendingScore >= 50 ? '#f7b14a' : '#ef5350' }} />
            </div>
          </div>
          {health.metrics.budgetScore !== null && (
            <div className="health-metric">
              <span className="health-metric-label">Budget</span>
              <div className="health-metric-bar">
                <div className="health-metric-fill" style={{ width: `${health.metrics.budgetScore}%`, background: health.metrics.budgetScore >= 70 ? '#66bb6a' : health.metrics.budgetScore >= 50 ? '#f7b14a' : '#ef5350' }} />
              </div>
            </div>
          )}
          {health.metrics.goalScore !== null && (
            <div className="health-metric">
              <span className="health-metric-label">Goals</span>
              <div className="health-metric-bar">
                <div className="health-metric-fill" style={{ width: `${health.metrics.goalScore}%`, background: health.metrics.goalScore >= 70 ? '#66bb6a' : health.metrics.goalScore >= 50 ? '#f7b14a' : '#ef5350' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export const WidgetInsights = memo(function WidgetInsights({ insights }) {
  if (!insights || insights.length === 0) return null
  return (
    <div className="insight-cards">
      {insights.map((insight) => (
        <InsightCard key={`${insight.type}-${insight.message}`} insight={insight} />
      ))}
    </div>
  )
})

export const WidgetMetrics = memo(function WidgetMetrics({ metrics, formatCurrency }) {
  return (
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
  )
})

export const WidgetTrend = memo(function WidgetTrend({ monthSeries, formatCurrency, trendNarrative, DeltaBadge, metrics }) {
  return (
    <>
      {monthSeries.length >= 2 ? (
        <div className="mom-comparison">
          <div className="mom-row">
            <span className="mom-label">This month</span>
            <span className="mom-value">{formatCurrency(monthSeries[monthSeries.length - 1]?.total ?? 0)}</span>
          </div>
          <div className="mom-row">
            <span className="mom-label">Last month</span>
            <span className="mom-value">{formatCurrency(monthSeries[monthSeries.length - 2]?.total ?? 0)}</span>
          </div>
          <div className="mom-row mom-change">
            <span className="mom-label">Change</span>
            <DeltaBadge value={metrics.momChangePercent} />
          </div>
        </div>
      ) : null}
      <ChartBars data={monthSeries} />
      {trendNarrative && <p className="trend-narrative">{trendNarrative}</p>}
    </>
  )
})

export const WidgetCategoryIntelligence = memo(function WidgetCategoryIntelligence({ categories, formatCurrency }) {
  if (categories.length === 0) return <p className="empty-inline">No categories yet.</p>
  return (
    <div className="category-rank">
      {categories.slice(0, 5).map((row, idx) => {
        const pct = Number(row.percent ?? 0).toFixed(0)
        return (
          <div key={row.category} className="category-rank-row">
            <span className="category-rank-num">{idx + 1}</span>
            <div className="category-rank-info">
              <div className="category-rank-header">
                <strong>{row.category}</strong>
                <span className="category-rank-amount">{formatCurrency(row.total_amount || row.total)}</span>
              </div>
              <div className="category-rank-bar-track">
                <div className="category-rank-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="category-rank-pct">{pct}% of spend</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export const WidgetBudgetSummary = memo(function WidgetBudgetSummary({ budgets, formatCurrency, navigate }) {
  if (budgets.length === 0) return <p className="empty-inline">No budgets set. Create spending targets to track adherence.</p>
  return (
    <div className="budget-summary">
      <div className="budget-summary-stats">
        <div className="budget-summary-stat">
          <span className="budget-summary-stat-value">{budgets.length}</span>
          <span className="budget-summary-stat-label">Budgets</span>
        </div>
        <div className="budget-summary-stat">
          <span className="budget-summary-stat-value">
            {budgets.filter((b) => {
              const pct = Number(b.current_spend) / Number(b.monthly_limit) * 100
              return pct >= 75 && pct < 100
            }).length}
          </span>
          <span className="budget-summary-stat-label">At risk</span>
        </div>
        <div className="budget-summary-stat">
          <span className="budget-summary-stat-value budget-danger">
            {budgets.filter((b) => Number(b.current_spend) > Number(b.monthly_limit)).length}
          </span>
          <span className="budget-summary-stat-label">Over budget</span>
        </div>
      </div>
      <div className="budget-summary-list">
        {budgets.slice(0, 4).map((b) => {
          const pct = Number(b.current_spend) / Number(b.monthly_limit) * 100
          const status = pct > 100 ? 'danger' : pct >= 75 ? 'warning' : 'healthy'
          return (
            <div key={b.id} className="budget-summary-row">
              <div className="budget-summary-row-header">
                <span className="budget-summary-cat">{b.category}</span>
                <span className={`budget-summary-amount budget-${status}`}>
                  {formatCurrency(b.current_spend)} / {formatCurrency(b.monthly_limit)}
                </span>
              </div>
              <div className="budget-bar-track">
                <div className="budget-bar-fill" style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: pct > 100 ? 'linear-gradient(90deg, #ef5350, #c62828)' : 'linear-gradient(90deg, var(--accent), var(--accentStrong))',
                }} />
              </div>
            </div>
          )
        })}
      </div>
      <button type="button" className="text-button widget-manage-btn" onClick={() => navigate('/budgets')}>
        Manage budgets
      </button>
    </div>
  )
})

export const WidgetGoalProgress = memo(function WidgetGoalProgress({ goals, formatCurrency, navigate }) {
  if (goals.length === 0) return <p className="empty-inline">No goals yet. Create financial targets to track progress.</p>
  return (
    <div className="goal-summary">
      {goals.slice(0, 4).map((goal) => {
        const current = Number(goal.current_amount || 0)
        const target = Number(goal.target_amount)
        const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
        return (
          <div key={goal.id} className="goal-summary-row">
            <div className="goal-summary-header">
              <span className="goal-summary-name">{goal.name}</span>
              <span className="goal-summary-pct">{Math.round(pct)}%</span>
            </div>
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{
                width: `${pct}%`,
                background: pct >= 100 ? 'linear-gradient(90deg, #66bb6a, #2e7d32)' : 'linear-gradient(90deg, var(--accent), #42a5f5)',
              }} />
            </div>
            <div className="goal-summary-amounts">
              <span>{formatCurrency(current)}</span>
              <span className="goal-summary-target">of {formatCurrency(target)}</span>
            </div>
          </div>
        )
      })}
      <button type="button" className="text-button widget-manage-btn" onClick={() => navigate('/budgets')}>
        Manage goals
      </button>
    </div>
  )
})

export const WidgetQuickAddBlock = memo(function WidgetQuickAddBlock({ categories, onSubmit, saving }) {
  return <QuickAdd categories={categories} onSubmit={onSubmit} saving={saving} />
})

export const WidgetAIAssistant = memo(function WidgetAIAssistant() {
  return (
    <p className="panel-copy">
      Ask questions like: <em>&ldquo;Where did I overspend?&rdquo;</em>, <em>&ldquo;How can I save money?&rdquo;</em>, or <em>&ldquo;Compare this month with last month.&rdquo;</em>
    </p>
  )
})
