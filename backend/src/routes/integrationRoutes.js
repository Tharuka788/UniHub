import { Router } from 'express'
import { createConfirmedEnrollment } from '../controllers/integrationController.js'
import { requireIntegrationAccess } from '../middlewares/integrationAuth.js'
import { validateBody } from '../middlewares/validateRequest.js'
import { confirmedEnrollmentPayloadSchema } from '../validations/enrollmentIntegrationValidation.js'

const router = Router()

router.post(
  '/enrollments/confirmed',
  requireIntegrationAccess,
  validateBody(confirmedEnrollmentPayloadSchema),
  createConfirmedEnrollment,
)

export default router
