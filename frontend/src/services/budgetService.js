import { api } from './api'

export async function getBudgets() {
  return api.get('/budgets')
}

export async function createBudget(category, monthlyLimit) {
  return api.post('/budgets', { category, monthly_limit: monthlyLimit })
}

export async function updateBudget(id, monthlyLimit) {
  return api.put(`/budgets/${id}`, { monthly_limit: monthlyLimit })
}

export async function deleteBudget(id) {
  return api.delete(`/budgets/${id}`)
}
