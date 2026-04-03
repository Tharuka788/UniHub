const express = require('express');
const {
  createAdminStudent,
  deleteAdminStudent,
  getAdminStudentDetail,
  getAdminStudentList,
  updateAdminStudent,
} = require('../../controllers/student-management/adminStudentsController');
const { validateBody, validateQuery } = require('../../middleware/student-management/validateRequest');
const {
  createStudentSchema,
  studentListQuerySchema,
  updateStudentSchema,
} = require('../../utils/student-management/validations/studentSchemas');

const router = express.Router();

router.post('/', validateBody(createStudentSchema), createAdminStudent);
router.get('/', validateQuery(studentListQuerySchema), getAdminStudentList);
router.get('/:id', getAdminStudentDetail);
router.patch('/:id', validateBody(updateStudentSchema), updateAdminStudent);
router.delete('/:id', deleteAdminStudent);

module.exports = router;
