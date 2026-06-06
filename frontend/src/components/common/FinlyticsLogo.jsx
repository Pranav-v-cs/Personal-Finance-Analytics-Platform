export function FinlyticsLogo({ size = 10, className }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-white ${className || ''}`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${Math.max(size * 0.35, 0.6)}rem` }}
      aria-hidden="true"
    >
      <svg width="60%" height="60%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22V10h4.5q2.1 0 3.15.9t1.05 2.55q0 1.2-.6 2.025-.6.825-1.8 1.125v.15q1.35.15 2.175 1.05.825.9.825 2.25 0 1.95-1.2 2.925T13.75 22H9zm3-7h1.5q.9 0 1.425-.45t.525-1.35q0-.9-.525-1.35T13.5 11.5H12v3.5zm0 4.5h1.75q1.05 0 1.65-.525t.6-1.575q0-1.05-.6-1.575T13.75 15.5H12V19.5z" fill="currentColor"/>
      </svg>
    </div>
  )
}
