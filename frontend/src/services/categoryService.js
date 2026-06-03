import { api } from './api'

export function listCategories() {
  return api.get('/categories')
}
