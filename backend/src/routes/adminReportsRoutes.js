import { Router } from 'express'
import {
  downloadAdminReportPdf,
  getAdminReportSummary,
} from '../controllers/adminReportsController.js'
import { validateQuery } from '../middlewares/validateRequest.js'
import {
  reportPdfQuerySchema,
  reportSummaryQuerySchema,
} from '../validations/reportSchemas.js'

const router = Router()

router.get('/summary', validateQuery(reportSummaryQuerySchema), getAdminReportSummary)
router.get('/pdf', validateQuery(reportPdfQuerySchema), downloadAdminReportPdf)

export default router
