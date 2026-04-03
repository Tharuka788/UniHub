const { env } = require('../../utils/student-management/env');
const { isMockSyncEnabled } = require('../../utils/student-management/runtimeMode');
const { createHttpError } = require('../../utils/student-management/http');

function requireIntegrationAccess(request, _response, next) {
  const providedSecret = request.headers['x-integration-secret'];

  if (isMockSyncEnabled()) {
    request.integrationSource = providedSecret ? 'integration' : 'mock';
    next();
    return;
  }

  if (!providedSecret || providedSecret !== env.INTEGRATION_SHARED_SECRET) {
    next(createHttpError(401, 'Invalid integration secret.'));
    return;
  }

  request.integrationSource = 'integration';
  next();
}

module.exports = {
  requireIntegrationAccess,
};
