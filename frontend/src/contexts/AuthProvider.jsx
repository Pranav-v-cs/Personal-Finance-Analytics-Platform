import { useEffect, useMemo, useState } from 'react'
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!token) {
        setReady(true)
        return
      }

      try {
        const currentUser = await getMe()
        if (active) {
          setUser(currentUser)
        }
      } catch {
        logoutRequest()
        if (active) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (active) {
          setReady(true)
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [token])

  useEffect(() => {
    const handleUnauthorized = () => {
      logoutRequest()
      setToken(null)
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const actions = useMemo(() => ({
    async login(credentials) {
      const result = await loginRequest(credentials)
      setToken(result.token)
      setUser(result.user)
      return result
    },
    async register(credentials) {
      const result = await registerRequest(credentials)
      setToken(result.token)
      setUser(result.user)
      return result
    },
    logout() {
      logoutRequest()
      setToken(null)
      setUser(null)
    },
  }), [])

  const value = useMemo(() => ({
    user,
    token,
    ready,
    isAuthenticated: Boolean(user && token),
    ...actions,
  }), [actions, ready, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
