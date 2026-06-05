import { memo } from 'react'
import { Card } from '../ui/Card'

const StatCard = memo(({ label, value, helper, badge, tone = 'default' }) => (
    <Card className="p-5">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[var(--muted)] font-semibold tracking-wide uppercase">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[clamp(1.3rem,2.5vw,1.85rem)] font-extrabold tracking-tight">{value}</span>
          {badge ? <span className="flex-shrink-0">{badge}</span> : null}
        </div>
        {helper ? <span className="text-[11px] text-[var(--muted)]">{helper}</span> : null}
      </div>
    </Card>
))

export { StatCard }
