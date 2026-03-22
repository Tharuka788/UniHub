import {
  getAdminClassOfferings,
  getAdminEnrollments,
  getDashboardSummary,
} from '../services/adminDashboardService.js'
import {
  sendClassLinksForOffering,
  upsertClassOffering,
} from '../services/classLinkService.js'

export async function getAdminDashboardSummary(_request, response, next) {
  try {
    const summary = await getDashboardSummary()

    response.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminEnrollmentList(request, response, next) {
  try {
    const data = await getAdminEnrollments(request.validatedQuery)

    response.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminClassOfferingList(_request, response, next) {
  try {
    const items = await getAdminClassOfferings()

    response.json({
      success: true,
      data: {
        items,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function createOrUpdateClassOffering(request, response, next) {
  try {
    const item = await upsertClassOffering(request.validatedBody)

    response.status(200).json({
      success: true,
      data: {
        item,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function sendClassLinks(request, response, next) {
  try {
    const result = await sendClassLinksForOffering(request.validatedBody)

    response.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
