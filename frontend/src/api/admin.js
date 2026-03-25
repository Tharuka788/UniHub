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

export function getStudents(query) {
  return apiRequest('/admin/students', { query })
}

export function getStudentDetail(studentId) {
  return apiRequest(`/admin/students/${studentId}`)
}

export function createStudent(body) {
  return apiRequest('/admin/students', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateStudent(studentId, body) {
  return apiRequest(`/admin/students/${studentId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deactivateStudent(studentId) {
  return apiRequest(`/admin/students/${studentId}`, {
    method: 'DELETE',
  })
}

export function sendClassLinks(body) {
  return apiRequest('/admin/class-links/send', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
