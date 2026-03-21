import {
  getAdminClassOfferings,
  getAdminEnrollments,
  getDashboardSummary,
} from '../services/adminDashboardService.js'

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
