const {
  getAdminEnrollments,
  getDashboardSummary,
} = require('../../services/student-management/adminDashboardService');
const { sendClassLinksForOffering } = require('../../services/student-management/classLinkService');
const { sendSuccess } = require('../../utils/student-management/response');

async function getAdminDashboardSummary(_request, response, next) {
  try {
    const summary = await getDashboardSummary();

    sendSuccess(response, {
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminEnrollmentList(request, response, next) {
  try {
    const data = await getAdminEnrollments(request.validatedQuery);

    sendSuccess(response, {
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function sendClassLinks(request, response, next) {
  try {
    const result = await sendClassLinksForOffering(request.validatedBody);

    sendSuccess(response, {
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboardSummary,
  getAdminEnrollmentList,
  sendClassLinks,
};
