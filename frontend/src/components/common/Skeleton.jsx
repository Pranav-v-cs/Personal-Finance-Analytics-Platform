export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />
}

export function SkeletonLine({ className = '' }) {
  return <div className={`skeleton-line ${className}`.trim()} aria-hidden="true" />
}
