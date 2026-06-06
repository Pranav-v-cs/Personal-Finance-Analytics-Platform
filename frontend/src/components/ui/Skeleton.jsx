import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[rgba(255,255,255,0.06)] relative overflow-hidden', className)}
      {...props}
    >
      <div className="absolute inset-0 animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent bg-[length:200%_100%]" />
    </div>
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
