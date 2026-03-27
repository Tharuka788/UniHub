import { DispatchLog } from '../models/DispatchLog.js'
import { Enrollment } from '../models/Enrollment.js'
import { env } from '../config/env.js'
import { createHttpError } from '../utils/http.js'
import { buildClassLinkEmail, sendMail } from './mailerService.js'
import { ensureClassOfferingExists } from './classOfferingService.shared.js'

export async function sendClassLinksForOffering({ classOfferingId, forceResend = false }) {
  const classOffering = await ensureClassOfferingExists(classOfferingId)

  if (classOffering.isArchived) {
    throw createHttpError(409, 'Archived class offerings cannot dispatch class links.', {
      errorCode: 'CLASS_OFFERING_ARCHIVED',
      suggestion: 'Restore the class offering before sending class links.',
    })
  }

  const classLink = classOffering.classLink || env.DEFAULT_CLASS_LINK

  if (!classLink) {
    throw createHttpError(409, 'Class link dispatch requires a valid class link.', {
      errorCode: 'CLASS_LINK_REQUIRED',
      details: [
        {
          path: 'classLink',
          message: 'A class link must be configured before dispatch.',
        },
      ],
      suggestion: 'Update the class offering with a valid class link and try again.',
    })
  }

  const enrollments = await Enrollment.find({
    classOffering: classOffering._id,
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
  }).populate('student')

  const eligibleEnrollments = forceResend
    ? enrollments
    : enrollments.filter((enrollment) => enrollment.linkDeliveryStatus !== 'sent')

  const summary = {
    classOffering: {
      id: classOffering._id,
      title: classOffering.title,
      kuppiSession: classOffering.kuppiSession,
    },
    totalTargets: enrollments.length,
    attempted: eligibleEnrollments.length,
    sent: 0,
    failed: 0,
    skipped: enrollments.length - eligibleEnrollments.length,
    errors: [],
  }

  for (const enrollment of eligibleEnrollments) {
    if (!enrollment.student?.isActive) {
      summary.failed += 1
      summary.errors.push({
        enrollmentId: enrollment._id,
        email: enrollment.student?.email || '',
        message: 'Inactive students cannot receive class links.',
      })
      continue
    }

    const emailContent = buildClassLinkEmail({
      studentName: enrollment.student.fullName,
      classTitle: classOffering.title,
      classLink,
      startDateTime: classOffering.startDateTime,
    })

    try {
      const dispatch = await sendMail({
        to: enrollment.student.email,
        ...emailContent,
      })

      enrollment.linkDeliveryStatus = 'sent'
      enrollment.linkSentAt = new Date()
      await enrollment.save()

      await DispatchLog.create({
        classOffering: classOffering._id,
        student: enrollment.student._id,
        recipient: enrollment.student.email,
        subject: emailContent.subject,
        status: 'sent',
        providerMessageId: dispatch.messageId,
        sentAt: enrollment.linkSentAt,
      })

      summary.sent += 1
    } catch (error) {
      enrollment.linkDeliveryStatus = 'failed'
      await enrollment.save()

      await DispatchLog.create({
        classOffering: classOffering._id,
        student: enrollment.student._id,
        recipient: enrollment.student.email,
        subject: emailContent.subject,
        status: 'failed',
        errorMessage: error.message,
      })

      summary.failed += 1
      summary.errors.push({
        enrollmentId: enrollment._id,
        email: enrollment.student.email,
        message: error.message,
      })
    }
  }

  return summary
}
