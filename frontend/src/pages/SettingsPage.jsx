import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Separator } from '../components/ui/Separator'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { PRESETS, PRESET_KEYS, DENSITY_MODES } from '../config/widgets'
import { PageContainer } from '../components/layout/PageContainer'
import { formatCurrency } from '../utils/format'

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar (A$)', symbol: 'AU$' },
  { code: 'CHF', label: 'Swiss Franc (Fr)', symbol: 'CHF' },
  { code: 'CNY', label: 'Chinese Yuan (¥)', symbol: 'CN¥' },
  { code: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
  { code: 'KRW', label: 'South Korean Won (₩)', symbol: '₩' },
  { code: 'SEK', label: 'Swedish Krona (kr)', symbol: 'SEK' },
  { code: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'NOK' },
  { code: 'DKK', label: 'Danish Krone (kr)', symbol: 'DKK' },
  { code: 'NZD', label: 'New Zealand Dollar (NZ$)', symbol: 'NZ$' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', symbol: 'SGD' },
  { code: 'MXN', label: 'Mexican Peso (MX$)', symbol: 'MX$' },
  { code: 'ZAR', label: 'South African Rand (R)', symbol: 'ZAR' },
  { code: 'TRY', label: 'Turkish Lira (₺)', symbol: 'TRY' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'AED' },
  { code: 'SAR', label: 'Saudi Riyal (﷼)', symbol: 'SAR' },
]

function Avatar({ name, email }) {
  const initials = (name || email || '?')
    .split(/[\s@]+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-bold text-white flex-shrink-0" title={name || email}>
      {initials}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { navigate } = useRouter()
  const layout = useDashboardLayout()
  const [saving, setSaving] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  const handleCurrencyChange = async (code) => {
    setSaving(true)
    try {
      await updateProfile({ currency: code })
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-col gap-12">
        <PageHeader eyebrow="Settings" title="Preferences and account controls" description="Manage display, dashboard, and auth state." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard Preferences */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Dashboard</div>
              <CardTitle>Layout & widgets</CardTitle>
              <CardDescription>Choose your default dashboard preset, widget density, and more.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Layout Preset</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors duration-150 ${
                        layout.preset === key
                          ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.12)] text-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                      }`}
                      onClick={() => layout.applyPreset(key)}
                    >
                      {PRESETS[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Widget Density</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(DENSITY_MODES).map(([key, mode]) => (
                    <button
                      key={key}
                      type="button"
                      className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-semibold border transition-colors duration-150 ${
                        layout.density === key
                          ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.1)]'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                      }`}
                      onClick={() => layout.setDensity(key)}
                    >
                      <span className="text-xl leading-none">{key === 'compact' ? '⊞' : '⊟'}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="ghost" onClick={() => { layout.resetLayout(); window.location.reload() }}>
                Reset Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Theme</div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Dark mode is the default. Switch to light mode for brighter workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={toggleTheme}>
                {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              </Button>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Currency</div>
              <CardTitle>Preferred currency</CardTitle>
              <CardDescription>All amounts will be displayed in the selected currency.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <select
                  value={user?.currency || 'USD'}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--fg)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--muted)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {user?.currency && (
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Preview: {formatCurrency(1234.56, user.currency)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Account</div>
              <CardTitle>Signed in user</CardTitle>
              <CardDescription>Your account details and session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name} email={user?.email} />
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{user?.name || 'Unknown'}</span>
                  <span className="text-sm text-[var(--muted)]">{user?.email || 'No email available'}</span>
                </div>
              </div>
              <Separator />
              <Button variant="secondary" onClick={handleLogout}>Sign out</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
