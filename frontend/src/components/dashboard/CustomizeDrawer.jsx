import { memo, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { WIDGET_DEFS, PRESETS, PRESET_KEYS } from '../../config/widgets'
import { Card } from '../ui/Card'

function PresetCard({ presetKey, preset, active, onApply }) {
  return (
    <button
      type="button"
      className={`preset-card ${active ? 'preset-active' : ''}`}
      onClick={() => onApply(presetKey)}
    >
      <div className="preset-card-name">{preset.label}</div>
      <div className="preset-card-desc">{preset.description}</div>
    </button>
  )
}

const PresetCardMemo = memo(PresetCard)

function WidgetToggleItem({ def, visible, onToggle }) {
  return (
    <label className="widget-toggle-row">
      <span className="widget-toggle-info">
        <span className="widget-toggle-name">{def.title}</span>
        <span className="widget-toggle-group">{def.zone}</span>
      </span>
      {def.alwaysVisible ? (
        <span className="badge badge-info">Always on</span>
      ) : (
        <button
          type="button"
          className={`toggle-switch ${visible ? 'toggle-on' : 'toggle-off'}`}
          onClick={() => onToggle(def.id)}
          aria-label={`${visible ? 'Hide' : 'Show'} ${def.title}`}
        >
          <span className="toggle-knob" />
        </button>
      )}
    </label>
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

  if (!open) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="customize-drawer" role="dialog" aria-label="Customize dashboard">
        <div className="drawer-header">
          <h2 className="typo-section-title">Customize Dashboard</h2>
          <button type="button" className="text-button" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="drawer-body">
          {recommendations.length > 0 && (
            <section className="drawer-section">
              <h3>Suggestions</h3>
              <ul className="recommendation-list">
                {recommendations.map((rec, i) => (
                  <li key={i} className="recommendation-item">{rec}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="drawer-section">
            <h3>Presets</h3>
            <p className="drawer-hint">Switch between pre-arranged layouts</p>
            <div className="preset-grid">
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

          <section className="drawer-section">
            <h3>Widgets</h3>
            <p className="drawer-hint">Show or hide dashboard widgets</p>
            <Card className="widget-toggle-list">
              {Object.values(WIDGET_DEFS).map((def) => (
                <WidgetToggleItemMemo
                  key={def.id}
                  def={def}
                  visible={layout.isVisible(def.id)}
                  onToggle={handleToggle}
                />
              ))}
            </Card>
          </section>

          <section className="drawer-section">
            <h3>Density</h3>
            <p className="drawer-hint">Control card spacing and size</p>
            <div className="density-options">
              <button
                type="button"
                className={`density-btn ${layout.density === 'compact' ? 'density-active' : ''}`}
                onClick={() => layout.setDensity('compact')}
              >
                <span className="density-icon">⊞</span>
                <span>Compact</span>
              </button>
              <button
                type="button"
                className={`density-btn ${layout.density === 'comfortable' ? 'density-active' : ''}`}
                onClick={() => layout.setDensity('comfortable')}
              >
                <span className="density-icon">⊟</span>
                <span>Comfortable</span>
              </button>
            </div>
          </section>

          <div className="drawer-footer">
            <Button variant="ghost" onClick={handleReset}>
              Reset Dashboard
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
