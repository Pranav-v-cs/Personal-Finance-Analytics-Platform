export function Input({ className = '', ...props }) {
  return <input className={`input ${className}`.trim()} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`textarea ${className}`.trim()} {...props} />
}

export function Select({ className = '', ...props }) {
  return <select className={`select ${className}`.trim()} {...props} />
}
