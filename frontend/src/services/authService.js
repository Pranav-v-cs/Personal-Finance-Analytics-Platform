import { api } from './api'

export async function register(credentials) {
  await api.post('/auth/register', credentials)
  return login({
    email: credentials.email,
    password: credentials.password,
  })
}

export async function login(credentials, persist = true) {
  const response = await api.post('/auth/login', credentials)
  if (persist) {
    localStorage.setItem('auth_token', response.access_token)
  }
  const user = await getMe()
  return {
    token: response.access_token,
    user,
  }
}

export function getMe() {
  return api.get('/auth/me')
}

export function updateUser(data) {
  return api.patch('/auth/me', data)
}

export function logout() {
  localStorage.removeItem('auth_token')
}
