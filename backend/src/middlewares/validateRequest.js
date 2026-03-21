import { ZodError } from 'zod'
import { createHttpError } from '../utils/http.js'

export function validateBody(schema) {
  return (request, _response, next) => {
    try {
      request.validatedBody = schema.parse(request.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          createHttpError(
            400,
            error.issues.map((issue) => issue.message).join(', '),
          ),
        )
        return
      }

      next(error)
    }
  }
}
