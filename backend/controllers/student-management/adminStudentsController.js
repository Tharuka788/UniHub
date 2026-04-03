const {
  createStudent,
  deactivateStudent,
  getStudentById,
  getStudents,
  updateStudent,
} = require('../../services/student-management/studentService');
const { sendSuccess } = require('../../utils/student-management/response');

async function createAdminStudent(request, response, next) {
  try {
    const item = await createStudent(request.validatedBody);

    sendSuccess(response, {
      statusCode: 201,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminStudentList(request, response, next) {
  try {
    const data = await getStudents(request.validatedQuery);

    sendSuccess(response, {
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminStudentDetail(request, response, next) {
  try {
    const item = await getStudentById(request.params.id);

    sendSuccess(response, {
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminStudent(request, response, next) {
  try {
    const item = await updateStudent(request.params.id, request.validatedBody);

    sendSuccess(response, {
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminStudent(request, response, next) {
  try {
    const result = await deactivateStudent(request.params.id);

    sendSuccess(response, {
      data: result,
      message: 'Student deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdminStudent,
  getAdminStudentList,
  getAdminStudentDetail,
  updateAdminStudent,
  deleteAdminStudent,
};
