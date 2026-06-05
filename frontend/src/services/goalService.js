import { api } from './api'

export async function getGoals() {
  return api.get('/goals')
}

export async function createGoal({ name, targetAmount, currentAmount = 0, targetDate = null }) {
  return api.post('/goals', {
    name,
    target_amount: targetAmount,
    current_amount: currentAmount,
    target_date: targetDate || null,
  })
}

export async function updateGoal(id, { currentAmount, targetAmount, targetDate }) {
  const body = {}
  if (currentAmount !== undefined) body.current_amount = currentAmount
  if (targetAmount !== undefined) body.target_amount = targetAmount
  if (targetDate !== undefined) body.target_date = targetDate || null
  return api.put(`/goals/${id}`, body)
}

export async function deleteGoal(id) {
  return api.delete(`/goals/${id}`)
}
