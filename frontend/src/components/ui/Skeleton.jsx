import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[rgba(255,255,255,0.06)]', className)}
      {...props}
    />
  )
}

function SkeletonLine({ className, ...props }) {
  return (
    <Skeleton
      className={cn('h-4 w-full rounded', className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonLine }
