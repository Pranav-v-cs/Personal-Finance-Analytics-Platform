import { useCallback, useEffect, useState } from 'react'
import {
  getDashboardCategories,
  getDashboardSummary,
  getMonthlySpending,
  getRecentExpenses,
} from '../services/dashboardService'
import { getBudgets } from '../services/budgetService'

export function useDashboard() {
  const [state, setState] = useState({
    summary: null,
    monthly: [],
    recent: [],
    categories: [],
    budgets: [],
    loading: true,
    error: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      setState((current) => ({ ...current, loading: true, error: '' }))

      try {
        const [summary, monthly, recent, categories, budgets] = await Promise.all([
          getDashboardSummary(),
          getMonthlySpending(),
          getRecentExpenses(),
          getDashboardCategories(),
          getBudgets(),
        ])

        if (!active) return
        setState({
          summary,
          monthly,
          recent,
          categories,
          budgets,
          loading: false,
          error: '',
        })
      } catch (error) {
        if (!active) return
        setState({
          summary: null,
          monthly: [],
          recent: [],
          categories: [],
          budgets: [],
          loading: false,
          error: error.message || 'Unable to load dashboard data',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [refreshKey])

  return { ...state, refresh }
}
