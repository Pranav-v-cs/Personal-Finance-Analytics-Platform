import { memo, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '../ui/Sheet'
import { Switch } from '../ui/Switch'
import { WIDGET_DEFS, PRESETS, PRESET_KEYS } from '../../config/widgets'

function PresetCard({ presetKey, preset, active, onApply }) {
  return (
    <button
      type="button"
      className={`flex flex-col gap-0.5 rounded-lg border px-3.5 py-3 text-left transition-colors ${
        active
          ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.1)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
      }`}
      onClick={() => onApply(presetKey)}
    >
      <div className="text-sm font-bold tracking-tight">{preset.label}</div>
      <div className="text-xs text-[var(--muted)]">{preset.description}</div>
    </button>
  )
}

const PresetCardMemo = memo(PresetCard)

function WidgetToggleItem({ def, visible, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5">
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{def.title}</span>
        <span className="text-xs text-[var(--muted)] capitalize">{def.zone}</span>
      </div>
      {def.alwaysVisible ? (
        <Badge variant="info">Always on</Badge>
      ) : (
        <Switch checked={visible} onCheckedChange={() => onToggle(def.id)} />
      )}
    </div>
  )
}

const WidgetToggleItemMemo = memo(WidgetToggleItem)

function computeRecommendations(layout, data) {
  const recs = []
  const { zones, isHidden, density } = layout
  const { hasBudgets, hasGoals } = data || {}

  const heroIds = zones?.hero || []
  const allVisible = []

  for (const zone of Object.values(zones || {})) {
    for (const id of zone) {
      if (!isHidden(id)) allVisible.push(id)
    }
  }

  if (hasBudgets && isHidden('budget-summary')) {
    recs.push('You have active budgets. Enable Budget Summary to track them on your dashboard.')
  }
  if (hasGoals && isHidden('goal-progress')) {
    recs.push('You have financial goals. Enable Goal Progress to monitor them at a glance.')
  }
  if (hasBudgets && !isHidden('budget-summary') && !heroIds.includes('budget-summary')) {
    recs.push('Consider adding Budget Summary to the Overview section for easier access.')
  }
  if (hasGoals && !isHidden('goal-progress') && !heroIds.includes('goal-progress')) {
    recs.push('Consider adding Goal Progress to the Overview section.')
  }
  if (allVisible.length > 6 && density === 'comfortable') {
    recs.push('Try Compact mode to fit more content without scrolling.')
  }
  return recs
}

export function CustomizeDrawer({ open, onClose, layout, data }) {
  const handlePreset = useCallback(
    (key) => { layout.applyPreset(key) },
    [layout],
  )

  const handleToggle = useCallback(
    (id) => { layout.toggleWidget(id) },
    [layout],
  )

  const handleReset = useCallback(() => {
    if (window.confirm('Reset dashboard to default layout?')) {
      layout.resetLayout()
    }
  }, [layout])

  const recommendations = useMemo(
    () => computeRecommendations(layout, data),
    [layout, data],
  )

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Customize Dashboard</SheetTitle>
          <SheetDescription>Choose widgets, presets, and density.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          {recommendations.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Suggestions</h3>
              <ul className="flex flex-col gap-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="rounded-md bg-[rgba(124,116,232,0.08)] px-3 py-2 text-xs text-[var(--accent)]">{rec}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Presets</h3>
            <p className="text-xs text-[var(--muted)]">Switch between pre-arranged layouts</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_KEYS.map((key) => (
                <PresetCardMemo
                  key={key}
                  presetKey={key}
                  preset={PRESETS[key]}
                  active={layout.preset === key}
                  onApply={handlePreset}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Widgets</h3>
            <p className="text-xs text-[var(--muted)]">Show or hide dashboard widgets</p>
            <div className="divide-y divide-[var(--border)]">
              {Object.values(WIDGET_DEFS).map((def) => (
                <WidgetToggleItemMemo
                  key={def.id}
                  def={def}
                  visible={layout.isVisible(def.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Density</h3>
            <p className="text-xs text-[var(--muted)]">Control card spacing and size</p>
            <div className="grid grid-cols-2 gap-2">
              {['compact', 'comfortable'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-semibold border transition-colors ${
                    layout.density === mode
                      ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.1)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                  }`}
                  onClick={() => layout.setDensity(mode)}
                >
                  <span className="text-xl leading-none">{mode === 'compact' ? '⊞' : '⊟'}</span>
                  <span>{mode === 'compact' ? 'Compact' : 'Comfortable'}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="pt-2 pb-6">
            <Button variant="ghost" onClick={handleReset}>
              Reset Dashboard
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
