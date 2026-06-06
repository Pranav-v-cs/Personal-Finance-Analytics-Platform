import { describe, it, expect } from 'vitest'

function computeTrendNarrative(monthly) {
  const values = monthly.map((m) => m.total).filter((v) => v > 0)
  if (values.length < 3) return 'Add more expenses to see spending trends.'

  const recent = values.slice(-3)
  const previous = values.slice(-6, -3)
  if (previous.length < 2) return 'Keep tracking to reveal your spending patterns.'

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const prevAvg = previous.reduce((a, b) => a + b, 0) / previous.length
  const change = ((recentAvg - prevAvg) / prevAvg) * 100

  let direction = 'remained steady'
  let degree = ''
  if (change > 15) { direction = 'increased significantly'; degree = 'significantly' }
  else if (change > 5) { direction = 'increased'; degree = 'moderately' }
  else if (change > 0) { direction = 'increased slightly'; degree = 'slightly' }
  else if (change < -15) { direction = 'decreased significantly'; degree = 'significantly' }
  else if (change < -5) { direction = 'decreased'; degree = 'moderately' }
  else if (change < 0) { direction = 'decreased slightly'; degree = 'slightly' }

  const absChange = Math.abs(change).toFixed(0)
  return `Spending has ${direction} over the last 3 months (${degree ? `${degree} ` : ''}${absChange}% vs the previous period).`
}

function computeForecast(monthly, summary) {
  if (!monthly?.length || !summary) return null

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

  const currentMonthData = monthly.find((m) => m.month === currentMonthStr)
  if (!currentMonthData) return null

  const currentTotal = currentMonthData.total
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const daysElapsed = dayOfMonth
  const daysRemaining = daysInMonth - dayOfMonth

  if (daysElapsed === 0) return null

  const dailyRate = currentTotal / daysElapsed
  const projected = currentTotal + dailyRate * daysRemaining

  const lastMonthStr = monthly.length >= 2 ? monthly[monthly.length - 2]?.month : null
  const lastMonthTotal = lastMonthStr ? monthly.find((m) => m.month === lastMonthStr)?.total || 0 : 0

  const vsLastMonth = lastMonthTotal > 0 ? ((projected - lastMonthTotal) / lastMonthTotal) * 100 : 0

  let confidence = 'Low'
  if (daysElapsed >= 7) confidence = 'High'
  else if (daysElapsed >= 3) confidence = 'Medium'

  return {
    projected: Math.round(projected * 100) / 100,
    dailyRate: Math.round(dailyRate * 100) / 100,
    daysRemaining,
    vsLastMonth: Math.round(vsLastMonth),
    lastMonthTotal,
    confidence,
    daysElapsed,
  }
}

function computeCategoryTrends(categoryMonthly, monthly) {
  if (!categoryMonthly?.length || !monthly?.length) return {}

  const months = monthly.filter((m) => m.total > 0).map((m) => m.month)
  if (months.length < 1) return {}

  const currentMonth = months[months.length - 1]
  const prevMonth = months.length > 1 ? months[months.length - 2] : null

  const currentByCat = categoryMonthly
    .filter((cm) => cm.month === currentMonth)
    .reduce((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

  if (!prevMonth) {
    return Object.fromEntries(
      Object.entries(currentByCat).map(([cat]) => [cat, { direction: 'new', change: 0 }])
    )
  }

  const prevByCat = categoryMonthly
    .filter((cm) => cm.month === prevMonth)
    .reduce((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

  const allCats = new Set([...Object.keys(currentByCat), ...Object.keys(prevByCat)])
  const trends = {}
  for (const cat of allCats) {
    const curr = currentByCat[cat] || 0
    const prev = prevByCat[cat] || 0
    if (prev === 0 && curr > 0) {
      trends[cat] = { direction: 'new', change: 100, current: curr }
    } else if (curr === 0 && prev > 0) {
      trends[cat] = { direction: 'down', change: -100, current: 0 }
    } else {
      const change = ((curr - prev) / prev) * 100
      trends[cat] = {
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
        change: Math.round(change),
        current: curr,
      }
    }
  }
  return trends
}

function computeCategoryInsights(categories, categoryTrends) {
  if (!categories?.length) return []

  const insights = []
  const top = categories[0]
  if (top) {
    insights.push(`${top.category} remains your dominant category at ${top.percent}% of total spending.`)
  }
  if (categories.length > 1) {
    const bottom = categories[categories.length - 1]
    insights.push(`${bottom.category} accounts for only ${bottom.percent}% — your smallest spending area.`)
  }

  const rising = Object.entries(categoryTrends || {})
    .filter(([, t]) => t.direction === 'up' && t.change > 0)
    .sort(([, a], [, b]) => b.change - a.change)
    .slice(0, 2)

  if (rising.length > 0) {
    rising.forEach(([cat, t]) => {
      insights.push(`${cat} spending is up ${t.change}% this month.`)
    })
  }

  const falling = Object.entries(categoryTrends || {})
    .filter(([, t]) => t.direction === 'down' && t.change < 0)
    .sort(([, a], [, b]) => a.change - b.change)
    .slice(0, 2)

  if (falling.length > 0) {
    falling.forEach(([cat, t]) => {
      insights.push(`${cat} spending dropped ${Math.abs(t.change)}% this month.`)
    })
  }

  return insights.slice(0, 4)
}

function computeAnomalyInsights(anomalyCandidates, categoryMonthly) {
  if (!anomalyCandidates?.length) return { transactions: [], categorySpikes: [] }

  const transactions = anomalyCandidates.filter((a) => Math.abs(a.z_score) >= 2.5).slice(0, 3)
  const categorySpikes = []

  if (categoryMonthly?.length) {
    const months = [...new Set(categoryMonthly.map((cm) => cm.month))].sort()
    const currentMonth = months[months.length - 1]
    if (currentMonth) {
      const currentByCat = categoryMonthly
        .filter((cm) => cm.month === currentMonth)
        .reduce((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

      const historicalByCat = categoryMonthly
        .filter((cm) => cm.month !== currentMonth)
        .reduce((acc, cm) => {
          const cat = cm.category
          const amount = Number(cm.total_amount)
          if (!acc[cat]) acc[cat] = []
          acc[cat].push(amount)
          return acc
        }, {})

      for (const [cat, amount] of Object.entries(currentByCat)) {
        const historical = historicalByCat[cat]
        if (historical?.length) {
          const avg = historical.reduce((a, b) => a + b, 0) / historical.length
          if (avg > 0 && amount / avg >= 1.5) {
            categorySpikes.push({
              category: cat,
              current: amount,
              average: Math.round(avg * 100) / 100,
              percentAbove: Math.round(((amount / avg) - 1) * 100),
            })
          }
        }
      }
    }
  }

  return { transactions: transactions.slice(0, 3), categorySpikes: categorySpikes.slice(0, 3) }
}

describe('computeTrendNarrative', () => {
  it('returns placeholder for fewer than 3 months', () => {
    const monthly = [{ total: 100 }, { total: 200 }]
    expect(computeTrendNarrative(monthly)).toBe('Add more expenses to see spending trends.')
  })

  it('detects significant increase', () => {
    const monthly = [
      { total: 1000 }, { total: 1100 }, { total: 1200 },
      { total: 1300 }, { total: 1500 }, { total: 1800 },
    ]
    const result = computeTrendNarrative(monthly)
    expect(result).toContain('increased')
  })

  it('detects significant decrease', () => {
    const monthly = [
      { total: 2000 }, { total: 1900 }, { total: 1800 },
      { total: 1700 }, { total: 1500 }, { total: 1200 },
    ]
    const result = computeTrendNarrative(monthly)
    expect(result).toContain('decreased')
  })

  it('detects steady spending', () => {
    const monthly = [
      { total: 1000 }, { total: 1010 }, { total: 990 },
      { total: 1005 }, { total: 995 }, { total: 1000 },
    ]
    const result = computeTrendNarrative(monthly)
    expect(result).toContain('remained steady')
  })
})

describe('computeForecast', () => {
  const mockSummary = { total_expenses: 1000 }

  it('returns null when monthly is empty', () => {
    expect(computeForecast([], mockSummary)).toBeNull()
  })

  it('returns null when summary is null', () => {
    expect(computeForecast([{ month: '2026-06', total: 500 }], null)).toBeNull()
  })

  it('returns null when current month data is missing', () => {
    const monthly = [{ month: '2025-01', total: 500 }]
    expect(computeForecast(monthly, mockSummary)).toBeNull()
  })

  it('sets confidence based on days elapsed', () => {
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const monthly = [
      { month: monthStr, total: 500 },
    ]
    const result = computeForecast(monthly, mockSummary)
    expect(result).not.toBeNull()
    expect(['Low', 'Medium', 'High']).toContain(result.confidence)
  })
})

describe('computeCategoryTrends', () => {
  it('returns empty for missing data', () => {
    expect(computeCategoryTrends(null, [])).toEqual({})
    expect(computeCategoryTrends([], null)).toEqual({})
  })

  it('detects new category', () => {
    const monthly = [
      { month: '2026-05', total: 1000 },
      { month: '2026-06', total: 1200 },
    ]
    const categoryMonthly = [
      { month: '2026-06', category: 'Food', total_amount: 500 },
    ]
    const result = computeCategoryTrends(categoryMonthly, monthly)
    expect(result['Food'].direction).toBe('new')
  })

  it('detects upward trend', () => {
    const monthly = [
      { month: '2026-05', total: 1000 },
      { month: '2026-06', total: 1200 },
    ]
    const categoryMonthly = [
      { month: '2026-05', category: 'Food', total_amount: 300 },
      { month: '2026-06', category: 'Food', total_amount: 450 },
    ]
    const result = computeCategoryTrends(categoryMonthly, monthly)
    expect(result['Food'].direction).toBe('up')
  })
})

describe('computeCategoryInsights', () => {
  it('returns empty array for no categories', () => {
    expect(computeCategoryInsights([], {})).toEqual([])
  })

  it('highlights dominant category', () => {
    const categories = [
      { category: 'Food', percent: 40 },
      { category: 'Rent', percent: 30 },
    ]
    const insights = computeCategoryInsights(categories, {})
    expect(insights[0]).toContain('Food')
    expect(insights[0]).toContain('40%')
  })

  it('highlights rising categories', () => {
    const categories = [
      { category: 'Food', percent: 40 },
      { category: 'Transport', percent: 20 },
    ]
    const trends = {
      Food: { direction: 'up', change: 15 },
    }
    const insights = computeCategoryInsights(categories, trends)
    const upMessages = insights.filter((i) => i.includes('up'))
    expect(upMessages.length).toBeGreaterThan(0)
  })
})

describe('computeAnomalyInsights', () => {
  it('returns empty for no anomalies', () => {
    const result = computeAnomalyInsights([], [])
    expect(result.transactions).toEqual([])
    expect(result.categorySpikes).toEqual([])
  })

  it('filters anomalies with z-score >= 2.5', () => {
    const anomalies = [
      { z_score: 3.0, title: 'Big purchase', amount: 5000, category: 'Electronics', date: '2026-06-01' },
      { z_score: 1.5, title: 'Normal', amount: 100, category: 'Food', date: '2026-06-02' },
    ]
    const result = computeAnomalyInsights(anomalies, [])
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0].title).toBe('Big purchase')
  })
})
