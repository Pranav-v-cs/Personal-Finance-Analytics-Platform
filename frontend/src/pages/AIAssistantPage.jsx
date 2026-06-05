import { useMemo, useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/common/PageHeader'
import { InlineError } from '../components/common/InlineError'
import { PageContainer } from '../components/layout/PageContainer'
import { SkeletonLine } from '../components/ui/Skeleton'
import { useDashboard } from '../hooks/useDashboard'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useSpendingMetrics } from '../hooks/useSpendingMetrics'
import { useInsights } from '../hooks/useInsights'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { useAIAssistant } from '../hooks/useAIAssistant'
import { useAnalytics } from '../hooks/useAnalytics'
import { SUGGESTED_QUESTIONS } from '../services/ai/promptTemplates'
import { generateFinancialReport } from '../services/ai/aiReports'
import { generateSavingsOpportunities, generateGoalRecommendations } from '../services/ai/aiInsights'

function AIMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--accent)] text-white rounded-br-sm'
            : 'bg-[var(--surface)] border border-[var(--border)] rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

function SuggestedQuestions({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
          onClick={() => onSelect(q)}
        >
          {q}
        </button>
      ))}
    </div>
  )
}

export default function AIAssistantPage() {
  const dashboard = useDashboard()
  const analyticsData = useAnalytics()
  const health = useFinancialHealth({
    summary: dashboard.summary,
    monthly: dashboard.monthly,
    budgets: dashboard.budgets,
    goals: dashboard.goals,
  })
  const metrics = useSpendingMetrics({
    summary: dashboard.summary,
    monthly: dashboard.monthly,
    recent: dashboard.recent,
  })
  const insights = useInsights({
    summary: dashboard.summary,
    monthly: dashboard.monthly,
    recent: dashboard.recent,
    categories: dashboard.categories,
    budgets: dashboard.budgets,
  })
  const layout = useDashboardLayout()

  const data = useMemo(() => ({
    summary: dashboard.summary,
    monthly: dashboard.monthly,
    categories: dashboard.categories,
    budgets: dashboard.budgets,
    goals: dashboard.goals,
    analytics: analyticsData.analytics,
    forecast: analyticsData.forecast,
    categoryTrends: analyticsData.categoryTrends,
    categoryInsights: analyticsData.categoryInsights,
    anomalyInsights: analyticsData.anomalyInsights,
    health,
    insights,
    metrics,
  }), [dashboard, analyticsData, health, insights, metrics])

  const { messages, loading, error, sendMessage, clearHistory } = useAIAssistant(data, layout.aiProvider)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggested = (question) => {
    sendMessage(question)
  }

  const isLoading = dashboard.loading || analyticsData.loading

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="AI Assistant" title="Your financial analyst" description="Loading your financial data..." />
        <Card>
          <CardContent className="flex flex-col gap-3 p-6">
            <SkeletonLine className="w-3/4" />
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-2/3" />
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="AI Assistant"
          title="Your financial analyst"
          description="Ask questions about your spending, budgets, goals, and financial health. Responses are grounded in your actual data."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { if (messages[messages.length-1]?.role !== 'user') sendMessage('Generate a financial report with executive summary, budget analysis, goal analysis, forecast analysis, savings opportunities, and recommendations.') }} disabled={loading}>
                Report
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { if (messages[messages.length-1]?.role !== 'user') sendMessage('What savings opportunities can you identify from my spending data?') }} disabled={loading}>
                Savings
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { if (messages[messages.length-1]?.role !== 'user') sendMessage('Review my goals and suggest adjustments or new goals based on my finances.') }} disabled={loading}>
                Goals
              </Button>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearHistory}>Clear</Button>
              )}
            </div>
          }
        />

        <Card className="flex flex-col min-h-[500px]">
          <CardContent className="flex flex-col gap-4 p-0 flex-1">
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 min-h-[400px] max-h-[500px]">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(124,116,232,0.12)] text-xl">
                    &#x1F9E0;
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold">Ask anything about your finances</p>
                    <p className="text-xs text-[var(--muted)] max-w-sm">
                      Try one of the suggested questions below, or type your own.
                    </p>
                  </div>
                  <SuggestedQuestions onSelect={handleSuggested} disabled={loading} />
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <AIMessage key={i} message={msg} />
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-xl rounded-bl-sm px-4 py-3 bg-[var(--surface)] border border-[var(--border)]">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && <InlineError message={error} />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {messages.length > 0 && !loading && (
              <div className="px-6 pb-2">
                <SuggestedQuestions onSelect={handleSuggested} disabled={loading} />
              </div>
            )}

            <div className="border-t border-[var(--border)] px-6 py-4">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={loading ? 'Waiting for response...' : 'Ask about your finances...'}
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
                />
                <Button onClick={handleSend} disabled={!input.trim() || loading}>
                  {loading ? '...' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
