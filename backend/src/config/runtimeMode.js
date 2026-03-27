import { env } from './env.js'
import { createHttpError } from '../utils/http.js'

export function isStandaloneMode() {
  return env.APP_MODE === 'standalone'
}

export function isIntegratedMode() {
  return env.APP_MODE === 'integrated'
}

export function isMockSyncEnabled() {
  return isStandaloneMode() && env.ALLOW_MOCK_SYNC
}

export function assertRuntimeConfig() {
  if (isIntegratedMode()) {
    if (!env.INTEGRATION_SHARED_SECRET || env.INTEGRATION_SHARED_SECRET === 'change-me') {
      throw createHttpError(
        500,
        'INTEGRATION_SHARED_SECRET must be configured in integrated mode.',
      )
    }

    if (env.EMAIL_PROVIDER !== 'smtp') {
      throw createHttpError(500, 'EMAIL_PROVIDER must be set to smtp in integrated mode.')
    }
  }

  if (env.EMAIL_PROVIDER === 'smtp' && (!env.SMTP_HOST || !env.SMTP_PORT)) {
    throw createHttpError(500, 'SMTP_HOST and SMTP_PORT are required for SMTP email.')
  }
}
