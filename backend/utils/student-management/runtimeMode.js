const { env } = require('./env');
const { createHttpError } = require('./http');

function isStandaloneMode() {
  return env.APP_MODE === 'standalone';
}

function isIntegratedMode() {
  return env.APP_MODE === 'integrated';
}

function isMockSyncEnabled() {
  return isStandaloneMode() && env.ALLOW_MOCK_SYNC;
}

function assertRuntimeConfig() {
  if (isIntegratedMode()) {
    if (!env.INTEGRATION_SHARED_SECRET || env.INTEGRATION_SHARED_SECRET === 'change-me') {
      throw createHttpError(
        500,
        'INTEGRATION_SHARED_SECRET must be configured in integrated mode.',
      );
    }

    if (env.EMAIL_PROVIDER !== 'smtp') {
      throw createHttpError(500, 'EMAIL_PROVIDER must be set to smtp in integrated mode.');
    }
  }

  if (env.EMAIL_PROVIDER === 'smtp' && (!env.SMTP_HOST || !env.SMTP_PORT)) {
    throw createHttpError(500, 'SMTP_HOST and SMTP_PORT are required for SMTP email.');
  }
}

module.exports = {
  isStandaloneMode,
  isIntegratedMode,
  isMockSyncEnabled,
  assertRuntimeConfig,
};
