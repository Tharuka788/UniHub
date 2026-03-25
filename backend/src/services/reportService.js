import { ClassOffering } from '../models/ClassOffering.js'
import { DispatchLog } from '../models/DispatchLog.js'
import { Enrollment } from '../models/Enrollment.js'
import { createHttpError } from '../utils/http.js'

const reportTitles = {
  'confirmed-students': 'Confirmed Students Report',
  'dispatch-summary': 'Dispatch Summary Report',
  'class-offering-summary': 'Class Offering Summary Report',
}

function buildDateRange(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return null
  }

  const range = {}

  if (dateFrom) {
    range.$gte = new Date(`${dateFrom}T00:00:00.000Z`)
  }

  if (dateTo) {
    range.$lte = new Date(`${dateTo}T23:59:59.999Z`)
  }

  return range
}

function buildFilename(reportType) {
  const dateStamp = new Date().toISOString().slice(0, 10)
  return `${reportType}-${dateStamp}.pdf`
}

function serializeFilters(query, selectedOffering) {
  return {
    classOfferingId: query.classOfferingId,
    classOfferingLabel: selectedOffering
      ? `${selectedOffering.title} (${selectedOffering.kuppiSession})`
      : 'All class offerings',
    dateFrom: query.dateFrom || 'Any',
    dateTo: query.dateTo || 'Any',
    deliveryStatus: query.deliveryStatus || 'Any',
    includeArchived: query.includeArchived,
  }
}

async function resolveOfferings(query) {
  let selectedOffering = null

  if (query.classOfferingId) {
    selectedOffering = await ClassOffering.findById(query.classOfferingId)

    if (!selectedOffering) {
      throw createHttpError(404, 'Class offering not found for report generation.', {
        errorCode: 'CLASS_OFFERING_NOT_FOUND',
        suggestion: 'Choose an existing class offering before generating the report.',
      })
    }
  }

  const filters = {}

  if (!query.includeArchived) {
    filters.isArchived = false
  }

  if (query.classOfferingId) {
    filters._id = query.classOfferingId
  }

  const offerings = await ClassOffering.find(filters).sort({ createdAt: -1 })

  return {
    selectedOffering,
    offerings,
    offeringIds: offerings.map((offering) => offering._id),
  }
}

async function buildConfirmedStudentsReport(query) {
  const offeringScope = await resolveOfferings(query)
  const enrollmentFilters = {
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
  }

  if (!query.includeArchived || query.classOfferingId) {
    enrollmentFilters.classOffering = {
      $in: offeringScope.offeringIds,
    }
  }

  if (query.deliveryStatus) {
    enrollmentFilters.linkDeliveryStatus = query.deliveryStatus
  }

  const createdAt = buildDateRange(query.dateFrom, query.dateTo)

  if (createdAt) {
    enrollmentFilters.createdAt = createdAt
  }

  const enrollments = await Enrollment.find(enrollmentFilters)
    .populate('student')
    .populate('classOffering')
    .sort({ createdAt: -1 })

  const rows = enrollments.map((enrollment) => ({
    studentName: enrollment.student?.fullName || 'Unknown student',
    email: enrollment.student?.email || 'Unknown email',
    phone: enrollment.student?.phone || 'No phone number',
    kuppiSession: enrollment.classOffering?.kuppiSession || 'Unknown session',
    paymentStatus: enrollment.paymentStatus,
    deliveryStatus: enrollment.linkDeliveryStatus,
    createdAt: enrollment.createdAt,
  }))

  const sentCount = rows.filter((row) => row.deliveryStatus === 'sent').length
  const failedCount = rows.filter((row) => row.deliveryStatus === 'failed').length
  const pendingCount = rows.filter((row) => row.deliveryStatus === 'pending').length

  return {
    reportType: query.reportType,
    title: reportTitles[query.reportType],
    filename: buildFilename(query.reportType),
    generatedAt: new Date().toISOString(),
    filters: serializeFilters(query, offeringScope.selectedOffering),
    totalRows: rows.length,
    metrics: [
      { label: 'Total students', value: rows.length },
      { label: 'Links sent', value: sentCount },
      { label: 'Pending', value: pendingCount },
      { label: 'Failed', value: failedCount },
    ],
    previewRows: rows.slice(0, 10),
    exportRows: rows,
  }
}

async function buildDispatchSummaryReport(query) {
  const offeringScope = await resolveOfferings(query)
  const enrollmentFilters = {
    registrationStatus: 'confirmed',
    paymentStatus: 'paid',
  }
  const dispatchFilters = {}

  if (!query.includeArchived || query.classOfferingId) {
    const offeringIdFilter = {
      $in: offeringScope.offeringIds,
    }

    enrollmentFilters.classOffering = offeringIdFilter
    dispatchFilters.classOffering = offeringIdFilter
  }

  if (query.deliveryStatus) {
    enrollmentFilters.linkDeliveryStatus = query.deliveryStatus

    if (query.deliveryStatus !== 'pending') {
      dispatchFilters.status = query.deliveryStatus
    }
  }

  const createdAt = buildDateRange(query.dateFrom, query.dateTo)

  if (createdAt) {
    enrollmentFilters.createdAt = createdAt
    dispatchFilters.createdAt = createdAt
  }

  const [enrollments, dispatchLogs] = await Promise.all([
    Enrollment.find(enrollmentFilters)
      .populate('student')
      .populate('classOffering')
      .sort({ createdAt: -1 }),
    DispatchLog.find(dispatchFilters)
      .populate('student')
      .populate('classOffering')
      .sort({ createdAt: -1 }),
  ])

  const sentCount = enrollments.filter(
    (item) => item.linkDeliveryStatus === 'sent',
  ).length
  const failedCount = enrollments.filter(
    (item) => item.linkDeliveryStatus === 'failed',
  ).length
  const pendingCount = enrollments.filter(
    (item) => item.linkDeliveryStatus === 'pending',
  ).length

  const failedRecipients = enrollments
    .filter((item) => item.linkDeliveryStatus === 'failed')
    .slice(0, 10)
    .map((item) => ({
      studentName: item.student?.fullName || 'Unknown student',
      email: item.student?.email || 'Unknown email',
      kuppiSession: item.classOffering?.kuppiSession || 'Unknown session',
    }))

  const recentDispatches = dispatchLogs.slice(0, 12).map((log) => ({
    recipient: log.recipient,
    status: log.status,
    subject: log.subject,
    studentName: log.student?.fullName || 'Unknown student',
    kuppiSession: log.classOffering?.kuppiSession || 'Unknown session',
    createdAt: log.createdAt,
  }))

  return {
    reportType: query.reportType,
    title: reportTitles[query.reportType],
    filename: buildFilename(query.reportType),
    generatedAt: new Date().toISOString(),
    filters: serializeFilters(query, offeringScope.selectedOffering),
    totalRows: enrollments.length,
    metrics: [
      { label: 'Total targets', value: enrollments.length },
      { label: 'Sent', value: sentCount },
      { label: 'Failed', value: failedCount },
      { label: 'Pending', value: pendingCount },
    ],
    previewRows: enrollments.slice(0, 10).map((item) => ({
      studentName: item.student?.fullName || 'Unknown student',
      email: item.student?.email || 'Unknown email',
      kuppiSession: item.classOffering?.kuppiSession || 'Unknown session',
      deliveryStatus: item.linkDeliveryStatus,
    })),
    failedRecipients,
    recentDispatches,
    exportRows: enrollments.map((item) => ({
      studentName: item.student?.fullName || 'Unknown student',
      email: item.student?.email || 'Unknown email',
      kuppiSession: item.classOffering?.kuppiSession || 'Unknown session',
      deliveryStatus: item.linkDeliveryStatus,
      paymentReference: item.paymentReference,
    })),
  }
}

async function buildClassOfferingSummaryReport(query) {
  const offeringScope = await resolveOfferings(query)
  const createdAt = buildDateRange(query.dateFrom, query.dateTo)
  const filters = {}

  if (!query.includeArchived) {
    filters.isArchived = false
  }

  if (query.classOfferingId) {
    filters._id = query.classOfferingId
  }

  if (createdAt) {
    filters.createdAt = createdAt
  }

  const offerings = await ClassOffering.find(filters).sort({ createdAt: -1 })

  const rows = await Promise.all(
    offerings.map(async (offering) => {
      const [confirmedCount, sentCount, failedCount] = await Promise.all([
        Enrollment.countDocuments({
          classOffering: offering._id,
          registrationStatus: 'confirmed',
          paymentStatus: 'paid',
        }),
        Enrollment.countDocuments({
          classOffering: offering._id,
          linkDeliveryStatus: 'sent',
        }),
        Enrollment.countDocuments({
          classOffering: offering._id,
          linkDeliveryStatus: 'failed',
        }),
      ])

      return {
        title: offering.title,
        kuppiSession: offering.kuppiSession,
        status: offering.isArchived ? 'archived' : offering.status,
        confirmedCount,
        sentCount,
        failedCount,
      }
    }),
  )

  return {
    reportType: query.reportType,
    title: reportTitles[query.reportType],
    filename: buildFilename(query.reportType),
    generatedAt: new Date().toISOString(),
    filters: serializeFilters(query, offeringScope.selectedOffering),
    totalRows: rows.length,
    metrics: [
      { label: 'Total class offerings', value: rows.length },
      {
        label: 'Archived',
        value: rows.filter((row) => row.status === 'archived').length,
      },
      {
        label: 'Active students',
        value: rows.reduce((sum, row) => sum + row.confirmedCount, 0),
      },
    ],
    previewRows: rows.slice(0, 10),
    exportRows: rows,
  }
}

async function buildReport(query) {
  switch (query.reportType) {
    case 'confirmed-students':
      return buildConfirmedStudentsReport(query)
    case 'dispatch-summary':
      return buildDispatchSummaryReport(query)
    case 'class-offering-summary':
      return buildClassOfferingSummaryReport(query)
    default:
      throw createHttpError(400, 'Unsupported report type.', {
        errorCode: 'INVALID_REPORT_TYPE',
        suggestion: 'Choose a supported report type and try again.',
      })
  }
}

export async function getReportSummary(query) {
  const report = await buildReport(query)

  return {
    reportType: report.reportType,
    title: report.title,
    generatedAt: report.generatedAt,
    filters: report.filters,
    totalRows: report.totalRows,
    metrics: report.metrics,
    previewRows: report.previewRows || [],
    failedRecipients: report.failedRecipients || [],
    recentDispatches: report.recentDispatches || [],
  }
}

export async function getReportPdfPayload(query) {
  const report = await buildReport(query)

  if (!query.allowEmpty && report.totalRows === 0) {
    throw createHttpError(409, 'The selected report has no rows to download.', {
      errorCode: 'REPORT_EMPTY',
      suggestion: 'Adjust the report filters or enable empty report downloads.',
    })
  }

  return report
}
