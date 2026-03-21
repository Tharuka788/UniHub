import { ClassOffering } from '../models/ClassOffering.js'
import { Enrollment } from '../models/Enrollment.js'

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function getDashboardSummary() {
  const [totalConfirmedStudents, totalLinksSent, totalPendingLinkSends, totalFailedSends] =
    await Promise.all([
      Enrollment.countDocuments({
        registrationStatus: 'confirmed',
        paymentStatus: 'paid',
      }),
      Enrollment.countDocuments({ linkDeliveryStatus: 'sent' }),
      Enrollment.countDocuments({ linkDeliveryStatus: 'pending' }),
      Enrollment.countDocuments({ linkDeliveryStatus: 'failed' }),
    ])

  const [lastEnrollment, lastSentEnrollment] = await Promise.all([
    Enrollment.findOne().sort({ createdAt: -1 }).select('createdAt'),
    Enrollment.findOne({ linkSentAt: { $ne: null } }).sort({ linkSentAt: -1 }).select('linkSentAt'),
  ])

  return {
    totalConfirmedStudents,
    totalLinksSent,
    totalPendingLinkSends,
    totalFailedSends,
    lastEnrollmentAt: lastEnrollment?.createdAt || null,
    lastLinkSentAt: lastSentEnrollment?.linkSentAt || null,
  }
}

export async function getAdminEnrollments(query) {
  const filters = {
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
  }

  if (query.linkDeliveryStatus) {
    filters.linkDeliveryStatus = query.linkDeliveryStatus
  }

  if (query.kuppiSession) {
    const matchingOfferings = await ClassOffering.find({
      kuppiSession: {
        $regex: escapeRegex(query.kuppiSession),
        $options: 'i',
      },
    }).select('_id')

    filters.classOffering = {
      $in: matchingOfferings.map((offering) => offering._id),
    }
  }

  if (query.search) {
    const matchingStudents = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentRecord',
        },
      },
      { $unwind: '$studentRecord' },
      {
        $match: {
          $or: [
            {
              'studentRecord.fullName': {
                $regex: escapeRegex(query.search),
                $options: 'i',
              },
            },
            {
              'studentRecord.email': {
                $regex: escapeRegex(query.search),
                $options: 'i',
              },
            },
          ],
        },
      },
      { $project: { _id: 1 } },
    ])

    filters._id = {
      $in: matchingStudents.map((item) => item._id),
    }
  }

  const totalItems = await Enrollment.countDocuments(filters)
  const skip = (query.page - 1) * query.limit

  const enrollments = await Enrollment.find(filters)
    .populate('student')
    .populate('classOffering')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(query.limit)

  return {
    items: enrollments.map((enrollment) => ({
      id: enrollment._id,
      registrationReference: enrollment.registrationReference,
      paymentReference: enrollment.paymentReference,
      registrationStatus: enrollment.registrationStatus,
      paymentStatus: enrollment.paymentStatus,
      linkDeliveryStatus: enrollment.linkDeliveryStatus,
      linkSentAt: enrollment.linkSentAt,
      createdAt: enrollment.createdAt,
      student: {
        id: enrollment.student._id,
        fullName: enrollment.student.fullName,
        email: enrollment.student.email,
        phone: enrollment.student.phone,
      },
      classOffering: {
        id: enrollment.classOffering._id,
        title: enrollment.classOffering.title,
        kuppiSession: enrollment.classOffering.kuppiSession,
        classLink: enrollment.classOffering.classLink,
        status: enrollment.classOffering.status,
      },
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit) || 0,
    },
  }
}

export async function getAdminClassOfferings() {
  const offerings = await ClassOffering.find().sort({ createdAt: -1 })

  return offerings.map((offering) => ({
    id: offering._id,
    title: offering.title,
    kuppiSession: offering.kuppiSession,
    classLink: offering.classLink,
    status: offering.status,
    startDateTime: offering.startDateTime,
    createdAt: offering.createdAt,
  }))
}
