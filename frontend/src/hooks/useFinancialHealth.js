import { useMemo } from 'react'

function computeScore(amounts) {
  if (amounts.length < 2) return null

  const avgMonthly = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
  const latestAmount = amounts[amounts.length - 1]

  const budgetAdherence = Math.max(0, Math.min(100, 100 - (Math.abs(latestAmount - avgMonthly) / avgMonthly) * 100))

  let trendScore = 50
  const prevAmount = amounts[amounts.length - 2]
  const change = ((latestAmount - prevAmount) / prevAmount) * 100
  if (change <= -10) trendScore = 90
  else if (change <= -5) trendScore = 75
  else if (change <= 0) trendScore = 60
  else if (change <= 10) trendScore = 40
  else if (change <= 20) trendScore = 25
  else trendScore = 10

  const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
  const variance = amounts.reduce((sum, a) => sum + (a - mean) ** 2, 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  const cv = mean > 0 ? stdDev / mean : 1
  const consistencyScore = Math.max(0, Math.min(100, 100 - cv * 50))

  return Math.round(budgetAdherence * 0.4 + trendScore * 0.3 + consistencyScore * 0.3)
}

function getLabel(score) {
  if (score >= 80) return 'Healthy'
  if (score >= 60) return 'On Track'
  if (score >= 40) return 'Watch Out'
  return 'Needs Attention'
}

function getRecommendation(score, topCategory, momChangePercent, amounts) {
  if (score >= 80) {
    return 'Your spending patterns are well balanced. Keep it up!'
  }
  if (score >= 60) {
    if (topCategory && topCategory.percent > 35) {
      return `Reducing ${topCategory.category} by 8% could help push your score above 80.`
    }
    return 'You are managing your finances well. Try keeping monthly spending consistent.'
  }
  if (score >= 40) {
    if (momChangePercent > 5) {
      return `Spending is up ${Math.abs(momChangePercent).toFixed(0)}% this month. Review discretionary categories to reverse the trend.`
    }
    if (topCategory) {
      return `Consider setting a budget for ${topCategory.category} to reduce volatility.`
    }
    return 'Consider reviewing your budget and reducing discretionary spending.'
  }
  if (momChangePercent > 10) {
    return `Spending surged ${Math.abs(momChangePercent).toFixed(0)}% this month. Identify the largest increases and set limits.`
  }
  return 'Your spending patterns need improvement. Focus on reducing top category expenses.'
}

export function useFinancialHealth({ summary, monthly }) {
  return useMemo(() => {
    const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
    const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)

    if (!totalExpenses || !expenseCount || !monthly || monthly.length < 2) {
      return {
        score: null,
        label: 'Insufficient data',
        recommendation: 'Track at least 2 months of expenses to calculate your financial health score.',
        scoreChange: null,
        actionRecommendation: 'Add more expenses across multiple months to unlock your health score.',
      }
    }

    const amounts = monthly.map((m) => Number(m.total_amount ?? 0)).filter((a) => a > 0)
    if (amounts.length < 2) {
      return {
        score: null,
        label: 'Insufficient data',
        recommendation: 'Track at least 2 months of expenses to calculate your financial health score.',
        scoreChange: null,
        actionRecommendation: 'Add more expenses across multiple months to unlock your health score.',
      }
    }

    const score = computeScore(amounts)
    const prevAmounts = amounts.slice(0, -1)
    const prevScore = prevAmounts.length >= 2 ? computeScore(prevAmounts) : null
    const scoreChange = prevScore !== null ? score - prevScore : null

    const label = getLabel(score)

    let momChangePercent = 0
    if (amounts.length >= 2) {
      momChangePercent = ((amounts[amounts.length - 1] - amounts[amounts.length - 2]) / amounts[amounts.length - 2]) * 100
    }

    const topCategory = summary?.topCategory || summary?.top_category || null
    const recommendation = getRecommendation(score, topCategory, momChangePercent, amounts)

    let actionRecommendation = ''
    if (topCategory && topCategory.percent > 35) {
      const targetReduction = Math.max(5, Math.min(20, Math.round((topCategory.percent - 30) / 2)))
      actionRecommendation = `Reduce ${topCategory.category} by ${targetReduction}% to reach a score above ${Math.min(100, score + 15)}.`
    } else if (momChangePercent > 5) {
      actionRecommendation = `Reverse the ${Math.abs(momChangePercent).toFixed(0)}% spending increase to stabilize your score.`
    } else if (score >= 80) {
      actionRecommendation = 'Maintain your current spending pattern to keep a healthy score.'
    } else {
      actionRecommendation = 'Keep monthly spending consistent to improve stability.'
    }

    return { score, label, recommendation, scoreChange, actionRecommendation }
  }, [summary, monthly])
}
