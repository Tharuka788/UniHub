import { apiRequest } from './client'

export function getDashboardSummary() {
  return apiRequest('/admin/dashboard/summary')
}

export function getEnrollments(query) {
  return apiRequest('/admin/enrollments', { query })
}

export function getClassOfferings() {
  return apiRequest('/admin/class-offerings')
}

export function sendClassLinks(body) {
  return apiRequest('/admin/class-links/send', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
