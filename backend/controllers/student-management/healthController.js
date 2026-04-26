const { sendSuccess } = require('../../utils/student-management/response');

function getHealth(_request, response) {
  sendSuccess(response, {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  getHealth,
};
