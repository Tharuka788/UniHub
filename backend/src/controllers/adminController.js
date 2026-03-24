import {
  getAdminClassOfferings,
  getAdminEnrollments,
  getDashboardSummary,
} from '../services/adminDashboardService.js'
import {
  sendClassLinksForOffering,
  upsertClassOffering,
} from '../services/classLinkService.js'
import { sendSuccess } from '../utils/response.js'

export async function getAdminDashboardSummary(_request, response, next) {
  try {
    const summary = await getDashboardSummary()

    sendSuccess(response, {
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminEnrollmentList(request, response, next) {
  try {
    const data = await getAdminEnrollments(request.validatedQuery)

    sendSuccess(response, {
      data,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminClassOfferingList(_request, response, next) {
  try {
    const items = await getAdminClassOfferings()

    sendSuccess(response, {
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

    sendSuccess(response, {
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

    sendSuccess(response, {
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
