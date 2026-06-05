import { useState, useCallback, useRef } from 'react'
import { generateAIResponse } from '../services/ai/aiService'
import { buildFinancialContext } from '../services/ai/financialContextBuilder'

const STORAGE_KEY = 'aiChatHistory'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
  } catch {}
}

export function useAIAssistant(data, aiProvider) {
  const [messages, setMessages] = useState(loadHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return

    const userMessage = { role: 'user', content: text.trim() }
    setMessages((prev) => {
      const updated = [...prev, userMessage]
      saveHistory(updated)
      return updated
    })
    setLoading(true)
    setError('')

    const context = buildFinancialContext(data)

    try {
      const response = await generateAIResponse(aiProvider, text, context)
      const assistantMessage = { role: 'assistant', content: response }
      setMessages((prev) => {
        const updated = [...prev, assistantMessage]
        saveHistory(updated)
        return updated
      })
    } catch (err) {
      setError(err.message || 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }, [data, aiProvider, loading])

  const clearHistory = useCallback(() => {
    setMessages([])
    setError('')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  return { messages, loading, error, sendMessage, clearHistory }
}
