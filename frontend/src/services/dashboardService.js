import { api } from './api'
import { buildMonthSeries } from '../utils/format'

export async function getDashboardSummary() {
  const summary = await api.get('/dashboard/summary')
  const breakdown = [...(summary.category_breakdown || [])].sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
  return {
    ...summary,
    totalExpenses: summary.total_expenses,
    expenseCount: summary.expense_count,
    avgPerDay: summary.avg_per_day,
    topCategory: summary.top_category || breakdown[0] || null,
    category_breakdown: breakdown,
  }
}

export async function getMonthlySpending() {
  const data = await api.get('/dashboard/monthly')
  return buildMonthSeries(data, 12)
}

export async function getRecentExpenses() {
  return api.get('/dashboard/recent')
}

export async function getDashboardCategories() {
  return api.get('/dashboard/categories')
}
