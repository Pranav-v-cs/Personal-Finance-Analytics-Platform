import { Button } from '../components/ui/Button'
import { FinlyticsLogo } from '../components/common/FinlyticsLogo'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transactions', path: '/expenses' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Assistant', path: '/assistant' },
  { label: 'Settings', path: '/settings' },
]

function Avatar({ name, email }) {
  const initials = (name || email || '?')
    .split(/[\s@]+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white flex-shrink-0" title={name || email}>
      {initials}
    </div>
  )
}

export function AppLayout({ children }) {
  const { pathname, navigate } = useRouter()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex lg:flex-col w-56 border-r border-(--border) bg-(--surface) p-5 gap-8 shrink-0">
        <div className="flex items-center gap-3">
          <FinlyticsLogo size={10} />
          <div className="flex flex-col">
            <div className="text-sm font-black tracking-tight">Finlytics</div>
            <div className="text-xs text-(--muted)">Analytics platform</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
            return (
              <button
                key={item.path}
                type="button"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors text-left ${
                  active
                    ? 'bg-[rgba(124,116,232,0.12)] text-(--accent)'
                    : 'text-(--muted) hover:text-(--text) hover:bg-[rgba(255,255,255,0.03)]'
                }`}
                aria-label={item.label}
                title={item.label}
                onClick={() => navigate(item.path)}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-(--accent)' : 'bg-(--border)'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex flex-col gap-2 pt-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-(--border) bg-(--bg)">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} email={user?.email} />
            <div className="flex flex-col">
              <span className="text-xs text-(--muted)">Signed in as</span>
              <span className="text-sm font-bold">{user?.name || 'Account'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 md:px-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-(--border) bg-(--bg)" aria-label="Primary mobile">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
          return (
            <button
              key={item.path}
              type="button"
              className={`flex-1 py-3 text-center text-xs font-semibold transition-colors ${
                active ? 'text-(--accent)' : 'text-(--muted)'
              }`}
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
