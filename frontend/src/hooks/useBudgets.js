import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgetService'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goalService'

export function useBudgets() {
  const [state, setState] = useState({
    budgets: [],
    goals: [],
    loading: true,
    error: '',
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let active = true
    async function load() {
      setState((s) => ({ ...s, loading: true, error: '' }))
      try {
        const [budgets, goals] = await Promise.all([getBudgets(), getGoals()])
        if (!active) return
        setState({ budgets, goals, loading: false, error: '' })
      } catch (err) {
        if (!active) return
        setState((s) => ({ ...s, loading: false, error: err.message || 'Unable to load data' }))
      }
    }
    load()
    return () => { active = false }
  }, [refreshKey])

  const budgetStats = useMemo(() => {
    const total = state.budgets.length
    const atRisk = state.budgets.filter((b) => {
      const pct = Number(b.current_spend) / Number(b.monthly_limit) * 100
      return pct >= 75 && pct < 100
    }).length
    const over = state.budgets.filter((b) => Number(b.current_spend) > Number(b.monthly_limit)).length
    return { total, atRisk, over }
  }, [state.budgets])

  return { ...state, budgetStats, refresh, createBudget, updateBudget, deleteBudget, createGoal, updateGoal, deleteGoal, refreshBudgets: refresh }
}
