import { useState, useCallback } from 'react'
import {
  generateExplainBudget,
  generateExplainForecast,
  generateExplainAnomaly,
} from '../services/ai/aiInsights'

export function useAIExplain(data) {
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)
  const [explainError, setExplainError] = useState('')

  const explainBudget = useCallback(async (budget) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainBudget(budget, data)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data])

  const explainForecast = useCallback(async (forecast) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainForecast(forecast, data)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data])

  const explainAnomaly = useCallback(async (txn, avgExpense) => {
    setExplaining(true)
    setExplainError('')
    setExplanation('')
    try {
      const result = await generateExplainAnomaly(txn, avgExpense, data)
      setExplanation(result)
    } catch (err) {
      setExplainError(err.message || 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }, [data])

  const clearExplanation = useCallback(() => {
    setExplanation('')
    setExplainError('')
  }, [])

  return {
    explanation,
    explaining,
    explainError,
    explainBudget,
    explainForecast,
    explainAnomaly,
    clearExplanation,
  }
}
