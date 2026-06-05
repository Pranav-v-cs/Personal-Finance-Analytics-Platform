import { useMemo } from 'react'

export function useSpendingMetrics({ summary, monthly, recent }) {
  return useMemo(() => {
    const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
    const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)
    const avgDailySpend = Number(summary?.avgPerDay ?? summary?.avg_per_day ?? 0)
    const avgTransactionValue = expenseCount > 0 ? totalExpenses / expenseCount : 0

    let largestTransaction = null
    if (recent && recent.length > 0) {
      largestTransaction = recent.reduce((max, r) => (Number(r.amount) > Number(max.amount) ? r : max), recent[0])
    }

    let trendDirection = 'stable'
    let momChangePercent = 0
    if (monthly && monthly.length >= 2) {
      const current = Number(monthly[monthly.length - 1]?.total_amount ?? 0)
      const previous = Number(monthly[monthly.length - 2]?.total_amount ?? 0)
      if (previous > 0) {
        momChangePercent = ((current - previous) / previous) * 100
        if (momChangePercent > 5) trendDirection = 'up'
        else if (momChangePercent < -5) trendDirection = 'down'
        else trendDirection = 'stable'
      }
    }

    return {
      totalExpenses,
      expenseCount,
      avgDailySpend,
      avgTransactionValue,
      largestTransaction,
      trendDirection,
      momChangePercent,
    }
  }, [summary, monthly, recent])
}
