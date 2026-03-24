import { logError, logWarn } from '../utils/logger.js'
import { sendError } from '../utils/response.js'

export function notFoundHandler(request, response) {
  sendError(response, {
    statusCode: 404,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  })
}

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500

  if (statusCode >= 500) {
    logError('Unhandled request error', {
      statusCode,
      message: error.message,
      stack: error.stack,
    })
  } else {
    logWarn('Handled request error', {
      statusCode,
      message: error.message,
      details: error.details,
    })
  }

  sendError(response, {
    statusCode,
    message: error.message || 'Internal server error.',
    details: error.details,
  })
}
