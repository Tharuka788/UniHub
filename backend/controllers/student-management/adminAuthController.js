const {
  authenticateAdmin,
  clearAdminSessionCookie,
  createAdminSession,
  getAdminSessionFromRequest,
  setAdminSessionCookie,
} = require('../../services/student-management/adminAuthService');
const { createHttpError } = require('../../utils/student-management/http');
const { sendSuccess } = require('../../utils/student-management/response');

function loginAdmin(request, response, next) {
  try {
    const { username, password } = request.validatedBody;
    const admin = authenticateAdmin(username, password);
    const session = createAdminSession(admin.username);

    setAdminSessionCookie(response, session.token);

    sendSuccess(response, {
      data: {
        username: session.username,
        expiresAt: session.expiresAt,
      },
      message: 'Admin login successful.',
    });
  } catch (error) {
    next(error);
  }
}

function getAdminSession(request, response, next) {
  try {
    const session = getAdminSessionFromRequest(request);

    if (!session) {
      throw createHttpError(401, 'No active admin session found.', {
        errorCode: 'ADMIN_SESSION_NOT_FOUND',
        suggestion: 'Sign in again to continue.',
      });
    }

    sendSuccess(response, {
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

function logoutAdmin(_request, response, next) {
  try {
    clearAdminSessionCookie(response);

    sendSuccess(response, {
      message: 'Admin logged out.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loginAdmin,
  getAdminSession,
  logoutAdmin,
};
