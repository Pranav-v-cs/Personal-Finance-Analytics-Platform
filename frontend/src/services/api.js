import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const requestPath = error?.config?.url || ''
    const isAuthSubmit = requestPath.includes('/auth/login') || requestPath.includes('/auth/register')

    if (error?.response?.status === 401 && !isAuthSubmit) {
      localStorage.removeItem('auth_token')
      window.dispatchEvent(new Event('auth:unauthorized'))
      if (window.location.pathname !== '/auth') {
        window.location.assign('/auth')
      }
    }

    return Promise.reject(error)
  },
)
