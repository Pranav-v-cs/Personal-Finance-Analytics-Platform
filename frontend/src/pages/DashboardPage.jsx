import { useMemo, useState } from 'react'
import { DndContext, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DeltaBadge } from '../components/common/DeltaBadge'
import { EmptyState } from '../components/common/EmptyState'
import { InlineError } from '../components/common/InlineError'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageContainer } from '../components/layout/PageContainer'
import { formatCurrency } from '../utils/format'
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
  'ai-assistant': WidgetAIAssistant,
}

const WIDGET_PROPS_MAP = {
  'financial-health': (ctx) => ({ health: ctx.health }),
  insights: (ctx) => ({ insights: ctx.insights }),
  metrics: (ctx) => ({ metrics: ctx.metrics, formatCurrency: ctx.formatCurrency }),
  trend: (ctx) => ({ monthSeries: ctx.monthSeries, formatCurrency: ctx.formatCurrency, trendNarrative: ctx.trendNarrative, DeltaBadge, metrics: ctx.metrics }),
  'category-intelligence': (ctx) => ({ categories: ctx.categories, formatCurrency: ctx.formatCurrency }),
  'budget-summary': (ctx) => ({ budgets: ctx.budgets, formatCurrency: ctx.formatCurrency, navigate: ctx.navigate }),
  'goal-progress': (ctx) => ({ goals: ctx.goals, formatCurrency: ctx.formatCurrency, navigate: ctx.navigate }),
  'ai-assistant': () => ({}),
}

function ZoneSection({ zone, label, widgetIds, layout, sharedProps }) {
  const visibleIds = useMemo(() => widgetIds?.filter((id) => layout.isVisible(id)) || [], [widgetIds, layout])
  if (visibleIds.length === 0) return null

  const isHero = zone === 'hero' || zone === 'utility'

  return (
    <section className={`flex flex-col gap-3 ${isHero ? '' : ''}`}>
      {label && <div><h2 className="text-lg font-extrabold tracking-tight">{label}</h2></div>}
      <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-4">
          {visibleIds.map((widgetId) => {
            const Widget = WIDGET_COMPONENTS[widgetId]
            if (!Widget) return null
            const def = WIDGET_DEFS[widgetId]
            return (
              <DashboardWidget
                key={widgetId}
                id={widgetId}
                zone={zone}
                density={layout.density}
                onToggle={layout.toggleWidget}
                size={layout.getWidgetSize(widgetId)}
                onResize={() => layout.cycleWidgetSize(widgetId)}
                sizes={def?.sizes}
              >
                <Widget {...WIDGET_PROPS_MAP[widgetId](sharedProps)} />
              </DashboardWidget>
            )
          })}
        </div>
      </SortableContext>
    </section>
  )
}

export default function DashboardPage() {
  const { summary, monthly, recent, categories, budgets, goals, loading, error } = useDashboard()
  const { navigate } = useRouter()
  const insights = useInsights({ summary, monthly, recent, categories, budgets })
  const metrics = useSpendingMetrics({ summary, monthly, recent })
  const health = useFinancialHealth({ summary, monthly, budgets, goals })
  const layout = useDashboardLayout()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

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

  const sharedProps = useMemo(() => ({
    insights, metrics, health, monthSeries: monthly, trendNarrative,
    categories, budgets, goals, navigate, formatCurrency,
  }), [insights, metrics, health, monthly, trendNarrative, categories, budgets, goals, navigate])

  if (loading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="Loading insights..." />
        <div className="flex flex-col gap-4">
          <WidgetSkeleton /><WidgetSkeleton /><WidgetSkeleton />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Dashboard" title="Your financial snapshot" description="A quick read on spending." />
        <InlineError message={error} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-12">
        <PageHeader
          eyebrow="Dashboard"
          title="Your financial snapshot"
          description="Your financial health, key metrics, and spending trends."
          actions={
            <>
              <Button variant="ghost" onClick={() => setDrawerOpen(true)}>Customize</Button>
              <Button onClick={() => navigate('/expenses')}>All transactions</Button>
            </>
          }
        />

        {!hasExpenses ? (
          <Card>
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
              if (activeZone && activeZone === overZone) layout.reorder(activeZone, active.id, over.id)
            }}
          >
            <div className="flex flex-col gap-12">
              {['hero', 'insights', 'analytics', 'utility'].map((zone) => (
                <ZoneSection
                  key={zone}
                  zone={zone}
                  label={zone === 'insights' ? 'Insights' : zone === 'analytics' ? 'Analytics' : ''}
                  widgetIds={layout.zones?.[zone] || []}
                  layout={layout}
                  sharedProps={sharedProps}
                />
              ))}
            </div>
          </DndContext>
        )}

        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white text-2xl font-bold shadow-[0_6px_20px_rgba(124,116,232,0.4)] hover:bg-[var(--accentStrong)] active:scale-95 transition-all md:hidden"
          onClick={() => navigate('/expenses')}
          aria-label="Quick add expense"
        >
          +
        </button>

        <CustomizeDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} layout={layout} data={{ hasBudgets: budgets.length > 0, hasGoals: goals.length > 0 }} />
      </div>
    </PageContainer>
  )
}
