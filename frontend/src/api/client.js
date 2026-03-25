import { appConfig } from '../app/config'

function buildUrl(path, query) {
  const url = new URL(`${appConfig.apiBaseUrl}${path}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  return url
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildUrl(path, options.query), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.')
    error.statusCode = response.status
    error.errorCode = data?.errorCode || 'REQUEST_FAILED'
    error.details = data?.details || []
    error.suggestion = data?.suggestion || ''
    throw error
  }

  return data
}
