import { Badge } from '../components/common/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
]

export function AppLayout({ children }) {
  const { pathname, navigate } = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PF</div>
          <div className="brand-copy">
            <div className="brand-name">Pulse Finance</div>
            <div className="brand-subtitle">Analytics platform</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
            return (
              <button
                key={item.path}
                type="button"
                className={`nav-item ${active ? 'is-active' : ''}`}
                aria-label={item.label}
                title={item.label}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-dot" aria-hidden="true" />
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
          <div className="nav-item nav-item-disabled">
            <span className="nav-dot" aria-hidden="true" />
            <span className="nav-label">AI Insights</span>
            <Badge tone="warning" className="coming-soon-badge">Coming soon</Badge>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div>
            <div className="topbar-kicker">Signed in as</div>
            <div className="topbar-user">{user?.name || 'Account'}</div>
          </div>
          <div className="topbar-actions">
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Primary mobile">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
          return (
            <button
              key={item.path}
              type="button"
              className={`mobile-nav-item ${active ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
