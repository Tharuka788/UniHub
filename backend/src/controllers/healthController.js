import { sendSuccess } from '../utils/response.js'

export function getHealth(_request, response) {
  sendSuccess(response, {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  })
}
