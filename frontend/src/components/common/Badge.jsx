export function Badge({ tone = 'default', className = '', ...props }) {
  return <span className={`badge badge-${tone} ${className}`.trim()} {...props} />
}
