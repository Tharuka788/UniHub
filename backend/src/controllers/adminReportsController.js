import { buildReportPdfBuffer } from '../services/pdfService.js'
import {
  getReportPdfPayload,
  getReportSummary,
} from '../services/reportService.js'
import { sendSuccess } from '../utils/response.js'

export async function getAdminReportSummary(request, response, next) {
  try {
    const data = await getReportSummary(request.validatedQuery)

    sendSuccess(response, {
      data,
    })
  } catch (error) {
    next(error)
  }
}

export async function downloadAdminReportPdf(request, response, next) {
  try {
    const report = await getReportPdfPayload(request.validatedQuery)
    const buffer = await buildReportPdfBuffer(report)

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.filename}"`,
    )
    response.status(200).send(buffer)
  } catch (error) {
    next(error)
  }
}
