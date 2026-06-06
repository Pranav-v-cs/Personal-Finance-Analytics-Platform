import { useEffect, useMemo, useState } from 'react'
import {
  getDashboardSummary,
  getMonthlySpending,
  getDashboardCategories,
  getCategoryMonthly,
  getDashboardAnalytics,
} from '../services/dashboardService'

interface MonthlyItem {
  month: string
  total: number
  label?: string
}

interface CategoryItem {
  category: string
  total: number
  percent: number
}

interface CategoryMonthlyItem {
  month: string
  category: string
  total_amount: number
}

interface AnomalyCandidate {
  id: number
  title: string
  amount: number
  category: string
  date: string
  z_score: number
}

interface AnalyticsData {
  weekly_metrics: unknown[]
  weekday_aggregates: unknown[]
  anomaly_candidates: AnomalyCandidate[]
  largest_transactions: unknown[]
}

interface CategoryTrend {
  direction: 'up' | 'down' | 'flat' | 'new'
  change: number
  current: number
}

interface ForecastResult {
  projected: number
  dailyRate: number
  daysRemaining: number
  vsLastMonth: number
  lastMonthTotal: number
  confidence: string
  daysElapsed: number
}

interface AnomalyInsights {
  transactions: AnomalyCandidate[]
  categorySpikes: {
    category: string
    current: number
    average: number
    percentAbove: number
  }[]
}

function computeTrendNarrative(monthly: MonthlyItem[]): string {
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

function computeCategoryTrends(
  categoryMonthly: CategoryMonthlyItem[],
  monthly: MonthlyItem[],
): Record<string, CategoryTrend> {
  if (!categoryMonthly?.length || !monthly?.length) return {}

  const months = monthly.filter((m) => m.total > 0).map((m) => m.month)
  if (months.length < 1) return {}

  const currentMonth = months[months.length - 1]
  const prevMonth = months.length > 1 ? months[months.length - 2] : null

  const currentByCat = categoryMonthly
    .filter((cm) => cm.month === currentMonth)
    .reduce<Record<string, number>>((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

  if (!prevMonth) {
    return Object.fromEntries(
      Object.entries(currentByCat).map(([cat]) => [cat, { direction: 'new' as const, change: 0, current: 0 }])
    )
  }

  const prevByCat = categoryMonthly
    .filter((cm) => cm.month === prevMonth)
    .reduce<Record<string, number>>((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

  const allCats = new Set([...Object.keys(currentByCat), ...Object.keys(prevByCat)])
  const trends: Record<string, CategoryTrend> = {}
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

function computeForecast(monthly: MonthlyItem[], summary: unknown): ForecastResult | null {
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

function computeCategoryInsights(
  categories: CategoryItem[],
  categoryTrends: Record<string, CategoryTrend>,
): string[] {
  if (!categories?.length) return []

  const insights: string[] = []
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

function computeAnomalyInsights(
  anomalyCandidates: AnomalyCandidate[] | null | undefined,
  categoryMonthly: CategoryMonthlyItem[],
): AnomalyInsights {
  if (!anomalyCandidates?.length) return { transactions: [], categorySpikes: [] }

  const transactions = anomalyCandidates.filter((a) => Math.abs(a.z_score) >= 2.5).slice(0, 3)
  const categorySpikes: AnomalyInsights['categorySpikes'] = []

  if (categoryMonthly?.length) {
    const months = [...new Set(categoryMonthly.map((cm) => cm.month))].sort()
    const currentMonth = months[months.length - 1]
    if (currentMonth) {
      const currentByCat = categoryMonthly
        .filter((cm) => cm.month === currentMonth)
        .reduce<Record<string, number>>((acc, cm) => { acc[cm.category] = Number(cm.total_amount); return acc }, {})

      const historicalByCat = categoryMonthly
        .filter((cm) => cm.month !== currentMonth)
        .reduce<Record<string, number[]>>((acc, cm) => {
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

interface AnalyticsState {
  summary: Record<string, unknown> | null
  monthly: MonthlyItem[]
  categories: CategoryItem[]
  categoryMonthly: CategoryMonthlyItem[]
  analytics: AnalyticsData | null
  loading: boolean
  error: string
}

interface UseAnalyticsResult extends AnalyticsState {
  trendNarrative: string
  categoryTrends: Record<string, CategoryTrend>
  forecast: ForecastResult | null
  categoryInsights: string[]
  anomalyInsights: AnomalyInsights
}

export function useAnalytics(): UseAnalyticsResult {
  const [state, setState] = useState<AnalyticsState>({
    summary: null,
    monthly: [],
    categories: [],
    categoryMonthly: [],
    analytics: null,
    loading: true,
    error: '',
  })

  useEffect(() => {
    let active = true

    async function load() {
      setState((s) => ({ ...s, loading: true, error: '' }))
      try {
        const [summary, monthly, categories, categoryMonthly, analytics] = await Promise.all([
          getDashboardSummary(),
          getMonthlySpending(),
          getDashboardCategories(),
          getCategoryMonthly(),
          getDashboardAnalytics(),
        ])
        if (!active) return
        setState({
          summary: summary as Record<string, unknown>,
          monthly: monthly as MonthlyItem[],
          categories: categories as CategoryItem[],
          categoryMonthly: categoryMonthly as CategoryMonthlyItem[],
          analytics: analytics as unknown as AnalyticsData,
          loading: false,
          error: '',
        })
      } catch (err: unknown) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Unable to load analytics'
        setState((s) => ({ ...s, loading: false, error: message }))
      }
    }

    load()
    return () => { active = false }
  }, [])

  const trendNarrative = useMemo(() => computeTrendNarrative(state.monthly), [state.monthly])
  const categoryTrends = useMemo(
    () => computeCategoryTrends(state.categoryMonthly, state.monthly),
    [state.categoryMonthly, state.monthly],
  )
  const forecast = useMemo(() => computeForecast(state.monthly, state.summary), [state.monthly, state.summary])
  const categoryInsights = useMemo(
    () => computeCategoryInsights(state.categories, categoryTrends),
    [state.categories, categoryTrends],
  )
  const anomalyInsights = useMemo(
    () => computeAnomalyInsights(
      (state.analytics as AnalyticsData | null)?.anomaly_candidates,
      state.categoryMonthly,
    ),
    [state.analytics, state.categoryMonthly],
  )

  return {
    ...state,
    trendNarrative,
    categoryTrends,
    forecast,
    categoryInsights,
    anomalyInsights,
  }
}
