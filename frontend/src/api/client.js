import { appConfig } from '../app/config'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
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
    throw new Error(data?.message || 'Request failed.')
  }

  return data
}
