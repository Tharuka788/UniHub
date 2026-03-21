import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'
import integrationRoutes from './integrationRoutes.js'

const router = Router()

router.get('/health', getHealth)
router.use('/integrations', integrationRoutes)

export default router
