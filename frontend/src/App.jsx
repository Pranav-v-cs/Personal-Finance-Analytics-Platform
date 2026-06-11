import { Suspense, lazy, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import { RouterProvider } from './routes/router'
import { useAuth } from './hooks/useAuth'
import { useRouter } from './hooks/useRouter'
import { AppLayout } from './layouts/AppLayout'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'))

const PROTECTED_ROUTES = new Set(['/dashboard', '/expenses', '/analytics', '/budgets', '/settings', '/assistant'])

const ROUTE_MAP = {
  '/': LandingPage,
  '/auth': AuthPage,
  '/dashboard': DashboardPage,
  '/expenses': ExpensesPage,
  '/analytics': AnalyticsPage,
  '/budgets': BudgetsPage,
  '/settings': SettingsPage,
  '/assistant': AIAssistantPage,
}

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        <p className="text-sm text-[var(--muted)]">Loading Finlytics</p>
      </div>
    </div>
  )
}

function NotFoundPage() {
  const { navigate } = useRouter()
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-sm w-full p-8 text-center flex flex-col items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">404</span>
        <h1 className="text-xl font-black tracking-tight">Page not found</h1>
        <p className="text-sm text-[var(--muted)]">The route you requested does not exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { pathname, navigate } = useRouter()
  const { isAuthenticated, ready } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (PROTECTED_ROUTES.has(pathname) && !isAuthenticated) {
      navigate('/auth', { replace: true })
    } else if (pathname === '/auth' && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, pathname, ready])

  if (!ready) return <FullScreenLoader />

  const Page = ROUTE_MAP[pathname]
  const needsLayout = pathname !== '/' && pathname !== '/auth'

  return (
    <Suspense fallback={<FullScreenLoader />}>
      {needsLayout ? <AppLayout>{Page ? <Page /> : <NotFoundPage />}</AppLayout> : Page ? <Page /> : <NotFoundPage />}
    </Suspense>
  )
}

function AppShell() {
  return (
    <HelmetProvider>
      <RouterProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </RouterProvider>
    </HelmetProvider>
  )
}

export default function App() {
  return <AppShell />
}
