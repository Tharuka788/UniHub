import { ClassOffering } from '../models/ClassOffering.js'
import { DispatchLog } from '../models/DispatchLog.js'
import { Enrollment } from '../models/Enrollment.js'
import { env } from '../config/env.js'
import { createHttpError } from '../utils/http.js'
import { buildClassLinkEmail, sendMail } from './mailerService.js'

export async function upsertClassOffering(payload) {
  const query = payload.id ? { _id: payload.id } : { kuppiSession: payload.kuppiSession }

  const classOffering = await ClassOffering.findOneAndUpdate(
    query,
    {
      title: payload.title,
      kuppiSession: payload.kuppiSession,
      classLink: payload.classLink || env.DEFAULT_CLASS_LINK,
      startDateTime: payload.startDateTime ? new Date(payload.startDateTime) : null,
      status: payload.status || 'ready',
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  )

  return {
    id: classOffering._id,
    title: classOffering.title,
    kuppiSession: classOffering.kuppiSession,
    classLink: classOffering.classLink,
    startDateTime: classOffering.startDateTime,
    status: classOffering.status,
  }
}

export async function sendClassLinksForOffering({ classOfferingId, forceResend = false }) {
  const classOffering = await ClassOffering.findById(classOfferingId)

  if (!classOffering) {
    throw createHttpError(404, 'Class offering not found.')
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
    const emailContent = buildClassLinkEmail({
      studentName: enrollment.student.fullName,
      classTitle: classOffering.title,
      classLink: classOffering.classLink || env.DEFAULT_CLASS_LINK,
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
