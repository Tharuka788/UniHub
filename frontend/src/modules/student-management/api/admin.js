import { apiDownload, apiRequest } from './client'

export function getDashboardSummary() {
  return apiRequest('/admin/dashboard/summary')
}

export function getEnrollments(query) {
  return apiRequest('/admin/enrollments', { query })
}

export function getClassOfferings(query) {
  return apiRequest('/admin/class-offerings', { query })
}

export function getClassOfferingDetail(classOfferingId) {
  return apiRequest(`/admin/class-offerings/${classOfferingId}`)
}

export function createClassOffering(body) {
  return apiRequest('/admin/class-offerings', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateClassOffering(classOfferingId, body) {
  return apiRequest(`/admin/class-offerings/${classOfferingId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function archiveClassOffering(classOfferingId) {
  return apiRequest(`/admin/class-offerings/${classOfferingId}`, {
    method: 'DELETE',
  })
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

export function getReportSummary(query) {
  return apiRequest('/admin/reports/summary', { query })
}

export function downloadReportPdf(query) {
  return apiDownload('/admin/reports/pdf', { query })
}

export function sendClassLinks(body) {
  return apiRequest('/admin/class-links/send', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
