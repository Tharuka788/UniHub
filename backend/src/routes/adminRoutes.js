import { Router } from 'express'
import {
  getAdminDashboardSummary,
  getAdminEnrollmentList,
  sendClassLinks,
} from '../controllers/adminController.js'
import { validateBody, validateQuery } from '../middlewares/validateRequest.js'
import { adminEnrollmentQuerySchema } from '../validations/adminValidation.js'
import { sendClassLinkSchema } from '../validations/classLinkValidation.js'
import adminClassOfferingsRoutes from './adminClassOfferingsRoutes.js'
import adminStudentsRoutes from './adminStudentsRoutes.js'

const router = Router()

router.get('/dashboard/summary', getAdminDashboardSummary)
router.get('/enrollments', validateQuery(adminEnrollmentQuerySchema), getAdminEnrollmentList)
router.use('/students', adminStudentsRoutes)
router.use('/class-offerings', adminClassOfferingsRoutes)
router.post('/class-links/send', validateBody(sendClassLinkSchema), sendClassLinks)

export default router
