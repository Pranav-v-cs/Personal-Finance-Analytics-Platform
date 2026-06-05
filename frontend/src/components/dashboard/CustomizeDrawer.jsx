import { memo, useCallback } from 'react'
import { Button } from '../ui/Button'
import { WIDGET_DEFS, PRESETS } from '../../config/widgets'
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
        <span className="widget-toggle-group">{def.group}</span>
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

export function CustomizeDrawer({ open, onClose, layout }) {
  const handlePreset = useCallback(
    (key) => {
      layout.applyPreset(key)
    },
    [layout],
  )

  const handleToggle = useCallback(
    (id) => {
      layout.toggleWidget(id)
    },
    [layout],
  )

  const handleReset = useCallback(() => {
    layout.resetLayout()
  }, [layout])

  if (!open) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="customize-drawer" role="dialog" aria-label="Customize dashboard">
        <div className="drawer-header">
          <h2>Customize Dashboard</h2>
          <button type="button" className="text-button" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3>Presets</h3>
            <p className="drawer-hint">Switch between pre-arranged layouts</p>
            <div className="preset-grid">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <PresetCardMemo
                  key={key}
                  presetKey={key}
                  preset={preset}
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
