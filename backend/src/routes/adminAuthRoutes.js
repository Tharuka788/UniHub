import { Router } from 'express'
import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from '../controllers/adminAuthController.js'
import { validateBody } from '../middlewares/validateRequest.js'
import { adminLoginSchema } from '../validations/adminValidation.js'

const router = Router()

router.post('/login', validateBody(adminLoginSchema), loginAdmin)
router.get('/session', getAdminSession)
router.post('/logout', logoutAdmin)

export default router
