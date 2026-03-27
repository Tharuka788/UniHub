import { Router } from 'express'
import adminRoutes from './adminRoutes.js'
import adminAuthRoutes from './adminAuthRoutes.js'
import { getHealth } from '../controllers/healthController.js'
import integrationRoutes from './integrationRoutes.js'
import { requireAdminAuth } from '../middlewares/adminAuth.js'

const router = Router()

router.get('/health', getHealth)
router.use('/admin/auth', adminAuthRoutes)
router.use('/admin', requireAdminAuth, adminRoutes)
router.use('/integrations', integrationRoutes)

export default router
