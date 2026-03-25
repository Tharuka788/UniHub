import { logError, logWarn } from '../utils/logger.js'
import { sendError } from '../utils/response.js'

export function notFoundHandler(request, response) {
  sendError(response, {
    statusCode: 404,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    errorCode: 'ROUTE_NOT_FOUND',
    suggestion: 'Check the request method and URL before retrying.',
  })
}

export function errorHandler(error, _request, response, _next) {
  let normalizedError = error

  if (error?.name === 'ValidationError') {
    normalizedError = {
      statusCode: 400,
      message: 'Database validation failed.',
      errorCode: 'VALIDATION_ERROR',
      suggestion: 'Correct the invalid field values and submit again.',
      details: Object.values(error.errors || {}).map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
      stack: error.stack,
    }
  } else if (error?.code === 11000) {
    const duplicateKeys = Object.keys(error.keyPattern || {})
    normalizedError = {
      statusCode: 409,
      message: 'A record with the same unique value already exists.',
      errorCode: 'DUPLICATE_RESOURCE',
      suggestion: 'Change the duplicate field value and try again.',
      details: duplicateKeys.map((key) => ({
        path: key,
        message: `${key} must be unique.`,
      })),
      stack: error.stack,
    }
  } else if (error?.name === 'CastError') {
    normalizedError = {
      statusCode: 400,
      message: 'Invalid identifier provided.',
      errorCode: 'INVALID_IDENTIFIER',
      suggestion: 'Use a valid resource identifier and try again.',
      details: [
        {
          path: error.path,
          message: error.message,
        },
      ],
      stack: error.stack,
    }
  }

  const statusCode = normalizedError.statusCode || 500

  if (statusCode >= 500) {
    logError('Unhandled request error', {
      statusCode,
      message: normalizedError.message,
      errorCode: normalizedError.errorCode,
      stack: normalizedError.stack,
    })
  } else {
    logWarn('Handled request error', {
      statusCode,
      message: normalizedError.message,
      errorCode: normalizedError.errorCode,
      details: normalizedError.details,
    })
  }

  sendError(response, {
    statusCode,
    message: normalizedError.message || 'Internal server error.',
    errorCode: normalizedError.errorCode,
    details: normalizedError.details,
    suggestion: normalizedError.suggestion,
  })
}
