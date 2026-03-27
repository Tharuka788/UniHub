import {
  archiveClassOffering,
  createClassOffering,
  getClassOfferingById,
  getClassOfferings,
  updateClassOffering,
} from '../services/classOfferingService.js'
import { sendSuccess } from '../utils/response.js'

export async function createAdminClassOffering(request, response, next) {
  try {
    const item = await createClassOffering(request.validatedBody)

    sendSuccess(response, {
      statusCode: 201,
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminClassOfferingList(request, response, next) {
  try {
    const data = await getClassOfferings(request.validatedQuery)

    sendSuccess(response, {
      data,
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminClassOfferingDetail(request, response, next) {
  try {
    const item = await getClassOfferingById(request.params.id)

    sendSuccess(response, {
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

export async function updateAdminClassOffering(request, response, next) {
  try {
    const item = await updateClassOffering(request.params.id, request.validatedBody)

    sendSuccess(response, {
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteAdminClassOffering(request, response, next) {
  try {
    const result = await archiveClassOffering(request.params.id)

    sendSuccess(response, {
      message: 'Class offering archived successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
