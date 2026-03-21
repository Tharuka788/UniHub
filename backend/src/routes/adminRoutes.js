import { Router } from 'express'
import {
  getAdminClassOfferingList,
  getAdminDashboardSummary,
  getAdminEnrollmentList,
} from '../controllers/adminController.js'
import { validateQuery } from '../middlewares/validateRequest.js'
import { adminEnrollmentQuerySchema } from '../validations/adminValidation.js'

const router = Router()

router.get('/dashboard/summary', getAdminDashboardSummary)
router.get('/enrollments', validateQuery(adminEnrollmentQuerySchema), getAdminEnrollmentList)
router.get('/class-offerings', getAdminClassOfferingList)

export default router
