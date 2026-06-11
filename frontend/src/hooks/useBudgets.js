import { useCallback, useEffect, useState } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../services/budgetService'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goalService'

export function useBudgets() {
  const [state, setState] = useState({ budgets: [], goals: [], loading: true, error: '' })
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let active = true
    async function load() {
      setState((s) => ({ ...s, loading: true, error: '' }))
      try {
        const [budgets, goals] = await Promise.all([getBudgets(), getGoals()])
        if (active) setState({ budgets, goals, loading: false, error: '' })
      } catch (err) {
        if (active) setState((s) => ({ ...s, loading: false, error: err.message || 'Unable to load data' }))
      }
    }
    load()
    return () => { active = false }
  }, [refreshKey])

  return { ...state, refresh, createBudget, updateBudget, deleteBudget, createGoal, updateGoal, deleteGoal, refreshBudgets: refresh }
}
