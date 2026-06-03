import { api } from './api'
import { adaptExpense, toExpensePayload } from '../utils/expense'

export async function listExpenses(filters = {}) {
  const params = Object.fromEntries(
    Object.entries({
      category: filters.category,
      start_date: filters.startDate,
      end_date: filters.endDate,
      min_amount: filters.minAmount,
      max_amount: filters.maxAmount,
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )

  const expenses = await api.get('/expenses', {
    params,
  })

  return expenses.map(adaptExpense)
}

export async function createExpense(form) {
  const expense = await api.post('/expenses', toExpensePayload(form))
  return adaptExpense(expense)
}

export async function updateExpense(id, form) {
  const expense = await api.put(`/expenses/${id}`, toExpensePayload(form))
  return adaptExpense(expense)
}

export function deleteExpense(id) {
  return api.delete(`/expenses/${id}`)
}
