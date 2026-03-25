import { Router } from 'express'
import {
  createAdminStudent,
  deleteAdminStudent,
  getAdminStudentDetail,
  getAdminStudentList,
  updateAdminStudent,
} from '../controllers/adminStudentsController.js'
import { validateBody, validateQuery } from '../middlewares/validateRequest.js'
import {
  createStudentSchema,
  studentListQuerySchema,
  updateStudentSchema,
} from '../validations/studentSchemas.js'

const router = Router()

router.post('/', validateBody(createStudentSchema), createAdminStudent)
router.get('/', validateQuery(studentListQuerySchema), getAdminStudentList)
router.get('/:id', getAdminStudentDetail)
router.patch('/:id', validateBody(updateStudentSchema), updateAdminStudent)
router.delete('/:id', deleteAdminStudent)

export default router
