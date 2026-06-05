import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { DeltaBadge } from '../components/common/DeltaBadge'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { PageHeader } from '../components/common/PageHeader'
import { SkeletonLine } from '../components/common/Skeleton'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../utils/format'
import { createExpense } from '../services/expenseService'
import { useDashboard } from '../hooks/useDashboard'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useInsights } from '../hooks/useInsights'
import { useSpendingMetrics } from '../hooks/useSpendingMetrics'
import { useRouter } from '../hooks/useRouter'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { DashboardWidget, WidgetSkeleton } from '../components/dashboard/DashboardWidget'
import { CustomizeDrawer } from '../components/dashboard/CustomizeDrawer'
import {
  WidgetFinancialHealth,
  WidgetInsights,
  WidgetMetrics,
  WidgetTrend,
  WidgetCategoryIntelligence,
  WidgetBudgetSummary,
  WidgetGoalProgress,
  WidgetQuickAddBlock,
  WidgetAIAssistant,
} from '../components/dashboard/widgets'

const WIDGET_COMPONENTS = {
  'financial-health': WidgetFinancialHealth,
  insights: WidgetInsights,
  metrics: WidgetMetrics,
  trend: WidgetTrend,
  'category-intelligence': WidgetCategoryIntelligence,
  'budget-summary': WidgetBudgetSummary,
  'goal-progress': WidgetGoalProgress,
  'quick-add': WidgetQuickAddBlock,
  'ai-assistant': WidgetAIAssistant,
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-stack">
      <WidgetSkeleton />
      <WidgetSkeleton />
      <WidgetSkeleton />
    </div>
  )
}

function getWidgetProps(id, { insights, metrics, health, monthSeries, trendNarrative, categories, budgets, goals, handleQuickAdd, quickAddSaving, navigate, formatCurrency }) {
  switch (id) {
    case 'financial-health':
      return { health }
    case 'insights':
      return { insights }
    case 'metrics':
      return { metrics, formatCurrency }
    case 'trend':
      return { monthSeries, formatCurrency, trendNarrative, DeltaBadge, metrics }
    case 'category-intelligence':
      return { categories, formatCurrency }
    case 'budget-summary':
      return { budgets, formatCurrency, navigate }
    case 'goal-progress':
      return { goals, formatCurrency, navigate }
    case 'quick-add':
      return { categories, onSubmit: handleQuickAdd, saving: quickAddSaving }
    case 'ai-assistant':
      return {}
    default:
      return {}
  }
}

export default function DashboardPage() {
  const { summary, monthly, recent, categories, budgets, goals, loading, error, refresh } = useDashboard()
  const { navigate } = useRouter()
  const [quickAddSaving, setQuickAddSaving] = useState(false)
  const insights = useInsights({ summary, monthly, recent, categories, budgets })
  const metrics = useSpendingMetrics({ summary, monthly, recent })
  const health = useFinancialHealth({ summary, monthly, budgets, goals })
  const layout = useDashboardLayout()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      if (active.id !== over.id) {
        layout.reorder(active.id, over.id)
      }
    },
    [layout],
  )

  const monthSeries = monthly.length ? monthly : []
  const hasExpenses = metrics.expenseCount > 0

  const trendNarrative = useMemo(() => {
    if (!monthly || monthly.length < 3) return ''
    const amounts = monthly.slice(-3).map((m) => Number(m.total_amount ?? 0))
    const [oldest, middle, newest] = amounts
    if (newest > middle && middle > oldest) return 'Spending has increased steadily over the last 3 months.'
    if (newest < middle && middle < oldest) return 'Spending has decreased steadily over the last 3 months.'
    if (newest > oldest) return 'Spending is trending upward compared to 3 months ago, despite some fluctuation.'
    if (newest < oldest) return 'Spending is trending downward compared to 3 months ago, despite some fluctuation.'
    return ''
  }, [monthly])

  const handleQuickAdd = useCallback(async (values) => {
    setQuickAddSaving(true)
    try {
      await createExpense(values)
      refresh()
    } catch {
      // Error feedback is handled by QuickAdd component
    } finally {
      setQuickAddSaving(false)
    }
  }, [refresh])

  const sharedProps = useMemo(() => ({
    insights,
    metrics,
    health,
    monthSeries,
    trendNarrative,
    categories,
    budgets,
    goals,
    handleQuickAdd,
    quickAddSaving,
    navigate,
    formatCurrency,
  }), [insights, metrics, health, monthSeries, trendNarrative, categories, budgets, goals, handleQuickAdd, quickAddSaving, navigate])

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="Loading insights..." />
        <DashboardSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="A quick read on spending." />
        <InlineError message={error} />
      </>
    )
  }

  return (
    <div className={`dashboard-stack density-${layout.density}`}>
      <PageHeader
        eyebrow="Dashboard"
        title="Your financial snapshot"
        description="Your financial health, key metrics, and spending trends."
        actions={
          <div className="dashboard-header-actions">
            <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
              Customize
            </Button>
            <Button onClick={() => navigate('/expenses')}>All transactions</Button>
          </div>
        }
      />

      {!hasExpenses ? (
        <Card className="dashboard-panel">
          <EmptyState
            title="Add your first expense to see your financial overview."
            description="Once you capture a few transactions, your health score, trends, and category mix will populate here."
            actionLabel="Add a transaction"
            onAction={() => navigate('/expenses')}
          />
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={layout.visibleWidgets}
            strategy={verticalListSortingStrategy}
          >
            <div className="widgets-container">
              {layout.visibleWidgets.map((widgetId) => {
                const Widget = WIDGET_COMPONENTS[widgetId]
                if (!Widget) return null
                const props = getWidgetProps(widgetId, sharedProps)
                return (
                  <DashboardWidget
                    key={widgetId}
                    id={widgetId}
                    density={layout.density}
                    onToggle={layout.toggleWidget}
                  >
                    <Widget {...props} />
                  </DashboardWidget>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        className="fab"
        onClick={() => navigate('/expenses')}
        aria-label="Quick add expense"
      >
        +
      </button>

      <CustomizeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        layout={layout}
        data={{ hasBudgets: budgets.length > 0, hasGoals: goals.length > 0 }}
      />
    </div>
  )
}
