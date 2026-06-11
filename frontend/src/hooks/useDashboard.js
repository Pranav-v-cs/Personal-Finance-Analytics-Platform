import { useCallback, useEffect, useState } from 'react'
import {
  getDashboardCategories,
  getDashboardSummary,
  getMonthlySpending,
  getRecentExpenses,
} from '../services/dashboardService'
import { getBudgets } from '../services/budgetService'
import { getGoals } from '../services/goalService'

const INITIAL_STATE = {
  summary: null,
  monthly: [],
  recent: [],
  categories: [],
  budgets: [],
  goals: [],
  loading: true,
  error: '',
}

export function useDashboard() {
  const [state, setState] = useState(INITIAL_STATE)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let active = true

    async function load() {
      setState((s) => ({ ...s, loading: true, error: '' }))
      try {
        const [summary, monthly, recent, categories, budgets, goals] = await Promise.all([
          getDashboardSummary(),
          getMonthlySpending(),
          getRecentExpenses(),
          getDashboardCategories(),
          getBudgets(),
          getGoals(),
        ])
        if (active) setState({ summary, monthly, recent, categories, budgets, goals, loading: false, error: '' })
      } catch (error) {
        if (active) setState({ ...INITIAL_STATE, loading: false, error: error.message || 'Unable to load dashboard data' })
      }
    }

    load()
    return () => { active = false }
  }, [refreshKey])

  return { ...state, refresh }
}
