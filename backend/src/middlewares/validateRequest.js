import { ZodError } from 'zod'
import { createHttpError } from '../utils/http.js'

function mapIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

export function validateBody(schema) {
  return (request, _response, next) => {
    try {
      request.validatedBody = schema.parse(request.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          createHttpError(400, 'Request body validation failed.', {
            errorCode: 'VALIDATION_ERROR',
            details: mapIssues(error.issues),
            suggestion: 'Review the request body fields and submit again.',
          }),
        )
        return
      }

      next(error)
    }
  }
}

export function validateQuery(schema) {
  return (request, _response, next) => {
    try {
      request.validatedQuery = schema.parse(request.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          createHttpError(400, 'Request query validation failed.', {
            errorCode: 'VALIDATION_ERROR',
            details: mapIssues(error.issues),
            suggestion: 'Adjust the query parameters and try again.',
          }),
        )
        return
      }

      next(error)
    }
  }
}
