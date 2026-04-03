import { apiRequest } from './client'

export function loginAdmin(body) {
  return apiRequest('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getAdminSession() {
  return apiRequest('/admin/auth/session')
}

export function logoutAdmin() {
  return apiRequest('/admin/auth/logout', {
    method: 'POST',
  })
}
