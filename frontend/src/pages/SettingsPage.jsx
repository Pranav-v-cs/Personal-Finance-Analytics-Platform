import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/common/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { navigate } = useRouter()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="settings-stack">
      <PageHeader eyebrow="Settings" title="Preferences and account controls" description="Manage display settings and auth state." />

      <div className="settings-grid">
        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Theme</div>
              <h2>Appearance</h2>
            </div>
          </div>
          <p className="panel-copy">
            Dark mode is the default. Switch to light mode when you need a brighter workspace.
          </p>
          <Button onClick={toggleTheme}>{theme === 'dark' ? 'Switch to light' : 'Switch to dark'}</Button>
        </Card>

        <Card className="settings-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">Account</div>
              <h2>Signed in user</h2>
            </div>
          </div>
          <div className="account-box">
            <strong>{user?.name || 'Unknown'}</strong>
            <span>{user?.email || 'No email available'}</span>
          </div>
          <Button variant="secondary" onClick={handleLogout}>Sign out</Button>
        </Card>
      </div>
    </div>
  )
}
