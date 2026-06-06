import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Separator } from '../components/ui/Separator'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { PRESETS, PRESET_KEYS, DENSITY_MODES } from '../config/widgets'
import { PageContainer, SectionContainer } from '../components/layout/PageContainer'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { navigate } = useRouter()
  const layout = useDashboardLayout()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
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

          {/* AI Provider */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">AI</div>
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>Select your preferred AI provider for the assistant, insights, and reports.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Provider</span>
                <div className="flex flex-wrap gap-2">
                  {['openrouter', 'ollama'].map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors duration-150 ${
                        layout.aiProvider === provider
                          ? 'border-[var(--accent)] bg-[rgba(124,116,232,0.12)] text-[var(--accent)]'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
                      }`}
                      onClick={() => layout.setAiProvider(provider)}
                    >
                      {provider === 'openrouter' ? 'OpenRouter' : 'Ollama'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Choose which AI provider powers your assistant, insights, and reports.
              </p>
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

          {/* Account */}
          <Card>
            <CardHeader>
              <div className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Account</div>
              <CardTitle>Signed in user</CardTitle>
              <CardDescription>Your account details and session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{user?.name || 'Unknown'}</span>
                <span className="text-sm text-[var(--muted)]">{user?.email || 'No email available'}</span>
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
