import { useCallback, useEffect, useState } from 'react'
import { createExpense, deleteExpense, listExpenses, updateExpense } from '../services/expenseService'
import { listCategories } from '../services/categoryService'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [expenseRows, categoryRows] = await Promise.all([
        listExpenses(filters),
        listCategories(),
      ])

      setExpenses(expenseRows)
      setCategories(categoryRows)
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load expenses')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    queueMicrotask(() => {
      load()
    })
  }, [load])

  return {
    expenses,
    categories,
    filters,
    setFilters,
    loading,
    saving,
    error,
    createExpenseItem: async (values) => {
      setSaving(true)
      setError('')
      try {
        const created = await createExpense(values)
        setExpenses((current) => [created, ...current])
        return created
      } catch (createError) {
        setError(createError.message || 'Unable to create expense')
        throw createError
      } finally {
        setSaving(false)
      }
    },
    updateExpenseItem: async (id, values) => {
      setSaving(true)
      setError('')
      try {
        const updated = await updateExpense(id, values)
        setExpenses((current) => current.map((expense) => (expense.id === id ? updated : expense)))
        return updated
      } catch (updateError) {
        setError(updateError.message || 'Unable to update expense')
        throw updateError
      } finally {
        setSaving(false)
      }
    },
    removeExpenseItem: async (id) => {
      setSaving(true)
      setError('')
      try {
        await deleteExpense(id)
        setExpenses((current) => current.filter((expense) => expense.id !== id))
      } catch (deleteError) {
        setError(deleteError.message || 'Unable to delete expense')
        throw deleteError
      } finally {
        setSaving(false)
      }
    },
    refresh: load,
  }
}
