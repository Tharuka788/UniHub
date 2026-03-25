import { ClassOffering } from '../models/ClassOffering.js'
import { DispatchLog } from '../models/DispatchLog.js'
import { Enrollment } from '../models/Enrollment.js'
import { env } from '../config/env.js'
import { createHttpError } from '../utils/http.js'
import { escapeRegex } from '../utils/validation.js'
import { ensureClassOfferingExists } from './classOfferingService.shared.js'

function buildReadiness({ offering, confirmedCount, failedDispatchCount, dispatchAttemptCount }) {
  let score = 0

  if (offering.classLink) {
    score += 30
  }

  if (['ready', 'active'].includes(offering.status)) {
    score += 20
  }

  if (confirmedCount > 0) {
    score += 20
  }

  if (!offering.isArchived && offering.title && offering.kuppiSession) {
    score += 10
  }

  const failedRate =
    dispatchAttemptCount > 0 ? failedDispatchCount / dispatchAttemptCount : 0

  if (failedRate < 0.2) {
    score += 20
  }

  let label = 'Needs Setup'

  if (score >= 80) {
    label = 'Ready'
  } else if (score >= 40) {
    label = 'Almost Ready'
  }

  return {
    score,
    label,
  }
}

function serializeClassOffering(offering, metrics = {}) {
  const readiness = buildReadiness({
    offering,
    confirmedCount: metrics.confirmedEnrollmentCount || 0,
    failedDispatchCount: metrics.failedDispatchCount || 0,
    dispatchAttemptCount: metrics.dispatchAttemptCount || 0,
  })

  return {
    id: offering._id,
    title: offering.title,
    kuppiSession: offering.kuppiSession,
    classLink: offering.classLink,
    startDateTime: offering.startDateTime,
    status: offering.status,
    isArchived: offering.isArchived,
    archivedAt: offering.archivedAt,
    createdAt: offering.createdAt,
    updatedAt: offering.updatedAt,
    confirmedEnrollmentCount: metrics.confirmedEnrollmentCount || 0,
    linkedStudentCount: metrics.confirmedEnrollmentCount || 0,
    failedDispatchCount: metrics.failedDispatchCount || 0,
    dispatchAttemptCount: metrics.dispatchAttemptCount || 0,
    readiness,
  }
}

async function getOfferingMetrics(offeringId) {
  const [confirmedEnrollmentCount, failedDispatchCount, dispatchAttemptCount] = await Promise.all([
    Enrollment.countDocuments({
      classOffering: offeringId,
      registrationStatus: 'confirmed',
      paymentStatus: 'paid',
    }),
    DispatchLog.countDocuments({
      classOffering: offeringId,
      status: 'failed',
    }),
    DispatchLog.countDocuments({
      classOffering: offeringId,
    }),
  ])

  return {
    confirmedEnrollmentCount,
    failedDispatchCount,
    dispatchAttemptCount,
  }
}

export async function createClassOffering(payload) {
  const offering = await ClassOffering.create({
    title: payload.title,
    kuppiSession: payload.kuppiSession,
    classLink: payload.classLink || env.DEFAULT_CLASS_LINK,
    startDateTime: payload.startDateTime ? new Date(payload.startDateTime) : null,
    status: payload.status || 'ready',
  })

  const metrics = await getOfferingMetrics(offering._id)

  return serializeClassOffering(offering, metrics)
}

export async function getClassOfferings(query = {}) {
  const filters = {}

  if (query.isArchived) {
    filters.isArchived = query.isArchived === 'true'
  } else {
    filters.isArchived = false
  }

  if (query.status) {
    filters.status = query.status
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i')
    filters.$or = [{ title: pattern }, { kuppiSession: pattern }]
  }

  const totalItems = await ClassOffering.countDocuments(filters)
  const skip = (query.page - 1) * query.limit
  const sort = {
    [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1,
  }

  const offerings = await ClassOffering.find(filters).sort(sort).skip(skip).limit(query.limit)

  const items = await Promise.all(
    offerings.map(async (offering) => {
      const metrics = await getOfferingMetrics(offering._id)
      return serializeClassOffering(offering, metrics)
    }),
  )

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit) || 0,
    },
  }
}

export async function getClassOfferingById(id) {
  const offering = await ensureClassOfferingExists(id)
  const metrics = await getOfferingMetrics(offering._id)
  const linkedEnrollments = await Enrollment.find({
    classOffering: offering._id,
  })
    .populate('student')
    .sort({ createdAt: -1 })

  return {
    ...serializeClassOffering(offering, metrics),
    linkedEnrollments: linkedEnrollments.map((enrollment) => ({
      id: enrollment._id,
      registrationReference: enrollment.registrationReference,
      paymentReference: enrollment.paymentReference,
      linkDeliveryStatus: enrollment.linkDeliveryStatus,
      createdAt: enrollment.createdAt,
      student: enrollment.student
        ? {
            id: enrollment.student._id,
            fullName: enrollment.student.fullName,
            email: enrollment.student.email,
            isActive: enrollment.student.isActive,
          }
        : null,
    })),
  }
}

export async function updateClassOffering(id, payload) {
  const existing = await ensureClassOfferingExists(id)

  if (existing.isArchived) {
    throw createHttpError(
      409,
      'Archived class offerings cannot be edited without a restore flow.',
    )
  }

  const offering = await ClassOffering.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(payload.classLink === '' ? { classLink: env.DEFAULT_CLASS_LINK } : {}),
      ...(payload.startDateTime === ''
        ? { startDateTime: null }
        : payload.startDateTime
          ? { startDateTime: new Date(payload.startDateTime) }
          : {}),
    },
    {
      new: true,
      runValidators: true,
    },
  )

  const metrics = await getOfferingMetrics(offering._id)

  return serializeClassOffering(offering, metrics)
}

export async function archiveClassOffering(id) {
  const offering = await ensureClassOfferingExists(id)

  if (!offering.isArchived) {
    offering.isArchived = true
    offering.archivedAt = new Date()
    await offering.save()
  }

  const [linkedEnrollmentCount, dispatchLogCount] = await Promise.all([
    Enrollment.countDocuments({ classOffering: offering._id }),
    DispatchLog.countDocuments({ classOffering: offering._id }),
  ])

  const metrics = await getOfferingMetrics(offering._id)

  return {
    item: serializeClassOffering(offering, metrics),
    linkedEnrollmentCount,
    dispatchLogCount,
  }
}
