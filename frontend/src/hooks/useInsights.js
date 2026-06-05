import { useMemo } from 'react'

function parseDate(val) {
  if (!val) return null
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

function daysBetween(a, b) {
  const msPerDay = 86400000
  return Math.floor((b.getTime() - a.getTime()) / msPerDay)
}

function getDismissed() {
  try {
    const raw = localStorage.getItem('dismissedInsights')
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date !== today) return {}
    return parsed.items || {}
  } catch {
    return {}
  }
}

function dismissKey(type, label) {
  return `${type}::${label}`
}

function isDismissed(type, label) {
  const dismissed = getDismissed()
  return !!dismissed[dismissKey(type, label)]
}

function makeInsight(type, { title, message, priority, actionLabel }) {
  return { type, title, message, priority, dismissible: true, actionLabel }
}

export function useInsights({ summary, monthly, recent, categories }) {
  return useMemo(() => {
    const insights = []
    const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
    const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)
    const avgPerDay = Number(summary?.avgPerDay ?? summary?.avg_per_day ?? 0)
    const topCategory = summary?.topCategory || summary?.top_category || null

    if (!totalExpenses || !expenseCount) return insights

    if (topCategory && topCategory.percent) {
      if (!isDismissed('top_category', topCategory.category)) {
        insights.push(makeInsight('top_category', {
          title: 'Top category',
          message: `${topCategory.category} accounts for ${topCategory.percent.toFixed(0)}% of your spending`,
          priority: 2,
          actionLabel: 'Review spending',
        }))
      }
    }

    const totalPercentage = categories
      ? categories.slice(0, 3).reduce((sum, cat) => sum + (cat.percent || 0), 0)
      : 0
    if (totalPercentage > 70) {
      if (!isDismissed('concentration', 'top3')) {
        insights.push(makeInsight('concentration', {
          title: 'Spending concentration',
          message: `Your top 3 categories make up ${totalPercentage.toFixed(0)}% of all spending`,
          priority: 2,
        }))
      }
    }

    if (monthly && monthly.length >= 2) {
      const current = Number(monthly[monthly.length - 1]?.total_amount ?? 0)
      const previous = Number(monthly[monthly.length - 2]?.total_amount ?? 0)
      if (previous > 0) {
        const change = ((current - previous) / previous) * 100
        if (Math.abs(change) >= 10) {
          const isIncrease = change > 0
          const typeKey = isIncrease ? 'increase' : 'decrease'
          if (!isDismissed(typeKey, 'mom')) {
            insights.push(makeInsight(typeKey, {
              title: isIncrease ? 'Spending increase' : 'Spending decrease',
              message: `${isIncrease ? 'Up' : 'Down'} ${Math.abs(change).toFixed(0)}% compared to last month`,
              priority: isIncrease ? 1 : 3,
            }))
          }
        }
      }
    }

    if (topCategory && topCategory.percent && topCategory.percent > 40) {
      if (!isDismissed('savings', topCategory.category)) {
        insights.push(makeInsight('savings', {
          title: 'Savings opportunity',
          message: `Reducing ${topCategory.category} by 10% could save roughly ${((totalExpenses * topCategory.percent / 100) * 0.1).toFixed(0)} in total`,
          priority: 2,
        }))
      }
    }

    if (expenseCount > 0 && recent && recent.length > 0) {
      const largest = recent.reduce((max, r) => (Number(r.amount) > Number(max.amount) ? r : max), recent[0])
      if (!isDismissed('largest', String(largest.id))) {
        insights.push(makeInsight('largest', {
          title: 'Largest transaction',
          message: `${largest.title || 'Expense'} at ${largest.category || 'uncategorized'} — ${Number(largest.amount).toFixed(2)}`,
          priority: 3,
        }))
      }
    }

    if (avgPerDay > 0) {
      if (!isDismissed('velocity', 'avg')) {
        insights.push(makeInsight('velocity', {
          title: 'Spending velocity',
          message: `Average spend of ${avgPerDay.toFixed(2)} per day across your tracked period`,
          priority: 3,
        }))
      }
    }

    if (recent && recent.length > 0) {
      const dates = recent
        .map((r) => r.date || r.transaction_date)
        .filter(Boolean)
        .map((d) => parseDate(d))
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime())

      if (dates.length > 0) {
        const latest = dates[0]
        const now = new Date()
        const gap = daysBetween(latest, now)
        if (gap >= 3) {
          if (!isDismissed('streak', String(gap))) {
            insights.push(makeInsight('streak', {
              title: 'No recent spending',
              message: `${gap} day${gap > 1 ? 's' : ''} since your last recorded expense`,
              priority: 2,
            }))
          }
        }
      }
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
  }, [summary, monthly, recent, categories])
}
