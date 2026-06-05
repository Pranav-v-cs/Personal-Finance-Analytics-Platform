export function InlineError({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.1)] px-4 py-2.5 text-sm text-[#ef9a9a]">
      {message}
    </div>
  )
}
