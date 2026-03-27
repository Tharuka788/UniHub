import { Router } from 'express'
import {
  createAdminClassOffering,
  deleteAdminClassOffering,
  getAdminClassOfferingDetail,
  getAdminClassOfferingList,
  updateAdminClassOffering,
} from '../controllers/adminClassOfferingsController.js'
import { validateBody, validateQuery } from '../middlewares/validateRequest.js'
import {
  classOfferingListQuerySchema,
  createClassOfferingSchema,
  updateClassOfferingSchema,
} from '../validations/classOfferingSchemas.js'

const router = Router()

router.post('/', validateBody(createClassOfferingSchema), createAdminClassOffering)
router.get('/', validateQuery(classOfferingListQuerySchema), getAdminClassOfferingList)
router.get('/:id', getAdminClassOfferingDetail)
router.patch('/:id', validateBody(updateClassOfferingSchema), updateAdminClassOffering)
router.delete('/:id', deleteAdminClassOffering)

export default router
