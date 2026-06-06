import { describe, it, expect } from 'vitest'

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

describe('computeScore', () => {
  it('returns null for fewer than 2 amounts', () => {
    expect(computeScore([])).toBeNull()
    expect(computeScore([100])).toBeNull()
  })

  it('calculates budget adherence based on latest vs average', () => {
    const result = computeScore([1000, 1000, 1000])
    expect(result.budgetAdherence).toBe(100)
  })

  it('gives high trend score when spending drops significantly', () => {
    const result = computeScore([1000, 800])
    expect(result.trendScore).toBe(90)
  })

  it('gives low trend score when spending increases significantly', () => {
    const result = computeScore([1000, 1200])
    expect(result.trendScore).toBe(25)
  })

  it('returns consistency score between 0-100', () => {
    const result = computeScore([1000, 1100, 900, 1200])
    expect(result.consistencyScore).toBeGreaterThanOrEqual(0)
    expect(result.consistencyScore).toBeLessThanOrEqual(100)
  })

  it('perfect consistency when all amounts equal', () => {
    const result = computeScore([1000, 1000, 1000, 1000])
    expect(result.consistencyScore).toBe(100)
  })
})

describe('computeBudgetScore', () => {
  it('returns null for empty budgets', () => {
    expect(computeBudgetScore([])).toBeNull()
    expect(computeBudgetScore(null)).toBeNull()
    expect(computeBudgetScore(undefined)).toBeNull()
  })

  it('scores 100 when all budgets under 50%', () => {
    const budgets = [
      { current_spend: 100, monthly_limit: 500 },
      { current_spend: 200, monthly_limit: 1000 },
    ]
    expect(computeBudgetScore(budgets)).toBe(100)
  })

  it('scores lower when budgets are near limit (91% utilization)', () => {
    const budgets = [
      { current_spend: 455, monthly_limit: 500 },
    ]
    expect(computeBudgetScore(budgets)).toBe(40)
  })

  it('penalizes over-budget categories', () => {
    const budgets = [
      { current_spend: 600, monthly_limit: 500 },
    ]
    expect(computeBudgetScore(budgets)).toBeLessThan(40)
  })
})

describe('computeGoalScore', () => {
  it('returns null for empty goals', () => {
    expect(computeGoalScore([])).toBeNull()
    expect(computeGoalScore(null)).toBeNull()
  })

  it('returns 100 for completed goals', () => {
    const goals = [
      { current_amount: 1000, target_amount: 1000 },
    ]
    expect(computeGoalScore(goals)).toBe(100)
  })

  it('returns 50 for half-completed goals', () => {
    const goals = [
      { current_amount: 500, target_amount: 1000 },
    ]
    expect(computeGoalScore(goals)).toBe(50)
  })

  it('averages multiple goals', () => {
    const goals = [
      { current_amount: 1000, target_amount: 1000 },
      { current_amount: 0, target_amount: 1000 },
    ]
    expect(computeGoalScore(goals)).toBe(50)
  })
})

describe('getLabel', () => {
  it('returns Healthy for score >= 80', () => {
    expect(getLabel(80)).toBe('Healthy')
    expect(getLabel(100)).toBe('Healthy')
  })

  it('returns On Track for score 60-79', () => {
    expect(getLabel(60)).toBe('On Track')
    expect(getLabel(75)).toBe('On Track')
  })

  it('returns Watch Out for score 40-59', () => {
    expect(getLabel(40)).toBe('Watch Out')
    expect(getLabel(59)).toBe('Watch Out')
  })

  it('returns Needs Attention for score < 40', () => {
    expect(getLabel(0)).toBe('Needs Attention')
    expect(getLabel(39)).toBe('Needs Attention')
  })
})

describe('getRecommendation', () => {
  it('positive message for high score', () => {
    const result = getRecommendation(85, null, 0, [], [], [], null, null)
    expect(result).toContain('well balanced')
  })

  it('flags over-budget categories when budgetScore < 70 and score >= 60', () => {
    const budgets = [
      { category: 'Food', current_spend: 600, monthly_limit: 500 },
    ]
    const result = getRecommendation(65, null, 0, [], budgets, [], 50, null)
    expect(result).toContain('over budget')
    expect(result).toContain('Food')
  })

  it('suggests goal improvement when goalScore < 50 and score >= 60', () => {
    const result = getRecommendation(65, null, 0, [], [], [], 80, 40)
    expect(result).toContain('goals need attention')
  })

  it('suggests top category reduction when >35%', () => {
    const topCategory = { category: 'Food', percent: 40 }
    const result = getRecommendation(65, topCategory, 0, [], [], [], 80, 60)
    expect(result).toContain('Reducing Food')
  })

  it('warns about spending increase when momChangePercent > 5 for score >= 40', () => {
    const result = getRecommendation(45, null, 15, [], [], [], 60, null)
    expect(result).toContain('up 15%')
  })

  it('warns about spending surge when momChangePercent > 10 for score < 40', () => {
    const result = getRecommendation(30, null, 20, [], [], [], null, null)
    expect(result).toContain('surged')
  })

  it('general improvement message for low score without triggers', () => {
    const result = getRecommendation(30, null, 5, [], [], [], null, null)
    expect(result).toContain('improvement')
  })
})
