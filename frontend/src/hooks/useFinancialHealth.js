import { useMemo } from 'react'

export function useFinancialHealth({ summary, monthly }) {
  return useMemo(() => {
    const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
    const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)

    if (!totalExpenses || !expenseCount || !monthly || monthly.length < 2) {
      return { score: null, label: 'Insufficient data', recommendation: 'Track at least 2 months of expenses to calculate your financial health score.' }
    }

    const amounts = monthly.map((m) => Number(m.total_amount ?? 0)).filter((a) => a > 0)
    if (amounts.length < 2) {
      return { score: null, label: 'Insufficient data', recommendation: 'Track at least 2 months of expenses to calculate your financial health score.' }
    }

    const avgMonthly = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const latestAmount = amounts[amounts.length - 1]

    const budgetAdherence = Math.max(0, Math.min(100, 100 - (Math.abs(latestAmount - avgMonthly) / avgMonthly) * 100))

    let trendScore = 50
    if (amounts.length >= 2) {
      const prevAmount = amounts[amounts.length - 2]
      const change = ((latestAmount - prevAmount) / prevAmount) * 100
      if (change <= -10) trendScore = 90
      else if (change <= -5) trendScore = 75
      else if (change <= 0) trendScore = 60
      else if (change <= 10) trendScore = 40
      else if (change <= 20) trendScore = 25
      else trendScore = 10
    }

    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const variance = amounts.reduce((sum, a) => sum + (a - mean) ** 2, 0) / amounts.length
    const stdDev = Math.sqrt(variance)
    const cv = mean > 0 ? stdDev / mean : 1
    const consistencyScore = Math.max(0, Math.min(100, 100 - cv * 50))

    const score = Math.round(budgetAdherence * 0.4 + trendScore * 0.3 + consistencyScore * 0.3)

    let label, recommendation
    if (score >= 80) {
      label = 'Healthy'
      recommendation = 'Your spending patterns are well balanced. Keep it up!'
    } else if (score >= 60) {
      label = 'On Track'
      recommendation = 'You are managing your finances well. Look for small improvements.'
    } else if (score >= 40) {
      label = 'Watch Out'
      recommendation = 'Consider reviewing your budget and reducing discretionary spending.'
    } else {
      label = 'Needs Attention'
      recommendation = 'Your spending patterns need improvement. Try creating a budget plan.'
    }

    return { score, label, recommendation }
  }, [summary, monthly])
}
