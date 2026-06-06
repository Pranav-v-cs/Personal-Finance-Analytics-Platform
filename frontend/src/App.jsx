import { Suspense, lazy, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import { RouterProvider } from './routes/router'
import { useAuth } from './hooks/useAuth'
import { useRouter } from './hooks/useRouter'
import { AppLayout } from './layouts/AppLayout'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'))

const protectedRoutes = new Set(['/dashboard', '/expenses', '/analytics', '/budgets', '/settings', '/assistant'])

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
      <Card className="max-w-sm w-full p-8 text-center flex flex-col items-center gap-4">
        <span className="text-xs uppercase tracking-[0.15em] text-[var(--accent)] font-semibold">404</span>
        <h1 className="text-xl font-black tracking-tight">Page not found</h1>
        <p className="text-sm text-[var(--muted)]">The route you requested does not exist.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
      </Card>
    </div>
  )
}

function AppRoutes() {
  const { pathname, navigate } = useRouter()
  const { isAuthenticated, ready } = useAuth()

  useEffect(() => {
    if (!ready) return
    if (protectedRoutes.has(pathname) && !isAuthenticated) {
      navigate('/auth', { replace: true })
      return
    }
    if (pathname === '/auth' && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, pathname, ready])

  if (!ready) {
    return <FullScreenLoader />
  }

  let page = <NotFoundPage />
  if (pathname === '/') page = <LandingPage />
  if (pathname === '/auth') page = <AuthPage />
  if (pathname === '/dashboard') page = <DashboardPage />
  if (pathname === '/expenses') page = <ExpensesPage />
  if (pathname === '/analytics') page = <AnalyticsPage />
  if (pathname === '/budgets') page = <BudgetsPage />
  if (pathname === '/settings') page = <SettingsPage />
  if (pathname === '/assistant') page = <AIAssistantPage />

  if (pathname === '/' || pathname === '/auth') {
    return <Suspense fallback={<FullScreenLoader />}>{page}</Suspense>
  }

  return <Suspense fallback={<FullScreenLoader />}><AppLayout>{page}</AppLayout></Suspense>
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
