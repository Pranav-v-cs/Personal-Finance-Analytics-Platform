import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '../ui/Card'
import { WIDGET_DEFS } from '../../config/widgets'

export function DashboardWidget({ id, children, className = '', density, onToggle }) {
  const def = WIDGET_DEFS[id]
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const cardClass = [
    'dashboard-widget',
    `widget-${id}`,
    `density-${density}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={setNodeRef} style={style} className={cardClass}>
      <Card className="dashboard-panel">
        <div className="widget-header">
          <div className="widget-header-left">
            <button
              type="button"
              className="widget-drag-handle"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              ⠿
            </button>
            <div>
              <div className="eyebrow">{def?.subtitle || ''}</div>
              <h2>{def?.title || id}</h2>
            </div>
          </div>
          {!def?.alwaysVisible && onToggle && (
            <button
              type="button"
              className="text-button widget-hide-btn"
              onClick={() => onToggle(id)}
              aria-label={`Hide ${def?.title || id}`}
            >
              Hide
            </button>
          )}
        </div>
        <div className="widget-body">
          {children}
        </div>
      </Card>
    </div>
  )
}

export function WidgetSkeleton() {
  return (
    <div className="dashboard-widget">
      <Card className="dashboard-panel">
        <div className="widget-header">
          <div className="widget-header-left">
            <span className="widget-drag-handle-placeholder" />
            <div>
              <div className="eyebrow">&nbsp;</div>
              <h2>&nbsp;</h2>
            </div>
          </div>
        </div>
        <div className="widget-body">
          <div className="skeleton-block" />
        </div>
      </Card>
    </div>
  )
}
