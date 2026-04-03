const ClassOffering = require('../../models/student-management/ClassOffering');
const Enrollment = require('../../models/student-management/Enrollment');
const Student = require('../../models/student-management/Student');
const { createHttpError } = require('../../utils/student-management/http');

async function ingestConfirmedEnrollment(payload, options = {}) {
  if (!payload.paymentReference?.trim()) {
    throw createHttpError(400, 'Paid enrollments require a payment reference.', {
      errorCode: 'PAYMENT_REFERENCE_REQUIRED',
      details: [
        {
          path: 'paymentReference',
          message: 'paymentReference is required when paymentStatus is paid.',
        },
      ],
      suggestion: 'Provide the payment reference from the payment confirmation payload.',
    });
  }

  const student = await Student.findOneAndUpdate(
    { email: payload.email },
    {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  const classOffering = await ClassOffering.findOneAndUpdate(
    { kuppiSession: payload.kuppiSession },
    {
      title: payload.classTitle || payload.kuppiSession,
      ...(payload.classLink ? { classLink: payload.classLink } : {}),
      ...(payload.startDateTime
        ? { startDateTime: new Date(payload.startDateTime) }
        : {}),
      status: 'ready',
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  const enrollmentPatch = {
    student: student._id,
    classOffering: classOffering._id,
    registrationStatus: payload.registrationStatus,
    paymentStatus: payload.paymentStatus,
    confirmationSource: options.source || 'integration',
    registrationReference: payload.registrationReference,
    paymentReference: payload.paymentReference,
    linkDeliveryStatus: 'pending',
  };

  const existingByReference = await Enrollment.findOne({
    registrationReference: payload.registrationReference,
  });

  if (existingByReference) {
    existingByReference.set(enrollmentPatch);
    await existingByReference.save();

    return {
      enrollment: existingByReference,
      student,
      classOffering,
      created: false,
    };
  }

  const existingPair = await Enrollment.findOne({
    classOffering: classOffering._id,
    student: student._id,
  });

  if (existingPair) {
    throw createHttpError(409, 'A paid confirmed enrollment already exists for this student and class offering.', {
      errorCode: 'DUPLICATE_ENROLLMENT',
      details: [
        {
          path: 'student',
          message: 'This student already has an active enrollment for the class offering.',
        },
      ],
      suggestion: 'Reuse the existing enrollment or move the student to a different class offering.',
    });
  }

  const enrollment = await Enrollment.create(enrollmentPatch);

  return {
    enrollment,
    student,
    classOffering,
    created: true,
  };
}

module.exports = {
  ingestConfirmedEnrollment,
};
