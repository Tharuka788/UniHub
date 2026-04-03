const { getAdminSessionFromRequest } = require('../../services/student-management/adminAuthService');
const { createHttpError } = require('../../utils/student-management/http');

function requireAdminAuth(request, _response, next) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    next(
      createHttpError(401, 'Admin authentication is required.', {
        errorCode: 'ADMIN_AUTH_REQUIRED',
        suggestion: 'Sign in with the configured admin credentials and try again.',
      }),
    );
    return;
  }

  request.adminSession = session;
  next();
}

module.exports = {
  requireAdminAuth,
};
