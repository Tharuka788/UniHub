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

function createApiError(data, statusCode) {
  const error = new Error(data?.message || 'Request failed.')
  error.statusCode = statusCode
  error.errorCode = data?.errorCode || 'REQUEST_FAILED'
  error.details = data?.details || []
  error.suggestion = data?.suggestion || ''
  return error
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
    throw createApiError(data, response.status)
  }

  return data
}

function parseFilename(contentDisposition) {
  const match = /filename="([^"]+)"/.exec(contentDisposition || '')
  return match?.[1] || 'report.pdf'
}

export async function apiDownload(path, options = {}) {
  const response = await fetch(buildUrl(path, options.query), {
    headers: {
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : null

    throw createApiError(data, response.status)
  }

  return {
    blob: await response.blob(),
    filename: parseFilename(response.headers.get('content-disposition')),
  }
}
