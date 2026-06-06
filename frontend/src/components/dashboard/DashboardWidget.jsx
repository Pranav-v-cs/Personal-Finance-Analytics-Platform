import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { WIDGET_DEFS } from '../../config/widgets'

export function DashboardWidget({ id, children, zone, className = '', density, onToggle, size, onResize, sizes }) {
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

  const canResize = sizes && sizes.length > 1

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${size === 'small' ? 'sm:col-span-1' : size === 'medium' ? 'sm:col-span-2' : 'sm:col-span-4'} ${className}`}
    >
      <Card>
        <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="flex-shrink-0 cursor-grab text-lg leading-none text-[var(--muted)] hover:text-[var(--text)] touch-none"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              ⠿
            </button>
            <div className="min-w-0">
              {def?.subtitle ? <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--accent)] font-semibold truncate">{def.subtitle}</div> : null}
              <h3 className="text-sm font-extrabold truncate">{def?.title || id}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {canResize && onResize && (
              <button
                type="button"
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] px-1"
                onClick={onResize}
                aria-label={`Resize ${def?.title || id}`}
                title={`Size: ${size}`}
              >
                {size === 'small' ? '▭' : size === 'medium' ? '◻' : '▢'}
              </button>
            )}
            {!def?.alwaysVisible && onToggle && (
              <Button variant="ghost" size="sm" className="h-6 text-[11px] px-1.5" onClick={() => onToggle(id)}>
                Hide
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-5">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function WidgetSkeleton() {
  return (
    <div className="animate-pulse">
      <Card>
        <div className="flex items-center gap-2 px-5 pt-4 pb-0">
          <div className="h-3 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
        </div>
        <CardContent className="p-5">
          <div className="h-24 rounded bg-[rgba(255,255,255,0.04)]" />
        </CardContent>
      </Card>
    </div>
  )
}
