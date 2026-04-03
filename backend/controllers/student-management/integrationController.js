const { ingestConfirmedEnrollment } = require('../../services/student-management/enrollmentIngestionService');
const { sendSuccess } = require('../../utils/student-management/response');

async function createConfirmedEnrollment(request, response, next) {
  try {
    const result = await ingestConfirmedEnrollment(request.validatedBody, {
      source: request.integrationSource,
    });

    sendSuccess(response, {
      statusCode: result.created ? 201 : 200,
      data: {
        created: result.created,
        student: {
          id: result.student._id,
          fullName: result.student.fullName,
          email: result.student.email,
        },
        classOffering: {
          id: result.classOffering._id,
          kuppiSession: result.classOffering.kuppiSession,
          title: result.classOffering.title,
        },
        enrollment: {
          id: result.enrollment._id,
          registrationReference: result.enrollment.registrationReference,
          paymentReference: result.enrollment.paymentReference,
          linkDeliveryStatus: result.enrollment.linkDeliveryStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConfirmedEnrollment,
};
