import { Router } from 'express'
import adminRoutes from './adminRoutes.js'
import { getHealth } from '../controllers/healthController.js'
import integrationRoutes from './integrationRoutes.js'

const router = Router()

router.get('/health', getHealth)
router.use('/admin', adminRoutes)
router.use('/integrations', integrationRoutes)

export default router
