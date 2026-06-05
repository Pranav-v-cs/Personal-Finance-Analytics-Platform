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

  return { budgetAdherence, trendScore, consistencyScore }
}

function computeBudgetScore(budgets) {
  if (!budgets || budgets.length === 0) return null
  let total = 0
  budgets.forEach((b) => {
    const spent = Number(b.current_spend ?? 0)
    const limit = Number(b.monthly_limit)
    if (!limit) return
    const pct = spent / limit
    if (pct <= 0.5) total += 100
    else if (pct <= 0.75) total += 80
    else if (pct <= 0.9) total += 60
    else if (pct <= 1) total += 40
    else total += Math.max(0, 40 - (pct - 1) * 100)
  })
  return Math.round(total / budgets.length)
}

function computeGoalScore(goals) {
  if (!goals || goals.length === 0) return null
  let total = 0
  goals.forEach((g) => {
    const current = Number(g.current_amount ?? 0)
    const target = Number(g.target_amount)
    if (!target) return
    const pct = current / target
    total += Math.min(100, pct * 100)
  })
  return Math.round(total / goals.length)
}

function getLabel(score) {
  if (score >= 80) return 'Healthy'
  if (score >= 60) return 'On Track'
  if (score >= 40) return 'Watch Out'
  return 'Needs Attention'
}

function getRecommendation(score, topCategory, momChangePercent, amounts, budgets, goals, budgetScore, goalScore) {
  if (score >= 80) {
    return 'Your spending patterns, budgets, and goals are well balanced. Keep it up!'
  }
  if (score >= 60) {
    if (budgetScore !== null && budgetScore < 70) {
      const over = (budgets || []).filter((b) => Number(b.current_spend ?? 0) > Number(b.monthly_limit))
      if (over.length > 0) {
        const names = over.map((b) => b.category).join(', ')
        return `You are over budget on ${names}. Review these categories to push your score higher.`
      }
    }
    if (goalScore !== null && goalScore < 50) {
      return 'Your goals need attention. Try increasing contributions to stay on track.'
    }
    if (topCategory && topCategory.percent > 35) {
      return `Reducing ${topCategory.category} by 8% could help push your score above 80.`
    }
    return 'You are managing your finances well. Try keeping monthly spending consistent.'
  }
  if (score >= 40) {
    if (budgetScore !== null && budgetScore < 50) {
      return 'Several budgets are being exceeded. Consider increasing limits or cutting back on variable expenses.'
    }
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
  return 'Your spending patterns need improvement. Focus on reducing top category expenses and setting realistic budgets.'
}

export function useFinancialHealth({ summary, monthly, budgets, goals }) {
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
        metrics: null,
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
        metrics: null,
      }
    }

    const { budgetAdherence, trendScore, consistencyScore } = computeScore(amounts)
    const budgetScore = computeBudgetScore(budgets)
    const goalScore = computeGoalScore(goals)

    const weightSpending = 0.30
    const weightTrend = 0.20
    const weightConsistency = 0.20
    const weightBudget = budgetScore !== null ? 0.15 : 0
    const weightGoal = goalScore !== null ? 0.15 : 0
    const totalWeight = weightSpending + weightTrend + weightConsistency + weightBudget + weightGoal

    const score = Math.round(
      (budgetAdherence * weightSpending +
        trendScore * weightTrend +
        consistencyScore * weightConsistency +
        (budgetScore ?? 0) * weightBudget +
        (goalScore ?? 0) * weightGoal) / totalWeight
    )

    const prevAmounts = amounts.slice(0, -1)
    const prevComponents = prevAmounts.length >= 2 ? computeScore(prevAmounts) : null
    let prevScore = null
    if (prevComponents) {
      prevScore = Math.round(
        (prevComponents.budgetAdherence * weightSpending +
          prevComponents.trendScore * weightTrend +
          prevComponents.consistencyScore * weightConsistency +
          (budgetScore ?? 0) * weightBudget +
          (goalScore ?? 0) * weightGoal) / totalWeight
      )
    }
    const scoreChange = prevScore !== null ? score - prevScore : null

    const label = getLabel(score)

    let momChangePercent = 0
    if (amounts.length >= 2) {
      momChangePercent = ((amounts[amounts.length - 1] - amounts[amounts.length - 2]) / amounts[amounts.length - 2]) * 100
    }

    const topCategory = summary?.topCategory || summary?.top_category || null
    const recommendation = getRecommendation(score, topCategory, momChangePercent, amounts, budgets, goals, budgetScore, goalScore)

    let actionRecommendation = ''
    if (topCategory && topCategory.percent > 35) {
      const targetReduction = Math.max(5, Math.min(20, Math.round((topCategory.percent - 30) / 2)))
      actionRecommendation = `Reduce ${topCategory.category} by ${targetReduction}% to reach a score above ${Math.min(100, score + 15)}.`
    } else if (momChangePercent > 5) {
      actionRecommendation = `Reverse the ${Math.abs(momChangePercent).toFixed(0)}% spending increase to stabilize your score.`
    } else if (budgetScore !== null && budgetScore < 70) {
      actionRecommendation = 'Set more realistic budget limits to improve your score.'
    } else if (goalScore !== null && goalScore < 50) {
      actionRecommendation = 'Increase contributions to your goals to boost your financial health score.'
    } else if (score >= 80) {
      actionRecommendation = 'Maintain your current spending, budget, and goal habits to keep a healthy score.'
    } else {
      actionRecommendation = 'Keep monthly spending consistent to improve stability.'
    }

    const metrics = { budgetScore, goalScore, spendingScore: budgetAdherence }

    return { score, label, recommendation, scoreChange, actionRecommendation, metrics }
  }, [summary, monthly, budgets, goals])
}
