import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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
import { WIDGET_DEFS } from '../config/widgets'
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

function getWidgetProps(id, ctx) {
  switch (id) {
    case 'financial-health':
      return { health: ctx.health }
    case 'insights':
      return { insights: ctx.insights }
    case 'metrics':
      return { metrics: ctx.metrics, formatCurrency: ctx.formatCurrency }
    case 'trend':
      return { monthSeries: ctx.monthSeries, formatCurrency: ctx.formatCurrency, trendNarrative: ctx.trendNarrative, DeltaBadge, metrics: ctx.metrics }
    case 'category-intelligence':
      return { categories: ctx.categories, formatCurrency: ctx.formatCurrency }
    case 'budget-summary':
      return { budgets: ctx.budgets, formatCurrency: ctx.formatCurrency, navigate: ctx.navigate }
    case 'goal-progress':
      return { goals: ctx.goals, formatCurrency: ctx.formatCurrency, navigate: ctx.navigate }
    case 'quick-add':
      return { categories: ctx.categories, onSubmit: ctx.handleQuickAdd, saving: ctx.quickAddSaving }
    case 'ai-assistant':
      return {}
    default:
      return {}
  }
}

function ZoneSection({ zone, label, widgetIds, layout, sharedProps }) {
  if (!widgetIds || widgetIds.length === 0) return null

  const zoneClass = `bento-zone bento-zone-${zone}`

  return (
    <section className={zoneClass}>
      {label && (
        <div className="zone-label">
          <h2 className="typo-section-title">{label}</h2>
        </div>
      )}
      <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
        <div className="zone-widgets">
          {widgetIds.map((widgetId) => {
            const Widget = WIDGET_COMPONENTS[widgetId]
            if (!Widget) return null
            const props = getWidgetProps(widgetId, sharedProps)
            const size = layout.getWidgetSize(widgetId)
            const def = WIDGET_DEFS[widgetId]
            return (
              <DashboardWidget
                key={widgetId}
                id={widgetId}
                zone={zone}
                density={layout.density}
                onToggle={layout.toggleWidget}
                size={size}
                onResize={() => layout.cycleWidgetSize(widgetId)}
                sizes={def?.sizes}
              >
                <Widget {...props} />
              </DashboardWidget>
            )
          })}
        </div>
      </SortableContext>
    </section>
  )
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
      /* Error feedback is handled by QuickAdd component */
    } finally {
      setQuickAddSaving(false)
    }
  }, [refresh])

  const sharedProps = useMemo(() => ({
    insights, metrics, health, monthSeries, trendNarrative,
    categories, budgets, goals, handleQuickAdd, quickAddSaving, navigate, formatCurrency,
  }), [insights, metrics, health, monthSeries, trendNarrative, categories, budgets, goals, handleQuickAdd, quickAddSaving, navigate])

  if (loading) {
    return (
      <div className="dashboard-stack">
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="Loading insights..." />
        <div className="bento-loading">
          <WidgetSkeleton />
          <WidgetSkeleton />
          <WidgetSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-stack">
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="A quick read on spending." />
        <InlineError message={error} />
      </div>
    )
  }

  return (
    <div className={`dashboard-stack density-${layout.density}`}>
      <PageHeader
        eyebrow="Dashboard"
        title="Your financial snapshot"
        description="Your financial health, key metrics, and spending trends."
        actions={
          <div className="page-header-actions">
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
          collisionDetection={closestCorners}
          onDragEnd={(event) => {
            const { active, over } = event
            if (!active || !over || active.id === over.id) return
            const entries = Object.entries(layout.zones || {})
            const activeZone = entries.find(([, ids]) => ids.includes(active.id))?.[0]
            const overZone = entries.find(([, ids]) => ids.includes(over.id))?.[0]
            if (activeZone && activeZone === overZone) {
              layout.reorder(activeZone, active.id, over.id)
            }
          }}
        >
          <div className="bento-grid">
            <ZoneSection
              zone="hero"
              label=""
              widgetIds={layout.zones?.hero || []}
              layout={layout}
              sharedProps={sharedProps}
            />
            <ZoneSection
              zone="insights"
              label="Insights"
              widgetIds={layout.zones?.insights || []}
              layout={layout}
              sharedProps={sharedProps}
            />
            <ZoneSection
              zone="analytics"
              label="Analytics"
              widgetIds={layout.zones?.analytics || []}
              layout={layout}
              sharedProps={sharedProps}
            />
            <ZoneSection
              zone="utility"
              label=""
              widgetIds={layout.zones?.utility || []}
              layout={layout}
              sharedProps={sharedProps}
            />
            <ZoneSection
              zone="future"
              label="Coming Soon"
              widgetIds={layout.zones?.future || []}
              layout={layout}
              sharedProps={sharedProps}
            />
          </div>
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
