export function createHttpError(statusCode, message, detailsOrOptions) {
  const options = Array.isArray(detailsOrOptions)
    ? { details: detailsOrOptions }
    : detailsOrOptions || {}

  const error = new Error(message)
  error.statusCode = statusCode
  error.details = options.details
  error.errorCode = options.errorCode
  error.suggestion = options.suggestion
  return error
}
