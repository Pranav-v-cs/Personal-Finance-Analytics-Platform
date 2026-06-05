import { useMemo } from 'react'
import { formatCurrency } from '../utils/format'

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

export function useInsights({ summary, monthly, recent, categories, budgets }) {
  return useMemo(() => {
    const insights = []
    const totalExpenses = Number(summary?.totalExpenses ?? summary?.total_expenses ?? 0)
    const expenseCount = Number(summary?.expenseCount ?? summary?.expense_count ?? 0)
    const avgPerDay = Number(summary?.avgPerDay ?? summary?.avg_per_day ?? 0)
    const topCategory = summary?.topCategory || summary?.top_category || null

    if (!totalExpenses || !expenseCount) return insights

    let momChangePercent = 0
    let previousTotal = 0
    if (monthly && monthly.length >= 2) {
      const current = Number(monthly[monthly.length - 1]?.total_amount ?? 0)
      const previous = Number(monthly[monthly.length - 2]?.total_amount ?? 0)
      previousTotal = previous
      if (previous > 0) {
        momChangePercent = ((current - previous) / previous) * 100
      }
    }

    const topPct = Number(topCategory?.percent ?? 0)
    if (topPct > 40) {
      if (!isDismissed('savings', topCategory.category)) {
        const catTotal = categories?.find((c) => c.category === topCategory.category)
        const catAmount = Number(catTotal?.total_amount || catTotal?.total || 0)
        const monthlySave = Math.round(catAmount * 0.1)
        insights.push(makeInsight('savings', {
          title: 'Savings opportunity',
          message: `Reducing ${topCategory.category} by 10% could save ₹${monthlySave}/month`,
          priority: 1,
          actionLabel: 'Review spending',
        }))
      }
    }

    if (Math.abs(momChangePercent) >= 8 && previousTotal > 0) {
      const isIncrease = momChangePercent > 0
      const typeKey = isIncrease ? 'velocity_up' : 'velocity_down'
      if (!isDismissed(typeKey, 'mom')) {
        insights.push(makeInsight(typeKey, {
          title: isIncrease ? 'Spending increase' : 'Spending decrease',
          message: isIncrease
            ? `You spent ${Math.abs(momChangePercent).toFixed(0)}% more than last month`
            : `You spent ${Math.abs(momChangePercent).toFixed(0)}% less than last month`,
          priority: isIncrease ? 2 : 5,
        }))
      }
    }

    if (budgets && budgets.length > 0) {
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysElapsed = now.getDate()

      budgets.forEach((b) => {
        const spent = Number(b.current_spend ?? 0)
        const limit = Number(b.monthly_limit)
        if (!limit) return
        const pct = (spent / limit) * 100

        if (spent > limit) {
          const over = spent - limit
          if (!isDismissed('overspent', b.category)) {
            insights.push(makeInsight('overspent', {
              title: `${b.category} over budget`,
              message: `${b.category} exceeded budget by ${formatCurrency(over)}`,
              priority: 1,
              actionLabel: 'Review budget',
            }))
          }
        } else if (pct >= 75 && daysElapsed > 0) {
          const dailyRate = spent / daysElapsed
          const projected = spent + dailyRate * (daysInMonth - daysElapsed)
          if (projected > limit) {
            const mayExceed = Math.round(projected - limit)
            if (!isDismissed('at_risk', b.category)) {
              insights.push(makeInsight('at_risk', {
                title: `${b.category} at risk`,
                message: `At your current pace you may exceed your ${b.category} budget by ${formatCurrency(mayExceed)}`,
                priority: 2,
                actionLabel: 'View budget',
              }))
            }
          } else {
            if (!isDismissed('warning', b.category)) {
              insights.push(makeInsight('warning', {
                title: `${b.category} budget warning`,
                message: `You have used ${Math.round(pct)}% of your ${b.category} budget`,
                priority: 2,
                actionLabel: 'View budget',
              }))
            }
          }
        } else if (pct < 50 && daysElapsed >= 7) {
          if (!isDismissed('under_budget', b.category)) {
            insights.push(makeInsight('under_budget', {
              title: `${b.category} under budget`,
              message: `You are ${Math.round(100 - pct)}% under budget for ${b.category}`,
              priority: 5,
            }))
          }
        }
      })
    }

    if (avgPerDay > 0 && previousTotal > 0) {
      if (!isDismissed('velocity', 'daily')) {
        let msg
        if (Math.abs(momChangePercent) >= 5) {
          const dir = momChangePercent > 0 ? 'faster' : 'slower'
          msg = `You're spending ₹${avgPerDay.toFixed(0)}/day — ${Math.abs(momChangePercent).toFixed(0)}% ${dir} than last month`
        } else {
          msg = `You're spending ₹${avgPerDay.toFixed(0)}/day on average`
        }
        insights.push(makeInsight('velocity', {
          title: 'Spending velocity',
          message: msg,
          priority: 3,
        }))
      }
    }

    if (topCategory && topPct) {
      if (!isDismissed('top_category', topCategory.category)) {
        const catShare = categories?.find((c) => c.category === topCategory.category)
        const catTotal = Number(catShare?.total_amount || catShare?.total || 0)
        const formatted = catTotal ? `₹${catTotal.toLocaleString()}` : ''
        insights.push(makeInsight('top_category', {
          title: 'Top spending category',
          message: `${topCategory.category} is your largest category this month${formatted ? '. ' + formatted : ''} — ${topPct.toFixed(0)}% of total spending`,
          priority: 4,
          actionLabel: 'Review spending',
        }))
      }
    }

    const totalPercentage = categories
      ? categories.slice(0, 3).reduce((sum, cat) => sum + Number(cat.percent || 0), 0)
      : 0
    if (totalPercentage > 70) {
      const top3Names = categories.slice(0, 3).map((c) => c.category).join(' and ')
      if (!isDismissed('concentration', 'top3')) {
        insights.push(makeInsight('concentration', {
          title: 'Spending concentration',
          message: `${totalPercentage.toFixed(0)}% of spending comes from ${top3Names}`,
          priority: 4,
        }))
      }
    }

    if (expenseCount > 0 && recent && recent.length > 0) {
      const largest = recent.reduce((max, r) => (Number(r.amount) > Number(max.amount) ? r : max), recent[0])
      if (!isDismissed('largest', String(largest.id))) {
        insights.push(makeInsight('largest', {
          title: 'Largest transaction',
          message: `${largest.title || 'Expense'} — ₹${Number(largest.amount).toFixed(0)}`,
          priority: 5,
        }))
      }
    }

    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
  }, [summary, monthly, recent, categories])
}
