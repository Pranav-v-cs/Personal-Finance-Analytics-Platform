import { useContext } from 'react'
import { RouterContext } from '../contexts/routerContext'

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider')
  }
  return context
}
