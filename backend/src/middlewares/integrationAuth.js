import { env } from '../config/env.js'
import { createHttpError } from '../utils/http.js'

export function requireIntegrationAccess(request, _response, next) {
  const providedSecret = request.headers['x-integration-secret']

  if (env.APP_MODE === 'standalone' && env.ALLOW_MOCK_SYNC) {
    request.integrationSource = providedSecret ? 'integration' : 'mock'
    next()
    return
  }

  if (!providedSecret || providedSecret !== env.INTEGRATION_SHARED_SECRET) {
    next(createHttpError(401, 'Invalid integration secret.'))
    return
  }

  request.integrationSource = 'integration'
  next()
}
