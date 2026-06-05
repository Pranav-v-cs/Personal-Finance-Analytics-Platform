import { generateAIResponse } from './aiService'
import { buildFinancialContext } from './financialContextBuilder'

export async function generateExplainBudget(budget, data, provider) {
  const context = buildFinancialContext(data)
  const prompt = `Explain the budget status for ${budget.category}. They have spent ${budget.current_spend} out of a ${budget.monthly_limit} limit (${Math.round((Number(budget.current_spend || 0) / Number(budget.monthly_limit)) * 100)}% utilized). Provide a concise assessment and one specific recommendation.`
  return generateAIResponse(provider, prompt, context)
}

export async function generateExplainHealth(health, data, provider) {
  const context = buildFinancialContext(data)
  const prompt = `The user's Financial Health score is ${health.score} (${health.label}). ${health.recommendation} Briefly explain what this means and suggest 1-2 specific actions to improve it.`
  return generateAIResponse(provider, prompt, context)
}

export async function generateExplainForecast(forecast, data, provider) {
  const context = buildFinancialContext(data)
  const prompt = `The spending forecast projects ${forecast.projected} for this month (${forecast.confidence} confidence). Daily rate is ${forecast.dailyRate} with ${forecast.daysRemaining} days remaining. ${forecast.vsLastMonth > 0 ? `This would exceed last month by ${forecast.vsLastMonth}%.` : forecast.vsLastMonth < 0 ? `This would be ${Math.abs(forecast.vsLastMonth)}% less than last month.` : 'This matches last month.'} Explain what this means and suggest one action.`
  return generateAIResponse(provider, prompt, context)
}

export async function generateExplainAnomaly(txn, avgExpense, data, provider) {
  const context = buildFinancialContext(data)
  const prompt = `This transaction is unusual: ${txn.title} for ${txn.amount} in ${txn.category} on ${txn.date}. ${avgExpense > 0 ? `It is ${Math.round(txn.amount / avgExpense)}x the average expense.` : ''} Briefly explain why this matters and what to check.`
  return generateAIResponse(provider, prompt, context)
}

export async function generateSavingsOpportunities(data, provider) {
  const context = buildFinancialContext(data)
  const prompt = 'Based on my financial data, identify 2-3 specific savings opportunities. Be specific about categories and amounts. Do not give generic advice.'
  return generateAIResponse(provider, prompt, context)
}

export async function generateGoalRecommendations(data, provider) {
  const context = buildFinancialContext(data)
  const prompt = 'Based on my financial data and goals, suggest 1-2 adjustments to my savings goals or recommend a new goal. Be specific and data-driven.'
  return generateAIResponse(provider, prompt, context)
}
