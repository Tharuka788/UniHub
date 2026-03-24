export function sendSuccess(response, { statusCode = 200, data = null, message } = {}) {
  response.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== null ? { data } : {}),
  })
}

export function sendError(response, { statusCode = 500, message, details } = {}) {
  response.status(statusCode).json({
    success: false,
    message: message || 'Internal server error.',
    ...(details ? { details } : {}),
  })
}
