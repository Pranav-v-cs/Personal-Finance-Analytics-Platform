import { useState, useCallback } from 'react'
import {
  generateExplainBudget,
  generateExplainHealth,
  generateExplainForecast,
  generateExplainAnomaly,
} from '../services/ai/aiInsights'

export function useAIExplain(data, provider) {
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [explainError, setExplainError] = useState('')

  const explainBudget = useCallback(async (budget) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainBudget(budget, data, provider)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data, provider])

  const explainHealth = useCallback(async (health) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainHealth(health, data, provider)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data, provider])

  const explainForecast = useCallback(async (forecast) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainForecast(forecast, data, provider)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data, provider])

  const explainAnomaly = useCallback(async (txn, avgExpense) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainAnomaly(txn, avgExpense, data, provider)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data, provider])

  const clearExplanation = useCallback(() => {
    setExplanation('')
    setExplainError('')
  }, [])

  return {
    explanation,
    explaining,
    explainError,
    explainBudget,
    explainHealth,
    explainForecast,
    explainAnomaly,
    clearExplanation,
  }
}
