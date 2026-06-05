import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'
import { useDashboardLayout } from '../hooks/useDashboardLayout'
import { PRESETS, PRESET_KEYS, DENSITY_MODES } from '../config/widgets'

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
    <div className="settings-stack">
      <PageHeader eyebrow="Settings" title="Preferences and account controls" description="Manage display, dashboard, and auth state." />

      <div className="settings-grid">
        {/* Dashboard Preferences */}
        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Dashboard</div>
              <h2 className="typo-section-title">Layout & widgets</h2>
            </div>
          </div>
          <p className="typo-description">
            Choose your default dashboard preset, widget density, and more.
          </p>

          <div className="setting-group">
            <label className="setting-label">Layout Preset</label>
            <div className="preset-inline-grid">
              {PRESET_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`preset-chip ${layout.preset === key ? 'preset-chip-active' : ''}`}
                  onClick={() => layout.applyPreset(key)}
                >
                  {PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">Widget Density</label>
            <div className="density-options">
              {Object.entries(DENSITY_MODES).map(([key, mode]) => (
                <button
                  key={key}
                  type="button"
                  className={`density-btn ${layout.density === key ? 'density-active' : ''}`}
                  onClick={() => layout.setDensity(key)}
                >
                  <span className="density-icon">{key === 'compact' ? '⊞' : '⊟'}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <Button variant="ghost" onClick={() => { layout.resetLayout(); window.location.reload() }}>
              Reset Dashboard
            </Button>
          </div>
        </Card>

        {/* AI Provider */}
        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">AI</div>
              <h2 className="typo-section-title">AI Provider</h2>
            </div>
          </div>
          <p className="typo-description">
            Select your preferred AI provider for future features like spending insights and financial assistance.
          </p>
          <div className="setting-group">
            <label className="setting-label">Provider</label>
            <div className="ai-provider-options">
              {['openai', 'gemini', 'ollama'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className={`preset-chip ${layout.aiProvider === provider ? 'preset-chip-active' : ''}`}
                  onClick={() => layout.setAiProvider(provider)}
                >
                  {provider === 'openai' ? 'OpenAI' : provider === 'gemini' ? 'Gemini' : 'Ollama'}
                </button>
              ))}
            </div>
          </div>
          <p className="typo-metadata" style={{ marginTop: '1rem' }}>
            No AI functionality has been implemented yet. This setting stores your preference for when AI features arrive.
          </p>
        </Card>

        {/* Theme */}
        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Theme</div>
              <h2 className="typo-section-title">Appearance</h2>
            </div>
          </div>
          <p className="typo-description">
            Dark mode is the default. Switch to light mode when you need a brighter workspace.
          </p>
          <Button onClick={toggleTheme}>{theme === 'dark' ? 'Switch to light' : 'Switch to dark'}</Button>
        </Card>

        {/* Account */}
        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Account</div>
              <h2 className="typo-section-title">Signed in user</h2>
            </div>
          </div>
          <div className="account-box">
            <strong>{user?.name || 'Unknown'}</strong>
            <span className="typo-metadata">{user?.email || 'No email available'}</span>
          </div>
          <Button variant="secondary" onClick={handleLogout}>Sign out</Button>
        </Card>
      </div>
    </div>
  )
}
