export function buildFinancialContext({
  summary,
  monthly,
  categories,
  budgets,
  goals,
  analytics,
  forecast,
  categoryTrends,
  categoryInsights,
  anomalyInsights,
}) {
  const context = {}

  if (summary) {
    context.summary = {
      totalExpenses: summary.totalExpenses || summary.total_expenses,
      expenseCount: summary.expenseCount || summary.expense_count,
      avgPerDay: summary.avgPerDay || summary.avg_per_day,
      topCategory: summary.topCategory || summary.top_category,
    }
  }

  if (monthly && monthly.length > 0) {
    const amounts = monthly.filter((m) => Number(m.total) > 0).map((m) => Number(m.total))
    const labels = monthly.filter((m) => Number(m.total) > 0).map((m) => m.label)
    context.spendingTrend = {
      months: labels.slice(-6),
      amounts: amounts.slice(-6),
      trendDirection: amounts.length >= 2
        ? amounts[amounts.length - 1] > amounts[amounts.length - 2] ? 'increasing' : 'decreasing'
        : 'stable',
      momChange: amounts.length >= 2
        ? Math.round(((amounts[amounts.length - 1] - amounts[amounts.length - 2]) / amounts[amounts.length - 2]) * 100)
        : 0,
    }
  }

  if (categories && categories.length > 0) {
    context.categoryBreakdown = categories.map((c) => ({
      name: c.category || c.name,
      total: c.total || c.amount,
      percentage: c.percentage || c.percent,
    }))
  }

  if (budgets && budgets.length > 0) {
    context.budgets = budgets.map((b) => ({
      category: b.category,
      limit: Number(b.monthly_limit),
      spent: Number(b.current_spend || 0),
      utilization: Number(b.monthly_limit) > 0
        ? Math.round((Number(b.current_spend || 0) / Number(b.monthly_limit)) * 100)
        : 0,
    }))
    const atRisk = context.budgets.filter((b) => b.utilization >= 75 && b.utilization <= 100)
    const over = context.budgets.filter((b) => b.utilization > 100)
    context.budgetSummary = {
      total: context.budgets.length,
      atRisk: atRisk.length,
      over: over.length,
    }
  }

  if (goals && goals.length > 0) {
    context.goals = goals.map((g) => ({
      name: g.name,
      current: Number(g.current_amount || 0),
      target: Number(g.target_amount),
      progress: Number(g.target_amount) > 0
        ? Math.round((Number(g.current_amount || 0) / Number(g.target_amount)) * 100)
        : 0,
      targetDate: g.target_date,
    }))
  }

  if (forecast) {
    context.forecast = {
      projected: forecast.projected,
      dailyRate: forecast.dailyRate || forecast.daily_rate,
      daysRemaining: forecast.daysRemaining || forecast.days_remaining,
      vsLastMonth: forecast.vsLastMonth || forecast.vs_last_month,
      confidence: forecast.confidence,
    }
  }

  if (anomalyInsights) {
    context.anomalies = {
      transactionCount: (anomalyInsights.transactions || []).length,
      spikeCount: (anomalyInsights.categorySpikes || []).length,
      spikes: (anomalyInsights.categorySpikes || []).map((s) => ({
        category: s.category,
        percentAbove: s.percentAbove || s.percent_above,
      })),
    }
  }

  if (categoryInsights && categoryInsights.length > 0) {
    context.insights = categoryInsights
  }

  if (analytics) {
    context.analytics = {
      weeklyMetrics: analytics.weekly_metrics,
      weekdayAggregates: analytics.weekday_aggregates,
    }
  }

  if (categoryTrends) {
    context.categoryTrends = Object.entries(categoryTrends).map(([name, data]) => ({
      name,
      direction: data.direction,
      change: data.change,
    }))
  }

  return context
}
