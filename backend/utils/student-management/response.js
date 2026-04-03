function sendSuccess(response, { statusCode = 200, data = null, message } = {}) {
  response.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== null ? { data } : {}),
  });
}

function sendError(
  response,
  { statusCode = 500, message, errorCode, details, suggestion } = {},
) {
  response.status(statusCode).json({
    success: false,
    message: message || 'Internal server error.',
    errorCode: errorCode || 'INTERNAL_SERVER_ERROR',
    ...(details ? { details } : {}),
    ...(suggestion ? { suggestion } : {}),
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
