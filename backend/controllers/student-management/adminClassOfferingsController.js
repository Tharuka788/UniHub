const {
  archiveClassOffering,
  createClassOffering,
  getClassOfferingById,
  getClassOfferings,
  updateClassOffering,
} = require('../../services/student-management/classOfferingService');
const { sendSuccess } = require('../../utils/student-management/response');

async function createAdminClassOffering(request, response, next) {
  try {
    const item = await createClassOffering(request.validatedBody);

    sendSuccess(response, {
      statusCode: 201,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminClassOfferingList(request, response, next) {
  try {
    const data = await getClassOfferings(request.validatedQuery);

    sendSuccess(response, {
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminClassOfferingDetail(request, response, next) {
  try {
    const item = await getClassOfferingById(request.params.id);

    sendSuccess(response, {
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminClassOffering(request, response, next) {
  try {
    const item = await updateClassOffering(request.params.id, request.validatedBody);

    sendSuccess(response, {
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminClassOffering(request, response, next) {
  try {
    const result = await archiveClassOffering(request.params.id);

    sendSuccess(response, {
      message: 'Class offering archived successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdminClassOffering,
  getAdminClassOfferingList,
  getAdminClassOfferingDetail,
  updateAdminClassOffering,
  deleteAdminClassOffering,
};
