import { Button } from '../components/ui/Button'
import { FinlyticsLogo } from '../components/common/FinlyticsLogo'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useRouter } from '../hooks/useRouter'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="8" rx="1"/><rect x="12" y="2" width="6" height="5" rx="1"/><rect x="2" y="13" width="6" height="5" rx="1"/><rect x="12" y="10" width="6" height="8" rx="1"/></svg> },
  { label: 'Transactions', path: '/expenses', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="5" x2="16" y2="5"/><line x1="4" y1="10" x2="16" y2="10"/><line x1="4" y1="15" x2="16" y2="15"/></svg> },
  { label: 'Analytics', path: '/analytics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="17" x2="3" y2="12"/><line x1="8" y1="17" x2="8" y2="8"/><line x1="13" y1="17" x2="13" y2="3"/><line x1="18" y1="17" x2="18" y2="10"/></svg> },
  { label: 'Budgets', path: '/budgets', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7"/><path d="M10 7v3"/><circle cx="10" cy="13" r="0.5" fill="currentColor"/></svg> },
  { label: 'Assistant', path: '/assistant', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"/><path d="M7 14v3l3-1.5L13 17v-3"/></svg> },
  { label: 'Settings', path: '/settings', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="2.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg> },
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t border-(--border) bg-(--bg)/80 backdrop-blur-2xl backdrop-saturate-150" aria-label="Primary mobile">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`)
          return (
            <button
              key={item.path}
              type="button"
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-colors ${
                active ? 'text-(--accent)' : 'text-(--muted)'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="w-5 h-5" aria-hidden="true">{item.icon}</span>
              <span className="hidden sm:inline text-[9px] font-semibold leading-tight sm:text-[10px] overflow-hidden text-ellipsis whitespace-nowrap max-w-full">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
