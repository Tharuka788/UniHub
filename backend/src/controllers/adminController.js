import {
  getAdminEnrollments,
  getDashboardSummary,
} from '../services/adminDashboardService.js'
import { sendClassLinksForOffering } from '../services/classLinkService.js'
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
