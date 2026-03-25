import { Router } from 'express'
import {
  createOrUpdateClassOffering,
  getAdminClassOfferingList,
  getAdminDashboardSummary,
  getAdminEnrollmentList,
  sendClassLinks,
} from '../controllers/adminController.js'
import { validateBody, validateQuery } from '../middlewares/validateRequest.js'
import { adminEnrollmentQuerySchema } from '../validations/adminValidation.js'
import {
  classOfferingUpsertSchema,
  sendClassLinkSchema,
} from '../validations/classLinkValidation.js'
import adminStudentsRoutes from './adminStudentsRoutes.js'

const router = Router()

router.get('/dashboard/summary', getAdminDashboardSummary)
router.get('/enrollments', validateQuery(adminEnrollmentQuerySchema), getAdminEnrollmentList)
router.use('/students', adminStudentsRoutes)
router.get('/class-offerings', getAdminClassOfferingList)
router.post('/class-offerings', validateBody(classOfferingUpsertSchema), createOrUpdateClassOffering)
router.post('/class-links/send', validateBody(sendClassLinkSchema), sendClassLinks)

export default router
