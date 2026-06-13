export function FinlyticsLogo({ size = 10, className }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl text-white ${className || ''}`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, backgroundColor: '#7c74e8' }}
      aria-hidden="true"
    >
      <svg width="60%" height="60%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="6" width="4" height="20" rx="1.5" fill="white" />
        <rect x="13" y="6" width="10" height="4" rx="1.5" fill="white" />
        <rect x="13" y="14" width="7" height="4" rx="1.5" fill="white" />
      </svg>
    </div>
  )
}
