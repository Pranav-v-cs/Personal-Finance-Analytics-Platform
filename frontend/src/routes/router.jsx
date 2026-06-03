import { useEffect, useMemo, useState } from 'react'
import { RouterContext } from '../contexts/routerContext'

export function RouterProvider({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname || '/')

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname || '/')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (to, options = {}) => {
    const { replace = false } = options
    if (replace) {
      window.history.replaceState({}, '', to)
    } else {
      window.history.pushState({}, '', to)
    }
    setPathname(to)
  }

  const value = useMemo(() => ({
    pathname,
    navigate,
  }), [pathname])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}
