import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { InlineError } from '../components/common/InlineError'
import { AuthLayout } from '../layouts/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from '../hooks/useRouter'

const initialValues = { name: '', email: '', password: '' }

function validate(values, mode) {
  const errors = {}
  if (mode === 'register' && !values.name.trim()) errors.name = 'Name is required'
  if (!values.email.trim()) errors.email = 'Email is required'
  if (!values.password.trim()) errors.password = 'Password is required'
  return errors
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register } = useAuth()
  const { navigate } = useRouter()

  const visibleFields = useMemo(() => (mode === 'register' ? ['name', 'email', 'password'] : ['email', 'password']), [mode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(form, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await register({ name: form.name, email: form.email, password: form.password })
      }
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button type="button" className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`} onClick={() => setMode('login')}>
          Login
        </button>
        <button type="button" className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`} onClick={() => setMode('register')}>
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {visibleFields.includes('name') ? (
          <label className="field">
            <span>Name</span>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
            />
            <InlineError message={errors.name} />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
          <InlineError message={errors.email} />
        </label>

        <label className="field">
          <span>Password</span>
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Minimum 8 characters"
          />
          <InlineError message={errors.password} />
        </label>

        <InlineError message={error} />

        <Button type="submit" disabled={loading}>
          {loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
