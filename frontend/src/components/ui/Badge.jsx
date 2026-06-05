import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[var(--border)] bg-[rgba(255,255,255,0.02)] text-[var(--text)]',
        warning: 'border-[rgba(245,127,23,0.3)] bg-[rgba(245,127,23,0.12)] text-[#f7b14a]',
        success: 'border-[rgba(46,125,50,0.3)] bg-[rgba(46,125,50,0.12)] text-[#74c46a]',
        danger: 'border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.12)] text-[#ef9a9a]',
        info: 'border-[rgba(90,82,204,0.3)] bg-[rgba(90,82,204,0.12)] text-[var(--accentStrong)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Badge = forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
})
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
