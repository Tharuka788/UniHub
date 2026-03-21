import { ClassOffering } from '../models/ClassOffering.js'
import { Enrollment } from '../models/Enrollment.js'
import { Student } from '../models/Student.js'
import { createHttpError } from '../utils/http.js'

export async function ingestConfirmedEnrollment(payload, options = {}) {
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
  )

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
  )

  const enrollmentPatch = {
    student: student._id,
    classOffering: classOffering._id,
    registrationStatus: payload.registrationStatus,
    paymentStatus: payload.paymentStatus,
    confirmationSource: options.source || 'integration',
    registrationReference: payload.registrationReference,
    paymentReference: payload.paymentReference,
    linkDeliveryStatus: 'pending',
  }

  const existingByReference = await Enrollment.findOne({
    registrationReference: payload.registrationReference,
  })

  if (existingByReference) {
    existingByReference.set(enrollmentPatch)
    await existingByReference.save()

    return {
      enrollment: existingByReference,
      student,
      classOffering,
      created: false,
    }
  }

  const existingPair = await Enrollment.findOne({
    classOffering: classOffering._id,
    student: student._id,
  })

  if (existingPair) {
    throw createHttpError(
      409,
      'A paid confirmed enrollment already exists for this student and class offering.',
    )
  }

  const enrollment = await Enrollment.create(enrollmentPatch)

  return {
    enrollment,
    student,
    classOffering,
    created: true,
  }
}
